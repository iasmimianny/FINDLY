const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const requireFrontend = createRequire(path.resolve(__dirname, "../package.json"));
const ts = requireFrontend("typescript");
const { NextRequest } = requireFrontend("next/server");
function loadModule(name) {
  const source = fs.readFileSync(path.resolve(__dirname, "../lib", name), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled)((name) => name.endsWith("/session-refresh") ? requireFrontend("./lib/session-refresh.ts") : requireFrontend(name), loaded, loaded.exports);
  return loaded.exports;
}
const { collectionPointsResponse, pointTarget, validPointInput } = loadModule("collection-points-proxy.ts");
const { pointsJson, pointsPath, capacityLabel } = loadModule("collection-points.ts");
const origin = "http://localhost:3000";
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers });
const request = (url = "/api/collection-points/", options = {}) => new NextRequest(origin + url, { ...options, headers: { origin, cookie: "findly_access=access", ...options.headers } });
const payload = { name: "Biblioteca", address: "Bloco A", opening_hours: "08h às 18h", capacity: null, is_active: true, operators: [2] };

test("only existing points operations and the read-only responsible lookup are allowed", () => {
  assert.equal(pointTarget([], "POST"), "/api/operations/points/");
  for (const method of ["GET", "PUT", "PATCH"]) assert.equal(pointTarget(["12"], method), "/api/operations/points/12/");
  assert.equal(pointTarget(["operators"], "GET"), "/api/users/");
  for (const segments of [[".."], ["1", "extra"], ["https://other.example"], ["0"], ["01"]]) assert.equal(pointTarget(segments, "GET"), null);
  assert.equal(pointTarget(["1"], "DELETE"), null);
  assert.equal(pointTarget(["operators"], "PATCH"), null);
});

test("payloads support unlimited capacity, zero capacity, no responsibles, and deactivation", () => {
  for (const body of [payload, { capacity: 0 }, { operators: [] }, { is_active: false }]) assert(validPointInput(body));
  for (const body of [{ occupancy: 1 }, { has_capacity: true }, { capacity: -1 }, { capacity: 1.5 }, { capacity: "10" }, { operators: ["2"] }, { operators: [0] }, { is_active: 1 }, [], {}]) assert(!validPointInput(body));
  assert.equal(capacityLabel({ capacity: 0, occupancy: 0 }), "0 de 0 vagas ocupadas");
  assert(capacityLabel({ capacity: null, occupancy: 4 }).includes("sem limite"));
});

