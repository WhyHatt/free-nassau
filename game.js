"use strict";
/* Free Nassau v2 rough draft. Single-file game logic. */
const RUNKEY='fnv2run', METAKEY='fnv2meta';
const rnd=n=>Math.floor(Math.random()*n), pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let S=null, M=null;

/* ---------- DATA ---------- */
const SHIPS={
 periagua:{n:'Periagua',hull:30,crew:25,hold:16,guns:2,price:0,perk:'Tiny and nimble: +3 Evasion each ship turn.'},
 sloop:{n:'Sloop',hull:45,crew:40,hold:22,guns:3,price:140,perk:'Fast: first sail card each fight costs 0.'},
 brigantine:{n:'Brigantine',hull:65,crew:60,hold:24,guns:4,price:300,perk:'Balanced: +2 hold, +1 card draw on boarding.'},
 snow:{n:'Snow',hull:85,crew:80,hold:28,guns:5,price:500,perk:'Heavy broadsides: cannon cards +2 damage.'},
 frigate:{n:'Frigate',hull:110,crew:110,hold:34,guns:6,price:800,perk:'Ship of force: enemy crews start -10%.'},
};
const LADDER=['periagua','sloop','brigantine','snow','frigate'];
const UPG={hull:{n:'Sheathing',d:'+15 max hull per level'},guns:{n:'Heavier guns',d:'+1 guns per level'},rig:{n:'New rigging',d:'+3 Evasion at start of each ship turn per level'}};
const UPG_COST=[70,140];

const CARGO={powder:{n:'Gunpowder',i:'💥'},timber:{n:'Timber',i:'🪵'},rope:{n:'Rope',i:'🪢'},food:{n:'Food',i:'🍖'},water:{n:'Fresh water',i:'💧'},rum:{n:'Rum',i:'🍾'},silver:{n:'Silver/plunder',i:'🪙'},maps:{n:'Charts & documents',i:'🗺️'}};
const HOLDKEYS=['powder','timber','rope','food','water','rum','silver'];
const PRICE={powder:8,timber:6,rope:5,food:3,water:2,rum:6};

/* Card tags: S = Ship phase, C = Crew (boarding), K = Captain (any phase) */
const CARDS={
 broadside:{n:'Broadside',tag:'S',c:2,pw:1,d:'Fire the guns: 6 + 2×Guns damage to hull. Uses 1 💥.',f:x=>x.shot(6+2*x.guns())},
 swivel:{n:'Swivel Gun',tag:'S',c:1,d:'Light gun: 3 + Guns damage to hull. No powder.',f:x=>x.shot(3+x.guns(),true)},
 chain:{n:'Chain Shot',tag:'S',c:1,pw:1,d:'4 + Guns damage. Enemy Weak 2 (deals 25% less). Uses 1 💥.',f:x=>{x.shot(4+x.guns());x.E().weak+=2}},
 grape:{n:'Grapeshot',tag:'S',c:1,pw:1,d:'2 + Guns hull damage and kill 6 enemy crew. Uses 1 💥.',f:x=>{x.shot(2+x.guns());x.killCrew(6)}},
 raking:{n:'Raking Fire',tag:'S',c:2,pw:1,d:'4 + 2×Guns damage; if the enemy has no Evasion, +6 and gain 1 Advantage. Uses 1 💥.',f:x=>{const e=x.E();const bonus=e.block<=0;x.shot(4+2*x.guns()+(bonus?6:0));if(bonus)x.adv(1)}},
 tack:{n:'Tack Hard',tag:'S',c:1,sail:1,d:'Gain 7 Evasion (blocks hull damage).',f:x=>x.blk(7)},
 crowd:{n:'Crowd Sail',tag:'S',c:1,sail:1,d:'Gain 4 Evasion. Draw 1.',f:x=>{x.blk(4);x.draw(1)}},
 weather:{n:'Take the Weather Gauge',tag:'S',c:1,sail:1,d:'Gain 3 Evasion and 1 Advantage.',f:x=>{x.blk(3);x.adv(1)}},
 fireship:{n:'Fireship',tag:'S',c:2,pw:2,x:1,d:'Enemy Burns: 5 hull damage each turn. Uses 2 💥. Exhaust.',f:x=>{x.E().burn+=5}},
 cutlass:{n:'Cutlasses',tag:'C',c:1,d:'Your boarders kill 6 enemy crew.',f:x=>x.melee(6)},
 pistols:{n:'Pistol Volley',tag:'C',c:1,d:'Kill 4 enemy crew. Enemy Weak 1.',f:x=>{x.melee(4);x.E().weak+=1}},
 axes:{n:'Boarding Axes',tag:'C',c:2,d:'Kill 13 enemy crew.',f:x=>x.melee(13)},
 hold:{n:'Hold the Rail',tag:'C',c:1,d:'Gain 6 Guard (blocks boarding damage).',f:x=>x.blk(6)},
 rally:{n:'Rally the Crew',tag:'C',c:1,d:'Gain 4 Guard. +5 morale.',f:x=>{x.blk(4);x.morale(5)}},
 grenades:{n:'Grenadoes',tag:'C',c:1,pw:1,d:'Kill 9 enemy crew. Uses 1 💥.',f:x=>x.melee(9)},
 fear:{n:'Fearsome Reputation',tag:'C',c:1,d:'Enemy crew loses 10% of its number and is Weak 2.',f:x=>{const e=x.E();x.melee(Math.ceil(e.crew*.1),true);e.weak+=2}},
 command:{n:'Command',tag:'K',c:1,d:'Draw 2 cards.',f:x=>x.draw(2)},
 parry:{n:'Parry',tag:'K',c:1,d:'Gain 7 Block (any phase).',f:x=>x.blk(7)},
 pistolshot:{n:"Captain's Pistol",tag:'K',c:1,d:'Deal 6 to the current target (hull, crew or foe).',f:x=>x.any(6)},
 resolve:{n:'Iron Resolve',tag:'K',c:0,x:1,d:'Gain 1 energy and draw 1. Exhaust.',f:x=>{x.C().energy++;x.draw(1)}},
 /* captain signatures */
 smoke:{n:'Lit Fuses in the Beard',tag:'K',c:1,d:'Blackbeard: gain 5 Block; enemy Weak 2.',f:x=>{x.blk(5);x.E().weak+=2}},
 shares:{n:"Prince's Share",tag:'K',c:0,d:'Bellamy: +8 morale, draw 1.',f:x=>{x.morale(8);x.draw(1)}},
 defiance:{n:'Defiance',tag:'K',c:1,x:1,d:'Vane: +2 Strength (all your damage) this fight. Exhaust.',f:x=>{x.C().str+=2}},
 twin:{n:'Twin Blades',tag:'K',c:1,d:'Bonny & Read: deal 4 twice to the current target.',f:x=>{x.any(4);x.any(4)}},
 getaway:{n:'Fast Getaway',tag:'K',c:1,d:'Rackham: gain 8 Block, draw 1.',f:x=>{x.blk(8);x.draw(1)}},
 /* officer signatures */
 fairshares:{n:'Fair Shares',tag:'C',c:1,d:'Quartermaster: +12 morale, gain 5 Guard.',f:x=>{x.morale(12);x.blk(5)}},
 ledger:{n:'Ship\u2019s Articles',tag:'K',c:0,x:1,d:'Purser: draw 2. Exhaust.',f:x=>x.draw(2)},
 allhands:{n:'All Hands to Pumps',tag:'S',c:1,d:'Bosun: repair 6 hull (uses 1 🪵 if you have it, else 3) and gain 4 Evasion.',f:x=>{x.repair(S.cargo.timber>0?6:3,true);x.blk(4)}},
 splice:{n:'Splice the Line',tag:'S',c:0,d:'Bosun: gain 5 Evasion.',f:x=>x.blk(5)},
 doubleshot:{n:'Double-Shotted',tag:'S',c:2,pw:2,d:'Master Gunner: 10 + 3×Guns damage. Uses 2 💥.',f:x=>x.shot(10+3*x.guns())},
 hotshot:{n:'Heated Shot',tag:'S',c:1,pw:1,d:'Master Gunner: 5 + Guns damage, enemy Burns 3. Uses 1 💥.',f:x=>{x.shot(5+x.guns());x.E().burn+=3}},
 readwind:{n:'Read the Wind',tag:'S',c:0,x:1,d:'Navigator: weather becomes Weather Gauge (yours). Draw 1. Exhaust.',f:x=>{x.C().weather='gauge';x.draw(1)}},
 shoal:{n:'Shoal Run',tag:'S',c:1,sail:1,d:'Navigator: gain 11 Evasion.',f:x=>x.blk(11)},
};
const POOL=['broadside','swivel','chain','grape','raking','tack','crowd','weather','fireship','cutlass','pistols','axes','hold','rally','grenades','command','parry','pistolshot','resolve'];

