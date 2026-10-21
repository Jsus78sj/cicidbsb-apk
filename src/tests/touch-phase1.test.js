/* ═══ المرحلة ١ من خطّة الهاتف ═══
   ١ · أزرار ✓ ⭘ ↶ ✕ أثناء الرسم (ui/touchbar.js) تنادي مسارَ المفاتيح نفسَه
   ٢ · بطاقةُ الخيارات تُطوى على الهاتف (optbar.js + touch.css)
   ٣ · بحثُ قائمة التطبيق هو فهرسُ لوحة الأوامر نفسُه (appmenu.js)
   ٤ · لا Ctrl ولا Esc في رسائل الهاتف (ui/touchtext.js)
   ٥ · نطاقُ الالتقاط والإبراز يكبر مع الإصبع (canvas.js)
   التشغيل:  node src/tests/touch-phase1.test.js                      */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {shim,shimCanvas,shimDOM,group,ok,eq,summary} from "./harness.js";
const ROOT=join(fileURLToPath(new URL(".",import.meta.url)),"..","..");
const rd=p=>{try{return readFileSync(join(ROOT,p),"utf8")}catch(e){return ""}};
const TC=rd("css/touch.css"), HTML=rd("index.html");
const block=(css,q)=>{
 const i=css.indexOf(q); if(i<0)return "";
 let d=0,k=css.indexOf("{",i),s=k;
 for(;k<css.length;k++){ if(css[k]==="{")d++; else if(css[k]==="}"){d--; if(!d)break} }
 return css.slice(s,k+1);
};

shim(); shimCanvas();
const doc=shimDOM();
for(const id of ["touchBar","optbar","cv","thumb","recent"]){
 const e=doc.createElement(id==="cv"?"canvas":"div");
 e.setAttribute("id",id); doc.body.appendChild(e);
}
if(!globalThis.window)globalThis.window={prompt:()=>null,confirm:()=>true};
for(const f of ["draw","openings","modify"])await import(`../tools/${f}.js`);
const R =await import("../tools/registry.js");
const TT=await import("../ui/touchtext.js");
const TB=await import("../ui/touchbar.js");
const ST=await import("../core/state.js");

