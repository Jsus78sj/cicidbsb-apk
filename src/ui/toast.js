/* ═══ التنبيهُ العابر ═══ المرحلة ٨ من خطّة الهاتف
   السجلُّ على الهاتف سطران دائمان يأكلان من اللوح ٤٦ بكسلاً ولا يُقرأ
   منهما إلّا الأخير. فصار مخفيّاً على الهاتف (touch.css)، وكلُّ رسالةٍ
   تظهر تنبيهاً أعلى اللوح لثانيتين ونصف (والخطأُ أربعاً) ثم تختفي.
   ولمسةُ التنبيه تفتح السجلَّ كاملاً (html.logOpen) ولمسةٌ ثانيةٌ تطويه.
   السجلُّ نفسُه يبقى المصدرَ ولقارئ الشاشة (aria-live)، والتنبيهُ نسخةٌ
   مرئيّةٌ مخفيّةٌ عنه فلا يُقرأ مرّتين. على الحاسوب لا شيء يتغيّر. */
const MS={er:4000,wr:3200};
let el=null, tm=null;
export const toastOn=()=>{
 try{return typeof matchMedia==="function"
  &&matchMedia("(max-width:768px), (max-height:500px) and (orientation:landscape) and (pointer:coarse)").matches}
 catch(_){return false}
};
function node(){
 if(el)return el;
 if(typeof document==="undefined"||!document.createElement||!document.body)return null;
 el=document.createElement("div");
 el.id="toast"; el.setAttribute("aria-hidden","true"); el.hidden=true;
 el.addEventListener("click",()=>{
  const r=document.documentElement;
  r.classList.toggle("logOpen");
  hideToast();
 });
 document.body.appendChild(el);
 return el;
}
export function hideToast(){
 if(tm){clearTimeout(tm); tm=null}
 if(el)el.hidden=true;
}
export function toast(cls,msg){
 if(!toastOn())return false;
 const t=String(msg==null?"":msg).trim();
 if(!t)return false;
 const n=node(); if(!n)return false;
 n.className="t-"+(cls||"in");
 n.textContent=t;
 n.hidden=false;
 if(tm)clearTimeout(tm);
 tm=setTimeout(hideToast,MS[cls]||2500);
 return true;
}
