/* ═══ المرحلة ٧ من خطّة الهاتف: صقلُ وضع الرسم ═══
   ١ · «آخرُ طول» زرٌّ جاهز · ٢ · العدسةُ تسمّي الالتقاطَ والطول
   ٣ · اهتزازٌ في المتصفّح · ٤ · عمودٌ جانبيّ في الأفقيّ
   التشغيل:  node src/tests/touch-phase7.test.js                      */
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
await import("../tools/draw.js");
const R =await import("../tools/registry.js");
const TB=await import("../ui/touchbar.js");
const CV=await import("../ui/canvas.js");
const ST=await import("../core/state.js");

group("١ · آخرُ طول",()=>{
 R.loadOpts(); R.setOpt("wall","chain",1);
 R.begin("wall"); TB.resetTouchBar(); TB.syncTouchBar();
 eq(TB.lastLen(),null,"لا طولَ قبل أوّل قطعة");
 R.feedPoint([0,0]); R.feedPoint([4000,0]); TB.syncTouchBar();
 eq(TB.lastLen(),4000,"أوّلُ قطعةٍ ٤ م ⇒ آخرُ طول");
 const b=doc.getElementById("touchBar").querySelector(".tbLast");
 ok(b&&!b.hidden,"والزرُّ ظاهر");
 eq(b.querySelector("span").textContent,"4.000","ويقول ٤٫٠٠٠");
 R.T.ghost=[4000,3000];
 const n=ST.S.walls.length;
 TB.runTouch("last");
 eq(ST.S.walls.length,n+1,"لمستُه تضع قطعةً");
 const w=ST.S.walls[ST.S.walls.length-1];
 ok(Math.abs(Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1])-4000)<1,"بالطول نفسِه");
 R.cancel(true); TB.syncTouchBar();
 eq(TB.lastLen(),null,"وإنهاءُ الأداة يمسحه");
});

group("٢ · العدسةُ تسمّي",()=>{
 R.begin("wall"); R.feedPoint([0,0]);
 R.T.ghost=[3250,0]; CV.UI.osnap={m:"end",p:[3250,0]};
 eq(CV.loupeTag(),"نهاية · 3.250 م","نوعُ الالتقاط والطولُ الحيّ");
 CV.UI.osnap=null;
 eq(CV.loupeTag(),"3.250 م","بلا التقاط ⇒ الطولُ وحده");
 R.cancel(true);
 ok(/const tag=loupeTag\(\)/.test(rd("src/ui/canvas.js")),"وتُرسَم داخل العدسة");
});

group("٣ · اهتزازٌ في المتصفّح",()=>{
 const P=rd("src/platform/index.js");
 ok(/navigator\.vibrate\(kind==="snap"\?14:8\)/.test(P),"navigator.vibrate بديلُ Capacitor");
 ok(/!matchMedia\("\(pointer:coarse\)"\)\.matches\)return false/.test(P),"وعلى اللمس وحده");
});

group("٤ · الأفقيّ",()=>{
 const i=TC.indexOf("المرحلة ٧ · صقلُ وضع الرسم");
 const t=TC.slice(i);
 ok(/@media \(max-height:500px\) and \(orientation:landscape\) and \(pointer:coarse\)\{\s*html\.cdDraw #touchBar\{/.test(t),"كتلةُ الأفقيّ");
 ok(/#touchBar \.tbB\{flex-direction:column/.test(t),"الأزرارُ عمود");
 ok(/inset-inline-start:var\(--s-6\); inset-inline-end:auto/.test(t),"على حافّة الإبهام");
});
summary();