const CAPTAINS={
 blackbeard:{n:'Edward "Blackbeard" Teach',short:'Blackbeard',hp:72,img:'img/captain-placeholder.jpg',crew:34,
  deck:['broadside','broadside','swivel','tack','tack','cutlass','cutlass','hold','fear','smoke'],
  passive:'Terror: enemy crews start boarding with 10% fewer men.',id:'Intimidation and boarding.'},
 bellamy:{n:'"Black Sam" Bellamy',short:'Bellamy',hp:62,img:'img/captain-placeholder.jpg',crew:40,
  deck:['broadside','swivel','swivel','tack','tack','cutlass','cutlass','rally','rally','shares'],
  passive:'Prince of Pirates: +30% plunder; morale losses halved; recruits cost 25% less.',id:'Crew, morale and plunder.'},
 vane:{n:'Charles Vane',short:'Vane',hp:62,img:'img/vane.jpg',crew:34,
  deck:['broadside','broadside','chain','grape','tack','crowd','cutlass','cutlass','hold','defiance'],
  passive:'No quarter: cannon cards +2 damage; start with +3 gunpowder.',id:'Aggressive gunnery.'},
 bonnyread:{n:'Anne Bonny & Mary Read',short:'Bonny & Read',hp:66,img:'img/captain-placeholder.jpg',crew:34,
  deck:['swivel','swivel','broadside','tack','tack','cutlass','cutlass','pistols','parry','twin'],
  passive:'Two blades: Captain cards deal +2 damage; +1 energy in duels.',id:'Hand-to-hand and duels.'},
 rackham:{n:'"Calico Jack" Rackham',short:'Rackham',hp:60,img:'img/captain-placeholder.jpg',crew:34,unlock:1,
  deck:['swivel','swivel','broadside','crowd','crowd','tack','cutlass','cutlass','hold','getaway'],
  passive:'Fast raider: sail cards give +3 Evasion; can flee normal fights on turn 1.',id:'Speed and evasion (unlock).'},
};
const ROLES={qm:{n:'Quartermaster',i:'📜'},bosun:{n:'Bosun',i:'🔨'},gunner:{n:'Master Gunner',i:'💣'},nav:{n:'Navigator',i:'🧭'}};
const OFFICERS={
 jennings:{n:'Henry Jennings',role:'qm',img:'img/captain-placeholder.jpg',card:'fairshares',passive:'Morale losses -50%; +10% plunder.',cost:60},
 purser:{n:'A hard-bargaining purser',role:'qm',img:'img/captain-placeholder.jpg',card:'ledger',passive:'Fence prices +30%.',cost:45},
 pruitt:{n:'Tom Pruitt',role:'bosun',img:'img/officer-b.jpg',card:'allhands',passive:'Careening repairs +50%.',cost:50},
 shea:{n:'Barty Shea',role:'bosun',img:'img/officer-a.jpg',card:'splice',passive:'+10 max hull.',cost:50},
 hands:{n:'Israel Hands',role:'gunner',img:'img/captain-placeholder.jpg',card:'doubleshot',passive:'First cannon card each fight costs 0 energy.',cost:65},
 hatch:{n:'Abel Hatch',role:'gunner',img:'img/captain-placeholder.jpg',card:'hotshot',passive:'Cannon cards +2 damage.',cost:55},
 penhallow:{n:'Matthias Penhallow',role:'nav',img:'img/officer-c.jpg',card:'readwind',passive:'Food & water used only every other leg.',cost:55},
 pilot:{n:'A Spanish pilot',role:'nav',img:'img/captain-placeholder.jpg',card:'shoal',passive:'Fights start with the Weather Gauge more often; +1 chart each act.',cost:50},
};
const WEATHER={
 fair:{n:'Fair wind',d:'+1 card on turn 1.'},
 gauge:{n:'Weather Gauge (yours)',d:'Your first cannon card each turn +3 damage.'},
 enemygauge:{n:'Weather Gauge (theirs)',d:'Enemy broadsides +2.'},
 squall:{n:'Squall',d:'All cannon fire -2 damage (both sides).'},
 calm:{n:'Calm',d:'Sail cards cost +1.'},
 fog:{n:'Fog',d:'Enemy gains 3 Evasion each turn.'},
};
/* enemy ship templates: hull, crew, ship intents */
const ENEMIES={
 merchant:{n:'Armed Merchantman',hull:30,crew:16,img:'img/ship.jpg',loot:1.3,ints:[['broad',5],['evade',6],['broad',4],['evade',4]]},
 rival:{n:'Rival Pirate Sloop',hull:40,crew:34,img:'img/ship.jpg',loot:1,ints:[['broad',7],['grape',6],['broad',5],['evade',5],['crit',5]]},
 privateer:{n:'Privateer Brig',hull:50,crew:38,img:'img/ship.jpg',loot:1.1,ints:[['broad',8],['evade',6],['crit',6],['broad',6],['load',2]]},
 patrol:{n:'Navy Patrol Frigate',hull:68,crew:55,img:'img/ship.jpg',loot:1.6,elite:1,ints:[['broad',11],['crit',7],['grape',8],['evade',8],['load',2],['broad',9]]},
 guarda:{n:'Spanish Guarda Costa',hull:60,crew:50,img:'img/ship.jpg',loot:1.3,ints:[['broad',9],['grape',8],['crit',7],['evade',7]]},
 hunter:{n:'Pardoned Pirate-Hunter',hull:70,crew:58,img:'img/ship.jpg',loot:1.4,ints:[['broad',10],['crit',8],['grape',9],['evade',8],['load',2]]},
 sqA:{n:"Squadron Sloop 'Escort'",hull:45,crew:30,img:'img/ship.jpg',loot:.6,ints:[['broad',8],['evade',6],['crit',6],['broad',7]]},
 sqB:{n:"Squadron Frigate (flagship)",hull:80,crew:60,img:'img/ship.jpg',loot:2,ints:[['broad',11],['crit',8],['load',2],['grape',9],['evade',8],['broad',13]]},
 fort:{n:'Guarda Costa Stockade',hull:0,crew:58,img:'img/nassau-day9.jpg',loot:2},
 horn:{n:"Hornigold's Ranger",hull:85,crew:55,img:'img/hornigold.jpg',loot:3,ints:[['broad',10],['crit',7],['grape',9],['evade',8],['load',2],['broad',12]]},
};
const ACTS={
 1:{n:'Act I: The Flying Gang',rows:10,pool:['merchant','rival','rival','privateer'],elite:'patrol',scale:1,boss:'Pirate-Hunter Squadron',trophy:{id:'pennant',n:"Commodore's Pennant",d:'+8 max hull for the rest of the run.'}},
 2:{n:'Act II: The Treasure Coast',rows:7,pool:['privateer','guarda','rival'],elite:'patrol',scale:1.3,boss:'Guarda Costa Stockade (crew assault)',trophy:{id:'letter',n:'Letter of Marque (forged)',d:'+30% Fence prices.'}},
 3:{n:'Act III: The Hunter',rows:7,pool:['hunter','guarda','privateer'],elite:'patrol',scale:1.55,boss:'Benjamin Hornigold',trophy:{id:'spyglass',n:"Hornigold's Spyglass",d:'Proof you beat the pirate-hunter.'}},
};
const NODEI={fight:'⚔️',elite:'☠️',event:'❓',port:'⚓',fence:'💰',shipwright:'🛠️',recruit:'👤',tavern:'🍺',cove:'🏝️',treasure:'🧰',wreck:'🌫️',boss:'👑'};
const NODEN={fight:'Ship battle',elite:'Navy frigate (elite)',event:'Event',port:'Port market',fence:'Fence',shipwright:'Shipwright',recruit:'Recruit',tavern:'Tavern',cove:'Careening cove',treasure:'Treasure',wreck:'Uncharted wreck (needs a chart)',boss:'Act boss'};

