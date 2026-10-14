// In-page bot used by tests/sim (not loaded by the game).
window.botRun=function(cap,opts={}){
 localStorage.removeItem(RUNKEY);newRun(cap);let steps=0;const errs=[];
 const incoming=()=>{const it=intent();return ['broad','crit','melee','rush','officer','slash','lunge','grape'].includes(it.k)?it.v:0};
 while(steps++<20000){const sc=S.screen;
  if(sc==='end')return{kind:S.end.kind,act:S.end.act,steps,cap};
  if(sc==='map'){let best=null,score=-1e9;for(let c=0;c<3;c++){if(!avail(S.row+1,c))continue;const n=S.map[S.row+1][c];let s=0;
    const hurt=S.hp<S.maxHp*.5||S.ship.hull<hullMax()*.5;
    s+={fight:3,elite:hurt?-6:2,event:2,port:S.coin>80?4:1,fence:S.cargo.silver>3?4:0,shipwright:S.coin>150?4:0,recruit:!S.officers[n.role]&&S.coin>50?6:1,tavern:S.hp<S.maxHp*.7?5:1,cove:S.ship.hull<hullMax()*.7?5:1,treasure:6,wreck:7,boss:10}[n.t]||0;
    s+=Math.random();if(s>score){score=s;best=c}}
   if(best===null)return{kind:'stuck',act:S.act,steps,cap};go(S.row+1,best);continue}
  if(sc==='combat'){const c=C(),e=E();
   if(c.phase==='ship'&&e.hull<=e.hullMax*.5&&!c.boss&&!c.queue.length){const safe=S.crew>=e.crew*.9&&S.hp>S.maxHp*.45;if(safe){board();continue}}
   const inc=incoming();let idx=-1;
   const cand=c.hand.map((k,i)=>({k,i})).filter(o=>playable(o.k)&&cost(o.k)<=c.energy);
   if(!cand.length){const sw=c.hand.findIndex(k=>!playable(k));if(c.swap&&sw>=0){swapCard(sw);continue}endTurn();continue}
   const isDef=k=>/Evasion|Guard|Block/.test(CARDS[k].d)&&!/damage|kill/i.test(CARDS[k].d.split('.')[0]);
   const def=cand.find(o=>isDef(o.k));const atk=cand.find(o=>!isDef(o.k));
   if(c.block<inc&&def)idx=def.i;else if(atk)idx=atk.i;else idx=cand[0].i;
   play(idx);continue}
  if(sc==='reward'){const r=S.reward;if(r.paths){if(S.ship.hull<hullMax()*.6)takeShipUp();else if(S.crew<crewMax()*.6)takeCrewUp();else if(S.deck.length<16)takeCard(r.cards[0]);else takeCaptainUp()}else if(r.cards)takeCard(r.cards[0]);else rewardDone();continue}
  if(sc==='prize'){const r=S.reward;if(r.officer){hireOfficer(r.officer,0);r.officer=null}if(r.prize){if(SHIPS[r.prize].hull>ship().hull)takePrize();else skipPrize()}else{S.reward=null;S.screen='map'}continue}
  if(sc==='port'){render();for(let i=0;i<3;i++){if(S.cargo.food<5)buy('food',2);if(S.cargo.water<5)buy('water',2);if(S.cargo.powder<6)buy('powder',2)}if(S.cargo.timber<2)buy('timber',2);if(S.cargo.rope<2)buy('rope',2);S.shop=null;S.screen='map';continue}
  if(sc==='fence'){sellSilver();S.screen='map';continue}
  if(sc==='shipwright'){const i=LADDER.indexOf(S.ship.type);const nx=LADDER[i+1];if(nx&&S.coin>=SHIPS[nx].price-shipValue()+40)buyShip(nx);['hull','guns'].forEach(k=>{if(S.ship.upg[k]<2&&S.coin>UPG_COST[S.ship.upg[k]]+40)upgradeShip(k)});if(S.ship.hull<hullMax())repairCoin();S.screen='map';continue}
  if(sc==='recruit'){const rc=S.recruit;if(rc.offer&&S.coin>=recruitCost(rc.offer))hireOfficer(rc.offer,recruitCost(rc.offer));if(S.crew<crewMax()*.7)hireCrew(5,3);S.screen='map';continue}
  if(sc==='tavern'){if(S.hp<S.maxHp*.75)tavernHeal();if(S.morale<50)buy('rum',2);S.screen='map';continue}
  if(sc==='cove'){repairCove();coveRest();S.msg='';S.screen='map';continue}
  if(sc==='event'){chooseEvent(rnd(EVENTS[S.ev].o.length));continue}
  if(sc==='mutiny'){resolveMutiny(S.cargo.rum>=2?0:S.coin>=40?1:2);continue}
  if(sc==='abandon'){S.screen='map';continue}
  if(sc==='extract'){if(opts.extract)endRun('extract');else if(S.act===3)endRun('win');else nextAct();continue}
  if(S.morale<40&&S.cargo.rum>0)drinkRum();
  return{kind:'unknown:'+sc,act:S.act,steps,cap}}
 return{kind:'timeout',act:S.act,steps,cap,screen:S.screen}};