test("search, active status, available capacity, responsible, sort and page reach the backend", async () => {
  const url = pointsPath({ search: " Biblioteca & campus ", active: "false", capacity: true, operator: "2", ordering: "-capacity", page: 3 });
  global.fetch = async (target, options) => {
    const uri = new URL(target);
    assert.equal(uri.pathname, "/api/operations/points/");
    assert.equal(uri.searchParams.get("search"), "Biblioteca & campus");
    assert.equal(uri.searchParams.get("is_active"), "false");
    assert.equal(uri.searchParams.get("has_capacity"), "true");
    assert.equal(uri.searchParams.get("operator"), "2");
    assert.equal(uri.searchParams.get("ordering"), "-capacity");
    assert.equal(uri.searchParams.get("page"), "3");
    assert.equal(options.headers.Authorization, "Bearer access");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    return json({ count: 45, results: [], next: "next", previous: "previous" });
  };
  const response = await collectionPointsResponse(request(url));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 45);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("create, detail lookup, editing and deactivation use the existing point endpoints", async () => {
  let saved = { id: 12, ...payload, occupancy: 0, has_capacity: true };
  global.fetch = async (target, options) => {
    assert(target.includes("/api/operations/points/"));
    if (options.method === "POST") {
      assert.deepEqual(JSON.parse(options.body), payload);
      return json(saved, 201);
    }
    assert(target.endsWith("/12/"));
    if (options.method === "PATCH") saved = { ...saved, ...JSON.parse(options.body) };
    return json(saved);
  };
  const options = (body, method = "PATCH") => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  assert.equal((await collectionPointsResponse(request(undefined, options(payload, "POST")))).status, 201);
  assert.equal((await (await collectionPointsResponse(request("/api/collection-points/12/"), ["12"])).json()).name, "Biblioteca");
  await collectionPointsResponse(request("/api/collection-points/12/", options({ capacity: 10, operators: [] })), ["12"]);
  await collectionPointsResponse(request("/api/collection-points/12/", options({ is_active: false })), ["12"]);
  assert.equal(saved.capacity, 10);
  assert.deepEqual(saved.operators, []);
  assert.equal(saved.is_active, false);
});

test("responsible lookup only requests operators/admins and keeps paginated search", async () => {
  for (const role of ["operator", "admin"]) {
    global.fetch = async (target) => {
      const uri = new URL(target);
      assert.equal(uri.pathname, "/api/users/");
      assert.equal(uri.searchParams.get("role"), role);
      assert.equal(uri.searchParams.get("search"), "Nome");
      assert.equal(uri.searchParams.get("page"), "2");
      assert.equal(uri.searchParams.has("untrusted"), false);
      return json({ count: 25, results: [], next: null, previous: "previous" });
    };
    assert.equal((await collectionPointsResponse(request(`/api/collection-points/operators/?role=${role}&search=Nome&page=2&untrusted=discard`), ["operators"])).status, 200);
  }
  global.fetch = () => { throw Error("Unexpected upstream call"); };
  assert.equal((await collectionPointsResponse(request("/api/collection-points/operators/?role=common"), ["operators"])).status, 400);
});

test("anonymous writes, cross-origin writes and readonly field changes are refused", async () => {
  global.fetch = () => { throw Error("Unexpected upstream call"); };
  assert.equal((await collectionPointsResponse(request(undefined, { headers: { cookie: "" } }))).status, 401);
  assert.equal((await collectionPointsResponse(request(undefined, { method: "POST", headers: { origin: "https://other.example" } }))).status, 403);
  assert.equal((await collectionPointsResponse(request(undefined, { method: "POST", body: JSON.stringify({ occupancy: 10 }) }))).status, 400);
});

test("the backend remains authoritative for admin permissions and responsible validation", async () => {
  for (const status of [400, 403, 429]) {
    let calls = 0;
    global.fetch = async () => { calls++; return json(status === 400 ? { operators: ["Apenas operadores ou administradores."] } : { detail: "Sem permissão ou limite de consultas." }, status, { "retry-after": "60" }); };
    const response = await collectionPointsResponse(request(undefined, { method: "POST", body: JSON.stringify(payload) }));
    assert.equal(response.status, status);
    assert.equal(calls, 1);
    assert.equal(response.headers.get("retry-after"), "60");
  }
});

test("expired access renews once and saves rotated cookies even on a validation error", async () => {
  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    if (calls === 1) return json({ detail: "expired" }, 401);
    if (calls === 2) { assert(url.endsWith("/api/auth/refresh/")); return json({ access: "new-access", refresh: "new-refresh" }); }
    assert.equal(options.headers.Authorization, "Bearer new-access");
    return json({ capacity: ["Inválida."] }, 400);
  };
  const response = await collectionPointsResponse(request(undefined, { method: "POST", headers: { cookie: "findly_access=old; findly_refresh=refresh" }, body: JSON.stringify(payload) }));
  assert.equal(calls, 3);
  const cookies = response.headers.getSetCookie().join(";");
  assert(cookies.includes("findly_access=new-access") && cookies.includes("findly_refresh=new-refresh") && cookies.includes("HttpOnly"));
  assert(!JSON.stringify(await response.json()).includes("new-access"));
});

test("missing access can renew from refresh and rejected refresh never loops", async () => {
  let calls = 0;
  global.fetch = async (url) => { calls++; return url.endsWith("/api/auth/refresh/") ? json({ access: "new", refresh: "rotated" }) : json({ count: 0, results: [] }); };
  assert.equal((await collectionPointsResponse(request(undefined, { headers: { cookie: "findly_refresh=refresh" } }))).status, 200);
  assert.equal(calls, 2);
  calls = 0;
  global.fetch = async () => { calls++; return json({ detail: "expired" }, 401); };
  assert.equal((await collectionPointsResponse(request(undefined, { headers: { cookie: "findly_refresh=refresh" } }))).status, 401);
  assert.equal(calls, 1);
});

test("network/HTML failures become safe JSON errors without retrying a create", async () => {
  for (const mock of [async () => new Response("<html>debug</html>", { status: 500 }), async () => new Response("<html>not found</html>", { status: 404 }), async () => { throw Error("network"); }]) {
    let calls = 0;
    global.fetch = async () => { calls++; return mock(); };
    const response = await collectionPointsResponse(request(undefined, { method: "POST", body: JSON.stringify(payload) }));
    assert.equal(response.status, 502);
    assert.equal(calls, 1);
    assert(!JSON.stringify(await response.json()).includes("<html>"));
  }
});

test("client validation messages use field labels and session failures remain identifiable", async () => {
  await assert.rejects(pointsJson(json({ operators: ["Responsável inválido."] }, 400)), error => error.message === "Responsáveis: Responsável inválido.");
  await assert.rejects(pointsJson(json({ detail: "expired" }, 401)), error => error.status === 401);
});
