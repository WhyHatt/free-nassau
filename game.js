"use strict";
/* Free Nassau v6: rules engine. Static data lives in data.js. */
/* ---------- META ---------- */
const SET_DEF={quick:0,auto:1,fx:1,shake:1,rm:0,text:0,cb:0,vib:1,mus:60,sfx:100,hand:'c',tips:1};
function loadMeta(){let o=null;try{o=JSON.parse(localStorage.getItem(METAKEY))}catch(e){}
 if(!o){try{const old=JSON.parse(localStorage.getItem(OLDMETA));if(old){o={banked:old.banked||0,runs:old.runs||0,wins:old.wins||0,deaths:old.deaths||0,extracts:old.extracts||0,bestAct:old.bestAct||0,sunk:old.sunk||0,boarded:old.boarded||0,plunder:old.plunder||0,unlocked:old.unlocked||{},maxNot:old.maxNot||0,buildings:Object.assign({shipyard:0,powder:0,tavern:0},old.buildings||{}),trophies:old.trophies||[],byCaptain:old.byCaptain||{},tut:1,renown:Math.round((old.runs||0)*10+(old.wins||0)*25)}}}catch(e){}}
 M=Object.assign({banked:0,runs:0,wins:0,deaths:0,extracts:0,bestAct:0,sunk:0,boarded:0,plunder:0,unlocked:{},maxNot:0,selNot:0,buildings:{},trophies:[],byCaptain:{},renown:0,tut:0,tips:{},log:[],doc:'std'},o||{});
 M.buildings=Object.assign({shipyard:0,powder:0,tavern:0,market:0,infirm:0},M.buildings);
 M.set=Object.assign({},SET_DEF,M.set||{})}
function saveMeta(){try{localStorage.setItem(METAKEY,JSON.stringify(M))}catch(e){}}
function rankOf(r){let k=0;RANKS.forEach((x,i)=>{if(r>=x.at)k=i});return k}
const rank=()=>M?rankOf(M.renown||0):0;
function save(){try{if(S)localStorage.setItem(RUNKEY,JSON.stringify(S));else localStorage.removeItem(RUNKEY)}catch(e){}}
function loadRun(){try{const r=JSON.parse(localStorage.getItem(RUNKEY));return r&&r.v===6?r:null}catch(e){return null}}

/* ---------- RUN ---------- */
function applyDoctrine(deck,doc){deck=deck.slice();const d=DOCTRINES[doc];if(!d||!d.add)return deck;let n=0;
 for(const k of d.drop){if(n>=2)break;const i=deck.indexOf(k);if(i>=0){deck.splice(i,1);n++}}
 d.add.forEach(k=>deck.push(k));return deck}
function newRun(cap,nl,doc){const C0=CAPTAINS[cap];const b=M.buildings;
 const NL=nl!=null?nl:Math.min(M.selNot||0,M.maxNot||0);
 doc=doc||M.doc||'std';if(!DOCTRINES[doc]||DOCTRINES[doc].rank>rank())doc='std';
 const rk=rank();
 S={v:6,cap,doc,bias:DOCTRINES[doc].a||null,not:NL,hp:C0.hp,maxHp:C0.hp,coin:60+(rk>=7?25:0)+(rk>=8?25:0),
  ship:{type:'sloop',hull:45,upg:{hull:0,guns:0,rig:0},spent:0},
  crew:C0.crew,cargo:{powder:5,rations:6,kits:1},
  officers:{},deck:applyDoctrine(C0.deck,doc),act:1,row:-1,col:-1,leg:0,screen:'map',combat:null,msg:'',trophies:[],removed:0,ren:0,
  stats:{fights:0,sunk:0,boarded:0,plunder:0,taps:0},log:[],tut:M.tut?0:1};
 if(cap==='bellamy')S.officers.qm={id:'jennings',injured:false};
 if(b.shipyard>=1)S.ship.upg.hull=1; if(b.shipyard>=2)S.ship.upg.guns=1;
 S.cargo.powder+=b.powder*3; if(cap==='vane')S.cargo.powder+=3;
 S.crew+=b.tavern*6;S.cargo.rations+=b.tavern*2;
 S.ship.hull=hullMax();S.crew=Math.min(S.crew,crewMax());
 S.map=genMap(1);M.runs++;saveMeta();save();render()}
const ship=()=>SHIPS[S.ship.type];
const hullMax=()=>ship().hull+15*S.ship.upg.hull+(off('shea')?10:0)+(S.trophies.includes('pennant')?8:0);
const crewMax=()=>ship().crew;
const off=id=>Object.values(S.officers).some(o=>o.id===id&&!o.injured);
const hasOff=id=>Object.values(S.officers).some(o=>o.id===id);
const sailMod=()=>S?SHIPS[S.ship.type].sail+(S.cap==='rackham'?3:0):0;
const GN=()=>{try{return ship().guns+S.ship.upg.guns}catch(e){return 3}};
function addCargo(k,n){const a=Math.max(0,Math.min(n,CAP[k]-S.cargo[k]));S.cargo[k]+=a;return a}
function px(p){let m=1-(off('purser')?.15:0)-(S.trophies.includes('letter')?.15:0)+(S.not>=3?.2:0);return Math.max(1,Math.round(p*m))}
function shipValue(){const base=ship().price*0.5*(S.ship.hull/hullMax());return Math.round(base+S.ship.spent*0.5)}
function officerCards(){return Object.values(S.officers).filter(o=>!o.injured).map(o=>OFFICERS[o.id].card)}
function ren(n){if(S)S.ren=(S.ren||0)+n}

/* ---------- MAP ---------- */
function wpick(w){let t=0;for(const k in w)t+=w[k];let x=Math.random()*t;for(const k in w){x-=w[k];if(x<0)return k}return 'fight'}
function genMap(act){const R=ACTS[act].rows,rows=[];const mid=Math.floor(R/2);const uniq=['elite','recruit','port','shipwright','smuggler','wreck','storm'];
 for(let r=0;r<R;r++){const row=[];for(let c=0;c<COLS;c++){let t;
  if(r===0)t=c===0||c===COLS-1?'fight':pick(['fight','fight','event','storm']);else if(r===mid)t='treasure';else if(r===R-1)t='cove';
  else{const w={fight:38,event:18,recruit:9,port:8,elite:r>=3?(S&&S.not>=1?14:10):0,shipwright:4,smuggler:6,wreck:5,storm:5};t=wpick(w);
   const p=rows[r-1][c].t;if(uniq.includes(t)&&t===p)t='fight'}
  row.push({t,done:0})}
  if(r>0&&r<R-1&&r!==mid){
   if((r===1||r===mid+1)&&!row.some(n=>n.t==='recruit'))row[rnd(COLS)].t='recruit';
   if(r===2&&!row.some(n=>n.t==='port'))row[rnd(COLS)].t='port'}
  row.forEach(n=>{if(n.t==='recruit'){const roles=Object.keys(ROLES).filter(k=>(ROLES[k].rank||0)<=rank());n.role=pick(roles)}});
  rows.push(row)}
 /* exactly one guaranteed elite per act in the middle rows, not directly adjacent to the cove */
 const er=[];for(let r=3;r<R-2;r++)er.push(r);if(!er.length)er.push(R-2);
 if(!rows.some(row=>row.some(n=>n.t==='elite'))){const r=pick(er);rows[r][rnd(COLS)].t='elite'}
 rows.push([{t:'empty'},{t:'boss',done:0},{t:'empty'},{t:'empty'}]);return rows}
function avail(r,c){const m=S.map;if(r!==S.row+1||r>=m.length)return false;const n=m[r][c];if(n.t==='empty')return false;
 if(r===m.length-1)return n.t==='boss';if(S.row<0)return true;return Math.abs(c-S.col)<=1}
