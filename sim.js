const {chromium}=require('playwright');
(async()=>{const N=+process.argv[2]||40;const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.addScriptTag({path:'bot.js'});
const res=await p.evaluate(N=>{const out=[];const caps=['blackbeard','bellamy','vane','bonnyread'];for(let i=0;i<N;i++){try{out.push(botRun(caps[i%4]))}catch(e){out.push({kind:'error',msg:e.message+' '+e.stack.split('\n')[1]})}}return out},N);
const tally={};res.forEach(r=>{const k=r.kind+(r.kind==='death'?' act'+r.act:'');tally[k]=(tally[k]||0)+1});console.log(tally);
const byCap={};res.forEach(r=>{byCap[r.cap]=byCap[r.cap]||{w:0,n:0};byCap[r.cap].n++;if(r.kind==='win')byCap[r.cap].w++});console.log(byCap);
const er=res.filter(r=>r.kind==='error'||r.kind.startsWith('unknown')||r.kind==='timeout'||r.kind==='stuck');if(er.length)console.log(er.slice(0,5));console.log('pageerrors',errs.slice(0,5));await b.close()})();
