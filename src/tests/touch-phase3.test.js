/* ═══ المرحلة ٣ من خطّة الهاتف: تقليلُ الزحام ═══
   ١ · أربعةُ تبويباتٍ على الهاتف والباقي في «المزيد»
   ٢ · وضعُ المبتدئ في أوّل تشغيلٍ على الهاتف
   ٣ · جولةُ الهاتف: جدار ← باب ← حفظ
   ٤ · زرُّ المساعدة يُسحَب ولا يغطّي الأدوات
   ٥ · زرُّ الرجوع: أداة ← مفتوح ← تحديد ← خروج
   التشغيل:  node src/tests/touch-phase3.test.js                      */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {shim,shimCanvas,shimDOM,group,ok,eq,summary} from "./harness.js";
const ROOT=join(fileURLToPath(new URL(".",import.meta.url)),"..","..");
const rd=p=>{try{return readFileSync(join(ROOT,p),"utf8")}catch(e){return ""}};
const TC=rd("css/touch.css");
shim(); shimCanvas();
const doc=shimDOM();
for(const id of ["ribbon","cv","touchBar","optbar","tour"]){
 const e=doc.createElement(id==="cv"?"canvas":"div");
 e.setAttribute("id",id); doc.body.appendChild(e);
}
if(!globalThis.window)globalThis.window={prompt:()=>null,confirm:()=>true};
for(const f of ["draw","openings","modify"])await import(`../tools/${f}.js`);
const R =await import("../tools/registry.js");
const RN=await import("../ui/ribbon/render.js");
const FD=await import("../ui/fabdrag.js");
const BN=await import("../ui/backnav.js");
const TR=await import("../ui/tour.js");
const ST=await import("../ui/store.js");

group("١ · أربعةُ تبويباتٍ والباقي في «المزيد»",()=>{
 eq(RN.PHONE_TABS.join(","),"draw,edit,view,out","رسم · تعديل · عرض · إخراج");
 RN.buildRibbon();
 const rb=doc.getElementById("ribbon");
 const tabs=[...rb.querySelectorAll(".rbTab")];
 eq(tabs.length,7,"الحاسوبُ يرى السبعةَ كما كانت");
 const sec=tabs.filter(b=>b.classList.contains("sec")).map(b=>b.dataset.tab);
 eq(sec.join(","),"annt,serv,mng","الثانويةُ ثلاثة");
 const menu=doc.getElementById("rbMoreMenu");
 ok(menu&&menu.hidden,"قائمة «المزيد» مغلقةٌ أوّلاً");
 const items=[...menu.querySelectorAll("[data-tab]")].map(b=>b.dataset.tab);
 eq(items.join(","),"annt,serv,mng","وفيها الثلاثة");
 ok(!!menu.querySelector('[data-act="beginner"]'),"ومفتاحُ وضع المبتدئ");
 eq(RN.toggleMoreTabs(),true,"تُفتح");
 ok(RN.moreTabsOpen(),"ومفتوحة");
 RN.setTab("annt");
 ok(!RN.moreTabsOpen(),"اختيارُ تبويبٍ يغلقها");
 const mb=doc.getElementById("rbMoreTab");
 ok(mb.classList.contains("on"),"و«المزيد» يُبرَز حين يكون الثانويُّ نشطاً");
 eq(mb.querySelector(".tn").textContent,"تأشير","ويحمل اسمَه");
 RN.setTab("draw");
 eq(mb.querySelector(".tn").textContent,"المزيد","ويعود اسمُه");
 ok(/#rbMoreTab, #rbMoreMenu\{display:none\}/.test(TC),"مخفيّان على الحاسوب");
 ok(/#rbTabs \.rbTab\.sec\{display:none\}/.test(TC),"والثانويةُ تُخفى على الهاتف وحده");
 ok(/toggleMoreTabs\(\)/.test(rd("src/ui/ribbon/wire.js")),"والنقرةُ موصولة");
});

group("٢ · وضعُ المبتدئ في أوّل تشغيلٍ على الهاتف",()=>{
 const s=rd("src/ui/store.js");
 ok(/function phoneDefaults\(\)\{[\s\S]*?UIS\.beginner=1/.test(s),"phoneDefaults تشغّله");
 ok(/if\(!raw\)\{phoneDefaults\(\)/.test(s),"عند غياب التفضيلات وحده (أوّل تشغيل)");
});

group("٣ · جولةُ الهاتف",()=>{
 eq(TR.STEPS_PHONE.length,3,"ثلاثُ خطوات");
 ok(/جدار/.test(TR.STEPS_PHONE[0].t)&&/باب/.test(TR.STEPS_PHONE[1].t)&&/احفظ/.test(TR.STEPS_PHONE[2].t),
  "جدار ← باب ← حفظ");
 ok(TR.STEPS_PHONE.every(x=>!/Ctrl|F7|F1|Enter|Esc\b/.test(x.s)),"بلا اختصارات لوحة مفاتيح");
 ok(typeof TR.STEPS_PHONE[2].act.fn==="function","والحفظُ زرٌّ في البطاقة");
 TR.STEPS_PHONE[0].go();
 eq(R.T.def&&R.T.def.id,"wall","الخطوةُ الأولى تفعّل الجدار");
 R.cancel(true);
 ok(/CUR=\(!full&&isPhone\(\)\)\?STEPS_PHONE:STEPS/.test(rd("src/ui/tour.js")),"والحاسوبُ يبقى على الجولة الكاملة");
});

group("٤ · زرُّ المساعدة يُسحَب",()=>{
 eq(FD.placeFab(100,100,52,52,400,800,false).s,74,"LTR: المسافةُ من اليسار");
 eq(FD.placeFab(100,100,52,52,400,800,true).s,274,"RTL: المسافةُ من اليمين");
 const p=FD.placeFab(-50,5000,52,52,400,800,false);
 ok(p.s>=6&&p.t<=800-52-6,"ولا يخرج من الشاشة");
 ok(/makeDraggable\(helpBot&&helpBot\.fab\)/.test(rd("src/app.js")),"موصولٌ بزرّ المساعدة");
 ok(/body \.hb-fab\.moved\{/.test(TC),"وللموضع المسحوب تنسيق");
 ok(/html\.cdDraw body \.hb-fab/.test(TC),"ويختفي أثناء الرسم");
});

group("٥ · زرُّ الرجوع",()=>{
 R.begin("wall");
 eq(BN.backStep(),"tool","الأداةُ الجارية أوّلاً");
 ok(!R.active(),"وأُلغيت");
 RN.toggleMoreTabs(true);
 eq(BN.backStep(),"more","ثمّ المفتوح");
 eq(BN.backStep(),null,"ولا شيء ⇒ المنصّةُ تطلب ضغطةً ثانية");
 const P=rd("src/platform/index.js");
 ok(/initNative\(\{onPause,onBack\}=\{\}\)/.test(P)&&/r=onBack\(\)/.test(P),"المنصّةُ تسأل الواجهةَ أوّلاً");
 ok(/onBack:backStep/.test(rd("src/app.js")),"وapp.js يمرّر backStep");
});
summary();