function go(r,c){if(!avail(r,c))return;const n=S.map[r][c];S.row=r;S.col=c;n.done=1;S.msg='';
 upkeep();enterNode(n)}
function upkeep(){S.leg++;if(off('penhallow')&&S.leg%2===0)return;
 const need=1+((S.ship.type==='snow'||S.ship.type==='frigate')&&S.leg%2===0?1:0);
 for(let i=0;i<need;i++){if(S.cargo.rations>0)S.cargo.rations--;else{S.crew=Math.max(0,S.crew-4);S.msg='Out of rations: crew starve. '}}}
function enterNode(n){const t=n.t;if(t==='cove')S.coveUsed=0;
 if(t==='fight')startFight([pick(ACTS[S.act].pool)],'normal');
 else if(t==='storm')startFight([pick(ACTS[S.act].pool)],'normal',{weather:'squall',lootMul:1.5,storm:1});
 else if(t==='elite')startFight([pick(ACTS[S.act].elites)],'elite');
 else if(t==='boss')startBoss();
 else if(t==='treasure'){const co=45+rnd(30),p=addCargo('powder',2);S.coin+=co;S.msg=`🧰 A buried cache: +${co} silver${p?`, +${p} gunpowder`:''}.`;S.screen='map'}
 else if(t==='event'){S.ev=pickEvent(false);S.screen='event'}
 else if(t==='wreck'){S.ev=pickEvent(true);S.screen='event'}
 else if(t==='recruit'){S.recruit={role:n.role,offer:pickOfficer(n.role)};S.screen='recruit'}
 else if(t==='smuggler'){S.smug=genSmug();S.screen='smuggler'}
 else S.screen=t;
 save();render()}
function pickOfficer(role){const c=Object.keys(OFFICERS).filter(k=>OFFICERS[k].role===role&&!hasOff(k));return c.length?pick(c):null}
function anyRole(){const roles=Object.keys(ROLES).filter(r=>(ROLES[r].rank||0)<=rank()&&(!S.officers[r]||true));return pick(roles)}

/* ---------- COMBAT ---------- */
function rollWeather(){if(S.nextGauge){S.nextGauge=0;return 'gauge'}let w=pick(['fair','fair','gauge','enemygauge','squall']);if(off('pilot')&&Math.random()<.4)w='gauge';return w}
function mkEnemy(k){const b=ENEMIES[k],sc=ACTS[S.act].scale*(TUNE.sc[S.act]||1)*(1+0.03*Math.max(0,S.row));const bossK=BOSSK.includes(k);
 const hm=(S.not>=4?1.15:1)*(bossK&&S.not>=5?1.2:1),cm=(S.not>=2?1.15:1)*(bossK&&S.not>=5?1.2:1);
 const gm=pick([-1,0,0,1]);
 const L=b.L?pick(b.L):[];
 const ints=L.map(i=>[i[0],i[0]==='come'?0:Math.max(1,Math.round(i[1]*sc*(bossK?TUNE.bd[S.act]:TUNE.dmg[S.act]))+(i[0]==='broad'?gm:0))]);
 const e={k,n:b.n,img:b.img,hullMax:Math.round(b.hull*sc*hm*(bossK?TUNE.bs[S.act]:TUNE.hull)),crewMax:Math.round(b.crew*sc*cm*(bossK?TUNE.bs[S.act]:TUNE.crew)),block:0,weak:0,burn:0,ints,ii:ints.length?rnd(ints.length):0,loot:b.loot,gm,tr:(b.tr||[]).slice(),run:b.run||0,gr:b.gr||0,rammed:0,elite:!!b.elite};
 e.hull=e.hullMax;e.crew=e.crewMax;return e}
function startFight(list,kind,opts={}){S.stats.fights++;
 const deck=S.deck.concat(officerCards());
 S.combat={kind,queue:list.slice(1),enemy:mkEnemy(list[0]),phase:opts.phase||'ship',weather:opts.weather||rollWeather(),draw:shuffle(deck),disc:[],hand:[],exh:[],
  energy:3,block:0,str:0,pweak:0,turn:0,advT:0,hullStart:S.ship.hull,crits:0,log:[],firstCannonUsed:false,sailFree:S.ship.type==='sloop',
  boss:opts.boss||null,forceBoard:!!opts.forceBoard,duel:opts.duel||0,canFlee:S.cap==='rackham'&&kind==='normal',
  ord:{},ordUsed:false,played:0,rg:0,rgb:0,fireBuff:0,nBuff:0,fog:0,skip:0,nextDraw:0,edge:false,deck:'open',lootMul:opts.lootMul||1,storm:!!opts.storm,undo:null,drew:false,tut:!!opts.tut,gaugeUsed:false};
 const c=S.combat;if(c.tut){c.weather='fair'}
 if(c.phase==='board'){prepBoard(true)}
 log(`${c.enemy.n} sighted. ${c.storm?'A storm front: ':'Weather: '}${WEATHER[c.weather].n}.`);S.screen='combat';fx('intro',{boss:c.boss,n:c.enemy.n,img:c.enemy.img,kind});startTurn()}
function startBoss(){const a=S.act;
 if(a===1)startFight(['sqA','sqB'],'boss',{boss:1,forceBoard:true});
 else if(a===2)startFight(['fort'],'boss',{boss:2,phase:'board'});
 else startFight(['horn'],'boss',{boss:3,forceBoard:true,duel:Math.round(34*TUNE.bs[3])})}
const C=()=>S.combat, E=()=>S.combat.enemy;
function log(m){const c=C();c.log.unshift(m);if(c.log.length>40)c.log.pop()}
function playable(k){return !CARDS[k].dead}
function cost(k){const c=C(),cd=CARDS[k];let v=cd.c;
 if(cd.pw&&off('hands')&&!c.firstCannonUsed)v=0;
 if(cd.sail){if(c.sailFree)v=0}return v}
/* damage calculation for guns: returns the final number and the parts that made it (used by tooltips too) */
function shotCalc(n,o,commit){o=o||{};const c=C(),parts=[['Base',n]];let t=n;
 if(c.phase!=='ship'){if(c.deck==='gun')parts.push(['Gun deck: full strength',0]);else{t=Math.round(t/2);parts.push(['Rigging fire: half',t-n])}}
 else{
  const add=(l,v)=>{if(v){t+=v;parts.push([l,v])}};
  if(S.cap==='vane')add('Vane',2);if(off('hatch')&&!o.light)add('Abel Hatch',2);if(S.ship.type==='snow')add('Snow',2);
  if(c.rg>0)add('Run Out',c.rgb);if(c.fireBuff)add('Fire at will',c.fireBuff);
  if(c.weather==='squall')add('Squall',-2);if(c.weather==='gauge'&&!c.gaugeUsed){add('Weather Gauge',3);if(commit)c.gaugeUsed=true}
  if(c.noPowder){const h=Math.floor(t/2);parts.push(['No powder: half',h-t]);t=h}}
 return {n:Math.max(0,t),parts}}
