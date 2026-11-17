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
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled)(requireFrontend, loaded, loaded.exports);
  return loaded.exports;
}

const { profileResponse } = loadModule("profile-proxy.ts");
const { readProfileResponse, ProfileApiError } = loadModule("profile.ts");
const origin = "http://localhost:3000";
const profile = { id: 1, full_name: "Pessoa Teste", phone: "", email: "test@example.invalid", role: "common", is_active: true, date_joined: "2026-11-17T12:00:00Z" };
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers });
function request(method = "GET", data, headers = {}) {
  return new NextRequest(`${origin}/api/account/me/`, {
    method,
    headers: { cookie: "findly_access=access", origin, "Content-Type": "application/json", ...headers },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
}

test("profile is fetched privately with the session cookie and extra fields never reach the browser", async () => {
  global.fetch = async (url, options) => {
    assert(url.endsWith("/api/users/me/"));
    assert.equal(options.headers.Authorization, "Bearer access");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    return json({ ...profile, password: "never-forward-this", is_superuser: true });
  };
  const response = await profileResponse(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await response.json(), profile);
});

test("PATCH changes only name and phone, and a subsequent GET sees the saved values", async () => {
  let stored = { ...profile };
  global.fetch = async (url, options) => {
    assert(url.endsWith("/api/users/me/"));
    if (options.method === "PATCH") {
      const data = JSON.parse(options.body);
      assert.deepEqual(data, { full_name: "Novo Nome", phone: "(83) 99999-0000" });
      stored = { ...stored, ...data };
    }
    return json(stored);
  };
  const saved = await profileResponse(request("PATCH", { full_name: "  Novo Nome  ", phone: " (83) 99999-0000 " }));
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).full_name, "Novo Nome");
  const loaded = await profileResponse(request());
  assert.equal((await loaded.json()).phone, "(83) 99999-0000");
});

test("an optional phone can be cleared without overwriting the email or role", async () => {
  global.fetch = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { phone: "" });
    return json(profile);
  };
  assert.equal((await profileResponse(request("PATCH", { phone: "" }))).status, 200);
});

test("read-only fields and invalid payloads are blocked before reaching Django", async () => {
  global.fetch = () => { throw Error("Unexpected upstream call"); };
  for (const body of [{ email: "other@example.invalid" }, { role: "admin" }, { is_active: false }, { password: "value" }, { full_name: 10 }, {}, [], null]) {
    assert.equal((await profileResponse(request("PATCH", body))).status, 400);
  }
});

test("writes from another origin and requests without a session are refused locally", async () => {
  global.fetch = () => { throw Error("Unexpected upstream call"); };
  assert.equal((await profileResponse(request("PATCH", { full_name: "Nome" }, { origin: "https://other.example" }))).status, 403);
  assert.equal((await profileResponse(request("GET", undefined, { cookie: "" }))).status, 401);
  assert.equal((await profileResponse(request("DELETE"))).status, 405);
});

test("expired access renews once and preserves rotated cookies even on validation errors", async () => {
  let calls = 0;
  global.fetch = async (url, options) => {
    calls++;
    if (calls === 1) return json({ detail: "expired" }, 401);
    if (calls === 2) {
      assert(url.endsWith("/api/auth/refresh/"));
      assert.deepEqual(JSON.parse(options.body), { refresh: "refresh" });
      return json({ access: "new-access", refresh: "new-refresh" });
    }
    assert.equal(options.headers.Authorization, "Bearer new-access");
    return json({ phone: ["Longo demais."] }, 400);
  };
  const response = await profileResponse(request("PATCH", { phone: "long" }, { cookie: "findly_access=expired; findly_refresh=refresh" }));
  assert.equal(calls, 3);
  assert.equal(response.status, 400);
  const cookies = response.headers.getSetCookie().join(";");
  assert(cookies.includes("HttpOnly") && cookies.includes("findly_access=new-access") && cookies.includes("findly_refresh=new-refresh"));
  assert(!JSON.stringify(await response.json()).includes("new-access"));
});

test("a missing access cookie can renew from refresh, while an invalid refresh stops without a loop", async () => {
  let calls = 0;
  global.fetch = async (url) => {
    calls++;
    return url.endsWith("/api/auth/refresh/") ? json({ access: "new", refresh: "rotated" }) : json(profile);
  };
  assert.equal((await profileResponse(request("GET", undefined, { cookie: "findly_refresh=refresh" }))).status, 200);
  assert.equal(calls, 2);
  calls = 0;
  global.fetch = async () => { calls++; return json({ detail: "expired" }, 401); };
  assert.equal((await profileResponse(request("GET", undefined, { cookie: "findly_refresh=refresh" }))).status, 401);
  assert.equal(calls, 1);
});

test("permission errors and throttling are not retried and Retry-After is retained", async () => {
  for (const status of [403, 429]) {
    let calls = 0;
    global.fetch = async () => { calls++; return json({ detail: "Aguarde." }, status, { "Retry-After": "60" }); };
    const response = await profileResponse(request());
    assert.equal(response.status, status);
    assert.equal(response.headers.get("Retry-After"), "60");
    assert.equal(calls, 1);
  }
});

test("unavailable, HTML, malformed profile and network responses do not become false save confirmations", async () => {
  for (const mock of [
    async () => new Response("<html>private debug</html>", { status: 500 }),
    async () => new Response("<html>not found</html>", { status: 404 }),
    async () => json({ full_name: "Incomplete response" }),
    async () => { throw Error("connection failed"); },
  ]) {
    global.fetch = mock;
    const response = await profileResponse(request("PATCH", { full_name: "Nome" }));
    assert.equal(response.status, 502);
    assert(!JSON.stringify(await response.json()).includes("<html>"));
  }
});

test("the client shows field validation messages and distinguishes expired sessions", async () => {
  await assert.rejects(readProfileResponse(json({ phone: ["Longo demais."] }, 400)), error => error instanceof ProfileApiError && error.message === "Telefone: Longo demais.");
  await assert.rejects(readProfileResponse(json({ detail: "expired" }, 401)), error => error.status === 401 && error.message.includes("sessão expirou"));
  await assert.rejects(readProfileResponse(new Response("<html/>")), error => error instanceof ProfileApiError);
});
