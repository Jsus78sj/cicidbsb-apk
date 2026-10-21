/* ═══ المرحلة ٢ من خطّة الهاتف: وضعُ الرسم ═══
   ١ · اختيارُ أداةٍ على الهاتف يُخفي القشرة ويُبقي البطاقةَ والقياسَ والأزرار
   ٢ · «الشاشة النظيفة» لا تُخفي القياس
   ٣ · حقلا الطول والزاوية بدل @5<45 (composeVals مشتركةٌ مع الإدخال الحركيّ)
   ٤ · لوحةُ المفاتيح لا تغطّي النقطة (keepVisible)
   ٥ · النقطةُ تُثبَّت عند الرفع · العدسة · نقرةٌ بإصبعين = تراجع
   التشغيل:  node src/tests/touch-phase2.test.js                      */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {shim,shimCanvas,shimDOM,fire,group,ok,eq,summary} from "./harness.js";
const ROOT=join(fileURLToPath(new URL(".",import.meta.url)),"..","..");
const rd=p=>{try{return readFileSync(join(ROOT,p),"utf8")}catch(e){return ""}};
const TC=rd("css/touch.css");
const block=(css,q)=>{
 const i=css.indexOf(q); if(i<0)return "";
 let d=0,k=css.indexOf("{",i),s=k;
 for(;k<css.length;k++){ if(css[k]==="{")d++; else if(css[k]==="}"){d--; if(!d)break} }
 return css.slice(s,k+1);
};
shim(); shimCanvas();
const doc=shimDOM();
for(const id of ["touchBar","optbar","cv","dynBox"]){
 const e=doc.createElement(id==="cv"?"canvas":"div");
 e.setAttribute("id",id); doc.body.appendChild(e);
}
if(!globalThis.window)globalThis.window={prompt:()=>null,confirm:()=>true};
for(const f of ["draw","openings","modify","annotate"])await import(`../tools/${f}.js`);
const R =await import("../tools/registry.js");
const TB=await import("../ui/touchbar.js");
const DY=await import("../ui/dyninput.js");
const CV=await import("../ui/canvas.js");
const ST=await import("../core/state.js");
const BUS=await import("../ui/bus.js");

group("٣ · التركيبُ من حقلين",()=>{
 const F=[{k:"L"},{k:"a"}];
 eq(DY.composeVals(F,["5","45"]),"@5<45","طولٌ وزاوية ⇒ الصيغةُ نفسُها لسطر الأوامر");
 eq(DY.composeVals(F,["3.2",""]),"3.2","طولٌ وحدَه ⇒ على الاتجاه الجاري");
 eq(DY.composeVals(F,["","90"]),"<90","زاويةٌ وحدَها ⇒ قفل");
 eq(DY.composeVals(F,["",""]),"","فارغان ⇒ لا شيء");
 eq(DY.composeVals([{k:"x"},{k:"y"}],["2",""]),"2,0","نقطةُ البداية: س وص");
 eq(DY.composeVals([{k:"a"}],["30"]),"30","خطوةُ زاويةٍ وحدَها");
});

group("٣ · الحقلان في شريط اللمس يرسمان",()=>{
 R.loadOpts(); R.setOpt("wall","chain",1);
 R.begin("wall");
 TB.syncTouchBar();
 eq(TB.measureFor(R.step()).map(f=>f.k).join(","),"x,y","البداية: س وص");
 R.feedPoint([0,0]);
 TB.syncTouchBar();
 eq(TB.measureFor(R.step()).map(f=>f.k).join(","),"L,a","بعد الأساس: الطول والزاوية");
 ok(doc.documentElement.classList.contains("cdMeas"),"html.cdMeas: البطاقةُ تعلو صفَّ القياس");
 const n=ST.S.walls.length;
 eq(TB.applyMeasure(["4","0"]),"@4<0","«طبّق» يركّب ويغذّي");
 eq(ST.S.walls.length,n+1,"جدارٌ جديد");
 const w=ST.S.walls[ST.S.walls.length-1];
 ok(w&&Math.abs(Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1])-4000)<1,"طولُه ٤ م بالضبط");
 eq(TB.pickAngle(90),90,"زرُّ ٩٠° يقفل الاتجاه");
 eq(TB.pickAngle(90),null,"ولمسةٌ ثانية تفكّه");
 eq(TB.applyMeasure(["",""]),false,"فارغان ⇒ لا شيء يُغذّى");
 R.cancel(true);
 TB.syncTouchBar();
 ok(!doc.documentElement.classList.contains("cdDraw"),"✕ يُخرج من وضع الرسم");
});

