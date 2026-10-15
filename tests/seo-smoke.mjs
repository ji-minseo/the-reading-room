import {readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
const origin='https://readingroom.everytinytool.com';
if(urls.length<90)throw new Error(`Expected at least 90 sitemap URLs, found ${urls.length}`);

const localPath=url=>{
  const {pathname}=new URL(url);
  return pathname==='/'?join(root,'index.html'):join(root,pathname.replace(/^\//,''),'index.html');
};
const exists=async path=>{try{await access(path);return true}catch{return false}};

const canonicals=new Set();
for(const url of urls){
  if(!url.startsWith(origin))throw new Error(`Unexpected sitemap origin: ${url}`);
  const path=localPath(url);
  if(!await exists(path))throw new Error(`Missing sitemap page: ${path}`);
  const html=await readFile(path,'utf8');
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if(canonical!==url)throw new Error(`Canonical mismatch for ${url}: ${canonical||'missing'}`);
  if(canonicals.has(canonical))throw new Error(`Duplicate canonical: ${canonical}`);
  canonicals.add(canonical);
  if(!/<title>[^<]+<\/title>/.test(html))throw new Error(`Missing title: ${url}`);
  if(!/<meta name="description" content="[^"]+"/.test(html))throw new Error(`Missing description: ${url}`);

  const hrefs=[...html.matchAll(/href="(\/[^"#?]*)"/g)].map(match=>match[1]);
  for(const href of hrefs){
    if(!href.endsWith('/'))continue;
    if(!href.startsWith('/tarot/')&&!href.startsWith('/cards/'))continue;
    const target=href==='/'?join(root,'index.html'):join(root,href.replace(/^\//,''),'index.html');
    if(!await exists(target))throw new Error(`Broken internal link on ${url}: ${href}`);
  }
}

const paymentPages=['/deep-reading/','/terms/','/privacy/','/refund/'];
for(const path of paymentPages){
  const url=origin+path;
  if(!urls.includes(url))throw new Error(`Missing payment review sitemap URL: ${url}`);
}
const [homeHtml,productHtml,termsHtml,privacyHtml,refundHtml]=await Promise.all([
  readFile(join(root,'index.html'),'utf8'),
  readFile(join(root,'deep-reading/index.html'),'utf8'),
  readFile(join(root,'terms/index.html'),'utf8'),
  readFile(join(root,'privacy/index.html'),'utf8'),
  readFile(join(root,'refund/index.html'),'utf8')
]);
for(const href of paymentPages)if(!homeHtml.includes(`href="${href}"`))throw new Error(`Home footer missing review link: ${href}`);
if(!productHtml.includes('4,900원')||!productHtml.includes('1회 리포트'))throw new Error('Deep Reading product price/details missing');
if(!termsHtml.includes('<h1>이용약관</h1>'))throw new Error('Terms page heading missing');
if(!privacyHtml.includes('<h1>개인정보처리방침</h1>'))throw new Error('Privacy page heading missing');
if(!refundHtml.includes('<h1>환불 및 청약철회 안내</h1>'))throw new Error('Refund page heading missing');

const detailCards=urls.filter(url=>/\/cards\/[^/]+\/$/.test(new URL(url).pathname));
if(detailCards.length!==78)throw new Error(`Expected 78 indexed card details, found ${detailCards.length}`);
for(const url of detailCards){
 const html=await readFile(localPath(url),'utf8');
 const count=re=>(html.match(re)||[]).length;
 if(count(/class="topic-orientation topic-upright"/g)!==10)throw new Error(`Expected 10 upright interpretations: ${url}`);
 if(count(/class="topic-orientation topic-reversed"/g)!==10)throw new Error(`Expected 10 reversed interpretations: ${url}`);
 if(count(/UPRIGHT · 정방향일 때/g)!==10||count(/REVERSED · 역방향일 때/g)!==10)throw new Error(`Missing orientation labels: ${url}`);
 if(html.includes('<p>undefined</p>')||html.includes('<p></p>'))throw new Error(`Empty card interpretation: ${url}`);
}
const magician=await readFile(localPath(origin+'/cards/the-magician/'),'utf8');
if(!magician.includes('좋은 말과 실제 배려가 같은 방향으로 가는지 확인해 보세요.'))throw new Error('Magician reversed interpretation missing');

console.log(`SEO QA passed: ${urls.length} sitemap pages, canonicals, metadata and internal links verified.`);