/* ---------- META ---------- */
function loadMeta(){try{M=JSON.parse(localStorage.getItem(METAKEY))}catch(e){}
 M=Object.assign({banked:0,runs:0,wins:0,deaths:0,extracts:0,bestAct:0,sunk:0,boarded:0,plunder:0,unlocked:{},buildings:{shipyard:0,powder:0,tavern:0},trophies:[],byCaptain:{}},M||{})}
function saveMeta(){try{localStorage.setItem(METAKEY,JSON.stringify(M))}catch(e){}}
const BUILD={
 shipyard:{n:'Shipyard',d:['Start with +1 Sheathing on your sloop.','Start with +1 Sheathing and +1 Guns.'],cost:[150,400]},
 powder:{n:'Powder House',d:['Start with +3 gunpowder.','Start with +6 gunpowder.'],cost:[120,300]},
 tavern:{n:'Harbour Tavern',d:['Start with +6 crew and +1 rum.','Start with +12 crew, +2 rum, +10 morale.'],cost:[120,300]},
};
function save(){try{if(S)localStorage.setItem(RUNKEY,JSON.stringify(S));else localStorage.removeItem(RUNKEY)}catch(e){}}
function loadRun(){try{return JSON.parse(localStorage.getItem(RUNKEY))}catch(e){return null}}

/* ---------- RUN ---------- */
function newRun(cap){const C0=CAPTAINS[cap];const b=M.buildings;
 S={cap,hp:C0.hp,maxHp:C0.hp,coin:60,
  ship:{type:'sloop',hull:45,upg:{hull:0,guns:0,rig:0},spent:0},
  crew:C0.crew,morale:70,cargo:{powder:5,timber:1,rope:1,food:4,water:4,rum:1,silver:0,maps:0},
  officers:{},deck:C0.deck.slice(),act:1,row:-1,col:-1,leg:0,screen:'map',combat:null,msg:'',trophies:[],removed:0,
  stats:{fights:0,sunk:0,boarded:0,plunder:0},log:[]};
 if(b.shipyard>=1)S.ship.upg.hull=1; if(b.shipyard>=2)S.ship.upg.guns=1;
 S.cargo.powder+=b.powder*3; if(cap==='vane')S.cargo.powder+=3;
 S.crew+=b.tavern*6;S.cargo.rum+=b.tavern;if(b.tavern>=2)S.morale+=10;
 S.ship.hull=hullMax();S.crew=Math.min(S.crew,crewMax());
 S.map=genMap(1);M.runs++;saveMeta();save();render()}
const ship=()=>SHIPS[S.ship.type];
const hullMax=()=>ship().hull+15*S.ship.upg.hull+(off('shea')?10:0)+(S.trophies.includes('pennant')?8:0);
const crewMax=()=>ship().crew;
const holdMax=()=>ship().hold+(S.ship.type==='brigantine'?2:0);
const holdUsed=()=>HOLDKEYS.reduce((a,k)=>a+S.cargo[k],0);
const off=id=>Object.values(S.officers).some(o=>o.id===id&&!o.injured);
const hasOff=id=>Object.values(S.officers).some(o=>o.id===id);
function addCargo(k,n){if(k==='maps'){S.cargo.maps+=n;return n}const room=holdMax()-holdUsed();const a=Math.max(0,Math.min(n,room));S.cargo[k]+=a;return a}
function moraleChange(n){if(n<0){if(S.cap==='bellamy')n=Math.ceil(n/2);if(off('jennings'))n=Math.ceil(n/2)}S.morale=clamp(S.morale+n,0,100)}
function shipValue(){const base=ship().price*0.5*(S.ship.hull/hullMax());return Math.round(base+S.ship.spent*0.5)}
function officerCards(){return Object.values(S.officers).filter(o=>!o.injured).map(o=>OFFICERS[o.id].card)}

