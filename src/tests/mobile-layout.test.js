/* ═══ واجهةُ الهاتف ═══ المرحلة E
   القياسُ الحقيقيُّ في Chromium (Playwright: 412×860 و360×740 و860×412 و915×360)
   مسجَّلٌ في CHANGES.md. هنا ما يحرسه بلا متصفّح: القواعدُ التي أصلحت
   العيوبَ باقية، ومنطقُ viewport.js (موقعُ سطح المكتب · ألواحُ الأفقيّ) صحيح.
   التشغيل:  node src/tests/mobile-layout.test.js                         */
import {readFileSync} from "node:fs";
import {group,ok,eq,summary} from "./harness.js";

const css=readFileSync(new URL("../../css/touch.css",import.meta.url),"utf8");
const vp=readFileSync(new URL("../ui/viewport.js",import.meta.url),"utf8");
const fn=name=>{
 const m=vp.match(new RegExp(`export function ${name}\\([\\s\\S]*?\\n}\\n`));
 if(!m)return null;
 const src=m[0].replace("export ","").replace(/=innerWidth|=innerHeight|=screen|=matchMedia\("\(pointer:coarse\)"\)\.matches/g,"");
 return new Function(src+`;return ${name}`)();
};

group("الحجزُ تحت الشريط السفليّ لا تُلغيه قاعدةُ الحواف",()=>{
 const safe=css.match(/body\{\s*padding-top:env\(safe-area-inset-top[\s\S]*?\}/);
 ok(!!safe,"قاعدةُ الحواف الآمنة موجودة");
 ok(safe&&/padding-bottom:calc\(var\(--bodyPadB,0px\) \+ env\(safe-area-inset-bottom/.test(safe[0]),
  "padding-bottom = --bodyPadB + الحافة (كان env وحدها فغلبت حجزَ الشريط)");
 ok(!/body\{padding-bottom:var\(--rbH/.test(css),"ولا padding-bottom صريحٌ آخر يتنازع معها");
 ok(/--bodyPadB:var\(--rbH,64px\)/.test(css),"الهاتف يحجز --rbH");
});
group("لا زرَّ خارج الشاشة بلا تمرير",()=>{
 ok(/#stItems\{overflow-x:auto/.test(css),"أزرارُ الحالة (الالتقاط · التعامد · القطبيّ) تُمرَّر");
 ok(/#lvlBar\{flex:0 1 auto; min-width:0; max-width:3\dvw/.test(css),"وشريطُ الطوابق لا يأكلها");
 ok(/#clPrompt\{min-width:0/.test(css)&&/#clLive\{min-width:0/.test(css),"سطرُ الأوامر ينكمش");
 ok(/#clFoldBtn,#clPrintBtn,#clMenuBtn\{min-inline-size:40px/.test(css),"وأزرارُه ٤٠ بكسلاً");
 ok(/#thumb\{position:absolute; bottom:var\(--s-6\)\}/.test(css),"الإبهامُ يطفو فوق اللوح لا فوق سطر الأوامر");
 ok(/--stageBot/.test(css)&&/--stageBot/.test(vp),"والعائماتُ تتبع --stageBot");
});
group("الأفقيُّ القصير: اللوحُ ليس صفراً",()=>{
 const m=css.match(/@media \(max-height:500px\) and \(orientation:landscape\) and \(pointer:coarse\)\{[\s\S]*?\n\}/);
 ok(!!m,"كتلةُ الأفقيّ القصير موجودة");
 const b=m?m[0]:"";
 ok(/#rbPanes\{display:none; position:absolute/.test(b),"ألواحُ الشريط تطفو ولا تأخذ ارتفاعاً");
 ok(/html\.rbPeek #ribbon:not\(\.min\) #rbPanes\{display:block\}/.test(b),"وتظهر بـ rbPeek");
 ok(/#side:not\(\.open\):not\(\.peek\)/.test(b),"اللوحةُ الجانبية غطاءٌ يُفتح");
 ok(/#navbar\{flex-direction:row/.test(b),"وشريطُ التنقّل أفقيّ");
});
group("موقعُ سطح المكتب: الأفقيُّ ليس منه",()=>{
 const f=fn("isDesktopSiteOnPhone");
 ok(typeof f==="function","isDesktopSiteOnPhone مُصدَّرة");
 const P={width:412,height:860};
 eq(f(412,860,P,true),false,"هاتفٌ عموديّ");
 eq(f(860,412,P,true),false,"هاتفٌ أفقيّ — كان true فيظهر #tools ويُصفَّر اللوح");
 eq(f(980,2045,P,true),true,"«موقعُ سطح المكتب» عموديّاً");
 eq(f(1024,768,{width:768,height:1024},true),false,"لوحيّ");
 eq(f(1366,800,{width:1366,height:800},false),false,"حاسوب");
});
group("ألواحُ الأفقيّ: تظهر بالتبويب وتُطوى بالأداة",()=>{
 const f=fn("peekFor");
 ok(typeof f==="function","peekFor مُصدَّرة");
 const el=hits=>({closest:s=>s.split(",").some(x=>hits.some(h=>x.includes(h)))?{}:null});
 eq(f(el([".rbTab"])),true,"تبويب ⇐ تظهر");
 eq(f(el(["#rbPanes [data-cmd]"])),false,"أمرٌ من اللوح ⇐ تُطوى");
 eq(f(el(["#ribbon"])),null,"غيرُ ذلك داخل الشريط ⇐ لا تغيير");
 eq(f(el([])),false,"خارج الشريط ⇐ تُطوى");
 eq(f(null),null,"لا هدف");
});
summary();