group("٤ · لوحةُ المفاتيح لا تغطّي النقطة",()=>{
 CV.V.w=400; CV.V.h=300; CV.V.k=0.05; CV.V.cx=0; CV.V.cy=0;
 eq(TB.keepVisible([0,0]),false,"نقطةٌ ظاهرة ⇒ لا إزاحة");
 ok(TB.keepVisible([0,-5000])===true,"نقطةٌ تحت الحافّة ⇒ إزاحة");
 const q=CV.W2S(0,-5000);
 ok(Math.abs(q[0]-200)<1&&Math.abs(q[1]-150)<1,"وتعود إلى منتصف اللوح");
});

group("٢ · الشاشةُ النظيفة لا تُخفي القياس",()=>{
 const dy=rd("src/ui/dyninput.js");
 ok(!/UIS\.clean/.test(dy),"syncDyn لا يسأل عن clean");
});

group("١ · وضعُ الرسم يُخفي القشرة على الهاتف وحده",()=>{
 const i=TC.indexOf("المرحلة ٢ · وضعُ الرسم");
 ok(i>0,"الكتلة موجودة");
 const b=block(TC.slice(i),"@media (max-width:768px)");
 for(const sel of ["#top","#ribbon","#status","#log","#fabDock"])
  ok(b.includes(`html.cdDraw ${sel}`),`${sel} يُخفى أثناء الأداة`);
 ok(/html\.cdDraw:not\(\.cdText\) #cmdWrap/.test(b),"وسطرُ الأوامر يبقى لخطوة النصّ");
 ok(/--bodyPadB:0px/.test(b),"ولا حجزَ لشريطٍ مخفيّ");
 ok(/#touchBar \.tbM\{display:none\}/.test(TC),"حقلا القياس لا يظهران على الحاسوب");
});

group("٥ · الإصبع: الرفعُ يثبّت · العدسة · إصبعان",()=>{
 const cv=rd("src/ui/canvas.js");
 ok(/if\(liftable\(\)\)\{/.test(cv)&&/lift=\{id:e\.pointerId/.test(cv),"اللمسُ والأداةُ فعّالة لا يضع نقطة");
 ok(/if\(e\.type!=="pointercancel"\)\{onMove\(le\); onDown\(le\)\}/.test(cv),"الرفعُ يثبّت والإلغاءُ لا يضع شيئاً");
 ok(/if\(lift\)\{lift=null; loupeOff\(\)\}/.test(cv),"إصبعٌ ثانٍ يُلغي النقطةَ المعلَّقة");
 ok(/st&&st\.freehand/.test(cv.slice(cv.indexOf("const liftable"))),"والرسمُ الحرّ مستثنى");
 ok(/paintLoupe\(\);/.test(cv),"العدسةُ تُرسم بعد اللوح في الإطار نفسِه");
 ok(/HOOK\.tap2\(\)/.test(cv)&&/TAP2_MS=300/.test(cv),"نقرةٌ بإصبعين تنادي التراجع");
 ok(/runTouch\("undo"\)\},TAP2_WAIT\)/.test(rd("src/ui/touchbar.js")),"والخطّافُ هو زرُّ ↶ نفسُه (بعد مهلة الملاءمة · المرحلة ٥)");
 ok(/#loupe\.on\{display:block\}/.test(TC),"وللعدسة تنسيق");
});
group("٥ · سلوكٌ بأحداثِ لمسٍ حقيقيّة",()=>{
 const cv=doc.getElementById("cv");
 const {HOOK}=BUS;
 CV.V.w=400; CV.V.h=300; CV.V.k=0.05; CV.V.cx=0; CV.V.cy=0;
 R.setOpt("wall","chain",1); R.begin("wall");
 const P=(t,id,x,y)=>fire(cv,t,{pointerType:"touch",pointerId:id,offsetX:x,offsetY:y,clientX:x,clientY:y,button:0});
 P("pointerdown",1,100,100);
 eq(R.T.ctx.pts.length,0,"اللمسُ وحدَه لا يضع نقطة");
 ok(CV.LOUPE.on,"والعدسةُ ظاهرة");
 P("pointermove",1,120,100); P("pointerup",1,120,100);
 eq(R.T.ctx.pts.length,1,"الرفعُ يثبّت النقطة");
 eq(R.T.ctx.pts[0][0],-1600,"في موضع الرفع لا اللمس");
 ok(!CV.LOUPE.on,"والعدسةُ تختفي");
 P("pointerdown",4,100,100); P("pointercancel",4,100,100);
 eq(R.T.ctx.pts.length,1,"pointercancel لا يضع شيئاً");
 let u=0; const old=HOOK.tap2; HOOK.tap2=()=>u++;
 P("pointerdown",2,200,100); P("pointerdown",3,250,100);
 P("pointerup",2,200,100); P("pointerup",3,250,100);
 eq(u,1,"نقرةٌ بإصبعين ⇒ تراجع مرّةً واحدة");
 eq(R.T.ctx.pts.length,1,"ولا نقطةَ من الإصبعين");
 HOOK.tap2=old; R.cancel(true);
});
summary();
