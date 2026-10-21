/* ═══ المرحلة ٦ من خطّة الهاتف: الأداء ═══
   ١ · طبقةُ المخطّط المحفوظة: الحركةُ ترسم الحيَّ وحدَه فوق نسخةٍ محفوظة
   ٢ · المنظرُ تغيّر ⇒ إطارٌ كامل (لا صورةَ قديمة تُعرَض)
   ٣ · القرصُ يحرّك الصورةَ نفسَها (gestXf) ثم إطارٌ كامل عند الرفع
   ٤ · مزامنةُ الواجهة مرّةً لكلّ إطار على المسار الساخن
   التشغيل:  node src/tests/touch-phase6.test.js                      */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
import {shim,shimCanvas,shimDOM,fire,group,ok,eq,near,summary} from "./harness.js";
const ROOT=join(fileURLToPath(new URL(".",import.meta.url)),"..","..");
const rd=p=>{try{return readFileSync(join(ROOT,p),"utf8")}catch(e){return ""}};
shim(); shimCanvas();
const doc=shimDOM();
for(const id of ["cv","touchBar","optbar"]){
 const e=doc.createElement(id==="cv"?"canvas":"div");
 e.setAttribute("id",id); doc.body.appendChild(e);
}
if(!globalThis.window)globalThis.window={prompt:()=>null,confirm:()=>true};
await import("../tools/draw.js");
const R =await import("../tools/registry.js");
const CV=await import("../ui/canvas.js");
const {HOOK}=await import("../ui/bus.js");
const L=CV.LSTAT;
const d=()=>({full:L.full,fx:L.fx,gest:L.gest});
CV.V.w=400; CV.V.h=300; CV.V.dpr=1; CV.V.k=0.05; CV.V.cx=0; CV.V.cy=0;

group("١ · الحركةُ لا تعيد رسم المخطّط",()=>{
 CV.draw();
 const a=d();
 CV.drawFx();
 const b=d();
 eq(b.fx-a.fx,1,"drawFx ⇒ إطارٌ حيّ");
 eq(b.full-a.full,0,"ولا إطارَ كاملاً");
 CV.drawFx(); CV.draw();
 const c=d();
 eq(c.full-b.full,1,"وdraw() يبقى كاملاً دائماً");
 const cv=doc.getElementById("cv");
 R.begin("wall");
 const e0=d();
 for(let i=0;i<20;i++)fire(cv,"mousemove",{offsetX:100+i,offsetY:100,clientX:100+i,clientY:100,button:0});
 const e1=d();
 eq(e1.full-e0.full,0,"عشرون حركةً بالأداة ⇒ صفرُ إطارٍ كامل");
 ok(e1.fx-e0.fx>=20,"وكلُّها إطاراتٌ حيّة");
 R.cancel(true);
});

group("٢ · المنظرُ تغيّر ⇒ كامل",()=>{
 CV.draw();
 CV.V.cx+=500;               /* تغييرٌ لم يمرّ بـdraw() */
 const a=d(); CV.drawFx(); const b=d();
 eq(b.full-a.full,1,"بصمةٌ لا تطابق ⇒ يعود كاملاً");
 eq(b.fx-a.fx,0,"ولا يُعرَض المحفوظُ القديم");
});

group("٣ · القرص",()=>{
 const g={k:0.05,cx:0,cy:0}, v={k:0.1,cx:200,cy:-100,w:400,h:300,dpr:2};
 const x=CV.gestXf(g,v);
 /* نقطةٌ عالميّة (1000,500): موضعُها عند البدء ثم بالتحويل = موضعُها الآن */
 const sx0=(1000-g.cx)*g.k+v.w/2, sy0=v.h/2-(500-g.cy)*g.k;
 const sx1=(1000-v.cx)*v.k+v.w/2, sy1=v.h/2-(500-v.cy)*v.k;
 near((sx0*v.dpr)*x.a+x.e, sx1*v.dpr,1e-6,"س تنطبق");
 near((sy0*v.dpr)*x.a+x.f, sy1*v.dpr,1e-6,"ص تنطبق");
 eq(x.a,2,"والمقياسُ نسبةُ k");
 const cv=doc.getElementById("cv");
 CV.draw();
 const P=(t,id,px,py)=>fire(cv,t,{pointerType:"touch",pointerId:id,offsetX:px,offsetY:py,clientX:px,clientY:py,button:0});
 P("pointerdown",11,100,100); P("pointerdown",12,200,100);
 /* بدءُ القرص نفسُه يرسم إطاراً كاملاً واحداً (abortDrag) — يُقاس ما بعده */
 const a=d();
 for(let i=1;i<=10;i++)P("pointermove",12,200+i*5,100);
 const b=d();
 ok(b.gest-a.gest>=10,"كلُّ حركة قرصٍ ⇒ صورةٌ محوَّلة");
 eq(b.full-a.full,0,"بلا إطارٍ كامل واحد أثناء القرص");
 P("pointerup",12,250,100); P("pointerup",11,100,100);
 const c=d();
 ok(c.full-b.full>=1,"والرفعُ يعيد الإطارَ الكامل");
});

group("٤ · مزامنةُ الواجهة",()=>{
 let n=0; const old=HOOK.prompt; HOOK.prompt=()=>n++;
 HOOK.promptSoon();
 eq(n,1,"الافتراضُ فوريّ (لا شيءَ يتأخّر في الاختبارات)");
 HOOK.prompt=old;
 const app=rd("src/app.js");
 ok(/HOOK\.promptSoon=\(\)=>\{if\(q\)return; q=1;/.test(app),"وفي التطبيق مرّةً لكلّ إطار");
 ok(/HOOK\.promptSoon\(\); drawFx\(\); return;/.test(rd("src/ui/canvas.js")),"والمسارُ الساخن يستعملها");
});
summary();
