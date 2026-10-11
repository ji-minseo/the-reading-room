const particlePairs={
 object:['을','를'],
 subject:['이','가'],
 topic:['은','는'],
 and:['과','와'],
 quote:['이라는','라는'],
 copula:['이에요','예요'],
 direction:['으로','로']
};

export function finalConsonantIndex(value){
 const text=String(value??'');
 for(let i=text.length-1;i>=0;i--){
  const code=text.charCodeAt(i);
  if(code>=0xac00&&code<=0xd7a3)return (code-0xac00)%28;
 }
 return 0;
}

export function josa(value,type){
 const pair=particlePairs[type];
 if(!pair)throw new Error('Unknown Korean particle type');
 const jong=finalConsonantIndex(value);
 if(type==='direction'&&(jong===0||jong===8))return pair[1];
 return jong===0?pair[1]:pair[0];
}
