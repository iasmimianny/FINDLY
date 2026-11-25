const assert = require("node:assert/strict");
const {test} = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const {createRequire} = require("node:module");
const req = createRequire(path.resolve(__dirname, "../package.json"));
const ts = req("typescript");
const {NextRequest} = req("next/server");
process.env.DJANGO_API_URL = "http://127.0.0.1:8001";
function load(file) {
  const mod = {exports:{}};
  new Function("require", "module", "exports", ts.transpileModule(fs.readFileSync(path.resolve(__dirname,"..",file),"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(name => name === "./session-refresh" ? req("./lib/session-refresh.ts") : req(name),mod,mod.exports);
  return mod.exports;
}
const {proxyItems,validItemPath} = load("lib/items-proxy.ts");
const {POST:verify} = load("app/api/auth/verify-email/route.ts");
const origin = "http://localhost:3000";
const request = (path, body={}, extra={}) => new NextRequest(origin+path, {method:"POST", headers:{origin,cookie:"findly_access=example", "content-type":"application/json",...extra},body:JSON.stringify(body)});
test("item actions restrict methods, identifiers and supported states",()=>{
  assert(validItemPath(["lost","ABCDEFGH23","complete"],"POST"));
  assert(validItemPath(["lost","ABCDEFGH23","cancel"],"POST"));
  assert(validItemPath(["claims","12","cancel"],"POST"));
  assert(!validItemPath(["claims","12","approve"],"POST"));
  assert(!validItemPath(["lost","ABCDEFGH23","complete"],"GET"));
  assert(!validItemPath(["claims","../1","cancel"],"POST"));
});
test("confirmed owner actions reach the correct backend endpoint once",async()=>{
  for (const [parts,endpoint] of [[['lost','ABCDEFGH23','complete'],'/api/items/lost/ABCDEFGH23/complete/'],[['claims','12','cancel'],'/api/operations/claims/12/cancel/']]) {
    let calls=0;
    global.fetch=async(url,options)=>{calls++;assert.equal(url,'http://127.0.0.1:8001'+endpoint);assert.equal(options.method,'POST');assert.equal(options.body,'{}');return Response.json({status:'ok'});};
    assert.equal((await proxyItems(request('/api/items/'+parts.join('/')),parts)).status,200);
    assert.equal(calls,1);
  }
});
test("foreign origins and extra action fields are refused before reaching Django",async()=>{
  global.fetch=async()=>{throw new Error('Should not reach backend');};
  assert.equal((await proxyItems(request('/api/items/claims/12/cancel',{}, {origin:'https://other.invalid'}),['claims','12','cancel'])).status,403);
  assert.equal((await proxyItems(request('/api/items/claims/12/cancel',{status:'APPROVED'}),['claims','12','cancel'])).status,400);
});
test("email verification uses configured backend without a session and forwards uid/token only",async()=>{
  let calls=0;
  global.fetch=async(url,options)=>{calls++;assert.equal(url,'http://127.0.0.1:8001/api/auth/verify-email/');assert.deepEqual(JSON.parse(options.body),{uid:'NQ',token:'abc-123'});return Response.json({detail:'Conta ativada.'});};
  const response=await verify(request('/api/auth/verify-email',{uid:'NQ',token:'abc-123',role:'admin'},{cookie:''}));
  assert.equal(response.status,200);assert.equal(calls,1);
});
test("email verification rejects malformed links and foreign origins",async()=>{
  global.fetch=async()=>{throw new Error('Should not reach backend');};
  assert.equal((await verify(request('/api/auth/verify-email',{uid:'../../',token:'x'}))).status,400);
  assert.equal((await verify(request('/api/auth/verify-email',{uid:'NQ',token:'abc'},{origin:'https://other.invalid'}))).status,403);
});
test("verification preserves rejected tokens and returns safe errors without retrying",async()=>{
  global.fetch=async()=>Response.json({detail:'Token inválido.'},{status:400});
  assert.equal((await verify(request('/api/auth/verify-email',{uid:'NQ',token:'abc'}))).status,400);
  let calls=0;global.fetch=async()=>{calls++;throw new Error('Network failure');};
  assert.equal((await verify(request('/api/auth/verify-email',{uid:'NQ',token:'abc'}))).status,502);assert.equal(calls,1);
});

test("public account proxy accepts only supported operations from the same origin", async () => {
  const { POST } = load("app/api/auth/[...segments]/route.ts");
  const previous = global.fetch;
  let calls = 0;
  global.fetch = async (url, options) => {
    calls += 1;
    assert.equal(new URL(url).pathname, "/api/auth/resend-verification/");
    assert.deepEqual(JSON.parse(options.body), { email: "user@example.test" });
    return Response.json({ detail: "Solicitação recebida." }, { status: 202 });
  };
  const path = "/api/auth/resend-verification/";
  const body = { email: "user@example.test" };
  const context = { params: Promise.resolve({ segments: ["resend-verification"] }) };
  try {
    assert.equal((await POST(request(path, body, { origin: "https://other.example" }), context)).status, 403);
    assert.equal((await POST(request(path, body), { params: Promise.resolve({ segments: ["refresh"] }) })).status, 404);
    assert.equal((await POST(request(path, body), context)).status, 202);
    assert.equal(calls, 1);
  } finally {
    global.fetch = previous;
  }
});