group("٤ · رسائلُ الهاتف بلا مفاتيح",()=>{
 const t=s=>TT.touchText(s,true);
 eq(t("احفظ المشروع ملفّاً (Ctrl+S) احتياطاً، ورسمك سليم."),
  "احفظ المشروع ملفّاً احتياطاً، ورسمك سليم.","القوسُ حول الاختصار يُحذَف بقوسه");
 eq(t("ماكرو · 3 سطراً — Ctrl+Z يتراجع عنه كلّه"),
  "ماكرو · 3 سطراً — ↶ يتراجع عنه كلّه","Ctrl+Z يصير زرَّ التراجع");
 eq(t("Ctrl+Shift+Z"),"↷","Ctrl+Shift+Z قبل Ctrl+Z");
 eq(t("جدار · Esc يلغي"),"جدار · ✕ يلغي","Esc يصير زرَّ الإلغاء");
 eq(t("لوحة السجل · Ctrl+Shift+H · قفز"),"لوحة السجل · قفز","المقطعُ بلا مقابلٍ يُحذَف بفاصله");
 eq(t("نقطتان لكل جدار · C يغلق · Enter ينهي السلسلة · Esc يخرج · U يتراجع"),
  "نقطتان لكل جدار · ⭘ يغلق · ✓ ينهي السلسلة · ✕ يخرج · ↶ يتراجع","وتلميحُ الأداة يسمّي الأزرار");
 eq(t("نصٌّ عاديّ بلا مفاتيح"),"نصٌّ عاديّ بلا مفاتيح","ما لا مفتاحَ فيه لا يُمَسّ");
 const s="احفظ (Ctrl+S) · Esc يلغي";
 eq(TT.touchText(s,false),s,"وعلى الحاسوب يبقى النصُّ حرفاً");
 ok(/touchText\(msg\)/.test(rd("src/ui/props.js")),"rep() يمرّر رسائلَ السجلّ بالمرشّح");
 ok(/eInfo=m=>[^\n]*touchText/.test(rd("src/ui/props.js")),"وeInfo كذلك");
 const app=rd("src/app.js");
 ok(/const p=touchText\(/.test(app)&&/const h=touchText\(/.test(app),
  "وموجِّهُ سطر الأوامر وتلميحُ الحالة");
});

group("١ · أزرار الرسم: ما يظهر",()=>{
 eq(TB.barFor(null,null).length,0,"لا أداة ⇒ لا أزرار");
 const ks=L=>L.map(x=>x.k).join(",");
 eq(ks(TB.barFor({id:"x"},{loop:1,opts:{c:{n:"إغلاق"},u:{n:"تراجع"}}})),
  "ok,close,undo,aids,esc","سلسلةٌ تقبل الإغلاق ⇒ الأربعة + ⚙ (المرحلة ٥)");
 eq(ks(TB.barFor({id:"x"},{p:"نقطة"})),"undo,aids,esc",
  "خطوةُ نقطةٍ واحدة ⇒ لا «إنهاء» يَعِد بما لا يفعل");
 eq(ks(TB.barFor({id:"x"},{confirm:1})),"ok,undo,aids,esc","خطوةُ تأكيد ⇒ «إنهاء»");
});

group("١ · أزرار الرسم: مسارُ المفاتيح نفسُه",()=>{
 R.loadOpts(); R.setOpt("wall","chain",1);
 R.begin("wall");
 ok(R.active(),"الجدار فعّال");
 TB.syncTouchBar();
 ok(doc.documentElement.classList.contains("cdDraw"),"html.cdDraw أثناء الأداة");
 R.feedPoint([0,0]); R.feedPoint([4000,0]); R.feedPoint([4000,3000]);
 const n0=ST.S.walls.length;
 ok(n0>=2,"جداران مرسومان");
 TB.runTouch("undo");
 eq(ST.S.walls.length,n0-1,"↶ يتراجع خطوةً داخل الأداة (U)");
 R.feedPoint([4000,3000]); R.feedPoint([0,3000]);
 const st=R.step();
 ok(st&&st.opts&&st.opts.c,"الخطوةُ تعرض الإغلاق");
 const n1=ST.S.walls.length;
 TB.runTouch("close");
 ok(ST.S.walls.length>n1,"⭘ يغلق الشكل (C)");
 if(R.active())TB.runTouch("esc");
 ok(!R.active(),"✕ يُنهي الأداة (Esc)");
 TB.syncTouchBar();
 ok(!doc.documentElement.classList.contains("cdDraw"),"وتُرفَع html.cdDraw");
 eq(TB.runTouch("???"),false,"مفتاحٌ مجهول لا يفعل شيئاً");
});

group("١ · أزرار الرسم: الصفحة والتنسيق",()=>{
 ok(/id="touchBar"[^>]*role="toolbar"/.test(HTML),"#touchBar في الصفحة بدور شريط أدوات");
 ok(/#touchBar\{display:none\}/.test(TC),"مخفيٌّ افتراضاً (الحاسوب)");
 ok(/html\.cdDraw #touchBar\{/.test(TC),"ويظهر أثناء الأداة وحدها");
 const b=block(TC,"#touchBar .tbB button{");
 ok(/block-size:48px/.test(b),"أهدافٌ بارتفاع ٤٨ بكسلاً");
 ok(/html\.cdDraw #thumb\{display:none/.test(TC),"وشريطُ الإبهام يُخلي مكانه");
 ok(/syncTouchBar\(\)/.test(rd("src/app.js")),"syncPrompt يزامنه");
 ok(/touchbar\.js/.test(rd("sw.js")),"وفي قائمة العامل دون اتصال");
});

group("٢ · بطاقةُ الخيارات مطويّة على الهاتف",()=>{
 const ob=rd("src/ui/optbar.js");
 ok(/id="obFold"/.test(ob),"زرُّ الطيّ يُبنى");
 ok(/data(set)?\.fold|dataset\.fold/.test(ob),"والحالةُ سمةٌ data-fold");
 ok(/if\(foldTool!==d\.id\)\{fold=true/.test(ob),"كلُّ أداةٍ جديدةٍ تبدأ مطويّة");
 ok(/t\.id==="cv"\)setFold\(true\)/.test(ob),"ولمسةُ اللوح تطويها");
 ok(/#obFold\{display:none\}/.test(TC),"الزرُّ لا يُرى على الحاسوب");
 ok(/#optbar\[data-fold="1"\] > :not\(\.tl\):not\(#obFold\)\{display:none/.test(TC),
  "المطويّةُ تُبقي الاسمَ والملخّصَ وحدَهما");
});

group("٣ · بحثٌ واحد",()=>{
 const am=rd("src/ui/appmenu.js");
 ok(/paletteQuery/.test(am)&&/paletteExec/.test(am),"قائمةُ التطبيق تسأل فهرسَ اللوحة وتنفّذ بمنفّذها");
 ok(!/type==="cmd"/.test(am),"ولا ترشيحَ للأدوات وحدها");
 const pl=rd("src/ui/palette.js");
 ok(/key:"app\.clean",label:"شاشة نظيفة"/.test(pl),"و«شاشة نظيفة» في ذلك الفهرس");
});

group("٥ · نطاقُ الإصبع",()=>{
 const cv=rd("src/ui/canvas.js");
 ok(/TOL=\{snap:\[16,28\],pick:\[14,22\],grip:\[8,22\]\}/.test(cv),"جدولٌ واحدٌ: فأرة/لمس");
 ok(/const tol=tolPx\("snap"\)/.test(cv),"الالتقاطُ منه");
 ok(!/14\/V\.k/.test(cv),"ولا ١٤ ثابتةٌ في الإبراز: المُبرَزُ هو ما يُلتقَط");
});
summary();
