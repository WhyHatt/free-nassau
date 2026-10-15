// In-page bot used by tests/sim (not loaded by the game). Works in the browser (sim.js) and in node (simnode.js).
(function(G){
const CS={broadside:7,swivel:4,chain:6,grape:5,raking:6,runout:4,barshot:6,ripple:7,mortar:7,fireship:4,powdermonkey:2,cutlass:5,pistols:5,axes:7,grenades:5,hold:4,rally:5,fear:6,hooks:4,rage:5,flurry:5,press:6,sharp:5,
 tack:5,crowd:5,weather:6,hardstar:4,brace:4,fog:5,careen:4,rigspeed:3,feint:5,smokescr:5,dirty:5,firepots:4,pickpocket:3,falsecol:5,rumour:3,hiddenblade:3,parry:5,pistolshot:4,resolve:5,rousing:4,steelnerve:5};
const sumTrack=()=>{const c=C(),e=E();return c.phase==='ship'?e.hull/e.hullMax:c.phase==='board'?e.crew/Math.max(1,e.crewMax):e.hp/Math.max(1,e.hpMax)};
function evalCard(i,inc){const c=C(),k=c.hand[i];const sv=S,rr=G.render,ss=G.save;let v=0;
 try{const snapS=JSON.stringify(S);S=JSON.parse(snapS);const c0=S.combat,e0=c0.enemy;const h0=e0.hull,cr0=e0.crew,hp0=e0.hp||0,bl0=c0.block,en0=c0.energy;const mine0=[S.ship.hull/hullMax(),S.crew/crewMax(),S.hp/S.maxHp];const w0=e0.weak,b0=e0.burn,hand0=c0.hand.length;
  G.render=()=>{};G.save=()=>{};G.__clone=1;play(i);
  if(!S||!S.combat){v=1000}else{const c1=S.combat,e1=c1.enemy;const trackMax=c1.phase==='ship'?e1.hullMax:c1.phase==='board'?e1.crewMax:(e1.hpMax||1);
   const dEn=c1.phase==='ship'?(h0-e1.hull)+(cr0-e1.crew)*.15:c1.phase==='board'?(cr0-e1.crew):((hp0)-(e1.hp||0));
   v+=dEn/trackMax*100;if(c1.phase!==c0.phase)v+=40;
   const useful=Math.min(Math.max(0,c1.block-bl0),Math.max(0,inc-bl0));v+=useful*(c1.phase==='board'?1.1:1.2)/(c1.phase==='ship'?hullMax():c1.phase==='board'?crewMax():S.maxHp)*100*1.4;
   v+=(S.ship.hull/hullMax()-mine0[0])*60+(S.crew/crewMax()-mine0[1])*50+(S.hp/S.maxHp-mine0[2])*80;
   v+=(e1.weak-w0)*(inc*.25)/(c1.phase==='ship'?hullMax():crewMax())*100*.7;v+=(e1.burn-b0)*(c1.phase==='ship'?3:1.5)/trackMax*100;
   v+=(c1.hand.length-(hand0-1))*3.5+(c1.energy-(en0-cost(k)))*5;v+=(c1.advT-c0.advT)*(c0.phase==='ship'?7:0)}}
 finally{G.__clone=0;S=sv;G.render=rr;G.save=ss}
 return v}
G.botRun=function(cap,opts={}){opts=opts||{};
 try{localStorage.removeItem(RUNKEY)}catch(e){}
 if(M){M.tut=1;M.renown=opts.renown||0}
 const expert=opts.level==='expert';
 const rr0=G.render,sv0=G.save;if(!opts.ui){G.render=function(){};G.save=function(){}}
 try{newRun(cap,opts.not||0,opts.doc);const snaps=[],snapped={};let lastPh='',lastBoss=0,lastEn='';let steps=0,actions=0,screens=0;const picked=[],offered={};const fl=[];let cur=null;
 const incoming=()=>{const it=intent();return ['broad','crit','melee','rush','officer','slash','lunge','grape','ram'].includes(it.k)?it.v:0};
 const pickCard=cards=>{let best=null,bs=-1;const cnt={};S.deck.forEach(k=>{const a=CARDS[k].a;cnt[a]=(cnt[a]||0)+1});
  cards.forEach(k=>{offered[k]=(offered[k]||0)+1;let s=(CS[k]||4)+(cnt[CARDS[k].a]||0)*.4+(S.bias===CARDS[k].a?1.2:0)+Math.random()*1.5;if(s>bs){bs=s;best=k}});
  return {k:best,s:bs}};
 while(steps++<6000){const sc=S.screen;
  if(sc==='combat'){const c=C();if(!cur||cur.c!==c){if(cur&&cur.c!==c&&!cur.done){}cur={c,k:c.enemy.k,kind:c.kind,h:S.ship.hull,cr:S.crew,hp:S.hp,t:0,done:0}}}
  else if(cur&&!cur.done){cur.done=1;fl.push({k:cur.k,kind:cur.kind,dh:cur.h-S.ship.hull,dc:cur.cr-S.crew,dp:cur.hp-S.hp,hm:hullMax(),sc:screens})}
  if(sc==='end'){return{kind:S.end.kind,act:S.end.act,row:S.row,steps,actions,cap,deck:S.deck.slice(),offs:Object.values(S.officers).map(o=>o.id),ship:S.ship.type,coin:S.coin,banked:S.end.banked,fights:S.stats.fights,ab:S.stats.abandons||0,abl:S.stats.abl||[],not:S.not,ph:lastPh,boss:lastBoss,en:lastEn,crew:S.crew,hull:S.ship.hull,snaps,ren:S.end.ren,doc:S.doc,offered,screens,taps:S.stats.taps,fl}}
  if(sc==='map'){screens++;let best=null,score=-1e9;for(let c=0;c<COLS;c++){if(!avail(S.row+1,c))continue;const n=S.map[S.row+1][c];let s=0;
    const hurt=S.hp<S.maxHp*.5||S.ship.hull<hullMax()*.5;
    s+={fight:3,elite:hurt?-6:4.5,event:2,port:S.coin>80?4:1,shipwright:S.coin>150?4:0,recruit:!S.officers[n.role]&&S.coin>50?6:1,cove:S.ship.hull<hullMax()*.7||S.hp<S.maxHp*.7?5:2,treasure:6,boss:10,smuggler:S.coin>60?3:0.5,wreck:2,storm:hurt?-2:2}[n.t]||0;
    s+=Math.random();if(s>score){score=s;best=c}}
   if(best===null)return{kind:'stuck',act:S.act,steps,cap};go(S.row+1,best);continue}
  if(sc==='combat'){const c=C(),e=E();if(c.boss&&!snapped[c.boss]){snapped[c.boss]=1;snaps.push({b:c.boss,hp:S.hp/S.maxHp,hull:S.ship.hull/hullMax(),crew:S.crew,crewMax:crewMax(),coin:S.coin,deck:S.deck.length,ship:S.ship.type,powder:S.cargo.powder,offs:Object.keys(S.officers).length})}lastPh=c.phase;lastBoss=c.boss||0;lastEn=e.k;
   actions++;cur.t=c.turn;cur.lastEn=c.enemy.k;
   if(c.phase==='ship'&&e.hull<=e.hullMax*.5&&!c.boss&&!c.queue.length){const safe=S.crew>=e.crew*.9&&S.hp>S.maxHp*.45;if(safe){board();continue}}
   const inc=incoming();
   const ol=orderList().filter(orderReady);
   if(ol.length&&!opts.noorders){const pickO=ol.find(o=>o==='fire'?c.hand.some(k=>CARDS[k].pw):o==='hard'?inc>c.block+6:o==='charge'?true:true);if(pickO){useOrder(pickO);continue}}
   const cand=c.hand.map((k,i)=>({k,i})).filter(o=>playable(o.k)&&cost(o.k)<=c.energy);
   if(!cand.length){endTurn();continue}
   if(!expert){const dmg=o=>{const sv=S,rr=G.render,ss=G.save;let d=0,b=0;try{S=JSON.parse(JSON.stringify(S));const e0=S.combat.enemy,t0=c.phase==='ship'?e0.hull:c.phase==='board'?e0.crew:e0.hp,b0=S.combat.block;G.render=()=>{};G.save=()=>{};G.__clone=1;play(o.i);if(S&&S.combat){const e1=S.combat.enemy;d=t0-(c.phase==='ship'?e1.hull:c.phase==='board'?e1.crew:e1.hp);b=S.combat.block-b0}else d=999}finally{G.__clone=0;S=sv;G.render=rr;G.save=ss}return {d,b}};
    const info=cand.map(o=>Object.assign({o},dmg(o)));const def=info.find(x=>x.b>0&&x.d<=2),atk=info.find(x=>x.d>0)||info[0];
    play(c.block<inc&&def?def.o.i:atk.o.i);continue}
   let bi=-1,bv=-1e9;cand.forEach(o=>{const v=(evalCard(o.i,inc)+Math.random()*.5)/(cost(o.k)+.5);if(v>bv){bv=v;bi=o.i}});
   play(bi);continue}
  if(sc==='reward'){screens++;const r=S.reward;
   if(r.heavy&&S.deck.length<14&&S.coin<150)takeHeavy();
   if(r.paths){const pc=pickCard(r.cards);if(S.ship.hull<hullMax()*.5)takeShipUp();else if(S.crew<crewMax()*.5)takeCrewUp();else if(!opts.nocards&&(expert?(pc.s>5.2+.3*(S.deck.length-12)):S.deck.length<16)){const k=expert?pc.k:r.cards[0];takeCard(k)}else if(S.maxHp<85&&S.hp<S.maxHp*.8)takeCaptainUp();else if(nextShipUp())takeShipUp();else takeCrewUp()}
   else if(r.cards){const pc=pickCard(r.cards);if(!opts.nocards&&(expert?pc.s>5+.3*(S.deck.length-12):S.deck.length<16))takeCard(expert?pc.k:r.cards[0]);else rewardDone()}else rewardDone();continue}
  if(sc==='prize'){screens++;const r=S.reward;if(r.officer){hireOfficer(r.officer,0);r.officer=null}if(r.prize){if(SHIPS[r.prize].hull>ship().hull)takePrize();else skipPrize()}else{S.reward=null;S.screen='map'}continue}
  if(sc==='port'){screens++;if(!S.shop)S.shop={cards:portCards(),removedHere:0,healed:0,repaired:0};
   if(S.hp<S.maxHp*.6)surgeonHeal();if(S.ship.hull<hullMax()*.7)carpenterRepair();for(let i=0;i<3;i++){if(S.cargo.rations<7)buy('rations',3);if(S.cargo.powder<6)buy('powder',2)}if(S.cargo.kits<2)buy('kits',1);for(let i=0;i<3;i++){if(S.crew<crewMax()*.75&&S.coin>crewPrice()*5+30)hireCrew(5,crewPrice())}
   if(!opts.nocards&&expert){const sh=S.shop;sh.cards.forEach((it,i)=>{if(it.sold||S.coin<px(it.p)+60)return;const pc=pickCard([it.k]);if(pc.s>6+.3*(S.deck.length-12))buyCard(i)});
    if(!sh.upgraded&&S.coin>px(70)+50){const i=S.deck.findIndex(k=>canUpgrade(k)&&(CS[k]||0)>=5);if(i>=0){S.upMode='port';upgradeCard(i)}}
    if(!sh.removedHere&&S.coin>dismissCost()+60){const i=S.deck.indexOf('ballast');if(i>=0)removeCard(i)}}
   S.shop=null;S.screen='map';continue}
  if(sc==='upgrade'){const m=S.upMode;const i=S.deck.map((k,i)=>({k,i})).filter(o=>canUpgrade(o.k)).sort((a,b)=>(CS[b.k]||0)-(CS[a.k]||0))[0];if(i)upgradeCard(i.i);else{S.screen=S.upBack||'map'}continue}
  if(sc==='remove'){const i=S.deck.indexOf('ballast');const j=i>=0?i:S.deck.findIndex(k=>k==='swivel'||k==='pistolshot'||k==='cutlass');if(S.smugRm)removeSmug(j>=0?j:0);else removeCard(j>=0?j:0);if(S.screen==='remove'){S.screen='map'}continue}
  if(sc==='smuggler'){screens++;const sm=S.smug;sm.cards.forEach((it,i)=>{if(it.sold||S.coin<px(it.p)+40)return;const pc=pickCard([baseId(it.k)]);if(!opts.nocards&&expert&&pc.s>5.5+.3*(S.deck.length-12))buySmug(i)});S.screen='map';continue}
  if(sc==='shipwright'){screens++;const i=LADDER.indexOf(S.ship.type);const nx=LADDER[i+1];if(nx&&S.coin>=SHIPS[nx].price-shipValue()+40)buyShip(nx);['hull','guns'].forEach(k=>{if(S.ship.upg[k]<2&&S.coin>UPG_COST[S.ship.upg[k]]+40)upgradeShip(k)});if(S.ship.hull<hullMax())repairCoin();S.screen='map';continue}
  if(sc==='recruit'){screens++;const rc=S.recruit;if(rc.offer&&S.coin>=recruitCost(rc.offer))hireOfficer(rc.offer,recruitCost(rc.offer));if(S.crew<crewMax()*.7)hireCrew(5,crewPrice());S.screen='map';continue}
  if(sc==='cove'){screens++;const hr=S.ship.hull/hullMax(),pr=S.hp/S.maxHp,inj=Object.values(S.officers).some(o=>o.injured);
   if(hr<.75&&hr<=pr)coveRepair();else if(pr<.75||inj)coveRest();else if(!opts.nocards&&expert&&S.deck.some(canUpgrade)){S.coveUsed=1;S.upMode='cove';const i=S.deck.map((k,i)=>({k,i})).filter(o=>canUpgrade(o.k)).sort((a,b)=>(CS[b.k]||0)-(CS[a.k]||0))[0];upgradeCard(i.i)}else coveRepair();continue}
  if(sc==='event'){screens++;chooseEvent(rnd(EVENTS[S.ev].o.length));continue}
  if(sc==='abandon'){S.screen='map';continue}
  if(sc==='extract'){screens++;if(opts.extract)endRun('extract');else if(S.act===3)endRun('win');else nextAct();continue}
  return{kind:'unknown:'+sc,act:S.act,steps,cap}}
 return{kind:'timeout',act:S.act,steps,cap,screen:S.screen}}
 finally{G.render=rr0;G.save=sv0}};
})(typeof window!=='undefined'?window:globalThis);