/* ---------- MAP ---------- */
function wpick(w){let t=0;for(const k in w)t+=w[k];let x=Math.random()*t;for(const k in w){x-=w[k];if(x<0)return k}return 'fight'}
function genMap(act){const R=ACTS[act].rows,rows=[];const mid=Math.floor(R/2);
 for(let r=0;r<R;r++){const row=[];for(let c=0;c<3;c++){let t;
  if(r===0)t='fight';else if(r===mid)t='treasure';else if(r===R-1)t='cove';
  else{const w={fight:40,event:18,port:8,fence:6,recruit:10,elite:r>=2?8:0,tavern:6,shipwright:4};t=wpick(w);
   const p=rows[r-1][c].t;if(['elite','recruit','port','shipwright','tavern'].includes(t)&&t===p)t='fight'}
  row.push({t,done:0})}
  if(r>0&&r<R-1&&r!==mid){
   if((r===1||r===mid+1)&&!row.some(n=>n.t==='recruit'))row[rnd(3)].t='recruit';
   if(r===2&&!row.some(n=>n.t==='port'||n.t==='fence'))row[rnd(3)].t='port';
   if(r>=2&&Math.random()<0.4){row[rnd(3)].t='wreck'}}
  row.forEach(n=>{if(n.t==='recruit')n.role=pick(Object.keys(ROLES))});
  rows.push(row)}
 rows.push([{t:'empty'},{t:'boss',done:0},{t:'empty'}]);return rows}
function avail(r,c){const m=S.map;if(r!==S.row+1||r>=m.length)return false;const n=m[r][c];if(n.t==='empty')return false;
 if(n.t==='wreck'&&S.cargo.maps<=0)return false;if(r===m.length-1)return c===1;if(S.row<0)return true;return Math.abs(c-S.col)<=1}
function go(r,c){if(!avail(r,c))return;const n=S.map[r][c];S.row=r;S.col=c;n.done=1;S.msg='';
 upkeep();if(S.screen==='mutiny'){S.pending={r,c};save();render();return}
 enterNode(n)}
function upkeep(){S.leg++;if(off('penhallow')&&S.leg%2===0)return;
 let short=0;['food','water'].forEach(k=>{if(S.cargo[k]>0)S.cargo[k]--;else short++});
 if(short){moraleChange(-8*short);S.crew=Math.max(0,S.crew-3*short);S.msg=`Short of ${short===2?'food and water':'supplies'}: -morale, -${3*short} crew. `}
 if(S.morale<=0)S.screen='mutiny'}
function enterNode(n){const t=n.t;
 if(t==='fight')startFight([pick(ACTS[S.act].pool)],'normal');
 else if(t==='elite')startFight([ACTS[S.act].elite],'elite');
 else if(t==='boss')startBoss();
 else if(t==='wreck'){S.cargo.maps--;const s=addCargo('silver',8+rnd(6)),p=addCargo('powder',2);S.reward={msg:`🗺️ Your chart leads to an uncharted wreck: +${s} silver, +${p} gunpowder.`,cards:rollCards(3),paths:false};S.screen='reward'}
 else if(t==='treasure'){const co=30+rnd(25),s=addCargo('silver',3+rnd(4));S.coin+=co;let m='';if(Math.random()<.5){S.cargo.maps++;m=', +1 chart'}S.msg=`🧰 A buried cache: +${co} coin, +${s} silver${m}.`;S.screen='map'}
 else if(t==='event'){S.ev=pickEvent();S.screen='event'}
 else if(t==='recruit'){S.recruit={role:n.role,offer:pickOfficer(n.role)};S.screen='recruit'}
 else S.screen=t;
 save();render()}
function pickOfficer(role){const c=Object.keys(OFFICERS).filter(k=>OFFICERS[k].role===role&&!hasOff(k));return c.length?pick(c):null}

/* ---------- COMBAT ---------- */
function rollWeather(){let w=pick(['fair','fair','gauge','enemygauge','squall','calm','fog']);if(off('pilot')&&Math.random()<.4)w='gauge';return w}
function mkEnemy(k){const b=ENEMIES[k],sc=ACTS[S.act].scale*(1+0.03*Math.max(0,S.row));
 const gm=pick([-1,0,0,1]);// randomized loadout
 const ints=b.ints?shuffle(b.ints).map(i=>[i[0],Math.max(1,Math.round(i[1]*sc)+(i[0]==='broad'?gm:0)),i[2]]):[];
 const e={k,n:b.n,img:b.img,hullMax:Math.round(b.hull*sc),crewMax:Math.round(b.crew*sc),block:0,weak:0,burn:0,str:0,ints,ii:0,loot:b.loot,gm};
 e.hull=e.hullMax;e.crew=e.crewMax;return e}
function startFight(list,kind,opts={}){S.stats.fights++;
 const deck=S.deck.concat(officerCards());
 S.combat={kind,queue:list.slice(1),enemy:mkEnemy(list[0]),phase:opts.phase||'ship',weather:rollWeather(),draw:shuffle(deck),disc:[],hand:[],exh:[],
  energy:3,block:0,str:0,pweak:0,turn:0,advT:0,hullStart:S.ship.hull,crits:0,log:[],firstCannonUsed:false,sailFree:S.ship.type==='sloop',
  swap:true,boss:opts.boss||null,forceBoard:!!opts.forceBoard,duel:opts.duel||0,canFlee:S.cap==='rackham'&&kind==='normal'};
 const c=S.combat;
 if(c.phase==='board'){prepBoard(true)}
 log(`${c.enemy.n} sighted. Weather: ${WEATHER[c.weather].n}.`);S.screen='combat';startTurn()}
function startBoss(){const a=S.act;
 if(a===1)startFight(['sqA','sqB'],'boss',{boss:1,forceBoard:true});
 else if(a===2)startFight(['fort'],'boss',{boss:2,phase:'board'});
 else startFight(['horn'],'boss',{boss:3,forceBoard:true,duel:40})}