const X={
 C,E,guns:GN,log,
 shot(n,o){o=o||{};const c=C();c.shotCard=true;const r=shotCalc(n,o,true);if(window.__prev)window.__prev.push(r.parts);fx('volley',{n:r.n,ph:c.phase});
  if(c.phase!=='ship')return X.any(r.n,{noBonus:1});X.dmgE(r.n,'hull',o)},
 any(n,o){const c=C();if(S.cap==='bonnyread'&&!(o&&o.noBonus))n+=2;if(c.deck==='cabin'&&c.phase==='board'&&!(o&&o.noBonus))n+=0;
  fx('slash',{});if(c.phase==='ship')X.dmgE(n,'hull');else if(c.phase==='board')X.dmgE(n,'crew');else X.dmgE(n,'hp')},
 melee(n,o){const c=C(),e=E();if(!(o&&o.raw)&&off('mackey'))n+=2;
  if(c.phase==='ship'){if(!c.edge){c.edge=true;X.adv(1);log('Your boarders make ready: +1 Advantage.')}X.killCrew(Math.floor(n/2),true);return}
  fx('clash',{n});X.dmgE(n,'crew',o)},
 killCrew(n,quiet){const e=E();n=Math.max(0,n+(quiet?0:0));e.crew=Math.max(0,e.crew-n);if(n)log(`${quiet?'Musket fire':'Grapeshot'} cuts down ${n} of their crew.`)},
 dmgE(n,track,o){o=o||{};const c=C(),e=E();if(c.phase==='duel')track='hp';n+=c.str+(c.nBuff||0);
  if(c.pweak>0)n=Math.floor(n*.75);n=Math.max(0,n);
  if(track==='hull'&&e.tr.includes('plated')&&!o.pierce&&n>0)n=Math.max(1,n-2);
  const ab=o.pierce?0:Math.min(e.block,n);e.block-=ab;const d=n-ab;e[track]=Math.max(0,e[track]-d);
  fx('hit',{d,ab,track,big:d>=14});
  log(`You deal ${d}${ab?` (${ab} blocked)`:''} to their ${track==='hp'?'captain':track}.`)},
 blk(n){const c=C();if(c._sail)n+=sailMod();c.block+=Math.max(0,n);fx('block',{n})},
 draw(n){const c=C();c.drew=true;for(let i=0;i<n;i++){if(!c.draw.length){c.draw=shuffle(c.disc);c.disc=[]}if(!c.draw.length||c.hand.length>=10)return;c.hand.push(c.draw.pop())}},
 adv(n){const c=C();c.advT=clamp(c.advT+n,-2,3)},
 heal(n){const a=Math.min(n,crewMax()-S.crew);S.crew+=a;log(a?`${a} crew restored.`:'Your crew is at full strength.')},
 healCap(n){const a=Math.min(n,S.maxHp-S.hp);S.hp+=a;log(a?`The captain recovers ${a}.`:'The captain is unhurt.')},
 repair(n,useKit){if(useKit&&S.cargo.kits>0)S.cargo.kits--;S.ship.hull=Math.min(hullMax(),S.ship.hull+n)},
 weak(n){E().weak+=n},burn(n){E().burn+=n},silver(n){S.coin+=n;S.stats.plunder+=n},powder(n){addCargo('powder',n)},
 gauge(){const c=C();if(c.phase==='ship'&&c.weather!=='gauge'){c.weather='gauge';c.gaugeUsed=false;log('You take the Weather Gauge.');fx('wind',{w:'gauge'})}},
 shiftWind(){const c=C();if(c.phase!=='ship')return;const m={enemygauge:'fair',squall:'fair',fair:'gauge'};if(m[c.weather]){c.weather=m[c.weather];c.gaugeUsed=false;log(`The wind shifts: ${WEATHER[c.weather].n}.`);fx('wind',{w:c.weather})}},
};
function startTurn(){const c=C();c.turn++;c.energy=3;c.block=0;c.gaugeUsed=false;c.played=0;c.edge=false;c.ordUsed=false;c.fireBuff=0;c.nBuff=0;c.drew=false;c.undo=null;
 if(c.turn>1)Object.keys(c.ord).forEach(k=>{if(c.ord[k]>0)c.ord[k]--});
 if(c.phase==='duel'&&S.cap==='bonnyread')c.energy++;
 if(c.phase==='ship'){c.block+=3*S.ship.upg.rig+(S.ship.type==='periagua'?3:0)}
 let n=5+c.nextDraw;c.nextDraw=0;
 if(c.turn===1){if(c.weather==='fair')n++;if(S.trophies.includes('spyglass'))n++;if(c.boardTurn1){n+=Math.max(0,c.advT);if(c.advT<0)c.energy+=c.advT;if(S.ship.type==='brigantine')n++;c.boardTurn1=false}}
 X.draw(n);c.drew=false;save();render()}
function play(i){const c=C(),k=c.hand[i];if(!k)return;const cd=CARDS[k];if(!playable(k))return;const v=cost(k);if(v>c.energy)return;
 c.undo=null;const snap=JSON.stringify(S);c.drew=false;c.shotCard=false;
 if(S.stats)S.stats.taps=(S.stats.taps||0)+1;
 c.noPowder=false;const pays=cd.pw&&(c.phase==='ship'||(c.phase==='board'&&(k==='grenades'||c.deck==='gun')));
 if(pays){if(S.cargo.powder>=cd.pw)S.cargo.powder-=cd.pw;else{c.noPowder=true;log('No powder! The shot is weak.')}}
 if(cd.pw&&c.phase==='ship')c.firstCannonUsed=true;if(cd.sail){c.sailFree=false;c._sail=true}
 c.energy-=v;c.hand.splice(i,1);c.played++;fx('card',{k});cd.f(X,P(k));c._sail=false;(cd.x?c.exh:c.disc).push(k);
 if(c.shotCard&&c.rg>0)c.rg--;
 c.undo=c.drew?null:snap;
 if(!checkState()){save();render()}}
/* free captain's orders: one per turn, each on a cooldown */
function orderList(){const c=C(),l=[];['fire','charge','hard'].forEach(k=>{if(ORDERS[k].ph.includes(c.phase))l.push(k)});const so=CAPTAINS[S.cap].order;if(so&&ORDERS[so].ph.includes(c.phase))l.push(so);return l}
function orderReady(id){const c=C();return !c.ordUsed&&!(c.ord[id]>0)&&ORDERS[id].ph.includes(c.phase)}
function useOrder(id){const c=C(),o=ORDERS[id];if(!orderReady(id))return;c.undo=null;c.ordUsed=true;c.ord[id]=o.cd;fx('order',{id});c._sail=false;
 if(id==='fire'){c.fireBuff=3;log('Fire at will! Cannon cards +3 this turn.')}
 else if(id==='charge'){c.energy++;if(c.phase==='duel')X.blk(4);else X.heal(3);log('Charge!')}
 else if(id==='hard'){X.blk(8);X.shiftWind()}
 else if(id==='litfuse'){X.weak(2);const e=E();const k=Math.round(e.crew*.12);e.crew=Math.max(0,e.crew-k);X.blk(4);log(`Lit fuses: ${k} of their crew flee the smoke.`)}
 else if(id==='fairshare'){X.heal(6);X.draw(2)}
 else if(id==='noquarter'){c.nBuff=3;X.burn(4)}
 else if(id==='twinblades'){X.any(5);X.any(5);X.blk(4)}
 else if(id==='getaway'){X.blk(10);X.draw(1);if(c.phase==='ship')X.gauge()}
 if(!checkState()){save();render()}}
