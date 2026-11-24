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
  new Function("require", "module", "exports", compiled)(requireFrontend, loaded, loaded.exports);
  return loaded.exports;
}
const {staffResponse,staffTarget}=loadModule("staff-proxy.ts");
const {updateSummary,validUpdates}=loadModule("notifications.ts");
const request=(query="",cookie="findly_access=access")=>new NextRequest(`http://localhost:3000/api/notifications/${query}`,{headers:{cookie}});
const entry=(extra={})=>({id:1,item:{public_code:"85X7C925S6",title:"Garrafa azul"},status:"PENDING",decision_note:"",message:"",created_at:"2026-11-20T12:00:00Z",updated_at:"2026-11-20T13:00:00Z",withdrawal:null,...extra});
test("notification projection always requests only the authenticated account's own claims",async()=>{
  global.fetch=async(url,options)=>{const parsed=new URL(url);assert.equal(parsed.pathname,"/api/operations/claims/");assert.equal(parsed.searchParams.get("mine"),"true");assert.equal(parsed.searchParams.get("page"),"2");assert.equal(parsed.searchParams.get("ordering"),"-created_at");assert(!parsed.searchParams.has("claimant"));assert(!parsed.searchParams.has("item"));assert.equal(options.headers.Authorization,"Bearer access");return Response.json({count:0,results:[],next:null,previous:null});};
  const response=await staffResponse(request("?mine=false&claimant=3&item=OTHER&page=2"),["updates"]);assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"private, no-store");
});
test("anonymous requests cannot read updates and this projection is read-only",async()=>{
  global.fetch=async()=>{throw new Error("No upstream expected");};assert.equal((await staffResponse(request("",""),["updates"])).status,401);assert.equal(staffTarget(["updates"],"POST"),null);
});
test("empty and real backend update pages are accepted while malformed entries are rejected",()=>{
  assert(validUpdates({count:0,results:[],next:null,previous:null}));assert(validUpdates({count:1,results:[entry()],next:null,previous:null}));
  for(const data of [null,{}, {count:1,results:[entry({status:"invented"})]}, {count:1,results:[{id:1}]}, {count:-1,results:[]}])assert(!validUpdates(data));
});
test("messages reflect real pending, approved, rejected and cancelled statuses",()=>{
  assert.equal(updateSummary(entry()).title,"Pedido enviado");assert.equal(updateSummary(entry({status:"REJECTED"})).title,"Pedido recusado");assert.equal(updateSummary(entry({status:"CANCELLED"})).title,"Pedido cancelado");
  assert.equal(updateSummary(entry({status:"APPROVED",withdrawal:{is_valid:true,used_at:null,expires_at:"2026-11-21T12:00:00Z"}})).title,"Pedido aprovado");
  assert.equal(updateSummary(entry({status:"APPROVED",withdrawal:{is_valid:false,used_at:null,expires_at:"2026-11-19T12:00:00Z"}})).title,"Autorização indisponível");
});
test("a used authorization is described as a completed withdrawal, not an unread approval",()=>{
  const used="2026-11-20T14:00:00Z";const summary=updateSummary(entry({status:"APPROVED",withdrawal:{is_valid:false,used_at:used,expires_at:"2026-11-21T12:00:00Z"}}));assert.equal(summary.title,"Retirada confirmada");assert.equal(summary.date,used);assert(!("unread" in summary));
});
