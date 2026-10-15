// UI-driven playtest: plays real runs by tapping the actual DOM (select card, tap again to play, buttons), like a phone player.
// node playtest.js <captain> <notoriety> [seed-label]   Writes notes/playtest-<captain>-N<not>.json with per-screen / per-fight friction metrics.
const {chromium}=require('playwright');const fs=require('fs');
const cap=process.argv[2]||'blackbeard',NL=+(process.argv[3]||0);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{localStorage.clear();window.NOFX=1;RM=true});await p.reload();await p.evaluate(()=>{window.NOFX=1;RM=true});
await p.evaluate(([c,n])=>{M.maxNot=5;newRun(c,n)},[cap,NL]);
const log={cap,not:NL,taps:0,screens:{},fights:[],overflow:[],events:[],decisions:0,shots:0};let cur=null;
const click=async sel=>{log.taps++;await p.evaluate(s=>{const e=document.querySelector(s);if(e)e.click()},sel)};
const st=()=>p.evaluate(()=>({sc:S.screen,hp:S.hp,mh:S.maxHp,hull:S.ship.hull,hm:hullMax(),crew:S.crew,coin:S.coin,act:S.act,row:S.row,r:S.cargo.rations,pw:S.cargo.powder,kits:S.cargo.kits,deck:S.deck.length,ship:S.ship.type,offs:Object.keys(S.officers).length}));
const meas=()=>p.evaluate(()=>{const e=document.querySelector('#app .scr');return e?e.scrollHeight-e.clientHeight:0});
let oshot=0;const fits=async tag=>{let o=await meas();if(o>2){await p.waitForTimeout(450);o=await meas();if(o>2){{const d=await p.evaluate(()=>{const scr=document.querySelector('#app .scr');const sea=scr.querySelector('.sea');return [...scr.children].map(c=>c.className+':'+c.offsetHeight).join(' ')+' | sea '+(sea?[...sea.children].map(c=>c.className+':'+c.offsetHeight).join(' '):'')+' | log '+(document.querySelector('#log')?document.querySelector('#log').innerText.length:'')});log.overflow.push(tag+' +'+o+' '+d)}if(oshot<3){oshot++;await p.screenshot({path:`/tmp/overflow-${cap}-${oshot}.png`})}}}};
let steps=0;const shots={};
while(steps++<1500){const s=await st();log.screens[s.sc]=(log.screens[s.sc]||0)+1;
 if(!shots[s.sc]&&['port','cove','map','reward','event','recruit','shipwright'].includes(s.sc)&&(+process.argv[4]||0)){shots[s.sc]=1;await p.screenshot({path:`/tmp/pt-${cap}-${s.sc}.png`})}
 if(s.sc==='end'){const e=await p.evaluate(()=>S.end);log.result={kind:e.kind,act:e.act,banked:e.banked};break}
 await fits(s.sc);
 if(s.sc==='map'){const pick=await p.evaluate(()=>{let best=-1,sc=-1e9;for(let c=0;c<3;c++){if(!avail(S.row+1,c))continue;const n=S.map[S.row+1][c];let v={fight:3,elite:S.hp<S.maxHp*.6?-5:2,event:2,port:S.coin>60?4:1,shipwright:S.coin>150?4:0,recruit:S.coin>50?5:1,cove:S.ship.hull<hullMax()*.7||S.hp<S.maxHp*.6?5:1,treasure:6,boss:10}[n.t]||0;v+=Math.random();if(v>sc){sc=v;best=c}}return best});log.decisions++;await click(`.node.avail[data-c="${pick}"]`);continue}
 if(s.sc==='combat'){cur=cur||{act:s.act,row:s.row,turns:0,taps:log.taps,hp0:s.hp,hull0:s.hull,crew0:s.crew,en:await p.evaluate(()=>E().k)};
  const act=await p.evaluate(()=>{const c=C(),e=E();
   if(c.phase==='ship'&&e.hull<=e.hullMax*.5&&!c.boss&&!c.queue.length&&S.crew>=e.crew*.9&&S.hp>S.maxHp*.45)return {t:'board'};
   const it=intent();const inc=['broad','crit','melee','rush','officer','slash','lunge','grape'].includes(it.k)?it.v:0;
   const cand=c.hand.map((k,i)=>({k,i})).filter(o=>playable(o.k)&&cost(o.k)<=c.energy);
   if(!cand.length){const sw=c.hand.findIndex(k=>!playable(k));if(c.swap&&sw>=0)return {t:'swap',i:sw};return {t:'end'}}
   const isDef=k=>/Block/.test(CARDS[k].d)&&!/damage|kill/i.test(CARDS[k].d.split('.')[0]);
   const def=cand.find(o=>isDef(o.k)),atk=cand.find(o=>!isDef(o.k));let i=(c.block<inc&&def)?def.i:atk?atk.i:cand[0].i;return {t:'play',i}});
  if(act.t==='board'){await click('#board');continue}
  if(act.t==='end'){cur.turns++;await click('#endturn');continue}
  if(act.t==='swap'){await click(`#hand .card[data-i="${act.i}"]`);await click('#selSwap');continue}
  await click(`#hand .card[data-i="${act.i}"]`);await click(`#hand .card[data-i="${act.i}"]`);continue}
 if(cur){const n=await st();log.fights.push({act:cur.act,row:cur.row,en:cur.en,turns:cur.turns,taps:log.taps-cur.taps,dhull:cur.hull0-n.hull,dhp:cur.hp0-n.hp,dcrew:cur.crew0-n.crew});cur=null}
 if(s.sc==='reward'){const r=await p.evaluate(()=>S.reward);if(r.paths){const k=await p.evaluate(()=>S.ship.hull<hullMax()*.6?'rwShip':S.crew<crewMax()*.6?'rwCrew':'card');if(k==='card'){await click('.cards .card:nth-child(1)');await click('#selCommit')}else await click('#'+k)}else if(r.cards){await click('.cards .card:nth-child(1)');await click('#selCommit')}else await click('#skip');continue}
 if(s.sc==='prize'){await p.evaluate(()=>{const r=S.reward;if(r.officer){hireOfficer(r.officer,0);r.officer=null}if(r.prize){if(SHIPS[r.prize].hull>ship().hull)takePrize();else skipPrize()}else{S.reward=null;S.screen='map'}render()});log.taps++;continue}
 if(s.sc==='port'){await p.evaluate(()=>{if(S.hp<S.maxHp*.6)surgeonHeal();if(S.ship.hull<hullMax()*.7)carpenterRepair();for(let i=0;i<3;i++){if(S.cargo.rations<7)buy('rations',3);if(S.cargo.powder<6)buy('powder',2)}if(S.cargo.kits<2)buy('kits',1)});log.taps+=3;await click('#leave');continue}
 if(s.sc==='shipwright'){await p.evaluate(()=>{const i=LADDER.indexOf(S.ship.type);const nx=LADDER[i+1];if(nx&&S.coin>=SHIPS[nx].price-shipValue()+40)buyShip(nx);['hull','guns'].forEach(k=>{if(S.ship.upg[k]<2&&S.coin>UPG_COST[S.ship.upg[k]]+40)upgradeShip(k)});if(S.ship.hull<hullMax())repairCoin()});log.taps+=2;await click('#leave');continue}
 if(s.sc==='recruit'){await p.evaluate(()=>{const rc=S.recruit;if(rc.offer&&S.coin>=recruitCost(rc.offer))hireOfficer(rc.offer,recruitCost(rc.offer));if(S.crew<crewMax()*.7)hireCrew(5,crewPrice())});log.taps+=2;await click('#leave');continue}
 if(s.sc==='cove'){const hr=s.hull/s.hm,pr=s.hp/s.mh;await click(hr<=pr?'#repair':'#rest');continue}
 if(s.sc==='event'){const n=await p.evaluate(()=>EVENTS[S.ev].o.length);const t=await p.evaluate(()=>EVENTS[S.ev].t);log.events.push(t);await click(`.evopt:nth-child(${1+Math.floor(Math.random()*n)})`);continue}
 if(s.sc==='abandon'){await click('#leave');continue}
 if(s.sc==='extract'){await p.evaluate(()=>{if(S.act===3)endRun('win');else nextAct()});log.taps++;continue}
 log.unknown=s.sc;break}
log.errs=errs;log.steps=steps;const f=`notes/playtest-${cap}-N${NL}.json`;fs.mkdirSync('notes',{recursive:true});fs.writeFileSync(f,JSON.stringify(log,null,1));
const fl=log.fights;console.log(JSON.stringify({cap,not:NL,result:log.result,taps:log.taps,fights:fl.length,avgTurns:(fl.reduce((a,x)=>a+x.turns,0)/Math.max(1,fl.length)).toFixed(1),avgTapsPerFight:(fl.reduce((a,x)=>a+x.taps,0)/Math.max(1,fl.length)).toFixed(0),overflow:log.overflow,errs:errs.length,screens:log.screens}));await b.close()})();
