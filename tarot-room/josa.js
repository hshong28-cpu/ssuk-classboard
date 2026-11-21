// Korean particle helper: picks 을/를, 이/가, 은/는, 과/와, 이에요/예요, 으로/로 by the final syllable.
(function(){
 const DIGIT_BATCHIM=[1,8,0,16,0,0,1,8,8,0]; // 영 일 이 삼 사 오 육 칠 팔 구 (8 = ㄹ)
 function finalConsonant(word){
  const s=String(word==null?'':word).replace(/[\s'’"”)\]>.,!?·…]+$/,'');
  if(!s)return 0;
  const code=s.charCodeAt(s.length-1);
  if(code>=0xAC00&&code<=0xD7A3)return (code-0xAC00)%28;
  const ch=s[s.length-1];
  if(/[0-9]/.test(ch))return DIGIT_BATCHIM[Number(ch)];
  if(/[lmnLMN]/.test(ch))return ch.toLowerCase()==='l'?8:4;
  return 0;
 }
 const FORMS={'을/를':['을','를'],'이/가':['이','가'],'은/는':['은','는'],'과/와':['과','와'],'이에요/예요':['이에요','예요'],'이라고/라고':['이라고','라고'],'이라는/라는':['이라는','라는'],'이나/나':['이나','나'],'으로/로':['으로','로']};
 window.josa=function(word,form){
  const pair=FORMS[form];if(!pair)return '';
  const f=finalConsonant(word);
  if(form==='으로/로')return f&&f!==8?pair[0]:pair[1];
  return f?pair[0]:pair[1];
 };
 window.withJosa=function(word,form){return String(word)+window.josa(word,form);};
})();
