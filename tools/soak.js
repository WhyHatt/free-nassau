// Real-time soak with FX enabled: node tools/soak.js [seconds] [w] [h]
const {chromium}=require('../node_modules/playwright');
(async()=>{const secs=+process.argv[2]||60,W=+process.argv[3]||390,H=+process.argv[4]||844;const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(300);await p.evaluate(()=>{M.set.fx=2;M.set.auto=1;newRun('vane',0)});
const seen={};const t0=Date.now();let n=0;
while(Date.now()-t0<secs*1000){const sc=await p.evaluate(()=>{
  if(document.querySelector('.cine'))document.querySelector('.cine').click();
  const s=S.screen;
  if(s==='map'){const R=S.map.length;for(let c=0;c<COLS;c++)if(avail(S.row+1,c)){go(S.row+1,c);break}}
  else if(s==='combat'){const c=C();const i=c.hand.findIndex(k=>playable(k)&&cost(k)<=c.energy);if(c.phase==='ship'&&E().hull<=E().hullMax*.5&&!c.boss&&!c.queue.length&&S.crew>E().crew)board();else if(i>=0)play(i);else endTurn()}
  else if(s==='reward'){const r=S.reward;if(r.cards&&r.cards.length)takeCard(r.cards[0]);else rewardDone()}
  else if(s==='prize'){skipPrize()}
  else if(s==='end'){S=null;newRun('bellamy',0)}
  else if(s==='extract'){nextAct()}
  else if(s==='event'){chooseEvent(EVENTS[S.ev].o.length-1)}
  else {S.screen='map';S.shop=null;S.smug=null;save();render()}
  return s});seen[sc]=(seen[sc]||0)+1;n++;await p.waitForTimeout(sc==='combat'?220:420)}
console.log('steps',n,JSON.stringify(seen),'errors',errs.slice(0,5));await b.close()})();
