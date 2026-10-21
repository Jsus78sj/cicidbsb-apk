/* ═══ المرحلة ٥ من خطّة الهاتف: ثغراتُ وضع الرسم ═══
   ١ · ⚙ مساعدات: الالتقاط والتعامد والشبكة والملاءمة أثناء الرسم
   ٢ · نقرةٌ مزدوجةٌ بإصبعين = ملاءمة، ومفردةٌ = تراجع
   ٣ · قائمةُ الضغط المطوّل بلا (Enter) ولا (Esc)
   التشغيل:  node src/tests/touch-phase5.test.js                      */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {shim,shimCanvas,shimDOM,group,ok,eq,summary} from "./harness.js";
const ROOT=join(fileURLToPath(new URL(".",import.meta.url)),"..","..");
const rd=p=>{try{return readFileSync(join(ROOT,p),"utf8")}catch(e){return ""}};
shim(); shimCanvas();
const doc=shimDOM();
for(const id of ["touchBar","optbar","cv"]){
 const e=doc.createElement(id==="cv"?"canvas":"div");
 e.setAttribute("id",id); doc.body.appendChild(e);
}
if(!globalThis.window)globalThis.window={prompt:()=>null,confirm:()=>true};
await import("../tools/draw.js");
const R =await import("../tools/registry.js");
const TB=await import("../ui/touchbar.js");
const TT=await import("../ui/touchtext.js");
const ST=await import("../core/state.js");
const {HOOK}=await import("../ui/bus.js");
const CV=await import("../ui/canvas.js");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

group("١ · ⚙ مساعداتُ الرسم",()=>{
 R.begin("wall"); TB.resetTouchBar(); TB.syncTouchBar();
 const box=doc.getElementById("touchBar");
 ok(!!box.querySelector('[data-tb="aids"]'),"زرُّ ⚙ في شريط الرسم");
 eq(TB.AIDS.map(a=>a.k).join(","),"snap,ortho,polar,grid,gsnap","خمسةُ مفاتيح");
 TB.runTouch("aids");
 ok(TB.aidsIsOpen()&&!!box.querySelector(".tbPop"),"اللوحةُ تُفتح");
 ok(!!box.querySelector('[data-tb="fit"]'),"وفيها الملاءمة");
 const was=!!+ST.S.rb.ortho;
 eq(TB.toggleAid("ortho"),!was,"التعامدُ يتبدّل");
 eq(box.querySelector('[data-tg="ortho"]').getAttribute("aria-pressed"),String(!was),"والزرُّ يعكسه");
 ST.S.rb.polar=0; TB.toggleAid("polar");
 ok(!!+ST.S.rb.polar&&!+ST.S.rb.ortho,"القطبيُّ يُطفئ التعامد (كشريط الحالة)");
 eq(TB.toggleAid("nope"),null,"مفتاحٌ مجهول يُرفَض");
 TB.runTouch("aids");
 ok(!TB.aidsIsOpen()&&!box.querySelector(".tbPop"),"ولمسةٌ ثانية تُغلقها");
 R.cancel(true);
 ok(/HOOK\.rbToggle=k=>rbToggle\(k\)/.test(rd("src/app.js")),"وفي التطبيق تمرّ بـrbToggle نفسِها");
});

await (async()=>{
 TB.initTouchBar();
 let u=0, f=0;
 const ru=TB.runTouch;
 R.begin("wall"); R.feedPoint([0,0]); R.feedPoint([3000,0]);
 const n=ST.S.walls.length;
 HOOK.tap2(); await sleep(TB.TAP2_WAIT+60);
 group("٢ · إصبعان: مرّةً تراجع، ومرّتين ملاءمة",()=>{
  eq(ST.S.walls.length,n-1,"نقرةٌ واحدة ⇒ تراجع بعد المهلة");
 });
 CV.V.cx=99999; CV.V.cy=99999;
 HOOK.tap2(); HOOK.tap2(); await sleep(TB.TAP2_WAIT+60);
 group("٢ · (تابع)",()=>{
  eq(ST.S.walls.length,n-1,"نقرتان ⇒ لا تراجع");
  ok(CV.V.cx!==99999||CV.V.cy!==99999,"بل ملاءمة");
 });
 R.cancel(true);
})();

group("٣ · قائمةُ الضغط المطوّل",()=>{
 const t=s=>TT.touchText(s,true);
 eq(t("تأكيد (Enter)"),"تأكيد","(Enter) يُحذَف");
 eq(t("إلغاء الأداة (Esc)"),"إلغاء الأداة","(Esc) يُحذَف");
 eq(t("إغلاق (C)"),"إغلاق","حرفُ الخطوة يُحذَف");
 eq(t("افحص (F7)"),"افحص","ومفتاحُ الوظيفة");
 eq(TT.touchText("تأكيد (Enter)",false),"تأكيد (Enter)","والحاسوبُ كما هو");
 ok(/esc\(touchText\(r\.n\)\)/.test(rd("src/ui/ctxmenu.js")),"ctxmenu.js يمرّر التسميات بالمرشّح");
});
summary();