function undoPlay(){const c=S&&S.combat;if(!c||!c.undo)return false;const snap=c.undo;S=JSON.parse(snap);FXQ.length=0;save();render();return true}
function canAct(){const c=C();return c.hand.some(k=>playable(k)&&cost(k)<=c.energy)}
function autoEndReady(){const c=C();return !canAct()&&(c.ordUsed||!orderList().some(orderReady))}
/* ---------- enemy intent: the next three moves ---------- */
const BCYC={open:['melee','melee','rush','officer','brace'],gun:['melee','brace','melee','melee','officer'],cabin:['rush','melee','rush','brace','officer']};
function intent(n){n=n||0;const c=C(),e=E();
 if(n===0&&c.skip>0)return {k:'skip',v:0,tx:'Holds fire (False Colours)',verb:'Loses its move'};
 const weak=e.weak>n;const fog=n===0&&c.fog;
 if(c.phase==='ship'){
  if(n===0&&e.tr.includes('fire')&&!e.rammed&&e.hull<=e.hullMax*.3){let v=Math.round(14*ACTS[S.act].scale);if(fog)v=Math.ceil(v/2);return {k:'ram',v,tx:`🔥 RAMS for ${v} (hull) and sinks`,verb:'Rams'}}
  if(!e.ints.length)return {k:'brace',v:0,tx:'…',verb:'Waits'};
  const p=e.ints[(e.ii+n)%e.ints.length];let v=p[1];
  if(p[0]==='come'){const t=c.weather==='enemygauge'?'holds the Weather Gauge':'takes the Weather Gauge';return {k:'come',v:0,tx:`🧭 Comes about: ${t}`,verb:'Comes about'}}
  if(p[0]==='broad'&&c.weather==='enemygauge')v+=2;if(['broad','crit'].includes(p[0])&&c.weather==='squall')v-=2;
  if(weak&&p[0]!=='brace')v=Math.floor(v*.75);if(fog&&p[0]!=='brace')v=Math.ceil(v/2);v=Math.max(0,v);
  return {k:p[0],v,tx:{broad:`💥 Broadside ${v} (hull)`,grape:`🔫 Grapeshot ${v} (kills crew)`,crit:`🎯 Aimed shot ${v} (hull; may injure an officer)`,brace:`🛡️ Brace ${p[1]}`}[p[0]],verb:{broad:'Broadside',grape:'Grapeshot',crit:'Aimed shot',brace:'Braces'}[p[0]]}}
 const base=Math.round((c.phase==='duel'?4+S.act*2:2+Math.ceil(e.crew/8))*(c.boss?TUNE.bd[S.act]:c.phase==='duel'?1:TUNE.dmg[S.act]));
 const cyc=c.phase==='duel'?['slash','slash','guard','lunge']:(BCYC[c.deck]||BCYC.open);
 const kk=cyc[(c.turn+n)%cyc.length];let v=kk==='lunge'?base+5:kk==='brace'||kk==='guard'?base:kk==='rush'?Math.ceil(base*.7):base;
 if(c.deck==='gun'&&kk==='melee')v=Math.round(v*1.2);
 if(weak&&!['brace','guard'].includes(kk))v=Math.floor(v*.75);if(fog&&!['brace','guard'].includes(kk))v=Math.ceil(v/2);
 return {k:kk,v,tx:{melee:`⚔️ Melee ${v} (kills your crew)`,rush:`🗡️ Rush the captain ${v}`,officer:`🎯 Hunt your officers ${v}`,brace:`🛡️ Brace ${v}`,slash:`🗡️ Slash ${v}`,guard:`🛡️ Guard ${v}`,lunge:`⚡ Lunge ${v}`}[kk],verb:{melee:'Melee',rush:'Rushes you',officer:'Hunts officers',brace:'Braces',slash:'Slash',guard:'Guards',lunge:'Lunge'}[kk]}}
function hitPlayer(v,track){const c=C();const ab=Math.min(c.block,v);c.block-=ab;const d=v-ab;fx('hurt',{d,ab,track});
 if(track==='hull'){S.ship.hull=Math.max(0,S.ship.hull-d);const lost=Math.floor(d/4);S.crew=Math.max(0,S.crew-lost);log(`They hit your hull for ${d}${ab?` (${ab} blocked)`:''}${lost?`, ${lost} crew fall`:''}.`)}
 else if(track==='crew'){if(S.crew>0){S.crew=Math.max(0,S.crew-d);log(`${d} of your crew are cut down${ab?` (${ab} guarded)`:''}.`)}else{S.hp-=d;log(`With no crew left, they hit the captain for ${d}.`)}}
 else {S.hp-=d;log(`They wound the captain for ${d}${ab?` (${ab} blocked)`:''}.`)}
 return d}
function injureOfficer(){const list=Object.values(S.officers).filter(o=>!o.injured);if(!list.length)return;const o=pick(list);o.injured=true;
 const c=C();const card=OFFICERS[o.id].card;['hand','draw','disc'].forEach(p=>{const i=c[p].indexOf(card);if(i>=0)c[p].splice(i,1)});log(`⚠️ ${OFFICERS[o.id].n} is injured!`)}
function endTurn(){const c=C(),e=E();c.undo=null;c.disc.push(...c.hand);c.hand=[];
 if(e.burn>0){if(c.phase==='ship'){e.hull=Math.max(0,e.hull-e.burn);log(`Fire aboard the enemy: ${e.burn} hull damage.`)}else if(c.phase==='board'){e.crew=Math.max(0,e.crew-e.burn);log(`Fire spreads below decks: ${e.burn} of their crew fall.`)}e.burn=Math.max(0,e.burn-1)}
 if(c.phase==='board'&&S.crew>0){let d=Math.floor(S.crew/7);if(d>0){e.crew=Math.max(0,e.crew-d);log(`Your boarders fight on: ${d} enemy crew fall.`);fx('clash',{n:d})}}
 if(checkState())return;
 e.block=0;const it=intent();
 if(c.skip>0){c.skip=0;log(`${e.n} is fooled and loses its move.`)}
 else{let fogged=false;const f=v=>{if(c.fog&&v>0){fogged=true;return Math.ceil(v/2)}return v};
  if(c.phase==='ship'){const p=e.ints.length?e.ints[e.ii%e.ints.length]:['brace',0];
   if(it.k==='ram'){e.rammed=1;hitPlayer(it.v,'hull');e.hull=0;log(`${e.n} rams you and goes down in flames!`);fx('sink',{boom:1})}
   else if(it.k==='broad'){fx('enemyfire',{k:'broad'});hitPlayer(f(it.v),'hull')}
   else if(it.k==='grape'){fx('enemyfire',{k:'grape'});const v=f(it.v);const ab=Math.min(c.block,v);c.block-=ab;const d=v-ab;S.crew=Math.max(0,S.crew-d);log(`Grapeshot sweeps your deck: ${d} crew fall.`);fx('hurt',{d,ab,track:'crew'})}
   else if(it.k==='crit'){fx('enemyfire',{k:'crit'});const d=hitPlayer(f(it.v),'hull');if(d>0){c.crits++;S.hp-=2;log('Splinters wound the captain (2).');if(Math.random()<.5)injureOfficer()}}
   else if(it.k==='brace')e.block+=it.v;
   else if(it.k==='come'){if(c.weather==='enemygauge'){}else if(c.weather==='squall')c.weather='fair';else c.weather='enemygauge';c.gaugeUsed=false;log(`${e.n} comes about: ${WEATHER[c.weather].n}.`);fx('wind',{w:c.weather})}
   if(it.k!=='ram')e.ii++}
  else if(c.phase==='board'){fx('enemyfire',{k:'melee'});
   if(it.k==='melee')hitPlayer(f(it.v),'crew');else if(it.k==='rush')hitPlayer(f(it.v),'hp');
   else if(it.k==='officer'){const d=hitPlayer(f(it.v),'crew');if(d>0&&Math.random()<.5)injureOfficer()}else e.block+=it.v}
  else{if(it.k==='guard')e.block+=it.v;else{fx('enemyfire',{k:'melee'});hitPlayer(f(it.v),'hp')}}
  if(fogged)c.fog=0}
 if(e.weak>0)e.weak--;if(c.pweak>0)c.pweak--;
 if(checkState())return;
 /* traits that act at the end of the round */
 if(c.phase==='ship'&&!c.boss){
  if(e.tr.includes('runs')&&e.run&&c.turn>=e.run){S.combat=null;S.screen='map';S.msg=`${e.n} outran you and slipped away. No loot.`;fx('escape',{});save();render();return}
  if(e.tr.includes('grapple')&&e.gr&&c.turn>=e.gr){log(`${e.n} throws grapples across and hauls you in!`);fx('grapple',{});c.disc.push(...c.hand);c.hand=[];prepBoard(false);c.advT=clamp(c.advT-1,-2,3);startTurn();return}}
 startTurn()}
