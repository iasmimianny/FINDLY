const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const requireFrontend = createRequire(path.resolve(__dirname, "../package.json"));
const ts = requireFrontend("typescript");
const cache = new Map();
function loadModule(name) {
  if (cache.has(name)) return cache.get(name);
  const source = fs.readFileSync(path.resolve(__dirname, "../lib", `${name}.ts`), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  const loaded = { exports: {} };
  const requireLocal = (moduleName) => moduleName.startsWith("./") ? loadModule(moduleName.slice(2)) : requireFrontend(moduleName);
  new Function("require", "module", "exports", compiled)(requireLocal, loaded, loaded.exports);
  cache.set(name, loaded.exports);
  return loaded.exports;
}
const { assignmentPath, loginDestination, loadStaffAssignment } = loadModule("staff");
const json = (body, status = 200) => Response.json(body, { status });
const user = (id, role = "operator") => ({ id, role, full_name: `Pessoa ${id}`, email: `person${id}@example.invalid`, phone: "", is_active: true, date_joined: "2026-11-17T10:00:00Z" });

test("login sends staff/admin accounts to the employee area and keeps ordinary accounts on their dashboard", () => {
  assert.equal(loginDestination("operator"), "/funcionario/pontos-coleta");
  assert.equal(loginDestination("admin"), "/funcionario/pontos-coleta");
  assert.equal(loginDestination("common"), "/dashboard");
  assert.equal(loginDestination(undefined), "/dashboard");
});

test("the employee assignment query uses identity from the current profile", () => {
  const value = new URL(assignmentPath(user(7)), "http://localhost:3000");
  assert.equal(value.searchParams.get("operator"), "7");
  assert.equal(value.searchParams.get("ordering"), "name");
  assert.equal(value.searchParams.get("page"), "1");
  assert.equal(value.searchParams.has("is_active"), false);
  assert.equal(new URL(assignmentPath(user(8, "admin")), "http://localhost:3000").searchParams.has("operator"), false);
  assert.throws(() => assignmentPath(user(2, "common")), error => error.status === 403);
  assert.throws(() => assignmentPath(user("../7")), error => error.status === 502);
});

test("different employee accounts receive their own block assignments without stored shared identity", async () => {
  for (const [id, block] of [[7, "Bloco H"], [8, "Bloco F"]]) {
    let calls = 0;
    global.fetch = async (url, options) => {
      calls++;
      assert.equal(options.cache, "no-store");
      assert.equal(options.credentials, "same-origin");
      if (calls === 1) { assert.equal(url, "/api/account/me/"); return json(user(id)); }
      assert.equal(new URL(url, "http://localhost:3000").searchParams.get("operator"), String(id));
      return json({ count: 1, results: [{ id: 1, name: block, operators: [id], is_active: true }], next: null, previous: null });
    };
    const data = await loadStaffAssignment();
    assert.equal(data.user.email, `person${id}@example.invalid`);
    assert.equal(data.points.results[0].name, block);
    assert.equal(calls, 2);
  }
});

test("administrators load all points instead of only points assigned to themselves", async () => {
  global.fetch = async (url) => url === "/api/account/me/" ? json(user(9, "admin")) : json({ count: 1, results: [{ id: 1, name: "Bloco H", operators: [7] }], next: null, previous: null });
  assert.equal((await loadStaffAssignment()).points.count, 1);
});

test("unassigned staff get an empty assignment rather than the hard-coded block", async () => {
  global.fetch = async (url) => url === "/api/account/me/" ? json(user(7)) : json({ count: 0, results: [], next: null, previous: null });
  assert.deepEqual((await loadStaffAssignment()).points.results, []);
});

test("inactive assigned points remain identifiable and paginated totals are preserved", async () => {
  global.fetch = async (url) => url === "/api/account/me/" ? json(user(7)) : json({ count: 25, results: [{ id: 1, name: "Bloco H", operators: [7], is_active: false }], next: "next", previous: null });
  const data = await loadStaffAssignment();
  assert.equal(data.points.count, 25);
  assert.equal(data.points.results[0].is_active, false);
});

test("the UI rejects mismatched assignments rather than labeling another employee's point as its own", async () => {
  global.fetch = async (url) => url === "/api/account/me/" ? json(user(7)) : json({ count: 1, results: [{ id: 1, operators: [8] }] });
  await assert.rejects(loadStaffAssignment(), error => error.status === 502);
});

test("ordinary users and expired sessions do not proceed to assignment lookup", async () => {
  for (const response of [json(user(7, "common")), json({ detail: "expired" }, 401)]) {
    let calls = 0;
    global.fetch = async () => { calls++; return response; };
    await assert.rejects(loadStaffAssignment(), error => [401, 403].includes(error.status));
    assert.equal(calls, 1);
  }
});

test("network failures and malformed assignment responses are not mistaken for an unassigned account", async () => {
  for (const result of [() => json({ count: "wrong", results: [] }), () => json({ count: 1, results: [] }), () => { throw Error("network"); }]) {
    global.fetch = async (url) => url === "/api/account/me/" ? json(user(7)) : result();
    await assert.rejects(loadStaffAssignment());
  }
});
