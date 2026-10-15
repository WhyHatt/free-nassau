// Usage: node sim.js [runs] [--not=N] [--json=file]   (runs are spread over the 4 base captains)
const {chromium}=require('playwright');const fs=require('fs');
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):null};
(async()=>{const N=+process.argv[2]||40;const NL=+(arg('not')||0);const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{window.NOFX=1;RM=true});await p.addScriptTag({path:'bot.js'});if(arg('set'))await p.evaluate(x=>{x.split(';').forEach(t=>eval(t))},arg('set'));
const res=await p.evaluate(({N,NL,CAPS})=>{const out=[];const caps=CAPS;for(let i=0;i<N;i++){try{out.push(botRun(caps[i%caps.length],{not:NL}))}catch(e){out.push({kind:'error',msg:e.message+' '+e.stack.split('\n')[1]})}}return out},{N,NL,CAPS:(arg('caps')||'blackbeard,bellamy,vane,bonnyread').split(',')});
if(arg('json'))fs.writeFileSync(arg('json'),JSON.stringify(res));
const pct=(a,b)=>b?Math.round(100*a/b)+'%':'-';
const wins=res.filter(r=>r.kind==='win').length;console.log(`Notoriety ${NL}: ${wins}/${res.length} wins (${pct(wins,res.length)})`);
const tally={};res.forEach(r=>{const k=r.kind+(r.kind==='death'?' act'+r.act:'');tally[k]=(tally[k]||0)+1});console.log('outcomes',tally);
const byCap={};res.forEach(r=>{const c=byCap[r.cap]=byCap[r.cap]||{w:0,n:0,a1:0,a2:0,a3:0};c.n++;if(r.kind==='win')c.w++;if(r.kind==='death')c['a'+r.act]++});
Object.entries(byCap).forEach(([k,v])=>console.log(k.padEnd(10),`${v.w}/${v.n} = ${pct(v.w,v.n)}  deaths a1:${v.a1} a2:${v.a2} a3:${v.a3}`));
const ab=res.reduce((a,r)=>a+(r.ab||0),0);console.log('ship losses per run',(ab/res.length).toFixed(2),'| fights per run',(res.reduce((a,r)=>a+(r.fights||0),0)/res.length).toFixed(1));
const al={};res.forEach(r=>(r.abl||[]).forEach(k=>al[k]=(al[k]||0)+1));console.log('ship losses by act:enemy',JSON.stringify(al));
const dr={};res.filter(r=>r.kind==='death').forEach(r=>{const k='a'+r.act+'r'+r.row;dr[k]=(dr[k]||0)+1});console.log('death rows',dr);const dp={};res.filter(r=>r.kind==='death').forEach(r=>{const k='a'+r.act+' '+(r.boss?'BOSS':'')+r.en+' '+r.ph;dp[k]=(dp[k]||0)+1});console.log('death where',dp);
const sn={};res.forEach(r=>(r.snaps||[]).forEach(x=>{const k='boss'+x.b+(r.kind==='win'||r.act>x.b?' passed':' lost');const o=sn[k]=sn[k]||{n:0,hp:0,hull:0,crew:0,crewMax:0,coin:0,deck:0,powder:0,offs:0};o.n++;['hp','hull','crew','crewMax','coin','deck','powder','offs'].forEach(f=>o[f]+=x[f])}));
Object.entries(sn).sort().forEach(([k,o])=>console.log(k.padEnd(14),'n='+o.n,'hp '+(o.hp/o.n*100|0)+'%','hull '+(o.hull/o.n*100|0)+'%','crew '+(o.crew/o.n|0)+'/'+(o.crewMax/o.n|0),'coin '+(o.coin/o.n|0),'deck '+(o.deck/o.n).toFixed(1),'powder '+(o.powder/o.n).toFixed(1),'offs '+(o.offs/o.n).toFixed(1)));
// card lift: win rate with the card in the final deck vs without
const ok=res.filter(r=>r.deck);const base=ok.filter(r=>r.kind==='win').length/ok.length;const cnt={};
ok.forEach(r=>new Set(r.deck).forEach(k=>{const c=cnt[k]=cnt[k]||{n:0,w:0};c.n++;if(r.kind==='win')c.w++}));
const lift=Object.entries(cnt).filter(([k,v])=>v.n>=Math.max(8,ok.length*.06)).map(([k,v])=>[k,v.n,Math.round(100*v.w/v.n)-Math.round(100*base)]).sort((a,b)=>b[2]-a[2]);
console.log('card lift (pp vs average, n>=6%):',lift.slice(0,6).map(x=>x.join(':')).join(' '),'...',lift.slice(-6).map(x=>x.join(':')).join(' '));
const oc={};ok.forEach(r=>(r.offs||[]).forEach(o=>{const c=oc[o]=oc[o]||{n:0,w:0};c.n++;if(r.kind==='win')c.w++}));
console.log('officer win%:',Object.entries(oc).map(([k,v])=>`${k}:${pct(v.w,v.n)}(${v.n})`).join(' '));
const er=res.filter(r=>r.kind==='error'||r.kind.startsWith('unknown')||r.kind==='timeout'||r.kind==='stuck');if(er.length)console.log(er.slice(0,5));console.log('pageerrors',errs.slice(0,5));await b.close()})();
