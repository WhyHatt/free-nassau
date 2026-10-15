// Full-UI bot run with real rendering at a given viewport; checks for errors, overflow and stuck screens.
// node uitest.js [runs] [w] [h]
const {chromium}=require('playwright');
(async()=>{const N=+process.argv[2]||3,W=+process.argv[3]||390,H=+process.argv[4]||844;const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{window.NOFX=1;RM=true});await p.addScriptTag({path:'bot.js'});
const res=await p.evaluate(async({N})=>{const out=[];const caps=['blackbeard','bellamy','vane','bonnyread','rackham'];const over={};
 const _r=render;render=function(){_r();const a=document.getElementById('app');const sc=S?S.screen:'title';if(a){const h=document.documentElement.scrollHeight;const scr=a.querySelector('.scr');const bad=h>innerHeight+2||a.scrollWidth>a.clientWidth+2;if(bad)over[sc]=(over[sc]||0)+1}};
 for(let i=0;i<N;i++){try{out.push(botRun(caps[i%caps.length],{ui:true,level:'expert'}))}catch(e){out.push({kind:'error',msg:e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')})}}
 return {out:out.map(r=>({k:r.kind,act:r.act,msg:r.msg,fights:r.fights})),over}},{N});
console.log(JSON.stringify(res));console.log('errors',errs.slice(0,8));await b.close()})();
