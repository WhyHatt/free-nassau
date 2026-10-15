// node tools/audit.js <w> <h> <outdir> [filter]   Screenshots every screen/state and prints layout metrics.
const {chromium}=require('playwright');const fs=require('fs');
const W=+process.argv[2]||390,H=+process.argv[3]||844,OUT=process.argv[4]||'/tmp/au',FIL=process.argv[5];
fs.mkdirSync(OUT,{recursive:true});
const CAPS=['blackbeard','bellamy','vane','bonnyread','rackham'];
const HANDS={1:['broadside'],5:['broadside','tack','cutlass','swivel','chain'],7:['broadside','tack','cutlass','swivel','chain','hold','grape'],9:['broadside','tack','cutlass','swivel','chain','hold','grape','pistols','axes']};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{localStorage.clear()});await p.reload();
await p.evaluate(()=>{window.NOFX=1;M.maxNot=2;M.unlocked.rackham=1});
if(process.env.CLEAN)await p.evaluate(()=>{RM=true});
const metrics=()=>p.evaluate(()=>{const out=[];const vis=e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&r.bottom>0&&r.top<innerHeight+1};
 const scr=document.querySelector('#app .scr');if(scr&&scr.scrollHeight>scr.clientHeight+2)out.push('SCROLL '+(scr.scrollHeight-scr.clientHeight));
 if(document.documentElement.scrollWidth>innerWidth+1)out.push('HSCROLL');if(document.getElementById('app').scrollHeight>innerHeight+1)out.push('APPTALL '+document.getElementById('app').scrollHeight);
 const tg=[];document.querySelectorAll('#app button,#app .node,#app .card,#app .ofc,#modal button,#app .med').forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();if(e.matches('.ofc,.dx,.side'))return;if(Math.min(r.width,r.height)<42&&!e.closest('.vig'))tg.push((e.className||e.tagName).toString().split(' ')[0]+':'+Math.round(r.width)+'x'+Math.round(r.height))});
 if(tg.length)out.push('SMALLTAP '+[...new Set(tg)].join(' '));
 const clip=[];document.querySelectorAll('#app *,#modal *').forEach(e=>{if(!vis(e)||e.children.length>3)return;const cs=getComputedStyle(e);if((cs.overflow==='hidden'||cs.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+2&&e.textContent.trim())clip.push((e.className||e.tagName)+':'+e.textContent.trim().slice(0,18))});
 if(clip.length)out.push('CLIP '+[...new Set(clip)].slice(0,6).join(' | '));
 const fs_=new Set();const w=document.createTreeWalker(document.getElementById('app'),NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(!n.nodeValue.trim()||!n.parentElement||!vis(n.parentElement))continue;const f=parseFloat(getComputedStyle(n.parentElement).fontSize);if(f<10.9)fs_.add(f+':'+n.nodeValue.trim().slice(0,12))}
 if(fs_.size)out.push('TINYFONT '+[...fs_].slice(0,6).join(' | '));
 const bt=[...document.querySelectorAll('#app button,#app .node')].filter(vis);const ov=[];for(let i=0;i<bt.length;i++)for(let j=i+1;j<bt.length;j++){const a=bt[i].getBoundingClientRect(),c=bt[j].getBoundingClientRect();if(bt[i].contains(bt[j])||bt[j].contains(bt[i]))continue;const ix=Math.max(0,Math.min(a.right,c.right)-Math.max(a.left,c.left)),iy=Math.max(0,Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top));if(ix*iy>.25*Math.min(a.width*a.height,c.width*c.height))ov.push((bt[i].className||bt[i].id)+'/'+(bt[j].className||bt[j].id))}
 if(ov.length)out.push('OVERLAP '+ov.slice(0,4).join(' '));return out});