function prepBoard(direct){const c=C(),e=E();
 if(!direct){const pct=e.hull/e.hullMax;let f=pct<=.25?.7:pct<=.5?.85:1;e.crew=Math.round(e.crew*f);
  if(pct<=.25&&e.crew>0)log('Their hull is shattered: their crew is shaken (-30%).');
  if(S.ship.hull/hullMax()<.5){c.advT-=1;log('Your battered ship gives you a poor start (Disadvantage).')}
  if(S.ship.hull>=c.hullStart*0.85){c.advT+=1;log('Clean approach: +1 Advantage.')}}
 if(off('reardon'))c.advT=clamp(c.advT+1,-2,3);
 if(S.cap==='blackbeard')e.crew=Math.round(e.crew*.9);if(S.ship.type==='frigate')e.crew=Math.round(e.crew*.9);
 c.deck=c.boss===2?'gun':c.boss===3?'cabin':pick(['open','open','gun','cabin']);
 e.block=0;e.weak=0;c.phase='board';c.boardTurn1=true;c.turn=0;fx('boarding',{deck:c.deck})}
const DECKN={open:['Open deck','A plain scrap at the rail.'],gun:['Gun deck','Cannon fire at full strength, but their melee hits 20% harder.'],cabin:['Captain\u2019s cabin','They rush your captain more often.']};
function board(){const c=C(),e=E();if(c.phase!=='ship'||e.hull>e.hullMax*.5)return;
 if(c.queue.length&&c.boss){return}
 c.undo=null;c.disc.push(...c.hand);c.hand=[];prepBoard(false);log(`⚓ Grapples away! Boarding with ${c.advT>0?'+'+c.advT+' Advantage':c.advT<0?c.advT+' Advantage':'no Advantage'}. ${DECKN[c.deck][0]}.`);startTurn()}
function flee(){const c=C();if(!c.canFlee||c.turn>1)return;S.combat=null;S.screen='map';S.msg='You ran before the wind. No loot.';save();render()}
function retreat(){const c=C();if(c.boss||c.phase!=='board')return;S.combat=null;S.crew=Math.max(0,S.crew-Math.ceil(S.crew*.2));S.screen='map';S.msg='You cut the grapples and broke off. -20% crew, no loot.';save();render()}
function checkState(){const c=C(),e=E();
 if(S.hp<=0){endRun('death');return true}
 if(c.phase==='ship'&&S.ship.hull<=0){abandonShip();return true}
 if(c.phase==='ship'&&e.hull<=0){fx('sink',{});
  if(c.queue.length){const nk=c.queue.shift();log(`${e.n} goes down! ${ENEMIES[nk].n} bears down on you.`);c.enemy=mkEnemy(nk);c.disc.push(...c.hand);c.hand=[];startTurn();return true}
  if(c.boss){c.enemy.hull=1;board();return true}
  M.sunk++;S.stats.sunk++;victory(false);return true}
 if(c.phase==='ship'&&c.forceBoard&&!c.queue.length&&e.hull<=e.hullMax*.5){board();return true}
 if(c.phase==='board'&&e.crew<=0){
  if(c.duel){c.phase='duel';e.hpMax=c.duel;e.hp=c.duel;e.block=0;c.duel=0;c.disc.push(...c.hand);c.hand=[];c.turn=0;e.n='Benjamin Hornigold (duel)';
   const hl=Math.min(S.maxHp-S.hp,Math.round(S.maxHp*.15));S.hp+=hl;c.deck='cabin';
   log(`Hornigold lowers his blade and offers parley. You refuse. ${hl?`Your surgeon patches you (+${hl} HP). `:''}Captain against captain!`);fx('duel',{});startTurn();return true}
  M.boarded++;S.stats.boarded++;victory(true);return true}
 if(c.phase==='duel'&&e.hp<=0){victory(true);return true}
 return false}
function lootFor(e,boarded,lm){const mult=(boarded?1:.4)*e.loot*(S.cap==='bellamy'?1.3:1)*(off('jennings')?1.15:1)*(lm||1);
 return {coin:Math.round((18+rnd(8))*mult*ACTS[S.act].scale)}}
function afterFight(){let msg='';const b=M.buildings;
 if(off('colley')){const n=Math.min(3,crewMax()-S.crew);if(n>0){S.crew+=n;msg+=` Surgeon: +${n} crew.`}}
 let h=(off('physician')?3:0)+b.infirm*2;if(h>0){const n=Math.min(h,S.maxHp-S.hp);if(n>0){S.hp+=n;msg+=` Captain +${n} HP.`}}
 return msg}
function victory(boarded){const c=C(),e=E();const L=lootFor(e,boarded,c.lootMul);S.coin+=L.coin;S.stats.plunder+=L.coin;
 ren(c.boss?12:c.kind==='elite'?6:boarded?3:2);
 let msg=`${boarded?'⚔️ Boarded and taken':'💥 Sunk'}: ${e.n}. +${L.coin} silver.`;
 if(boarded){const g=pick(['powder','rations','kits']);const n=addCargo(g,2+rnd(2));if(n)msg+=` +${n} ${CARGO[g].n.toLowerCase()}.`}
 msg+=afterFight();
 const kind=c.kind;S.combat=null;fx('victory',{boarded});
 if(c.boss){const tr=ACTS[S.act].trophy;S.trophies.push(tr.id);if(tr.id==='pennant')S.ship.hull+=8;S.screen='extract';S.reward={msg:msg+` 🏆 Trophy: ${tr.n} (${tr.d})`};save();render();return}
 const prize=boarded&&e.k!=='merchant'?prizeType(e.k):null;
 const nc=3+(M.buildings.market>=1?1:0);
 S.reward={msg,cards:rollCards(nc),paths:true,picks:kind==='elite'?2:1,prize,officer:boarded&&Math.random()<.25?pickOfficer(anyRole()):null,heavy:boarded&&!c.boss?Math.round(L.coin*.6):0};
 S.screen='reward';save();render()}
function prizeType(k){const map={rival:'sloop',salvager:'sloop',schooner:'sloop',privateer:'brigantine',cutter:'brigantine',corsair:'brigantine',patrol:'snow',rover:'snow',guarda:'brigantine',hunter:'snow',galleon:'snow',capitana:'snow',plate:'snow',warship:'snow',vengeance:'snow'};return map[k]||null}
function rollCards(n){const rk=rank();const cand=POOL.filter(k=>POOLR[k]<=rk);let out=[];
 if(S&&S.bias){const b=shuffle(cand.filter(k=>CARDS[k].a===S.bias));if(b.length)out.push(b[0])}
 shuffle(cand).forEach(k=>{if(out.length<n&&!out.includes(k))out.push(k)});return shuffle(out)}
function abandonShip(){(S.stats.abl=S.stats.abl||[]).push(S.act+':'+(S.combat?S.combat.enemy.k:'?'));S.combat=null;S.stats.abandons=(S.stats.abandons||0)+1;const lostCrew=Math.round(S.crew*.4);
 S.ship={type:'periagua',hull:SHIPS.periagua.hull,upg:{hull:0,guns:0,rig:0},spent:0};
 S.crew=Math.min(crewMax(),S.crew-lostCrew);CARGOKEYS.forEach(k=>S.cargo[k]=Math.floor(S.cargo[k]/2));
 S.coin=Math.floor(S.coin/2);const list=Object.values(S.officers);if(list.length)pick(list).injured=true;
 if(S.row===S.map.length-1){S.bossFails=(S.bossFails||0)+1;
  if(S.bossFails>=2){S.capturedMsg='Your ship lost twice to the boss. You are taken in chains.';endRun('death');return}
  S.row-=2;S.map[S.row+1].forEach(n=>n.done=0);S.map[S.row+2][1].done=0;S.col=1}
 S.screen='abandon';save();render()}