const C=()=>S.combat, E=()=>S.combat.enemy;
function log(m){const c=C();c.log.unshift(m);if(c.log.length>40)c.log.pop()}
function playable(k){const c=C(),cd=CARDS[k];if(c.phase==='ship')return cd.tag!=='C';return cd.tag!=='S'}
function cost(k){const c=C(),cd=CARDS[k];let v=cd.c;
 if(cd.pw&&off('hands')&&!c.firstCannonUsed)v=0;
 if(cd.sail){if(c.sailFree)v=0;if(c.weather==='calm')v+=1}return v}
const X={
 C,E,guns:()=>ship().guns+S.ship.upg.guns,
 shot(n,light){const c=C(),e=E();if(c.phase!=='ship'){return X.any(Math.round(n/2))}
  if(S.cap==='vane')n+=2;if(off('hatch')&&!light)n+=2;if(S.ship.type==='snow')n+=2;
  if(c.weather==='squall')n-=2;if(c.weather==='gauge'&&!c.gaugeUsed){n+=3;c.gaugeUsed=true}
  if(c.noPowder)n=Math.floor(n/2);X.dmgE(n,'hull')},
 any(n){const c=C();if(S.cap==='bonnyread')n+=2;if(c.phase==='ship')X.dmgE(n,'hull');else if(c.phase==='board')X.dmgE(n,'crew');else X.dmgE(n,'hp')},
 melee(n,raw){if(!raw&&S.morale<25)n=Math.floor(n*.75);X.dmgE(n,'crew')},
 killCrew(n){const e=E();e.crew=Math.max(0,e.crew-n);log(`Grapeshot cuts down ${n} of their crew.`)},
 dmgE(n,track){const c=C(),e=E();if(c.phase==='duel')track='hp';n+=c.str;if(c.pweak>0)n=Math.floor(n*.75);n=Math.max(0,n);
  const ab=Math.min(e.block,n);e.block-=ab;const d=n-ab;e[track]=Math.max(0,e[track]-d);
  log(`You deal ${d}${ab?` (${ab} evaded)`:''} to their ${track==='hp'?'captain':track}.`)},
 blk(n){const cd=C();if(cd._sail&&S.cap==='rackham')n+=3;cd.block+=n},
 draw(n){const c=C();for(let i=0;i<n;i++){if(!c.draw.length){c.draw=shuffle(c.disc);c.disc=[]}if(!c.draw.length||c.hand.length>=10)return;c.hand.push(c.draw.pop())}},
 adv(n){const c=C();c.advT=clamp(c.advT+n,-2,3)},
 morale(n){moraleChange(n)},
 repair(n,useTimber){if(useTimber&&S.cargo.timber>0)S.cargo.timber--;S.ship.hull=Math.min(hullMax(),S.ship.hull+n)},
};
function startTurn(){const c=C();c.turn++;c.energy=3;c.block=0;c.gaugeUsed=false;
 if(c.phase==='duel'&&S.cap==='bonnyread')c.energy++;
 if(c.phase==='ship'){c.block+=3*S.ship.upg.rig+(S.ship.type==='periagua'?3:0)}
 let n=5;if(c.turn===1){if(c.weather==='fair')n++;if(c.boardTurn1){n+=Math.max(0,c.advT);if(c.advT<0)c.energy+=c.advT;if(S.ship.type==='brigantine')n++;c.boardTurn1=false}}
 c.swap=true;X.draw(n);save();render()}
function play(i){const c=C(),k=c.hand[i],cd=CARDS[k];if(!playable(k))return;const v=cost(k);if(v>c.energy)return;
 c.noPowder=false;if(cd.pw&&c.phase==='ship'){if(S.cargo.powder>=cd.pw)S.cargo.powder-=cd.pw;else{c.noPowder=true;log('No powder! The shot is weak.')}}
 if(cd.pw&&c.phase!=='ship'&&k==='grenades'){if(S.cargo.powder>=1)S.cargo.powder--;else c.noPowder=true}
 if(cd.pw)c.firstCannonUsed=true;if(cd.sail){c.sailFree=false;c._sail=true}
 c.energy-=v;c.hand.splice(i,1);cd.f(X);c._sail=false;(cd.x?c.exh:c.disc).push(k);
 if(!checkState()){save();render()}}
function swapCard(i){const c=C();if(!c.swap)return;const k=c.hand[i];if(playable(k))return;c.swap=false;c.hand.splice(i,1);c.disc.push(k);X.draw(1);save();render()}
function intent(){const c=C(),e=E();
 if(c.phase==='ship'){const p=e.ints[e.ii%e.ints.length];let v=p[1]+e.str;if(p[0]==='broad'&&c.weather==='enemygauge')v+=2;if(['broad','crit'].includes(p[0])&&c.weather==='squall')v-=2;if(e.weak>0&&p[0]!=='evade')v=Math.floor(v*.75);
  return {k:p[0],v:Math.max(0,v),tx:{broad:`💥 Broadside ${v} (hull)`,grape:`🔫 Grapeshot ${v} (kills crew)`,crit:`🎯 Aimed shot ${v} (hull; may injure an officer)`,evade:`🌀 Evade ${p[1]}`,load:`⬆️ Double-load guns (+${p[1]})`}[p[0]]}}
 // boarding / duel intents derived from enemy crew size
 const base=c.phase==='duel'?4+S.act*2:2+Math.ceil(e.crew/8);const cyc=c.phase==='duel'?['slash','slash','guard','lunge']:['melee','melee','rush','officer','brace'];
 const kk=cyc[c.turn%cyc.length];let v=kk==='lunge'?base+5:kk==='brace'||kk==='guard'?base:kk==='rush'?Math.ceil(base*.7):base;
 if(e.weak>0&&!['brace','guard'].includes(kk))v=Math.floor(v*.75);
 return {k:kk,v,tx:{melee:`⚔️ Melee ${v} (kills your crew)`,rush:`🗡️ Rush the captain ${v}`,officer:`🎯 Hunt your officers ${v}`,brace:`🛡️ Brace ${v}`,slash:`🗡️ Slash ${v}`,guard:`🛡️ Guard ${v}`,lunge:`⚡ Lunge ${v}`}[kk]}}
function hitPlayer(v,track){const c=C();const ab=Math.min(c.block,v);c.block-=ab;const d=v-ab;
 if(track==='hull'){S.ship.hull=Math.max(0,S.ship.hull-d);const lost=Math.floor(d/4);S.crew=Math.max(0,S.crew-lost);log(`They hit your hull for ${d}${ab?` (${ab} evaded)`:''}${lost?`, ${lost} crew fall`:''}.`)}
 else if(track==='crew'){if(S.crew>0){S.crew=Math.max(0,S.crew-d);log(`${d} of your crew are cut down${ab?` (${ab} guarded)`:''}.`)}else{S.hp-=d;log(`With no crew left, they hit the captain for ${d}.`)}}
 else {S.hp-=d;log(`They wound the captain for ${d}${ab?` (${ab} blocked)`:''}.`)}
 return d}
