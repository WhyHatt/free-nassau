// Fast headless sim (no browser): node simnode.js [runs] [--not=N] [--caps=a,b] [--doc=gun] [--nocards] [--extract] [--json=f]
const vm=require('vm'),fs=require('fs');
const arg=k=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):null};const flag=k=>process.argv.includes('--'+k);
const N=+process.argv[2]||200,NL=+(arg('not')||0);
const store={};const ctx={console,Math,JSON,Date,performance:{now:()=>Date.now()},setTimeout:()=>0,clearTimeout:()=>0,localStorage:{getItem:k=>store[k]===undefined?null:store[k],setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},navigator:{}};
ctx.window=ctx;ctx.globalThis=ctx;ctx.NOFX=1;ctx.render=function(){};
vm.createContext(ctx);
for(const f of ['data.js','game.js','bot.js'])vm.runInContext(fs.readFileSync(f,'utf8').replace(/^"use strict";/,''),ctx,{filename:f});
vm.runInContext('loadMeta();M.renown=+(globalThis.__RK||0);',ctx);
if(arg('rank'))vm.runInContext('M.renown=RANKS['+arg('rank')+'].at',ctx);
if(arg('set'))vm.runInContext(arg('set'),ctx);
const caps=(arg('caps')||'blackbeard,bellamy,vane,bonnyread').split(',');
ctx.__o={not:NL,doc:arg('doc')||undefined,nocards:flag('nocards'),extract:flag('extract'),noorders:flag('noorders'),level:arg('level')||'novice',renown:+(arg('renown')||0)};ctx.__caps=caps;ctx.__N=N;
const t0=Date.now();
const res=vm.runInContext(`(()=>{const out=[];for(let i=0;i<__N;i++){try{out.push(botRun(__caps[i%__caps.length],__o))}catch(e){out.push({kind:'error',msg:e.message+' '+(e.stack||'').split('\\n').slice(0,3).join('|')})}}return out})()`,ctx);
if(arg('json'))fs.writeFileSync(arg('json'),JSON.stringify(res));
const pct=(a,b)=>b?Math.round(100*a/b)+'%':'-';
const wins=res.filter(r=>r.kind==='win').length;console.log(`Notoriety ${NL}: ${wins}/${res.length} wins (${pct(wins,res.length)})  [${((Date.now()-t0)/1000).toFixed(1)}s]`);
const tally={};res.forEach(r=>{const k=r.kind+(r.kind==='death'?' act'+r.act:'');tally[k]=(tally[k]||0)+1});console.log('outcomes',JSON.stringify(tally));
const byCap={};res.forEach(r=>{const c=byCap[r.cap]=byCap[r.cap]||{w:0,n:0,a1:0,a2:0,a3:0};c.n++;if(r.kind==='win')c.w++;if(r.kind==='death')c['a'+r.act]++});
Object.entries(byCap).forEach(([k,v])=>console.log(k.padEnd(10),`${v.w}/${v.n} = ${pct(v.w,v.n)}  deaths a1:${v.a1} a2:${v.a2} a3:${v.a3}`));
const ok=res.filter(r=>r.fights!=null);const avg=f=>(ok.reduce((a,r)=>a+(r[f]||0),0)/Math.max(1,ok.length));
console.log('fights/run',avg('fights').toFixed(1),'| combat actions/run',avg('actions').toFixed(0),'| ship losses/run',avg('ab').toFixed(2),'| non-combat screens/run',avg('screens').toFixed(0));
const dp={};res.filter(r=>r.kind==='death').forEach(r=>{const k='a'+r.act+' '+(r.boss?'BOSS':'')+r.en+' '+r.ph;dp[k]=(dp[k]||0)+1});console.log('death where',JSON.stringify(dp));
const sn={};res.forEach(r=>(r.snaps||[]).forEach(x=>{const k='boss'+x.b+(r.kind==='win'||r.act>x.b?' passed':' lost');const o=sn[k]=sn[k]||{n:0,hp:0,hull:0,crew:0,coin:0,deck:0};o.n++;['hp','hull','crew','coin','deck'].forEach(f=>o[f]+=x[f])}));
Object.entries(sn).sort().forEach(([k,o])=>console.log(k.padEnd(14),'n='+o.n,'hp '+(o.hp/o.n*100|0)+'%','hull '+(o.hull/o.n*100|0)+'%','crew '+(o.crew/o.n|0),'coin '+(o.coin/o.n|0),'deck '+(o.deck/o.n).toFixed(1)));
const fk={};res.forEach(r=>(r.fl||[]).forEach(f=>{const o=fk[f.k]=fk[f.k]||{n:0,dh:0,dc:0,dp:0};o.n++;o.dh+=f.dh/f.hm*100;o.dc+=f.dc;o.dp+=f.dp}));
if(flag('fights'))Object.entries(fk).forEach(([k,o])=>console.log(k.padEnd(10),'n='+String(o.n).padEnd(4),'hull lost '+(o.dh/o.n).toFixed(0)+'%','crew lost '+(o.dc/o.n).toFixed(1),'captain hp lost '+(o.dp/o.n).toFixed(1)));
// pick rate and winner presence
const off={},inw={},cnt={},wn=res.filter(r=>r.kind==='win').length;
res.forEach(r=>{Object.entries(r.offered||{}).forEach(([k,n])=>off[k]=(off[k]||0)+n);new Set(r.deck||[]).forEach(k=>{k=baseId2(k);cnt[k]=(cnt[k]||0)+1;if(r.kind==='win')inw[k]=(inw[k]||0)+1})});
function baseId2(k){return k.replace(/\+$/,'')}
if(flag('cards')){console.log('card: in-deck%  in-winners%  (winners n='+wn+')');Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]).forEach(k=>console.log(k.padEnd(13),pct(cnt[k],res.length).padEnd(5),pct(inw[k]||0,wn)))}
const oc={};res.forEach(r=>(r.offs||[]).forEach(o=>{const c=oc[o]=oc[o]||{n:0,w:0};c.n++;if(r.kind==='win')c.w++}));
console.log('officer win%:',Object.entries(oc).map(([k,v])=>`${k}:${pct(v.w,v.n)}(${v.n})`).join(' '));
const er=res.filter(r=>r.kind==='error'||r.kind.startsWith('unknown')||r.kind==='timeout'||r.kind==='stuck');if(er.length)console.log('PROBLEMS',er.length,JSON.stringify(er.slice(0,3)));