function payoutValue(){return S.coin}
function endRun(kind){const v=payoutValue();const pct=kind==='death'?.25:kind==='extract'?.75:1.25;const banked=Math.round(v*pct*(1+.1*(S.not||0)));
 if(kind==='win')ren(25);else if(kind==='extract')ren(10);
 const rb=rank();const gain=S.ren||0;M.renown=(M.renown||0)+gain;const ra=rank();
 M.banked+=banked;M.bestAct=Math.max(M.bestAct,S.act);M.plunder+=S.stats.plunder;
 const bc=M.byCaptain[S.cap]=M.byCaptain[S.cap]||{runs:0,wins:0};bc.runs++;
 if(kind==='death')M.deaths++;else{if(kind==='win'){M.wins++;bc.wins++;M.maxNot=Math.min(NOTMAX,Math.max(M.maxNot||0,(S.not||0)+1))}else M.extracts++;S.trophies.forEach(t=>{if(!M.trophies.includes(t))M.trophies.push(t)});if(!M.unlocked.rackham){M.unlocked.rackham=1;S.unlockMsg='New captain unlocked: "Calico Jack" Rackham!'}}
 (M.log=M.log||[]).unshift({cap:S.cap,kind,act:S.act,fights:S.stats.fights,coin:banked,ren:gain,not:S.not||0,t:Date.now()});M.log=M.log.slice(0,15);
 S.end={kind,banked,act:S.act,trophies:kind==='death'?[]:S.trophies.slice(),ren:gain,rankBefore:rb,rankAfter:ra,total:M.renown,stats:Object.assign({},S.stats),deck:S.deck.length,ship:S.ship.type,by:S.combat?S.combat.enemy.n:(S.capturedMsg||'')};
 S.combat=null;S.screen='end';saveMeta();save();render()}
function nextAct(){S.act++;S.bossFails=0;ren(3);S.map=genMap(S.act);S.row=-1;S.col=-1;S.screen='map';
 S.msg=`${ACTS[S.act].n}. ${S.act===3?'Benjamin Hornigold, pardoned and hunting his old friends, waits at the end.':'New waters, harder prey.'}`;fx('act',{act:S.act});save();render()}

/* ---------- REWARDS / NODES ---------- */
function takeCard(k){S.deck.push(k);rewardDone()}
function nextShipUp(){const order=['hull','guns','rig'];const lo=Math.min(...order.map(k=>S.ship.upg[k]));return lo>=2?null:order.find(k=>S.ship.upg[k]===lo)}
function takeShipUp(){const k=nextShipUp();if(k){S.ship.upg[k]++;S.ship.spent+=UPG_COST[S.ship.upg[k]-1];if(k==='hull')S.ship.hull+=15;S.reward.note=`Ship: ${UPG[k].n} +1.`}else{S.ship.hull=Math.min(hullMax(),S.ship.hull+20)}rewardDone()}
function takeCrewUp(){const n=Math.min(crewMax()-S.crew,8);S.crew+=n;rewardDone()}
function takeCaptainUp(){S.maxHp+=4;S.hp=Math.min(S.maxHp,S.hp+10);rewardDone()}
function takeHeavy(){const r=S.reward;if(!r||!r.heavy)return;S.coin+=r.heavy;S.stats.plunder+=r.heavy;S.deck.push('ballast');r.heavy=0;r.msg+=` Heavy plunder: +silver, and the hold is crammed (Heavy Plunder card added).`;save();render()}
function rewardDone(){const r=S.reward;r.picks=(r.picks||1)-1;r.cardsTaken=true;if(r.picks>0&&r.paths){r.cards=rollCards(3+(M.buildings.market>=1?1:0));render();return}
 if(r.prize||r.officer){r.paths=false;r.cards=null;S.screen='prize';save();render();return}
 S.reward=null;S.screen='map';save();render()}
function takePrize(){const t=S.reward.prize;S.ship={type:t,hull:Math.round(SHIPS[t].hull*.45),upg:{hull:0,guns:0,rig:0},spent:0};S.crew=Math.min(S.crew,crewMax());S.reward.prize=null;save();render()}
function skipPrize(){S.reward.prize=null;if(!S.reward.officer){S.reward=null;S.screen='map'}save();render()}
function hireOfficer(id,price){const o=OFFICERS[id];if(S.coin<price)return false;S.coin-=price;S.officers[o.role]={id,injured:false};return true}
function recruitCost(id){let p=OFFICERS[id].cost;if(S.cap==='bellamy')p=Math.round(p*.75);return p}
const crewPrice=()=>Math.max(1,Math.round(3*(S.cap==='bellamy'?.75:1)*(1-(off('purser')?.15:0)-(S.trophies.includes('letter')?.15:0)+(S.not>=3?.2:0))));
function hireCrew(n,price){const room=crewMax()-S.crew;n=Math.min(n,room);if(n<=0||S.coin<price*n)return;S.coin-=price*n;S.crew+=n;save();render()}
function buy(k,n=1){const p=px(PRICE[k]);if(S.coin<p)return;const a=addCargo(k,n);S.coin-=p*a;save();render()}
function portCards(){const n=4+(M.buildings.market>=1?1:0);const cs=rollCards(n).map(k=>({k,p:45+rnd(40)+(CARDS[k].c>=2?10:0)}));
 if(M.buildings.market>=2){const k=pick(POOL.filter(x=>POOLR[x]<=rank()&&upId(x)));cs.push({k:k+'+',p:110+rnd(30)})}return cs}
function buyCard(i){const it=S.shop.cards[i];if(!it||it.sold||S.coin<px(it.p))return;S.coin-=px(it.p);it.sold=1;S.deck.push(it.k);save();render()}
const dismissCost=()=>50+25*S.removed;
function removeCard(i){const free=S.removeFree;const cost=free?0:dismissCost();if(!free&&(S.shop.removedHere||S.coin<cost))return;if(S.deck.length<=6)return;S.coin-=cost;if(!free){S.removed++;S.shop.removedHere=1}S.deck.splice(i,1);S.removeFree=0;S.screen=S.removeBack||'port';S.removeBack=null;save();render()}
/* upgrading a card: at ports for silver, at coves as a rest option, from events */
function canUpgrade(k){return !!upId(k)}
function upgradeCard(i){const k=S.deck[i];if(!canUpgrade(k))return;const m=S.upMode;
 if(m==='port'){const p=px(70);if(S.coin<p||S.shop.upgraded)return;S.coin-=p;S.shop.upgraded=1}
 if(m==='cove')S.coveUsed=1;
 S.deck[i]=upId(k);S.msg=`${CARDS[k].n} is improved.`;S.screen=m==='cove'?'map':(S.upBack||'map');S.upMode=null;S.upBack=null;fx('upgrade',{});save();render()}
function openUpgrade(mode,back){S.upMode=mode;S.upBack=back||'map';S.screen='upgrade';save();render()}
/* Cove: choose ONE */
function coveRepair(){if(S.coveUsed)return;S.coveUsed=1;const mx=hullMax();let h=Math.round(mx*.3),k=0;const per=off('pruitt')?18:12;
 S.ship.hull=Math.min(mx,S.ship.hull+h);while(S.cargo.kits>0&&S.ship.hull<mx){S.cargo.kits--;k++;S.ship.hull=Math.min(mx,S.ship.hull+per)}
 S.msg=`Careened: hull patched${k?` (used ${k} repair kit${k>1?'s':''})`:''}.`;S.screen='map';save();render()}
