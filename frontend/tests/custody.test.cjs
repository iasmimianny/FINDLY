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
const { custodyResponse, custodyTarget, validCustodyInput } = loadModule("custody-proxy.ts");
const code = "85X7C925S6";
const origin = "http://localhost:3000";
const request = (method="GET", body, headers={}) => new NextRequest(`${origin}/api/custody/${code}/`, { method, headers: { origin, cookie: "findly_access=access", ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
test("custody routes are restricted to existing history and transfer operations", () => {
  assert.equal(custodyTarget([code], "GET"), `/api/operations/items/found/${code}/custody/`);
  assert.equal(custodyTarget([code,"transfer"], "POST"), `/api/operations/items/found/${code}/custody/transfer/`);
  for (const segments of [[], [".."], [code,"delete"], [code,"transfer","extra"]]) assert.equal(custodyTarget(segments,"POST"), null);
  assert.equal(custodyTarget([code],"POST"),null);
});
test("transfer accepts only a positive point id and a bounded note", () => {
  assert(validCustodyInput({collection_point:2,note:"Recebido"}));
  assert(validCustodyInput({collection_point:2}));
  for (const value of [{}, [], {collection_point:"2"}, {collection_point:0}, {collection_point:2,note:"x".repeat(256)}, {collection_point:2,user:4}]) assert(!validCustodyInput(value));
});
test("history and transfer forward authenticated requests to the fixed backend routes", async () => {
  for (const method of ["GET","POST"]) {
    global.fetch=async (url, options) => {
      assert.equal(new URL(url).pathname, `/api/operations/items/found/${code}/custody/${method === "POST" ? "transfer/" : ""}`);
      assert.equal(options.headers.Authorization,"Bearer access");
      assert.equal(options.cache,"no-store");
      if (method === "POST") assert.deepEqual(JSON.parse(options.body),{collection_point:2,note:"Conferido"});
      return Response.json(method === "POST" ? {id:5} : [], {status:method === "POST" ? 201:200});
    };
    const response=await custodyResponse(request(method,method === "POST" ? {collection_point:2,note:"Conferido"}:undefined),method === "POST" ? [code,"transfer"]:[code]);
    assert.equal(response.status,method === "POST" ? 201:200);
    assert.equal(response.headers.get("cache-control"),"private, no-store");
  }
});
test("anonymous and foreign-origin transfers never reach the backend",async () => {
  global.fetch=async()=>{throw new Error("Must not send");};
  assert.equal((await custodyResponse(request("POST",{collection_point:2},{origin:"https://other.example"}),[code,"transfer"])).status,403);
  assert.equal((await custodyResponse(request("POST",{collection_point:2},{cookie:""}),[code,"transfer"])).status,401);
});
test("rotated cookies are retained on backend validation failure",async()=>{
  let calls=0;
  global.fetch=async (url,options)=>{
    calls++;
    if (url.endsWith("/refresh/")) return Response.json({access:"new-access",refresh:"new-refresh"});
    if(options.headers.Authorization === "Bearer access") return Response.json({}, {status:401});
    return Response.json({detail:"Ponto lotado"},{status:400});
  };
  const response=await custodyResponse(request("POST",{collection_point:2},{cookie:"findly_access=access; findly_refresh=refresh"}),[code,"transfer"]);
  assert.equal(response.status,400); assert.equal(calls,3);
  assert(response.headers.get("set-cookie").includes("new-refresh"));
});
test("uncertain transfer failures are not retried and instruct custody verification",async()=>{
  let calls=0;
  global.fetch=async()=>{calls++; throw new Error("Disconnected");};
  const response=await custodyResponse(request("POST",{collection_point:2}),[code,"transfer"]);
  assert.equal(response.status,502); assert.equal(calls,1);
  assert((await response.json()).detail.includes("custódia"));
});
test("backend restrictions and throttling remain authoritative",async()=>{
  for (const status of [400,403,404,429]) {
    global.fetch=async()=>Response.json({detail:"Recusado"},{status,headers:{"Retry-After":"20"}});
    const response=await custodyResponse(request("POST",{collection_point:2}),[code,"transfer"]);
    assert.equal(response.status,status); assert.equal(response.headers.get("retry-after"),"20");
  }
});