function injureOfficer(){const list=Object.values(S.officers).filter(o=>!o.injured);if(!list.length)return;const o=pick(list);o.injured=true;
 const c=C();const card=OFFICERS[o.id].card;['hand','draw','disc'].forEach(p=>{const i=c[p].indexOf(card);if(i>=0)c[p].splice(i,1)});log(`⚠️ ${OFFICERS[o.id].n} is injured!`)}
function endTurn(){const c=C(),e=E();c.disc.push(...c.hand);c.hand=[];
 if(c.phase==='ship'&&e.burn>0){e.hull=Math.max(0,e.hull-e.burn);log(`Fire aboard the enemy: ${e.burn} hull damage.`);e.burn=Math.max(0,e.burn-1)}
 if(c.phase==='board'&&S.crew>0){let d=Math.floor(S.crew/7);if(S.morale<25)d=Math.floor(d/2);if(d>0){e.crew=Math.max(0,e.crew-d);log(`Your boarders fight on: ${d} enemy crew fall.`)}}
 if(checkState())return;
 e.block=0;const it=intent();
 if(c.phase==='ship'){
  if(it.k==='broad')hitPlayer(it.v,'hull');
  else if(it.k==='grape'){const ab=Math.min(c.block,it.v);c.block-=ab;const d=it.v-ab;S.crew=Math.max(0,S.crew-d);log(`Grapeshot sweeps your deck: ${d} crew fall.`)}
  else if(it.k==='crit'){const d=hitPlayer(it.v,'hull');if(d>0){c.crits++;S.hp-=2;log('Splinters wound the captain (2).');if(Math.random()<.5)injureOfficer()}}
  else if(it.k==='evade')e.block+=it.v;else if(it.k==='load')e.str+=ENEMIES[e.k].ints.find(i=>i[0]==='load')[1];
  if(c.weather==='fog')e.block+=3;e.ii++}
 else if(c.phase==='board'){
  if(it.k==='melee')hitPlayer(it.v,'crew');else if(it.k==='rush')hitPlayer(it.v,'hp');
  else if(it.k==='officer'){const d=hitPlayer(it.v,'crew');if(d>0&&Math.random()<.5)injureOfficer()}else e.block+=it.v}
 else{if(it.k==='guard')e.block+=it.v;else hitPlayer(it.v,'hp')}
 if(e.weak>0)e.weak--;if(c.pweak>0)c.pweak--;
 if(!checkState())startTurn()}
function prepBoard(direct){const c=C(),e=E();
 if(!direct){const pct=e.hull/e.hullMax;let f=pct<=.25?.7:pct<=.5?.85:1;e.crew=Math.round(e.crew*f);
  if(pct<=.25&&e.crew>0)log('Their hull is shattered: their crew is shaken (-30%).');
  if(S.ship.hull/hullMax()<.5){c.advT-=1;log('Your battered ship gives you a poor start (Disadvantage).')}
  if(S.ship.hull>=c.hullStart*0.85){c.advT+=1;log('Clean approach: +1 Advantage.')}}
 if(S.cap==='blackbeard')e.crew=Math.round(e.crew*.9);if(S.ship.type==='frigate')e.crew=Math.round(e.crew*.9);
 e.block=0;e.weak=0;c.phase='board';c.boardTurn1=true;c.turn=0}
function board(){const c=C(),e=E();if(c.phase!=='ship'||e.hull>e.hullMax*.5)return;
 if(c.queue.length&&c.boss){return}
 c.disc.push(...c.hand);c.hand=[];prepBoard(false);log(`⚓ Grapples away! Boarding with ${c.advT>0?'+'+c.advT+' Advantage':c.advT<0?c.advT+' Advantage':'no Advantage'}.`);startTurn()}
function flee(){const c=C();if(!c.canFlee||c.turn>1)return;S.combat=null;S.screen='map';S.msg='You ran before the wind. No loot.';save();render()}
function retreat(){const c=C();if(c.boss||c.phase!=='board')return;S.combat=null;moraleChange(-15);S.screen='map';S.msg='You cut the grapples and broke off. -15 morale, no loot.';save();render()}
function checkState(){const c=C(),e=E();
 if(S.hp<=0){endRun('death');return true}
 if(c.phase==='ship'&&S.ship.hull<=0){abandonShip();return true}
 if(c.phase==='ship'&&e.hull<=0){
  if(c.queue.length){const nk=c.queue.shift();log(`${e.n} goes down! ${ENEMIES[nk].n} bears down on you.`);c.enemy=mkEnemy(nk);c.disc.push(...c.hand);c.hand=[];startTurn();return true}
  if(c.boss){c.enemy.hull=1;board();return true}
  M.sunk++;S.stats.sunk++;victory(false);return true}
 if(c.phase==='ship'&&c.forceBoard&&!c.queue.length&&e.hull<=e.hullMax*.5){board();return true}
 if(c.phase==='board'&&e.crew<=0){
  if(c.duel){c.phase='duel';e.hpMax=c.duel;e.hp=c.duel;e.block=0;c.duel=0;c.disc.push(...c.hand);c.hand=[];c.turn=0;e.n='Benjamin Hornigold (duel)';log('Hornigold draws his sword. Captain against captain!');startTurn();return true}
  M.boarded++;S.stats.boarded++;victory(true);return true}
 if(c.phase==='duel'&&e.hp<=0){victory(true);return true}
 return false}
function lootFor(e,boarded){const mult=(boarded?1:.4)*e.loot*(S.cap==='bellamy'?1.3:1)*(off('jennings')?1.1:1);
 return {coin:Math.round((14+rnd(10))*mult*ACTS[S.act].scale),silver:Math.round((4+rnd(4))*mult)}}
function victory(boarded){const c=C(),e=E();const L=lootFor(e,boarded);S.coin+=L.coin;const s=addCargo('silver',L.silver);S.stats.plunder+=s;
 let msg=`${boarded?'⚔️ Boarded and taken':'💥 Sunk'}: ${e.n}. +${L.coin} coin, +${s} silver${s<L.silver?' (hold full)':''}.`;
 if(boarded){const g=pick(['powder','food','water','rum','timber','rope']);const n=addCargo(g,2+rnd(2));if(n)msg+=` +${n} ${CARGO[g].n.toLowerCase()}.`;moraleChange(8);if(Math.random()<.2){S.cargo.maps++;msg+=' Found a chart!'}}
 else moraleChange(3);
 S.combat=null;
 if(c.boss){const tr=ACTS[S.act].trophy;S.trophies.push(tr.id);if(tr.id==='pennant')S.ship.hull+=8;S.screen='extract';S.reward={msg:msg+` 🏆 Trophy: ${tr.n} (${tr.d})`};save();render();return}
 const prize=boarded&&e.k!=='merchant'?prizeType(e.k):null;
 S.reward={msg,cards:rollCards(3),paths:true,picks:c.kind==='elite'?2:1,prize,officer:boarded&&Math.random()<.25?pickOfficer(pick(Object.keys(ROLES))):null};
 S.screen='reward';save();render()}
