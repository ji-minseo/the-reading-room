import {readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {cards} from '../core/data/cards.mjs';
import {cardSlug} from '../core/data/card-directory.mjs';
import {reversedCardContext} from '../core/data/card-topic-orientations.mjs';

// Expand all 78 static dictionary pages, preserving their canonical URLs,
// layout and the existing upright wording. Works before SEO QA and Pages deployment.
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const topicKeys={love:'love',reunion:'reunion',feelings:'feelings',contact:'contact',breakup:'breakup','reunion-timing':'timing',job:'job',work:'work',money:'money',study:'study'};
const escape=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
let converted=0,unchanged=0;
for(const card of cards){
 const path=join(root,'cards',cardSlug(card),'index.html');
 const html=await readFile(path,'utf8');
 const existing=(html.match(/class="topic-orientation topic-reversed"/g)||[]).length;
 if(existing===10){unchanged++;continue;}
 if(existing!==0)throw new Error(`Unexpected partially expanded card page: ${card.name}`);
 let grids=0,topics=0;
 let output=html.replace(/(<div class="topic-grid">)([\s\S]*?)(<\/div><\/section>)/g,(match,start,body,end)=>{
  grids++;
  let inGrid=0;
  const rendered=body.replace(/<article><div><h3>([^<]+)<\/h3><p>([\s\S]*?)<\/p><\/div><a href="(\/tarot\/([^/]+)\/)">([^<]+)<\/a><\/article>/g,(whole,title,upright,href,slug,label)=>{
   const topic=topicKeys[slug];
   if(!topic)throw new Error(`Unknown reading type in ${card.name}: ${slug}`);
   const reverse=reversedCardContext(card,topic);
   if(!reverse)throw new Error(`Missing reversed interpretation for ${card.name}: ${topic}`);
   inGrid++;topics++;
   return `<article><div><h3>${title}</h3><div class="topic-orientation topic-upright"><span>UPRIGHT · 정방향일 때</span><p>${upright}</p></div><div class="topic-orientation topic-reversed"><span>REVERSED · 역방향일 때</span><p>${escape(reverse)}</p></div></div><a href="${href}">${label}</a></article>`;
  });
  if(inGrid!==(grids===1?6:4))throw new Error(`Wrong topic count on ${card.name}, grid ${grids}: ${inGrid}`);
  return start+rendered+end;
 });
 if(grids!==2||topics!==10)throw new Error(`Expected 10 topic rows in two grids for ${card.name}; found ${topics}/${grids}`);
 output=output.replace('질문에 따라 같은 카드의 상징도 강조되는 부분이 달라집니다.','같은 카드도 질문과 방향에 따라 다른 관점으로 읽을 수 있어요. 역방향은 나쁜 결과의 확정이 아니라 다시 살펴볼 지점이에요.')
   .replace('같은 카드가 취업, 직장, 돈, 공부에서는 어떤 행동과 조건을 강조하는지도 함께 볼 수 있어요.','취업, 직장, 돈, 공부에서도 정방향·역방향을 나눠 지금 확인할 조건과 행동을 살펴보세요.');
 await writeFile(path,output);
 converted++;
}
console.log(`Card orientation pages ready: ${converted} updated, ${unchanged} already expanded, ${cards.length} total.`);