function coveRest(){if(S.coveUsed)return;S.coveUsed=1;Object.values(S.officers).forEach(o=>o.injured=false);S.hp=Math.min(S.maxHp,S.hp+Math.round(S.maxHp*.3));S.msg='The crew rests. Your captain recovers and your officers are fit for duty.';S.screen='map';save();render()}
function upgradeShip(k){const l=S.ship.upg[k];if(l>=2)return;const cst=UPG_COST[l];if(S.coin<cst)return;S.coin-=cst;S.ship.upg[k]++;S.ship.spent+=cst;if(k==='hull')S.ship.hull+=15;save();render()}
function buyShip(t){const cst=SHIPS[t].price-shipValue();if(S.coin<cst)return;S.coin-=Math.max(0,cst);S.ship={type:t,hull:SHIPS[t].hull,upg:{hull:0,guns:0,rig:0},spent:0};S.crew=Math.min(S.crew,crewMax());save();render()}
function repairCoin(){const need=hullMax()-S.ship.hull;const n=Math.min(need,Math.floor(S.coin/2));S.coin-=n*2;S.ship.hull+=n;save();render()}
function carpenterRepair(){const p=px(20);if(S.coin<p||(S.shop&&S.shop.repaired)||S.ship.hull>=hullMax())return;S.coin-=p;if(S.shop)S.shop.repaired=1;S.ship.hull=Math.min(hullMax(),S.ship.hull+15);save();render()}
function surgeonHeal(){const p=px(25);if(S.coin<p||(S.shop&&S.shop.healed))return;S.coin-=p;if(S.shop)S.shop.healed=1;S.hp=Math.min(S.maxHp,S.hp+Math.round(S.maxHp*.25));Object.values(S.officers).forEach(o=>o.injured=false);save();render()}
/* smuggler's cove: rare cards cheap, a quiet dismissal, cheap powder */
function genSmug(){const rk=rank();const locked=shuffle(POOL.filter(k=>POOLR[k]>rk)),open=shuffle(POOL.filter(k=>POOLR[k]<=rk));
 const ks=locked.slice(0,2).concat(open.slice(0,3-Math.min(2,locked.length)));
 return {cards:ks.slice(0,3).map(k=>({k:Math.random()<.35&&upId(k)?k+'+':k,p:20+10*CARDS[k].c+rnd(15)})),rm:1,pw:1}}