function prizeType(k){const map={rival:'sloop',privateer:'brigantine',patrol:'snow',guarda:'brigantine',hunter:'snow'};return map[k]||null}
function rollCards(n){return shuffle(POOL).slice(0,n)}
function abandonShip(){S.combat=null;const lostCrew=Math.round(S.crew*.4);
 S.ship={type:'periagua',hull:Math.round(SHIPS.periagua.hull*.6),upg:{hull:0,guns:0,rig:0},spent:0};
 S.crew=Math.min(crewMax(),S.crew-lostCrew);HOLDKEYS.forEach(k=>S.cargo[k]=Math.floor(S.cargo[k]/2));
 while(holdUsed()>holdMax()){const k=HOLDKEYS.find(k=>S.cargo[k]>0);S.cargo[k]--}
 S.coin=Math.floor(S.coin/2);moraleChange(-20);const list=Object.values(S.officers);if(list.length)pick(list).injured=true;
 if(S.row===S.map.length-1){S.bossFails=(S.bossFails||0)+1;
  if(S.bossFails>=2){S.capturedMsg='Your ship lost twice to the boss. You are taken in chains.';endRun('death');return}
  S.row-=2;S.map[S.row+1].forEach(n=>n.done=0);S.map[S.row+2][1].done=0;S.col=1}
 S.screen='abandon';save();render()}
function payoutValue(){return S.cargo.silver*10+S.coin}
function endRun(kind){const v=payoutValue();const pct=kind==='death'?.25:kind==='extract'?.75:1.25;const banked=Math.round(v*pct);
 M.banked+=banked;M.bestAct=Math.max(M.bestAct,S.act);M.plunder+=S.stats.plunder;
 const bc=M.byCaptain[S.cap]=M.byCaptain[S.cap]||{runs:0,wins:0};bc.runs++;
 if(kind==='death')M.deaths++;else{if(kind==='win'){M.wins++;bc.wins++}else M.extracts++;S.trophies.forEach(t=>{if(!M.trophies.includes(t))M.trophies.push(t)});if(!M.unlocked.rackham){M.unlocked.rackham=1;S.unlockMsg='New captain unlocked: "Calico Jack" Rackham!'}}
 S.end={kind,banked,act:S.act,trophies:kind==='death'?[]:S.trophies.slice()};S.combat=null;S.screen='end';saveMeta();save();render()}
function nextAct(){S.act++;S.bossFails=0;S.map=genMap(S.act);S.row=-1;S.col=-1;S.screen='map';if(off('pilot'))S.cargo.maps++;
 S.msg=`${ACTS[S.act].n}. ${S.act===3?'Benjamin Hornigold, pardoned and hunting his old friends, waits at the end.':'New waters, harder prey.'}`;save();render()}

/* ---------- REWARDS / NODES ---------- */
function takeCard(k){S.deck.push(k);rewardDone()}
function takeShipUp(){const keys=Object.keys(UPG).filter(k=>S.ship.upg[k]<2);if(keys.length){const k=pick(keys);S.ship.upg[k]++;S.ship.spent+=UPG_COST[S.ship.upg[k]-1];if(k==='hull')S.ship.hull+=15;S.reward.note=`Ship: ${UPG[k].n} +1.`}else{S.ship.hull=Math.min(hullMax(),S.ship.hull+20)}rewardDone()}
function takeCrewUp(){const n=Math.min(crewMax()-S.crew,8);S.crew+=n;moraleChange(10);rewardDone()}
function takeCaptainUp(){S.maxHp+=4;S.hp=Math.min(S.maxHp,S.hp+10);rewardDone()}
function rewardDone(){const r=S.reward;r.picks=(r.picks||1)-1;r.cardsTaken=true;if(r.picks>0&&r.paths){r.cards=rollCards(3);render();return}
 if(r.prize||r.officer){r.paths=false;r.cards=null;S.screen='prize';save();render();return}
 S.reward=null;S.screen='map';save();render()}
function takePrize(){const t=S.reward.prize;S.ship={type:t,hull:Math.round(SHIPS[t].hull*.45),upg:{hull:0,guns:0,rig:0},spent:0};S.crew=Math.min(S.crew,crewMax());while(holdUsed()>holdMax()){const k=HOLDKEYS.find(k=>S.cargo[k]>0);S.cargo[k]--}S.reward.prize=null;save();render()}
function skipPrize(){S.reward.prize=null;if(!S.reward.officer){S.reward=null;S.screen='map'}save();render()}
function hireOfficer(id,price){const o=OFFICERS[id];if(S.coin<price)return false;const old=S.officers[o.role];S.coin-=price;S.officers[o.role]={id,injured:false};return true}
function recruitCost(id){let p=OFFICERS[id].cost;if(S.cap==='bellamy')p=Math.round(p*.75);return p}
function hireCrew(n,price){const room=crewMax()-S.crew;n=Math.min(n,room);if(n<=0||S.coin<price*n)return;S.coin-=price*n;S.crew+=n;save();render()}
function buy(k,n=1){if(S.coin<PRICE[k]*n)return;const a=addCargo(k,n);S.coin-=PRICE[k]*a;save();render()}
function sellSilver(){const p=Math.round(12*(off('purser')?1.3:1)*(S.trophies.includes('letter')?1.3:1));S.coin+=S.cargo.silver*p;if(S.cargo.silver>0)moraleChange(5);S.cargo.silver=0;save();render()}
function sellMap(){if(S.cargo.maps<=0)return;S.cargo.maps--;S.coin+=25;save();render()}
function buyCard(i){const it=S.shop.cards[i];if(!it||it.sold||S.coin<it.p)return;S.coin-=it.p;it.sold=1;S.deck.push(it.k);save();render()}
function removeCard(i){const cost=50+25*S.removed;if(S.shop.removedHere||S.coin<cost||S.deck.length<=6)return;S.coin-=cost;S.removed++;S.shop.removedHere=1;S.deck.splice(i,1);S.screen='port';save();render()}
function repairCove(){const per=off('pruitt')?18:12;let n=0;while(S.cargo.timber>0&&S.cargo.rope>0&&S.ship.hull<hullMax()){S.cargo.timber--;S.cargo.rope--;S.ship.hull=Math.min(hullMax(),S.ship.hull+per);n++}
 S.msg=n?`Careened and patched: used ${n} timber + ${n} rope.`:'Nothing to repair with (need timber + rope) or hull is full.';}
