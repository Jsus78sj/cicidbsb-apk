/* ═══ المرحلة ٨ من خطّة الهاتف: تقليلُ الزحام ٢ ═══
   ١ · شريطُ التحديد: نقل · نسخ · تدوير · حذف · خصائص · ✕
   ٢ · أزرارُ الترويسة ٤٤ بكسلاً على الهاتف
   ٣ · السجلُّ تنبيهاً عابراً
   التشغيل:  node src/tests/touch-phase8.test.js                      */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {shim,shimCanvas,shimDOM,group,ok,eq,summary} from "./harness.js";
const ROOT=join(fileURLToPath(new URL(".",import.meta.url)),"..","..");
const rd=p=>{try{return readFileSync(join(ROOT,p),"utf8")}catch(e){return ""}};
const TC=rd("css/touch.css");
shim(); shimCanvas();
const doc=shimDOM();
for(const id of ["touchBar","optbar","cv"]){
 const e=doc.createElement(id==="cv"?"canvas":"div");
 e.setAttribute("id",id); doc.body.appendChild(e);
}
if(!globalThis.window)globalThis.window={prompt:()=>null,confirm:()=>true};
for(const f of ["draw","modify"])await import(`../tools/${f}.js`);
const R =await import("../tools/registry.js");
const TB=await import("../ui/touchbar.js");
const CV=await import("../ui/canvas.js");
const ST=await import("../core/state.js");
const TO=await import("../ui/toast.js");

group("١ · شريطُ التحديد",()=>{
 eq(TB.selFor(0).length,0,"لا تحديد ⇒ لا شريط");
 eq(TB.selFor(2).map(x=>x.k).join(","),"s:move,s:copy,s:rotate,del,props,clear","ستّةُ أفعال");
 R.loadOpts(); R.setOpt("wall","chain",1);
 R.begin("wall"); R.feedPoint([0,0]); R.feedPoint([4000,0]); R.cancel(true);
 const w=ST.S.walls[ST.S.walls.length-1];
 CV.setSel([{k:"wall",id:w.id}],{k:"wall",id:w.id});
 TB.resetTouchBar(); TB.syncTouchBar();
 ok(doc.documentElement.classList.contains("cdSel"),"html.cdSel مع التحديد");
 const box=doc.getElementById("touchBar");
 ok(!!box.querySelector('[data-tb="del"]'),"وزرُّ الحذف ظاهر");
 R.H.sel=()=>CV.selList();   /* كما يوصله app.js */
 TB.runTouch("s:move");
 eq(R.T.def&&R.T.def.id,"move","«نقل» يبدأ أداةَ النقل بالتحديد الجاري");
 R.cancel(true);
 CV.setSel([{k:"wall",id:w.id}],{k:"wall",id:w.id});
 const n=ST.S.walls.length;
 TB.runTouch("del");
 eq(ST.S.walls.length,n-1,"«حذف» يحذف المحدَّد (delSel نفسُها)");
 TB.syncTouchBar();
 ok(!doc.documentElement.classList.contains("cdSel"),"ولا تحديدَ بعده ⇒ يختفي الشريط");
 ok(/syncTouchBar\(\)\};/.test(rd("src/app.js").match(/HOOK\.props=[^\n]*/)[0]),"HOOK.props يزامنه");
 ok(/html\.cdSel #touchBar\{/.test(TC)&&/html\.cdSel #thumb\{display:none/.test(TC),"وله موضعُ شريطِ الإبهام");
});

group("٢ · الترويسة",()=>{
 const i=TC.indexOf("المرحلة ٨ · تقليلُ الزحام ٢");
 const t=TC.slice(i);
 ok(/#qat button\{width:44px; height:44px\}/.test(t),"٤٤ × ٤٤ على الهاتف");
 for(const a of ["fnew","xOpen","xPdf","inspect","learn"])
  ok(t.includes(`#qat button[data-act="${a}"]`),`«${a}» إلى القائمة`);
 ok(!/data-act="(xSave|undo|redo|fit)"\]/.test(t),"والحفظُ والتراجعُ والإعادةُ والملاءمةُ تبقى");
});

group("٣ · السجلُّ تنبيهاً عابراً",()=>{
 eq(TO.toast("in","x"),false,"على الحاسوب لا تنبيه");
 const P=rd("src/ui/props.js");
 ok(/toast\(cls,d\.textContent\)/.test(P),"rep() يرسل كلَّ رسالةٍ إليه");
 ok(/html:not\(\.logOpen\) #log\{display:none/.test(TC),"والسجلُّ مخفيٌّ على الهاتف حتى يُفتح");
 ok(/aria-hidden","true"/.test(rd("src/ui/toast.js")),"ولا يُقرأ مرّتين (السجلُّ يُعلن)");
 ok(/MS=\{er:4000,wr:3200\}/.test(rd("src/ui/toast.js")),"والخطأُ يبقى أطول");
});
summary();
