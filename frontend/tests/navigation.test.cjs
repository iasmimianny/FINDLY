const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const requireFrontend = createRequire(path.resolve(__dirname, "../package.json"));
const ts = requireFrontend("typescript");
const { NextRequest } = requireFrontend("next/server");
function moduleFrom(file) {
  const source=fs.readFileSync(path.resolve(__dirname,"..",file),"utf8");
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
  const loaded={exports:{}};
  const requireLocal=(name)=>name==="./lib/navigation"?navigation:requireFrontend(name);
  new Function("require","module","exports",compiled)(requireLocal,loaded,loaded.exports);
  return loaded.exports;
}
const navigation=moduleFrom("lib/navigation.ts");
const {proxy}=moduleFrom("proxy.ts");
const {accountLinks,isActiveNavigation,navigationMenus,staffAccountRedirect}=navigation;
const request=(pathname,cookie="findly_access=access")=>new NextRequest(`http://localhost:3000${pathname}`,{headers:{cookie}});
test("account destinations stay within the chosen area",()=>{
  for(const area of ["staff","user"]){const links=accountLinks(area);for(const path of Object.values(links))assert.equal(path.startsWith("/funcionario/"),area==="staff");}
  assert.equal(accountLinks("staff").profile,"/funcionario/perfil");
  assert.equal(accountLinks("user").profile,"/perfil");
});
test("nested detail pages keep their parent sidebar entry active",()=>{
  assert(isActiveNavigation("/funcionario/inventario/85X7C925S6","/funcionario/inventario"));
  assert(isActiveNavigation("/pontos-coleta/12","/pontos-coleta"));
  assert(!isActiveNavigation("/funcionario/inventario-extra","/funcionario/inventario"));
});
test("staff menus contain no links to student pages",()=>{
  assert(navigationMenus.staff.every((item)=>item.href.startsWith("/funcionario/")));
  assert(navigationMenus.user.every((item)=>!item.href.startsWith("/funcionario/")));
  assert.equal(staffAccountRedirect("/perfil","common"),null);
  assert.equal(staffAccountRedirect("/funcionario/perfil","operator"),null);
});
test("legacy account links redirect staff using the validated backend role",async()=>{
  for(const role of ["operator","admin"]){for(const [from,to] of [["/perfil","/funcionario/perfil"],["/configuracao","/funcionario/configuracao"],["/faq","/funcionario/faq"],["/dashboard","/funcionario/painel"]]){
    global.fetch=async()=>Response.json({role});const response=await proxy(request(from));assert.equal(response.status,303);assert.equal(new URL(response.headers.get("location")).pathname,to);
  }}
});
test("common accounts retain their pages and cannot enter staff profile/settings/help",async()=>{
  global.fetch=async()=>Response.json({role:"common"});
  for(const pathname of ["/perfil","/configuracao","/faq","/dashboard"])assert.equal((await proxy(request(pathname))).status,200);
  for(const pathname of ["/funcionario/perfil","/funcionario/configuracao","/funcionario/faq"])assert.equal((await proxy(request(pathname))).status,403);
});
test("expired sessions redirect to login and unavailable identity never selects an area",async()=>{
  assert.equal(new URL((await proxy(request("/perfil",""))).headers.get("location")).pathname,"/login");
  global.fetch=async()=>Response.json({},{status:500});assert.equal((await proxy(request("/perfil"))).status,503);
});
test("renewed cookies are preserved when a legacy profile redirects to staff",async()=>{
  let count=0;global.fetch=async(url)=>{count++;if(url.endsWith("/refresh/"))return Response.json({access:"new-access",refresh:"new-refresh"});return count===1?Response.json({},{status:401}):Response.json({role:"operator"});};
  const response=await proxy(request("/perfil","findly_access=old; findly_refresh=refresh"));assert.equal(response.status,303);assert.equal(count,3);assert(response.headers.get("set-cookie").includes("new-refresh"));
});