function coveRest(){Object.values(S.officers).forEach(o=>o.injured=false);S.hp=Math.min(S.maxHp,S.hp+Math.round(S.maxHp*.15));}
function upgradeShip(k){const l=S.ship.upg[k];if(l>=2)return;const cst=UPG_COST[l];if(S.coin<cst)return;S.coin-=cst;S.ship.upg[k]++;S.ship.spent+=cst;if(k==='hull')S.ship.hull+=15;save();render()}
function buyShip(t){const cst=SHIPS[t].price-shipValue();if(S.coin<cst)return;S.coin-=Math.max(0,cst);S.ship={type:t,hull:SHIPS[t].hull,upg:{hull:0,guns:0,rig:0},spent:0};save();render()}
function repairCoin(){const need=hullMax()-S.ship.hull;const n=Math.min(need,Math.floor(S.coin/2));S.coin-=n*2;S.ship.hull+=n;save();render()}
function tavernHeal(){if(S.coin<20)return;S.coin-=20;S.hp=Math.min(S.maxHp,S.hp+Math.round(S.maxHp*.3));Object.values(S.officers).forEach(o=>o.injured=false);save();render()}
function drinkRum(){if(S.cargo.rum<=0)return;S.cargo.rum--;moraleChange(15);save();render()}
function dice(bet){if(S.coin<bet)return;const a=1+rnd(6)+1+rnd(6),b=1+rnd(6)+1+rnd(6);S.coin+=a>b?bet:a<b?-bet:0;S.diceMsg=`You roll ${a}, the house rolls ${b}: ${a>b?'you win '+bet:a<b?'you lose '+bet:'push'}.`;save();render()}
const EVENTS=[
 {t:'A Drifting Wreck',d:'A merchant wreck wallows on the swell. Salvage is risky: she may roll over.',o:[['Send a salvage party (60%: +2 timber, +2 rope, +3 silver; 40%: lose 6 crew)',()=>{if(Math.random()<.6){addCargo('timber',2);addCargo('rope',2);addCargo('silver',3);return'Good salvage!'}S.crew=Math.max(0,S.crew-6);return'She rolled. 6 men lost.'}],['Leave her',()=>'You sail on.']]},
 {t:'The 1715 Fleet Wrecks',d:'Divers still work the wrecks of the Spanish treasure fleet off the Florida coast. Their camp is lightly guarded.',o:[['Raid the camp (captain takes 8 damage; +8 silver)',()=>{S.hp-=8;const s=addCargo('silver',8);return`+${s} silver.`}],['Trade with the divers (-15 coin, +1 chart, +2 food)',()=>{if(S.coin<15)return'Not enough coin.';S.coin-=15;S.cargo.maps++;addCargo('food',2);return'A chart of the reef.'}],['Sail past',()=>'']]},
 {t:'Storm on the Horizon',d:'A black squall line is coming down fast.',o:[['Run through it (lose 10 hull, the next leg uses no supplies)',()=>{S.ship.hull=Math.max(1,S.ship.hull-10);S.leg++;return'Battered but fast.'}],['Heave to and wait (use 2 extra food and water)',()=>{S.cargo.food=Math.max(0,S.cargo.food-2);S.cargo.water=Math.max(0,S.cargo.water-2);return'You ride it out.'}]]},
 {t:'An Officer Without a Ship',d:'A paroled officer asks for a berth in exchange for a share.',o:[['Sign him on (30 coin)',()=>{const roles=Object.keys(ROLES).filter(r=>!S.officers[r]);const r=roles.length?pick(roles):pick(Object.keys(ROLES));const id=pickOfficer(r);if(!id)return'He finds no post that suits him.';if(!hireOfficer(id,30))return'Not enough coin.';return`${OFFICERS[id].n} joins as ${ROLES[r].n}.`}],['Turn him away',()=>'']]},
 {t:'Rum Smugglers',d:'A smuggler sloop offers casks of rum for silver.',o:[['Trade 3 silver for 4 rum',()=>{if(S.cargo.silver<3)return'Not enough silver.';S.cargo.silver-=3;addCargo('rum',4);return'Rum aboard.'}],['Sell them powder (-2 gunpowder, +30 coin)',()=>{if(S.cargo.powder<2)return'Not enough powder.';S.cargo.powder-=2;S.coin+=30;return'+30 coin.'}],['Ignore them',()=>'']]},
 {t:'Mutterings Below Deck',d:'The crew grumbles about shares and short rations.',o:[['Broach a cask (-1 rum, +15 morale)',()=>{if(S.cargo.rum<1)return'No rum!';S.cargo.rum--;moraleChange(15);return'Spirits rise.'}],['Flog the ringleader (+5 morale... or -15)',()=>{const ok=Math.random()<.5;moraleChange(ok?5:-15);return ok?'Order restored.':'It made things worse.'}]]},
 {t:'Fishing Village',d:'A quiet cove with a village willing to trade.',o:[['Buy provisions (-12 coin, +3 food, +3 water)',()=>{if(S.coin<12)return'Not enough coin.';S.coin-=12;addCargo('food',3);addCargo('water',3);return'Provisioned.'}],['Recruit hands (-15 coin, +6 crew)',()=>{if(S.coin<15)return'Not enough coin.';S.coin-=15;S.crew=Math.min(crewMax(),S.crew+6);return'+6 crew.'}]]},
];
function pickEvent(){return rnd(EVENTS.length)}
function chooseEvent(i){const r=EVENTS[S.ev].o[i][1]();S.msg=r||'';S.screen='map';if(S.hp<=0){endRun('death');return}save();render()}
function resolveMutiny(opt){if(opt===0&&S.cargo.rum>=2){S.cargo.rum-=2;S.morale=30;S.msg='You buy peace with rum.'}else if(opt===1&&S.coin>=40){S.coin-=40;S.morale=30;S.msg='Extra shares paid out.'}else{S.crew=Math.max(0,S.crew-Math.ceil(S.crew*.25));S.morale=35;const l=Object.keys(S.officers);if(l.length){const r=pick(l);S.msg=`Mutineers seize a boat; ${OFFICERS[S.officers[r].id].n} goes with them.`;delete S.officers[r]}else S.msg='A quarter of the crew deserts.'}
 const p=S.pending;S.pending=null;S.screen='map';enterNode(S.map[p.r][p.c])}