const shot=async(n)=>{if(FIL&&!n.includes(FIL))return;await p.waitForTimeout(350);await p.screenshot({path:`${OUT}/${n}.png`});const m=await metrics();console.log(n.padEnd(26),m.length?m.join(' ;; '):'ok')};
const run=(cap)=>p.evaluate(c=>{S=null;newRun(c,0);S.coin=150;S.hp=Math.round(S.maxHp*.8)},cap);
const fight=(ids,kind,hand,ph)=>p.evaluate(([ids,kind,hand,ph])=>{S.combat=null;S.screen='combat';startFight(ids,kind);const c=C();if(ph==='board'){c.phase='board';E().crew=22;E().crewMax=30}c.hand=hand;c.energy=3;render()},[ids,kind,hand,ph]);
await shot('01-title');
await p.evaluate(()=>{S=null;renderCapSelect()});await shot('02-capselect');
await p.evaluate(()=>{M.maxNot=0;M.unlocked={};S=null;CSEL='rackham';renderCapSelect()});await shot('02b-capselect-locked');await p.evaluate(()=>{M.maxNot=2;M.unlocked.rackham=1});
await run('blackbeard');await p.evaluate(()=>{S.screen='map';render()});await shot('03-map-start');
await p.evaluate(()=>{S.row=4;S.col=1;S.map.slice(0,5).forEach(r=>r.forEach(n=>n.done=n.t!=='empty'?1:0));S.screen='map';render()});await shot('03-map-mid');
await p.evaluate(()=>{S.act=3;S.map=genMap(3);S.row=3;S.col=1;S.map.slice(0,4).forEach(r=>r.forEach(n=>n.done=n.t!=='empty'?1:0));S.screen='map';render()});await shot('03-map-act3');
await p.evaluate(()=>{S.msg='You ran before the wind. No loot.';render()});await shot('03-map-msg');
await run('bellamy');
for(const n of [1,5,7,9]){await fight(['rival'],'normal',HANDS[n],'ship');await shot('04-ship-'+n)}
await p.evaluate(()=>document.querySelector('#hand .card[data-i="0"]').click());await shot('04-ship-selected');
await p.evaluate(()=>{const c=C();c.energy=0;render()});await shot('04-ship-noenergy');
await fight(['patrol'],'elite',HANDS[5],'ship');await shot('04-elite');
await fight(['rival'],'normal',HANDS[5],'ship');await p.evaluate(()=>{E().hull=10;render()});await shot('04-canboard');
for(const n of [1,5,7,9]){await fight(['privateer'],'normal',HANDS[n],'board');await shot('05-board-'+n)}
await p.evaluate(()=>document.querySelector('#hand .card[data-i="2"]').click());await shot('05-board-selected');
await run('vane');await p.evaluate(()=>{S.act=2});await fight(['galleon'],'normal',HANDS[5],'ship');await shot('04-galleon');
await p.evaluate(()=>{S.act=1;S.combat=null;enterNode({t:'boss'})});await shot('06-boss-squadron');
await p.evaluate(()=>{S.act=2;S.combat=null;enterNode({t:'boss'})});await shot('06-boss-fort');
await p.evaluate(()=>{S.act=3;S.combat=null;enterNode({t:'boss'})});await shot('06-boss-horn');
await p.evaluate(()=>{const c=C();c.phase='duel';render()});await shot('06-duel');
await run('bonnyread');
await p.evaluate(()=>{S.combat=null;S.reward={msg:'The Rival Pirate Sloop strikes her colours. 62 silver taken.',cards:['broadside','tack','chain'],paths:true,picks:1};S.screen='reward';render()});await shot('07-reward');
await p.evaluate(()=>document.querySelector('.cards .card:nth-child(2)').click());await shot('07-reward-sel');
await p.evaluate(()=>{S.reward={msg:'Plunder!',cards:['broadside','tack','chain'],picks:1};S.screen='reward';render()});await shot('07-reward-cards');
await p.evaluate(()=>{S.reward={msg:'x',prize:'snow',officer:'jennings'};S.screen='prize';render()});await shot('07-prize');
await p.evaluate(()=>{S.reward={msg:'x',prize:'sloop'};S.screen='prize';render()});await shot('07-prize-only');
await p.evaluate(()=>{S.reward=null;S.shop=null;S.coin=140;S.hp=40;S.ship.hull=30;enterNode({t:'port'})});await shot('08-port');
await p.evaluate(()=>document.querySelector('.cardwrap .card').click());await shot('08-port-sel');
await p.evaluate(()=>{S.shop=null;S.coin=12;S.hp=S.maxHp;enterNode({t:'port'})});await shot('08-port-poor');
await p.evaluate(()=>{S.coin=200;S.screen='remove';render()});await shot('08-remove');
await p.evaluate(()=>{S.coin=300;enterNode({t:'shipwright'})});await shot('09-shipwright');
await p.evaluate(()=>{S.coin=40;enterNode({t:'shipwright'})});await shot('09-shipwright-poor');
for(const r of ['qm','gunner']){await p.evaluate(r=>{S.coin=300;enterNode({t:'recruit',role:r})},r);await shot('10-recruit-'+r)}
await p.evaluate(()=>{S.coin=0;enterNode({t:'recruit',role:'nav'})});await shot('10-recruit-poor');
await p.evaluate(()=>{S.ship.hull=10;S.hp=10;enterNode({t:'cove'})});await shot('11-cove');
for(let a=1;a<=3;a++){const evs=await p.evaluate(a=>EVENTS.map((e,i)=>e.a.includes(a)?i:-1).filter(i=>i>=0),a);for(const i of evs.slice(0,a===1?5:2)){await p.evaluate(([a,i])=>{S.act=a;S.ev=i;S.screen='event';render()},[a,i]);await shot(`12-event-${a}-${i}`)}}
await p.evaluate(()=>{S.act=1;S.screen='abandon';render()});await shot('13-abandon');
await p.evaluate(()=>{S.act=2;S.reward={msg:'Stockade falls. Trophy!'};S.screen='extract';render()});await shot('13-extract');
await p.evaluate(()=>{S.act=3;S.reward={msg:'Hornigold falls!'};S.screen='extract';render()});await shot('13-extract-final');
for(const k of ['death','extract','win']){await p.evaluate(k=>{S.end={kind:k,banked:240,act:3,trophies:k==='death'?[]:['pennant']};S.screen='end';render()},k);await shot('14-end-'+k)}
await p.evaluate(()=>{S.screen='nassau';render()});await shot('15-nassau');
await p.evaluate(()=>{S.screen='logbook';render()});await shot('15-logbook');
await run('rackham');await p.evaluate(()=>{S.officers.qm={id:'jennings',injured:false};S.officers.gunner={id:'hands',injured:true};S.screen='map';render()});
for(const t of ['crew','supplies','deck','legend','settings']){await p.evaluate(t=>{showMenu(t)},t);await shot('16-menu-'+t)}
await p.evaluate(()=>{bkTab('deck');document.querySelector('.declist .dl').click()});await shot('16-menu-deck-card');
console.log('ERRORS',errs.join('|')||'none');await b.close()})();