function buySmug(i){const it=S.smug.cards[i];if(!it||it.sold||S.coin<px(it.p))return;S.coin-=px(it.p);it.sold=1;S.deck.push(it.k);save();render()}
function smugPowder(){if(!S.smug.pw||S.coin<12)return;S.coin-=12;S.smug.pw=0;addCargo('powder',5);save();render()}
function smugRemove(){if(!S.smug.rm||S.coin<15||S.deck.length<=6)return;S.removeFree=0;S.smugRm=1;S.removeBack='smuggler';S.screen='remove';render()}
function removeSmug(i){if(S.coin<15||S.deck.length<=6)return;S.coin-=15;S.smug.rm=0;S.smugRm=0;S.deck.splice(i,1);S.screen='smuggler';save();render()}
/* ---------- EVENTS ---------- */
/* a: acts the event can appear in. w: derelict-wreck pool. Each option: [label, fn]. */
const miss='Not enough silver.';
const EVENTS=[
 {a:[1,2],w:1,t:'A Drifting Wreck',d:'A merchant wreck wallows on the swell. Salvage is risky: she may roll over.',o:[['Send a salvage party (60%: +2 kits, +25 silver; 40%: lose 6 crew)',()=>{if(Math.random()<.6){addCargo('kits',2);S.coin+=25;return'Good salvage!'}S.crew=Math.max(0,S.crew-6);return'She rolled. 6 men lost.'}],['Leave her',()=>'You sail on.']]},
 {a:[1,2,3],w:1,t:'The 1715 Fleet Wrecks',d:'Divers still work the wrecks of the Spanish treasure fleet off the Florida coast. Their camp is lightly guarded.',o:[['Raid the camp (captain takes 8 damage; +50 silver)',()=>{S.hp-=8;S.coin+=50;return'+50 silver.'}],['Buy salvage (-20 silver, +2 kits, +2 powder)',()=>{if(S.coin<20)return miss;S.coin-=20;addCargo('kits',2);addCargo('powder',2);return'Useful salvage.'}],['Sail past',()=>'']]},
 {a:[1,2,3],t:'Storm on the Horizon',d:'A black squall line is coming down fast.',o:[['Run through it (lose 10 hull, no rations eaten next leg)',()=>{S.ship.hull=Math.max(1,S.ship.hull-10);S.leg++;S.cargo.rations++;return'Battered but fast.'}],['Heave to and wait (lose 2 rations)',()=>{S.cargo.rations=Math.max(0,S.cargo.rations-2);return'You ride it out.'}]]},
 {a:[1,2,3],t:'An Officer Without a Ship',d:'A paroled officer asks for a berth in exchange for a share.',o:[['Sign him on (30 silver)',()=>{const r=anyRole();const id=pickOfficer(r);if(!id)return'He finds no post that suits him.';if(!hireOfficer(id,30))return miss;return`${OFFICERS[id].n} joins as ${ROLES[r].n}.`}],['Turn him away',()=>'']]},
 {a:[1,2],t:'Powder Smugglers',d:'A smuggler sloop trades in kegs, no questions asked.',o:[['Buy 4 gunpowder (-20 silver)',()=>{if(S.coin<20)return miss;S.coin-=20;addCargo('powder',4);return'Kegs aboard.'}],['Sell 2 gunpowder (+30 silver)',()=>{if(S.cargo.powder<2)return'Not enough gunpowder.';S.cargo.powder-=2;S.coin+=30;return'+30 silver.'}],['Ignore them',()=>'']]},
 {a:[1],t:'Fishing Village',d:'A quiet cove with a village willing to trade.',o:[['Buy provisions (-12 silver, +4 rations)',()=>{if(S.coin<12)return miss;S.coin-=12;addCargo('rations',4);return'Provisioned.'}],['Recruit hands (-15 silver, +6 crew)',()=>{if(S.coin<15)return miss;S.coin-=15;S.crew=Math.min(crewMax(),S.crew+6);return'+6 crew.'}]]},
 {a:[2],t:'A Straggler from the Plate Fleet',d:'A Spanish merchantman has fallen behind her convoy. She is slow, but her guns are not silent.',o:[['Fire on her (-2 gunpowder, +60 silver; 40%: she answers, -12 hull)',()=>{if(S.cargo.powder<2)return'Not enough gunpowder to bother.';S.cargo.powder-=2;S.coin+=60;if(Math.random()<.4){S.ship.hull=Math.max(1,S.ship.hull-12);return'+60 silver, but she hit back (-12 hull).'}return'+60 silver.'}],['Let her go',()=>'']]},
 {a:[2,3],t:'Fever Aboard',d:'A sickness is spreading below decks.',o:[['Burn the hammocks and ride it out (lose 6 crew)',()=>{S.crew=Math.max(0,S.crew-6);return'Six men lost.'}],['Pay a physician in the next port (-35 silver)',()=>{if(S.coin<35){S.crew=Math.max(0,S.crew-6);return'You cannot pay. Six men are lost.'}S.coin-=35;return'The fever breaks.'}]]},
 {a:[2,3],w:1,t:'A Powder Hulk',d:'An abandoned hulk with a sealed magazine. The seal may be trapped.',o:[['Open the magazine (+5 gunpowder; 30%: it blows, captain -10)',()=>{addCargo('powder',5);if(Math.random()<.3){S.hp-=10;return'+5 gunpowder, but the fuse caught (-10 HP).'}return'+5 gunpowder.'}],['Leave her',()=>'']]},
 {a:[3],t:'The King\u2019s Pardon',d:'A pardon proclamation is nailed to a harbour post. Half your crew are reading it.',o:[['Tear it down and pay shares (-30 silver)',()=>{if(S.coin<30){S.crew=Math.max(0,S.crew-5);return'You cannot cover the shares. Five men slip away.'}S.coin-=30;return'The crew is with you.'}],['Let them read (lose 5 crew)',()=>{S.crew=Math.max(0,S.crew-5);return'Five men take the pardon.'}]]},
 {a:[3],t:'An Informant in Port',d:'A man who knows the hunter\u2019s patrol routes will sell them.',o:[['Buy the routes (-30 silver): your next battle starts with the Weather Gauge',()=>{if(S.coin<30)return miss;S.coin-=30;S.nextGauge=1;return'You know where the hunter will be.'}],['Rob him (+30 silver, captain -6)',()=>{S.hp-=6;S.coin+=30;return'+30 silver.'}]]},
 {a:[3],t:'Navy Press Gang',d:'A press gang is working the dock, and a Navy cutter stands off.',o:[['Slip away (lose 8 crew)',()=>{S.crew=Math.max(0,S.crew-8);return'Eight men are pressed.'}],['Bribe the officer (-40 silver)',()=>{if(S.coin<40){S.crew=Math.max(0,S.crew-8);return'You cannot pay. Eight men are pressed.'}S.coin-=40;return'He looks away.'}]]},
 /* v6 additions */
 {a:[1,2,3],t:'The Old Gunner\u2019s Lesson',d:'A grizzled gunner at a harbour tavern says he can teach you a trick or two. For a price, or a drink.',o:[['Pay 25 silver: improve one card of your choice',()=>{if(S.coin<25)return miss;S.coin-=25;S.pend='upgrade';return''}],['Share a drink (captain heals 8)',()=>{S.hp=Math.min(S.maxHp,S.hp+8);return'A good story and a stiff drink. +8 HP.'}]]},
 {a:[1,2,3],t:'Ballast Overboard',d:'The hold is cluttered with plunder nobody can sell. A quick purge would lighten the ship.',o:[['Heave dead weight over the side (dismiss a card for free)',()=>{if(S.deck.length<=6)return'You have no cards to spare.';S.pend='remove';return''}],['Keep everything',()=>'']]},
 {a:[2,3],t:'A Page from a Navigator\u2019s Journal',d:'A dead navigator\u2019s journal, full of manoeuvres. You could study it, or sell it.',o:[['Study it (gain a card)',()=>{const k=rollCards(1)[0];S.deck.push(k);return`You learn ${CARDS[k].n}.`}],['Sell it (+35 silver)',()=>{S.coin+=35;return'+35 silver.'}]]},
 {a:[1,2,3],t:'Becalmed',d:'The wind dies. Sails hang like washing. Fresh water is the least of your worries.',o:[['Row with the sweeps (lose 4 crew; no ration eaten next leg)',()=>{S.crew=Math.max(0,S.crew-4);S.leg++;S.cargo.rations++;return'Four men worked to collapse.'}],['Wait it out (lose 1 ration; your next battle starts with the Weather Gauge)',()=>{S.cargo.rations=Math.max(0,S.cargo.rations-1);S.nextGauge=1;return'The first breeze favours you.'}]]},
 {a:[1,2],t:'Turtle Hunters',d:'Cayman turtlers have a boat full of salted turtle, cheap and filling.',o:[['Buy turtle meat (-10 silver, +5 rations)',()=>{if(S.coin<10)return miss;S.coin-=10;addCargo('rations',5);return'The hold smells, but it is full.'}],['Trade 2 gunpowder for 4 rations',()=>{if(S.cargo.powder<2)return'Not enough gunpowder.';S.cargo.powder-=2;addCargo('rations',4);return'A fair swap.'}],['Sail on',()=>'']]},
 {a:[2,3],t:'A Mutinous Murmur',d:'The crew grumbles that the captain has been keeping too much of the plunder. Pirate crews vote on such things.',o:[['Call the vote and pay shares (-25 silver)',()=>{if(S.coin<25){S.crew=Math.max(0,S.crew-5);return'You cannot pay. Five men leave.'}S.coin-=25;return'The crew cheers.'}],['Stand firm (50%: nothing; 50%: lose 8 crew)',()=>{if(Math.random()<.5)return'They back down.';S.crew=Math.max(0,S.crew-8);return'Eight men leave in the night.'}]]},
 {a:[1,2,3],t:'Dice in a Back Room',d:'A tavern back room in Port Royal. The dice are probably loaded, but so are the pockets.',o:[['Throw dice (-20 silver; 50%: +50 silver)',()=>{if(S.coin<20)return miss;S.coin-=20;if(Math.random()<.5){S.coin+=70;return'You win! +50 silver net.'}return'The dice were loaded. -20 silver.'}],['Keep your hands in your pockets',()=>'']]},
 {a:[1],t:'A Rival Captain Offers a Share',d:'A pirate captain flies a black flag and proposes a short cruise together against a merchant.',o:[['Join him (+40 silver; -8 hull from the skirmish)',()=>{S.coin+=40;S.ship.hull=Math.max(1,S.ship.hull-8);return'+40 silver. The merchant fought back.'}],['Decline',()=>'']]},
 {a:[2,3],w:1,t:'A Burning Merchantman',d:'A merchant vessel burns from stem to stern. Boats pull away from her. The hold may still be intact.',o:[['Rescue survivors (use 1 repair kit if you have one; +6 crew)',()=>{if(S.cargo.kits>0)S.cargo.kits--;S.crew=Math.min(crewMax(),S.crew+6);return'+6 crew.'}],['Plunder the hold (+45 silver; captain -6)',()=>{S.coin+=45;S.hp-=6;return'+45 silver. The deck was hot.'}],['Sail on',()=>'']]},
 {a:[3],t:'The Gibbets at Port Royal',d:'The tarred bodies of hanged pirates swing along the cays. Some of your crew mutter and touch charms.',o:[['Hold a toast to the dead (-10 silver; +6 crew rally)',()=>{if(S.coin<10)return miss;S.coin-=10;S.crew=Math.min(crewMax(),S.crew+6);return'The crew sails on, grimly.'}],['Pick the corpses\u2019 pockets (+30 silver; lose 3 crew)',()=>{S.coin+=30;S.crew=Math.max(0,S.crew-3);return'Superstitious hands slip away.'}]]},
 {a:[1,2,3],w:1,t:'A Marooned Man on a Cay',d:'A lone man waves a shirt from a sandbar. He says he has been here a week. He might be telling the truth.',o:[['Take him aboard (+4 crew, -1 ration)',()=>{S.crew=Math.min(crewMax(),S.crew+4);S.cargo.rations=Math.max(0,S.cargo.rations-1);return'A thin, grateful recruit.'}],['Ask where he buried it (60%: +50 silver; 40%: he robs you of 15)',()=>{if(Math.random()<.6){S.coin+=50;return'It was real. +50 silver.'}S.coin=Math.max(0,S.coin-15);return'He lied and he is quick-fingered. -15 silver.'}],['Leave him',()=>'']]},
];
function pickEvent(wreck){const seen=S.seenEv=S.seenEv||[];const ok=i=>EVENTS[i].a.includes(S.act)&&(wreck?EVENTS[i].w:!EVENTS[i].w||Math.random()<.4);
 let c=EVENTS.map((e,i)=>i).filter(i=>ok(i)&&!seen.includes(i));if(!c.length){S.seenEv=[];c=EVENTS.map((e,i)=>i).filter(i=>ok(i))}if(!c.length)c=EVENTS.map((e,i)=>i).filter(i=>EVENTS[i].a.includes(S.act));const i=pick(c);S.seenEv.push(i);return i}
function chooseEvent(i){const r=EVENTS[S.ev].o[i][1]();S.msg=r||'';S.screen='map';
 if(S.hp<=0){endRun('death');return}
 if(S.pend==='upgrade'){S.pend=null;if(S.deck.some(canUpgrade)){openUpgrade(null,'map');return}S.msg='No card could be improved.'}
 else if(S.pend==='remove'){S.pend=null;S.removeFree=1;S.removeBack='map';S.screen='remove'}
 save();render()}

function swapCard(){}
