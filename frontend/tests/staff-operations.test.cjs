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
const { staffTarget, validStaffInput, staffResponse } = loadModule("staff-proxy.ts");
const origin="http://localhost:3000";
const code="85X7C925S6";
const request=(path, method="GET", body, headers={})=>new NextRequest(origin+path,{method,headers:{origin,cookie:"findly_access=access",...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
test("staff routes match existing backend endpoints and refuse arbitrary URLs and methods",()=>{
  for (const [parts,expected] of [[["items"],"/api/items/found/"],[["items",code],`/api/items/found/${code}/`],[["items",code,"history"],`/api/items/found/${code}/history/`],[["items",code,"label"],`/api/operations/items/found/${code}/label/`],[["claims"],"/api/operations/claims/"],[["audit"],"/api/audit/"]]) assert.equal(staffTarget(parts,"GET"),expected);
  assert.equal(staffTarget(["claims","3","approve"],"POST"),"/api/operations/claims/3/approve/");
  assert.equal(staffTarget(["claims","3","reject"],"POST"),"/api/operations/claims/3/reject/");
  assert.equal(staffTarget(["claims","3","reissue"],"POST"),"/api/operations/claims/3/reissue/");
  assert.equal(staffTarget(["withdrawal"],"POST"),"/api/operations/withdrawals/confirm/");
  for(const parts of [[],[".."],["items","wrong"],["claims","03","approve"],["claims","1","cancel"],["https://example.com"]]) assert.equal(staffTarget(parts,"POST"),null);
  assert.equal(staffTarget(["items"],"DELETE"),null);
});
test("writes accept only the correct decision or withdrawal payload",()=>{
  assert(validStaffInput(["claims","3","approve"],{decision_note:"Conferido"}));
  assert(validStaffInput(["claims","3","reject"],{}));
  assert(validStaffInput(["claims","3","reissue"],{decision_note:"Identidade conferida"}));
  assert(validStaffInput(["withdrawal"],{token:"test-token"}));
  for(const value of [{token:""},{token:" "},{token:"x".repeat(256)},{token:"valid",user:5},[]]) assert(!validStaffInput(["withdrawal"],value));
  assert(!validStaffInput(["claims"],{status:"APPROVED"}));
});
test("inventory, claims and audit forward only supported pagination and filters",async()=>{
  const cases=[[["items"],"status=EM_CUSTODIA&category=chaves&page=2",["status","category","page"]],[["claims"],`status=PENDING&item=${code}&page=3`,["status","item","page"]],[["audit"],"collection_point=2&action=CREATED&page=1",["collection_point","action","page"]]];
  for(const [segments,query,keys] of cases){
    global.fetch=async(url,options)=>{const uri=new URL(url);assert(!uri.searchParams.has("user"));for(const key of keys)assert(uri.searchParams.has(key));assert.equal(options.headers.Authorization,"Bearer access");assert.equal(options.cache,"no-store");return Response.json({count:0,results:[],next:null,previous:null});};
    assert.equal((await staffResponse(request(`/api/staff/?${query}&user=123`),segments)).status,200);
  }
});
test("decision and physical withdrawal are separate POST requests",async()=>{
  for(const [parts,body] of [[["claims","3","approve"],{decision_note:"Conferido"}],[["claims","3","reject"],{decision_note:"Não corresponde"}],[["withdrawal"],{token:"opaque-test-token"}]]){
    global.fetch=async(url,options)=>{assert.equal(options.method,"POST");assert.deepEqual(JSON.parse(options.body),body);return Response.json({id:3});};
    assert.equal((await staffResponse(request("/api/staff/","POST",body),parts)).status,200);
  }
});
test("missing sessions and cross-origin writes do not reach the backend",async()=>{
  global.fetch=async()=>{throw new Error("Unexpected request");};
  assert.equal((await staffResponse(request("/api/staff/","POST",{token:"test"},{origin:"https://other.example"}),["withdrawal"])).status,403);
  assert.equal((await staffResponse(request("/api/staff/","GET",undefined,{cookie:""}),["items"])).status,401);
});
test("permission checks, invalid workflow states and throttling come from Django",async()=>{
  for(const status of [400,403,404,429]){global.fetch=async()=>Response.json({detail:"Recusado"},{status,headers:{"Retry-After":"12"}});const response=await staffResponse(request("/api/staff/","POST",{token:"test"}),["withdrawal"]);assert.equal(response.status,status);assert.equal(response.headers.get("retry-after"),"12");}
});
test("rotated refresh cookies survive a rejected decision without retry loops",async()=>{
  let count=0;global.fetch=async(url,options)=>{count++;if(url.endsWith("/refresh/"))return Response.json({access:"renewed",refresh:"rotated"});if(options.headers.Authorization==="Bearer access")return Response.json({},{status:401});return Response.json({detail:"Estado inválido"},{status:400});};
  const response=await staffResponse(request("/api/staff/","POST",{decision_note:""},{cookie:"findly_access=access; findly_refresh=refresh"}),["claims","3","approve"]);
  assert.equal(response.status,400);assert.equal(count,3);assert(response.headers.get("set-cookie").includes("rotated"));
});
test("QR labels remain PNG responses and reject non-image success bodies",async()=>{
  global.fetch=async()=>new Response(new Uint8Array([137,80,78,71]),{headers:{"Content-Type":"image/png"}});
  let response=await staffResponse(request("/api/staff/"),["items",code,"label"]);assert.equal(response.headers.get("content-type"),"image/png");assert.equal(response.headers.get("cache-control"),"private, no-store");
  global.fetch=async()=>Response.json({detail:"not an image"});response=await staffResponse(request("/api/staff/"),["items",code,"label"]);assert.equal(response.status,502);
});
test("network failures do not automatically repeat decisions or withdrawals",async()=>{
  let count=0;global.fetch=async()=>{count++;throw new Error("Disconnected");};const response=await staffResponse(request("/api/staff/","POST",{token:"test"}),["withdrawal"]);assert.equal(response.status,502);assert.equal(count,1);
});
