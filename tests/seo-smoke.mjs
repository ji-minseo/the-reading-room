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
console.log(`SEO QA passed: ${urls.length} sitemap pages, canonicals, metadata and internal links verified.`);
