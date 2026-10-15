"use strict";
/* Free Nassau v6: static game data (ships, cards, officers, enemies, events). Rules live in game.js. */
const RUNKEY='fn6run', METAKEY='fn6meta', OLDMETA='fnv2meta';
const rnd=n=>Math.floor(Math.random()*n), pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let S=null, M=null;
/* FX event queue: the engine emits, the UI plays. Capped, off in tests. */
const FXQ=[];
function fx(t,d){if(window.NOFX||window.__prev||FXQ.length>80)return;FXQ.push(Object.assign({t},d||{}))}
/* Balance dials (tuned with sim.js). dmg[act]: normal-enemy damage multiplier on top of the act scale; bd/bs: boss damage / size by act. */
const TUNE={dmg:[0,3.0,3.3,3.1],hull:1.8,crew:1.3,bd:[0,1.8,2.1,1.45],bs:[0,1.5,1.7,1.0],sc:[0,1,1.15,1.15]};
/* Ships: heavier hulls give less Block from Sail cards (sail). */
const SHIPS={
 periagua:{n:'Periagua',hull:30,crew:25,guns:2,price:0,sail:2,perk:'Tiny and nimble: +3 Block each ship turn; Sail cards +2 Block.'},
 sloop:{n:'Sloop',hull:45,crew:40,guns:3,price:140,sail:1,perk:'Fast: first Sail card each fight costs 0; Sail cards +1 Block.'},
 brigantine:{n:'Brigantine',hull:65,crew:60,guns:4,price:300,sail:0,perk:'Balanced: +1 card draw on boarding.'},
 snow:{n:'Snow',hull:85,crew:80,guns:5,price:500,sail:-1,perk:'Heavy broadsides: cannon cards +2 damage. Sail cards -1 Block. Eats an extra ration every 2nd leg.'},
 frigate:{n:'Frigate',hull:110,crew:110,guns:6,price:800,sail:-2,perk:'Ship of force: enemy crews start -10%. Sail cards -2 Block. Eats an extra ration every 2nd leg.'},
};
const LADDER=['periagua','sloop','brigantine','snow','frigate'];
const UPG={hull:{n:'Sheathing',d:'+15 max hull per level'},guns:{n:'Heavier guns',d:'+1 guns per level'},rig:{n:'New rigging',d:'+3 Block at start of each ship turn per level'}};
const UPG_COST=[90,180];
const CARGO={powder:{n:'Gunpowder',i:'💥',d:'Fuels cannon cards. With none, shots deal half damage.'},rations:{n:'Rations',i:'🍖',d:'One is eaten each leg. With none, 4 crew starve per leg.'},kits:{n:'Repair kits',i:'🔧',d:'Patch the hull at coves and with Bosun cards.'}};
const CARGOKEYS=['powder','rations','kits'];
const CAP={powder:14,rations:12,kits:6};
const PRICE={powder:8,rations:4,kits:10};

/* ---------- CARDS ----------
   {n,tag S/C/K,c cost,pw powder,x exhaust,sail,a archetype G/B/N/K(cunning)/C(captain),i icon,
    p:{param:[base,upgraded]},cu upgraded cost,d:(P,G)=>text,f:(x,P)=>effect}.
   Every card can be played in every phase: Ship cards fire at half strength from the rigging when boarding (full on the Gun deck),
   Crew cards at sea make ready your boarders (+1 Advantage, once a turn). */
const CARDS={};
const A=(id,o)=>{CARDS[id]=o};
/* Gunnery */
A('broadside',{n:'Broadside',tag:'S',a:'G',c:2,pw:1,i:'💥',p:{b:[6,9]},d:(P,G)=>`Fire the guns: <b>${P.b+2*G}</b> damage to the hull.`,f:(x,P)=>x.shot(P.b+2*x.guns())});
A('swivel',{n:'Swivel Gun',tag:'S',a:'G',c:1,i:'🔫',p:{b:[3,5]},d:(P,G)=>`Light gun: <b>${P.b+G}</b> damage to the hull. No powder.`,f:(x,P)=>x.shot(P.b+x.guns(),{light:1})});
A('chain',{n:'Chain Shot',tag:'S',a:'G',c:1,pw:1,i:'⛓️',p:{b:[4,6],w:[2,3]},d:(P,G)=>`<b>${P.b+G}</b> damage. Enemy Weak <b>${P.w}</b>.`,f:(x,P)=>{x.shot(P.b+x.guns());x.weak(P.w)}});
A('grape',{n:'Grapeshot',tag:'S',a:'G',c:1,pw:1,i:'🍇',p:{b:[2,3],k:[6,9]},d:(P,G)=>`<b>${P.b+G}</b> hull damage and kill <b>${P.k}</b> enemy crew.`,f:(x,P)=>{x.shot(P.b+x.guns());x.killCrew(P.k)}});
A('raking',{n:'Raking Fire',tag:'S',a:'G',c:2,pw:1,i:'🎯',p:{b:[4,5],r:[6,9]},d:(P,G)=>`<b>${P.b+2*G}</b> damage; if the enemy has no Block, +<b>${P.r}</b> and gain 1 Advantage.`,f:(x,P)=>{const bonus=x.E().block<=0;x.shot(P.b+2*x.guns()+(bonus?P.r:0));if(bonus)x.adv(1)}});
A('runout',{n:'Run Out the Guns',tag:'S',a:'G',c:0,x:1,i:'🧨',p:{b:[4,6]},d:P=>`Your next <b>2</b> cannon cards deal +<b>${P.b}</b> damage.`,f:(x,P)=>{const c=x.C();c.rg=2;c.rgb=P.b}});
A('barshot',{n:'Bar Shot',tag:'S',a:'G',c:1,pw:1,i:'🔩',p:{b:[3,5],w:[2,3]},d:(P,G)=>`Strips all enemy Block, then <b>${P.b+G}</b> damage and Weak <b>${P.w}</b>.`,f:(x,P)=>{x.E().block=0;x.shot(P.b+x.guns());x.weak(P.w)}});
A('ripple',{n:'Ripple Fire',tag:'S',a:'G',c:2,pw:2,i:'🌊',p:{b:[2,3]},d:(P,G)=>`Three shots of <b>${P.b+G}</b> damage each.`,f:(x,P)=>{for(let i=0;i<3;i++)x.shot(P.b+x.guns())}});
A('mortar',{n:'Mortar Shell',tag:'S',a:'G',c:2,pw:1,i:'🎇',p:{b:[14,19]},d:(P,G)=>`<b>${P.b+G}</b> damage that ignores Block and armour.`,f:(x,P)=>x.shot(P.b+x.guns(),{pierce:1})});
A('fireship',{n:'Fireship',tag:'S',a:'G',c:2,pw:2,x:1,i:'🔥',p:{b:[5,7]},d:P=>`Enemy Burn <b>${P.b}</b>: hull damage each turn.`,f:(x,P)=>{x.burn(P.b)}});
A('powdermonkey',{n:'Powder Monkey',tag:'S',a:'G',c:0,i:'🐒',p:{p:[2,3]},d:P=>`Fetch <b>${P.p}</b> gunpowder from the magazine.`,f:(x,P)=>{x.powder(P.p)}});
/* Boarding */
A('cutlass',{n:'Cutlasses',tag:'C',a:'B',c:1,i:'🗡️',p:{k:[6,8]},d:P=>`Your boarders kill <b>${P.k}</b> enemy crew.`,f:(x,P)=>x.melee(P.k)});
A('pistols',{n:'Pistol Volley',tag:'C',a:'B',c:1,i:'🔫',p:{k:[4,6],w:[1,2]},d:P=>`Kill <b>${P.k}</b> enemy crew. Enemy Weak <b>${P.w}</b>.`,f:(x,P)=>{x.melee(P.k);x.weak(P.w)}});
A('axes',{n:'Boarding Axes',tag:'C',a:'B',c:2,i:'🪓',p:{k:[16,22]},d:P=>`Kill <b>${P.k}</b> enemy crew.`,f:(x,P)=>x.melee(P.k)});
A('grenades',{n:'Grenadoes',tag:'C',a:'B',c:1,pw:1,i:'🧨',p:{k:[9,13]},d:P=>`Kill <b>${P.k}</b> enemy crew. Uses 1 💥.`,f:(x,P)=>x.melee(P.k)});
A('hold',{n:'Hold the Rail',tag:'C',a:'B',c:1,i:'🛡️',p:{b:[6,9]},d:P=>`Gain <b>${P.b}</b> Block.`,f:(x,P)=>x.blk(P.b)});
A('rally',{n:'Rally the Crew',tag:'C',a:'B',c:1,i:'📣',p:{b:[4,6],h:[3,5]},d:P=>`Gain <b>${P.b}</b> Block. Restore <b>${P.h}</b> crew.`,f:(x,P)=>{x.blk(P.b);x.heal(P.h)}});
A('fear',{n:'Fearsome Reputation',tag:'C',a:'B',c:1,i:'💀',p:{pc:[10,15],w:[1,2]},d:P=>`Enemy crew loses <b>${P.pc}%</b> of its number and is Weak <b>${P.w}</b>.`,f:(x,P)=>{const e=x.E();x.melee(Math.ceil(e.crew*P.pc/100),{raw:1});x.weak(P.w)}});
A('hooks',{n:'Grappling Hooks',tag:'C',a:'B',c:1,i:'🪝',p:{k:[5,7],a:[2,3]},d:P=>`At sea: gain <b>${P.a}</b> Advantage. Boarding: kill <b>${P.k}</b> crew and draw 1.`,f:(x,P)=>{if(x.C().phase==='ship')x.adv(P.a);else{x.melee(P.k);x.draw(1)}}});
A('rage',{n:'Blood Rage',tag:'C',a:'B',c:1,x:1,i:'😤',p:{s:[3,4],l:[3,2]},d:P=>`All your damage +<b>${P.s}</b> this fight. Lose <b>${P.l}</b> crew.`,f:(x,P)=>{x.C().str+=P.s;S.crew=Math.max(0,S.crew-P.l);x.log(`The crew works itself into a rage. ${P.l} fall to their own fury.`)}});
A('flurry',{n:'Cutlass Flurry',tag:'C',a:'B',c:1,i:'⚔️',p:{k:[3,4]},d:P=>`Kill <b>${P.k}</b> enemy crew for each card you have played this turn (including this).`,f:(x,P)=>x.melee(P.k*x.C().played)});
A('press',{n:'Press the Attack',tag:'C',a:'B',c:2,i:'🏴‍☠️',p:{k:[10,14],b:[10,14]},d:P=>`Kill <b>${P.k}</b> enemy crew. If you have more crew than they do, also gain <b>${P.b}</b> Block.`,f:(x,P)=>{x.melee(P.k);if(S.crew>x.E().crew)x.blk(P.b)}});
A('sharp',{n:'Sharpshooters',tag:'C',a:'B',c:1,i:'🎯',p:{k:[5,7]},d:P=>`Kill <b>${P.k}</b> enemy crew; again if you have 2+ Advantage.`,f:(x,P)=>{x.melee(P.k);if(x.C().advT>=2)x.melee(P.k)}});
/* Seamanship */
A('tack',{n:'Tack Hard',tag:'S',a:'N',c:1,sail:1,i:'⛵',p:{b:[7,10]},d:P=>`Gain <b>${P.b+sailMod()}</b> Block.`,f:(x,P)=>x.blk(P.b)});
A('crowd',{n:'Crowd Sail',tag:'S',a:'N',c:1,sail:1,i:'🌬️',p:{b:[4,6]},d:P=>`Gain <b>${P.b+sailMod()}</b> Block. Draw 1.`,f:(x,P)=>{x.blk(P.b);x.draw(1)}});
A('weather',{n:'Take the Weather Gauge',tag:'S',a:'N',c:1,sail:1,i:'🧭',p:{b:[5,8]},d:P=>`Gain <b>${P.b+sailMod()}</b> Block and 1 Advantage. The wind swings to your favour.`,f:(x,P)=>{x.blk(P.b);x.adv(1);x.gauge()}});
A('hardstar',{n:'Hard a-Starboard',tag:'S',a:'N',c:1,sail:1,i:'↪️',p:{b:[6,9]},d:P=>`Gain <b>${P.b+sailMod()}</b> Block. Shift the wind one step your way.`,f:(x,P)=>{x.blk(P.b);x.shiftWind()}});
A('brace',{n:'Brace the Yards',tag:'S',a:'N',c:0,i:'🪢',p:{b:[3,5]},d:P=>`Gain <b>${P.b}</b> Block. Draw 1.`,f:(x,P)=>{x.blk(P.b);x.draw(1)}});
A('fog',{n:'Fog Bank',tag:'S',a:'N',c:1,cu:0,x:1,i:'🌫️',p:{},d:()=>`The enemy's next attack deals half damage.`,f:x=>{x.C().fog=1}});
A('careen',{n:'Careen Underway',tag:'S',a:'N',c:2,i:'🔧',p:{h:[6,9],b:[6,9]},d:P=>`Repair <b>${P.h}</b> hull (no kit needed). Gain <b>${P.b}</b> Block.`,f:(x,P)=>{x.repair(P.h,false);x.blk(P.b)}});
A('rigspeed',{n:'Rig for Speed',tag:'S',a:'N',c:1,x:1,i:'🏁',p:{d:[2,3]},d:P=>`Next turn, draw <b>${P.d}</b> extra cards.`,f:(x,P)=>{x.C().nextDraw+=P.d}});
/* Cunning */
A('feint',{n:'Feint',tag:'K',a:'K',c:1,i:'🎭',p:{w:[3,4]},d:P=>`Enemy Weak <b>${P.w}</b>. Draw 1.`,f:(x,P)=>{x.weak(P.w);x.draw(1)}});
A('smokescr',{n:'Smoke Screen',tag:'S',a:'K',c:1,i:'💨',p:{w:[2,3],b:[4,6]},d:P=>`Enemy Weak <b>${P.w}</b>. Gain <b>${P.b}</b> Block.`,f:(x,P)=>{x.weak(P.w);x.blk(P.b)}});
A('dirty',{n:'Dirty Fighting',tag:'C',a:'K',c:1,i:'🦶',p:{k:[4,6],r:[8,12]},d:P=>`Kill <b>${P.k}</b> enemy crew; <b>${P.k+P.r}</b> if the enemy is Weak.`,f:(x,P)=>x.melee(P.k+(x.E().weak>0?P.r:0))});
A('firepots',{n:'Fire Pots',tag:'S',a:'K',c:1,pw:1,i:'🏺',p:{b:[3,4]},d:P=>`Enemy Burn <b>${P.b}</b>: damage each turn.`,f:(x,P)=>x.burn(P.b)});
A('pickpocket',{n:'Pickpocket',tag:'C',a:'K',c:1,i:'👛',p:{k:[3,4],s:[6,9]},d:P=>`Kill <b>${P.k}</b> enemy crew. Gain <b>${P.s}</b> silver.`,f:(x,P)=>{x.melee(P.k);x.silver(P.s)}});
A('falsecol',{n:'False Colours',tag:'S',a:'K',c:1,cu:0,x:1,i:'🏳️',p:{},d:()=>`The enemy loses its next move.`,f:x=>{x.C().skip=1}});
A('rumour',{n:'Spread Rumours',tag:'K',a:'K',c:0,i:'🗣️',p:{d:[2,3],s:[6,10]},d:P=>`Draw <b>${P.d}</b>. Gain <b>${P.s}</b> silver.`,f:(x,P)=>{x.draw(P.d);x.silver(P.s)}});
A('hiddenblade',{n:'Hidden Blade',tag:'K',a:'K',c:0,i:'🗡️',p:{b:[3,5]},d:P=>`Deal <b>${P.b}</b> to the current target.`,f:(x,P)=>x.any(P.b)});
/* Captain */
A('parry',{n:'Parry',tag:'K',a:'C',c:1,i:'🗡️',p:{b:[7,10]},d:P=>`Gain <b>${P.b}</b> Block (any phase).`,f:(x,P)=>x.blk(P.b)});
A('pistolshot',{n:"Captain's Pistol",tag:'K',a:'C',c:1,i:'🔫',p:{b:[6,9]},d:P=>`Deal <b>${P.b}</b> to the current target (hull, crew or foe).`,f:(x,P)=>x.any(P.b)});
A('resolve',{n:'Iron Resolve',tag:'K',a:'C',c:0,x:1,i:'⚓',p:{d:[1,2]},d:P=>`Gain 1 energy and draw <b>${P.d}</b>.`,f:(x,P)=>{x.C().energy++;x.draw(P.d)}});
A('rousing',{n:'Rousing Speech',tag:'K',a:'C',c:1,x:1,i:'📢',p:{h:[5,8],s:[1,2]},d:P=>`Restore <b>${P.h}</b> crew. All your damage +<b>${P.s}</b> this fight.`,f:(x,P)=>{x.heal(P.h);x.C().str+=P.s}});
A('steelnerve',{n:'Steel Nerve',tag:'K',a:'C',c:2,i:'🦾',p:{b:[14,18],h:[3,5]},d:P=>`Gain <b>${P.b}</b> Block. Heal the captain <b>${P.h}</b>.`,f:(x,P)=>{x.blk(P.b);x.healCap(P.h)}});
/* Captain signatures */
A('smoke',{n:'Lit Fuses in the Beard',tag:'K',a:'S',c:1,i:'🌫️',p:{b:[5,8],w:[1,2]},d:P=>`Blackbeard: gain <b>${P.b}</b> Block; enemy Weak <b>${P.w}</b>.`,f:(x,P)=>{x.blk(P.b);x.weak(P.w)}});
A('shares',{n:"Prince's Share",tag:'K',a:'S',c:0,i:'💰',p:{h:[6,9],d:[1,2],b:[4,6]},d:P=>`Bellamy: restore <b>${P.h}</b> crew, gain <b>${P.b}</b> Block, draw <b>${P.d}</b>.`,f:(x,P)=>{x.heal(P.h);x.blk(P.b);x.draw(P.d)}});
A('defiance',{n:'Defiance',tag:'K',a:'S',c:1,x:1,i:'🏴‍☠️',p:{b:[5,8],s:[2,3]},d:P=>`Vane: gain <b>${P.b}</b> Block. All your damage +<b>${P.s}</b> this fight.`,f:(x,P)=>{x.blk(P.b);x.C().str+=P.s}});
A('twin',{n:'Twin Blades',tag:'K',a:'S',c:1,i:'⚔️',p:{b:[4,6]},d:P=>`Bonny & Read: deal <b>${P.b}</b> twice to the current target.`,f:(x,P)=>{x.any(P.b);x.any(P.b)}});
A('getaway',{n:'Fast Getaway',tag:'K',a:'S',c:1,i:'💨',p:{b:[8,11]},d:P=>`Rackham: gain <b>${P.b}</b> Block, draw 1. At sea, also take the Weather Gauge.`,f:(x,P)=>{x.blk(P.b);x.draw(1);if(x.C().phase==='ship')x.gauge()}});
/* Officer cards */
A('fairshares',{n:'Fair Shares',tag:'C',a:'O',c:1,i:'🪙',p:{h:[5,7],b:[6,9]},d:P=>`Quartermaster: restore <b>${P.h}</b> crew, gain <b>${P.b}</b> Block.`,f:(x,P)=>{x.heal(P.h);x.blk(P.b)}});
A('ledger',{n:'Ship\u2019s Articles',tag:'K',a:'O',c:0,x:1,i:'📒',p:{d:[2,3]},d:P=>`Purser: draw <b>${P.d}</b>.`,f:(x,P)=>x.draw(P.d)});
A('allhands',{n:'All Hands to Pumps',tag:'S',a:'O',c:1,i:'🔧',p:{h:[6,9],b:[4,6]},d:P=>`Bosun: repair <b>${P.h}</b> hull (uses a 🔧 if you have one, else half) and gain <b>${P.b}</b> Block.`,f:(x,P)=>{x.repair(S.cargo.kits>0?P.h:Math.ceil(P.h/2),true);x.blk(P.b)}});
A('splice',{n:'Splice the Line',tag:'S',a:'O',c:0,i:'🪢',p:{b:[5,8]},d:P=>`Bosun: gain <b>${P.b}</b> Block.`,f:(x,P)=>x.blk(P.b)});
A('doubleshot',{n:'Double-Shotted',tag:'S',a:'O',c:2,pw:2,i:'💥',p:{b:[10,14]},d:(P,G)=>`Master Gunner: <b>${P.b+3*G}</b> damage.`,f:(x,P)=>x.shot(P.b+3*x.guns())});
A('hotshot',{n:'Heated Shot',tag:'S',a:'O',c:1,pw:1,i:'🔥',p:{b:[5,7],u:[3,4]},d:(P,G)=>`Master Gunner: <b>${P.b+G}</b> damage, enemy Burn <b>${P.u}</b>.`,f:(x,P)=>{x.shot(P.b+x.guns());x.burn(P.u)}});
A('readwind',{n:'Read the Wind',tag:'S',a:'O',c:0,x:1,i:'🧭',p:{d:[1,2]},d:P=>`Navigator: take the Weather Gauge. Draw <b>${P.d}</b>.`,f:(x,P)=>{x.gauge();x.draw(P.d)}});
A('shoal',{n:'Shoal Run',tag:'S',a:'O',c:1,sail:1,i:'🌊',p:{b:[11,15]},d:P=>`Navigator: gain <b>${P.b+sailMod()}</b> Block.`,f:(x,P)=>x.blk(P.b)});
A('fielddress',{n:'Field Dressing',tag:'K',a:'O',c:1,i:'🩹',p:{h:[5,7],c:[4,6],b:[3,5]},d:P=>`Surgeon: heal the captain <b>${P.h}</b>, restore <b>${P.c}</b> crew, gain <b>${P.b}</b> Block.`,f:(x,P)=>{x.healCap(P.h);x.heal(P.c);x.blk(P.b)}});
A('tourniquet',{n:'Tourniquet',tag:'K',a:'O',c:1,i:'🩸',p:{b:[8,11],h:[3,5]},d:P=>`Surgeon: gain <b>${P.b}</b> Block, heal the captain <b>${P.h}</b>.`,f:(x,P)=>{x.blk(P.b);x.healCap(P.h)}});
A('grapplesaway',{n:'Grapples Away!',tag:'C',a:'O',c:1,i:'🪝',p:{k:[8,12],a:[2,3]},d:P=>`Boarding Master: kill <b>${P.k}</b> crew. At sea: gain <b>${P.a}</b> Advantage instead.`,f:(x,P)=>{if(x.C().phase==='ship')x.adv(P.a);else x.melee(P.k)}});
A('ambush',{n:'Ambush',tag:'C',a:'O',c:1,i:'🌑',p:{k:[6,9],r:[8,10]},d:P=>`Boarding Master: kill <b>${P.k}</b> crew; <b>${P.k+P.r}</b> if the enemy is Weak.`,f:(x,P)=>x.melee(P.k+(x.E().weak>0?P.r:0))});
/* clutter from heavy plunder */
A('ballast',{n:'Heavy Plunder',tag:'K',a:'X',c:0,i:'📦',dead:1,p:{},d:()=>`Dead weight: cannot be played. Dismiss it at a port, or it clogs your hand.`,f:()=>{}});
/* upgrades are generated: id+'+' */
Object.keys(CARDS).forEach(id=>{const b=CARDS[id];if(b.dead)return;const u=Object.assign({},b,{n:b.n+'+',up:1,base:id});if(b.cu!=null)u.c=b.cu;CARDS[id+'+']=u});
const P=k=>{const cd=CARDS[k],o={};for(const n in cd.p)o[n]=cd.p[n][cd.up?1:0];return o};
const baseId=k=>CARDS[k].base||k;
const upId=k=>CARDS[k].up||CARDS[k].dead?null:k+'+';
/* reward pool: [card, rank needed to appear]. */
const POOLR={broadside:0,swivel:0,chain:0,grape:0,raking:0,runout:0,tack:0,crowd:0,weather:0,hardstar:0,cutlass:0,pistols:0,axes:0,grenades:0,hold:0,rally:0,hooks:0,flurry:0,feint:0,brace:0,careen:0,pistolshot:0,resolve:0,parry:0,fireship:0,
 barshot:1,fear:1,dirty:1, ripple:2,press:2,hiddenblade:2, rage:3,smokescr:3,fog:3, mortar:4,sharp:4,firepots:4, falsecol:5,pickpocket:5,rigspeed:5, powdermonkey:6,rousing:6,steelnerve:6,rumour:6};
const POOL=Object.keys(POOLR);

const CAPTAINS={
 blackbeard:{n:'Edward “Blackbeard” Teach',short:'Blackbeard',hp:78,crew:34,order:'litfuse',
  deck:['broadside','broadside','swivel','swivel','tack','tack','cutlass','cutlass','fear','smoke'],
  passive:'Terror: enemy crews start boarding with 8% fewer men.',id:'Intimidation and boarding.'},
 bellamy:{n:'“Black Sam” Bellamy',short:'Bellamy',hp:72,crew:40,order:'fairshare',
  deck:['broadside','broadside','swivel','tack','tack','cutlass','cutlass','cutlass','rally','shares'],
  passive:'Prince of Pirates: starts with Henry Jennings as Quartermaster; +30% silver from fights; hires cost 25% less.',id:'Crew and plunder.'},
 vane:{n:'Charles Vane',short:'Vane',hp:62,crew:34,order:'noquarter',
  deck:['broadside','broadside','chain','grape','tack','pistols','cutlass','cutlass','hold','defiance'],
  passive:'No quarter: cannon cards +2 damage; start with +3 gunpowder.',id:'Aggressive gunnery.'},
 bonnyread:{n:'Anne Bonny & Mary Read',short:'Bonny & Read',hp:66,crew:34,order:'twinblades',
  deck:['swivel','swivel','broadside','tack','tack','cutlass','cutlass','pistols','parry','twin'],
  passive:'Two blades: Captain cards deal +2 damage; +1 energy in duels.',id:'Hand-to-hand and duels.'},
 rackham:{n:'“Calico Jack” Rackham',short:'Rackham',hp:68,crew:34,unlock:1,order:'getaway',
  deck:['swivel','swivel','broadside','crowd','pistols','tack','cutlass','cutlass','hold','getaway'],
  passive:'Fast raider: Sail cards +3 Block; can flee normal fights on turn 1.',id:'Speed and evasion (unlock).'},
};
/* Doctrines: an alternate starting deck focus. Adds two archetype cards, drops two of the listed basics. */
const DOCTRINES={
 std:{n:'Captain\u2019s own',d:'The captain\u2019s usual deck. No bias.',rank:0},
 gun:{n:'Gunnery',a:'G',d:'Trade two crew cards for Run Out the Guns and Chain Shot. Rewards favour guns.',add:['runout','chain'],drop:['cutlass','pistols','fear','hold','rally','parry'],rank:0},
 board:{n:'Boarding',a:'B',d:'Trade two gun cards for Grappling Hooks and Cutlass Flurry. Rewards favour boarders.',add:['hooks','flurry'],drop:['swivel','chain','grape','broadside'],rank:0},
 sea:{n:'Seamanship',a:'N',d:'Trade two cards for Hard a-Starboard and Brace the Yards. Rewards favour sailing.',add:['hardstar','brace'],drop:['pistols','cutlass','swivel','hold'],rank:2},
 cun:{n:'Cunning',a:'K',d:'Trade two cards for Feint and Smoke Screen. Rewards favour tricks.',add:['feint','smokescr'],drop:['swivel','cutlass','hold','pistols'],rank:4},
};
const ROLES={qm:{n:'Quartermaster',i:'📜'},bosun:{n:'Bosun',i:'🔨'},gunner:{n:'Master Gunner',i:'💣'},nav:{n:'Navigator',i:'🧭'},surg:{n:'Surgeon',i:'🩺',rank:3},bm:{n:'Boarding Master',i:'⚔️',rank:3}};
const OFFICERS={
 jennings:{n:'Henry Jennings',role:'qm',img:'img/art/officer-quartermaster.webp',card:'fairshares',passive:'+15% silver from fights.',cost:60},
 purser:{n:'A hard-bargaining purser',role:'qm',img:'img/art/officer-quartermaster.webp',card:'ledger',passive:'Ports sell 15% cheaper.',cost:45},
 pruitt:{n:'Tom Pruitt',role:'bosun',img:'img/art/officer-bosun.webp',card:'allhands',passive:'Careening repairs +50%.',cost:50},
 shea:{n:'Barty Shea',role:'bosun',img:'img/art/officer-bosun.webp',card:'splice',passive:'+10 max hull.',cost:50},
 hands:{n:'Israel Hands',role:'gunner',img:'img/art/officer-gunner.webp',card:'doubleshot',passive:'First cannon card each fight costs 0 energy.',cost:65},
 hatch:{n:'Abel Hatch',role:'gunner',img:'img/art/officer-gunner.webp',card:'hotshot',passive:'Cannon cards +2 damage.',cost:55},
 penhallow:{n:'Matthias Penhallow',role:'nav',img:'img/art/officer-navigator.webp',card:'readwind',passive:'Rations are eaten only every other leg.',cost:55},
 pilot:{n:'A Spanish pilot',role:'nav',img:'img/art/officer-navigator.webp',card:'shoal',passive:'Fights start with the Weather Gauge more often.',cost:50},
 colley:{n:'Ned Colley, barber-surgeon',role:'surg',img:'img/art/officer-surgeon.webp',card:'fielddress',passive:'Restores 3 crew after every fight.',cost:55},
 physician:{n:'A captured ship\u2019s doctor',role:'surg',img:'img/art/officer-surgeon.webp',card:'tourniquet',passive:'Heals the captain 3 after every fight.',cost:55},
 reardon:{n:'Owen Reardon',role:'bm',img:'img/art/officer-boarding-master.webp',card:'grapplesaway',passive:'You start every boarding with +1 Advantage.',cost:60},
 mackey:{n:'Quint Mackey, ex-soldier',role:'bm',img:'img/art/officer-boarding-master.webp',card:'ambush',passive:'Your Crew cards kill 2 more.',cost:60},
};
const WEATHER={
 fair:{n:'Fair wind',d:'+1 card on turn 1.'},
 gauge:{n:'Weather Gauge (yours)',d:'Your first cannon card each turn +3 damage.'},
 enemygauge:{n:'Weather Gauge (theirs)',d:'Enemy broadsides +2.'},
 squall:{n:'Squall',d:'All cannon fire -2 damage (both sides).'},
};
/* Orders: one free captain's order per turn, each on a cooldown. */
const ORDERS={
 fire:{n:'Fire at will!',ph:['ship'],cd:4,i:'💥',d:'Your cannon cards deal +3 this turn.'},
 charge:{n:'Charge!',ph:['board','duel'],cd:3,i:'⚔️',d:'Gain 1 energy. Restore 3 crew (duel: gain 4 Block).'},
 hard:{n:'Hard to port!',ph:['ship'],cd:3,i:'⚓',d:'Gain 8 Block and shift the wind your way.'},
 litfuse:{n:'Lit Fuses',ph:['ship','board','duel'],cd:4,i:'🔥',d:'Blackbeard: enemy Weak 1, enemy crew -8%, gain 4 Block.',cap:'blackbeard'},
 fairshare:{n:'Fair Shares',ph:['ship','board','duel'],cd:4,i:'💰',d:'Bellamy: restore 6 crew, draw 2 and gain 1 energy.',cap:'bellamy'},
 noquarter:{n:'No Quarter!',ph:['ship','board','duel'],cd:4,i:'🏴‍☠️',d:'Vane: all damage +3 this turn; enemy Burn 4.',cap:'vane'},
 twinblades:{n:'Twin Blades',ph:['ship','board','duel'],cd:3,i:'⚔️',d:'Bonny & Read: deal 5 twice; gain 4 Block.',cap:'bonnyread'},
 getaway:{n:'Fast Getaway',ph:['ship','board','duel'],cd:4,i:'💨',d:'Rackham: gain 10 Block, draw 1, take the Weather Gauge at sea.',cap:'rackham'},
};
/* Enemies. L: 2-3 loadouts of ship intents [kind,value]; tr: traits. kinds: broad, grape, crit, brace, come. */
const ENEMIES={
 merchant:{n:'Armed Merchantman',hull:30,crew:16,img:'img/art/enemy-merchant.webp',loot:1.3,tr:[],L:[[['broad',5],['brace',6],['broad',4],['brace',4]],[['brace',5],['broad',6],['brace',5],['crit',4]]]},
 schooner:{n:'Fast Schooner',hull:26,crew:20,img:'img/art/enemy-merchant.webp',loot:1.1,tr:['runs'],run:5,L:[[['broad',5],['come',0],['broad',6],['brace',4]],[['crit',5],['broad',5],['come',0],['brace',5]]]},
 salvager:{n:'Wrecker Cutter',hull:34,crew:24,img:'img/art/enemy-pirate.webp',loot:.9,tr:[],L:[[['broad',6],['crit',5],['broad',5],['brace',4]],[['grape',6],['broad',6],['crit',5],['brace',4]]]},
 rival:{n:'Rival Pirate Sloop',hull:40,crew:34,img:'img/art/enemy-pirate.webp',loot:1,tr:[],L:[[['broad',7],['grape',6],['broad',5],['brace',5],['crit',5]],[['come',0],['broad',8],['broad',6],['brace',5]],[['grape',7],['grape',6],['broad',7],['brace',4]]]},
 corsair:{n:'Corsair Raider',hull:38,crew:40,img:'img/art/enemy-pirate.webp',loot:1.2,tr:['grapple'],gr:4,L:[[['broad',6],['grape',6],['broad',5],['grape',5]],[['crit',6],['broad',6],['grape',6],['broad',5]]]},
 privateer:{n:'Privateer Brig',hull:50,crew:38,img:'img/art/enemy-hunter.webp',loot:1.1,tr:[],L:[[['broad',8],['brace',6],['crit',6],['broad',6],['grape',6]],[['broad',7],['come',0],['broad',9],['brace',6]],[['crit',7],['grape',6],['brace',7],['broad',8]]]},
 galleon:{n:'Treasure Galleon',hull:70,crew:36,img:'img/art/enemy-galleon.webp',loot:2.2,tr:['plated'],L:[[['broad',6],['brace',8],['grape',5],['brace',6],['broad',7]],[['brace',7],['broad',8],['brace',6],['grape',6],['broad',6]]]},
 brulot:{n:'Fire Ship',hull:36,crew:14,img:'img/art/enemy-flagship.webp',loot:.8,tr:['fire'],L:[[['broad',5],['brace',4],['broad',6],['broad',5]],[['crit',5],['broad',5],['brace',4],['broad',6]]]},
 guarda:{n:'Spanish Guarda Costa',hull:60,crew:50,img:'img/art/enemy-navy.webp',loot:1.3,tr:[],L:[[['broad',9],['grape',8],['crit',7],['brace',7]],[['come',0],['broad',10],['grape',8],['brace',7]],[['crit',8],['broad',9],['brace',8],['grape',8]]]},
 cutter:{n:'Navy Revenue Cutter',hull:46,crew:34,img:'img/art/enemy-navy.webp',loot:1,tr:['runs'],run:6,L:[[['crit',7],['broad',7],['crit',6],['brace',5]],[['come',0],['crit',7],['broad',8],['brace',5]]]},
 hunter:{n:'Pardoned Pirate-Hunter',hull:70,crew:58,img:'img/art/enemy-hunter.webp',loot:1.4,tr:[],L:[[['broad',10],['crit',8],['grape',9],['brace',8],['broad',9]],[['grape',10],['broad',10],['come',0],['crit',8],['brace',8]]]},
 /* elites */
 patrol:{n:'Navy Patrol Frigate',hull:68,crew:55,img:'img/art/enemy-navy.webp',loot:1.6,elite:1,tr:[],L:[[['broad',11],['crit',7],['grape',8],['brace',8],['broad',9],['crit',8]],[['broad',10],['brace',9],['broad',12],['grape',8],['crit',8]]]},
 rover:{n:'Black Jack\u2019s Rover',hull:62,crew:62,img:'img/art/enemy-pirate.webp',loot:1.7,elite:1,tr:['grapple'],gr:3,L:[[['broad',9],['grape',9],['crit',7],['broad',9],['grape',8]],[['crit',8],['broad',10],['grape',9],['broad',8]]]},
 capitana:{n:'Guarda Costa Capitana',hull:78,crew:60,img:'img/art/enemy-navy.webp',loot:1.8,elite:1,tr:['plated'],L:[[['broad',11],['grape',9],['brace',9],['crit',8],['broad',9]],[['brace',9],['broad',12],['grape',9],['crit',8],['broad',10]]]},
 plate:{n:'Plate Fleet Flagship',hull:88,crew:56,img:'img/art/enemy-flagship.webp',loot:2.4,elite:1,tr:['plated'],L:[[['broad',10],['grape',8],['brace',10],['broad',12],['brace',8]],[['brace',10],['broad',11],['grape',9],['broad',11],['crit',8]]]},
 warship:{n:'Royal Navy Warship',hull:82,crew:62,img:'img/art/enemy-navy.webp',loot:2,elite:1,tr:[],L:[[['broad',12],['crit',8],['grape',10],['brace',9],['broad',10],['crit',9]],[['grape',11],['broad',12],['brace',9],['crit',9],['broad',11]]]},
 vengeance:{n:'Hunter\u2019s Man-of-War',hull:86,crew:64,img:'img/art/enemy-hunter.webp',loot:2.2,elite:1,tr:['plated','grapple'],gr:5,L:[[['broad',11],['brace',9],['grape',10],['broad',12],['crit',9]],[['crit',9],['broad',12],['grape',10],['brace',10],['broad',11]]]},
 /* bosses */
 sqA:{n:"Squadron Sloop 'Escort'",hull:40,crew:30,img:'img/art/enemy-pirate.webp',loot:.6,tr:[],L:[[['broad',8],['brace',6],['crit',6],['broad',7]]]},
 sqB:{n:"Squadron Frigate (flagship)",hull:70,crew:60,img:'img/art/enemy-flagship.webp',loot:2,tr:[],L:[[['broad',11],['crit',8],['grape',9],['grape',9],['brace',8],['broad',13]]]},
 fort:{n:'Guarda Costa Stockade',hull:0,crew:58,img:'img/art/event-port.webp',loot:2,tr:[]},
 horn:{n:"Hornigold's Ranger",hull:75,crew:55,img:'img/art/enemy-hunter.webp',loot:3,tr:[],L:[[['broad',10],['crit',7],['grape',9],['brace',8],['grape',9],['broad',12]]]},
};
const BOSSK=['sqA','sqB','fort','horn'];
const TRAITS={plated:['🛡️','Ironbound hull','Every hit on its hull is reduced by 2. Mortar Shells and Burn ignore it.'],fire:['🔥','Fire ship','Rams for 14 when its hull falls to 30% or below, then sinks. Sink it from range, or take the Weather Gauge.'],runs:['💨','Runs','Flees at the end of turn 5. No loot if it escapes.'],grapple:['🪝','Boarder','Grapples you after a few turns and forces a boarding fight (you start 1 Advantage down).']};
const ACTS={
 1:{n:'Act I: The Flying Gang',rows:7,pool:['merchant','merchant','rival','privateer','salvager','schooner','corsair'],elites:['patrol','rover'],scale:1,boss:'Pirate-Hunter Squadron',trophy:{id:'pennant',n:"Commodore's Pennant",d:'+8 max hull for the rest of the run.'}},
 2:{n:'Act II: The Treasure Coast',rows:6,pool:['privateer','guarda','rival','galleon','salvager','brulot','schooner'],elites:['capitana','plate'],scale:1.3,boss:'Guarda Costa Stockade (crew assault)',trophy:{id:'letter',n:'Letter of Marque (forged)',d:'Ports sell 15% cheaper.'}},
 3:{n:'Act III: The Hunter',rows:6,pool:['hunter','guarda','cutter','privateer','galleon','brulot','corsair'],elites:['warship','vengeance'],scale:1.55,boss:'Benjamin Hornigold',trophy:{id:'spyglass',n:"Hornigold's Spyglass",d:'+1 card on the first turn of every fight.'}},
};
const COLS=4;
const NODEI={fight:'⚔️',elite:'☠️',event:'❓',port:'⚓',shipwright:'🛠️',recruit:'👤',cove:'🏝️',treasure:'🧰',boss:'👑',smuggler:'🕯️',wreck:'🦴',storm:'🌩️'};
const NODEN={fight:'Ship battle',elite:'Elite warship',event:'Event',port:'Port market',shipwright:'Shipwright',recruit:'Recruit',cove:'Careening cove',treasure:'Treasure',boss:'Act boss',smuggler:'Smuggler\u2019s cove',wreck:'Derelict wreck',storm:'Storm front'};
const NODED={fight:'A ship under sail. Fight her for silver and a card.',elite:'A warship. Hard, but the best spoils: two card picks.',event:'Something unexpected. Choices, not dice.',port:'Buy cards, supplies, repairs; dismiss a card.',shipwright:'Upgrade your ship or trade up.',recruit:'Hire an officer or hands.',cove:'Rest: careen the ship OR heal the captain OR upgrade a card.',treasure:'A buried cache: free silver.',boss:'The act boss.',smuggler:'Black market: rare cards cheap, quiet dismissals.',wreck:'A drifting wreck. A gamble with a prize.',storm:'A squall battle: guns weaken, loot +50%.'};
/* Notoriety: opt-in difficulty ladder unlocked by winning */
const NOT=[{n:'Quiet waters',d:'The standard voyage.'},{n:'Hunted',d:'Elite warships appear more often.'},{n:'Hardened crews',d:'Enemy crews are 15% larger.'},{n:'Gouging merchants',d:'Port prices +20%.'},{n:'Heavy guns',d:'Enemy hulls are 15% stronger.'},{n:"Admiral's revenge",d:'Bosses are 20% stronger.'}];
const NOTMAX=5;
/* Renown and ranks: banked on every ending. */
const RANKS=[
 {t:'Landlubber',at:0,u:'The basics.'},
 {t:'Deckhand',at:30,u:'New cards: Bar Shot, Fearsome Reputation, Dirty Fighting.'},
 {t:'Powder Monkey',at:80,u:'Seamanship doctrine. New cards: Ripple Fire, Press the Attack, Hidden Blade.'},
 {t:'Gunner\u2019s Mate',at:150,u:'Surgeons and Boarding Masters can be hired. New cards: Blood Rage, Smoke Screen, Fog Bank.'},
 {t:'Quartermaster',at:250,u:'Cunning doctrine. New cards: Mortar Shell, Sharpshooters, Fire Pots.'},
 {t:'First Mate',at:380,u:'New cards: False Colours, Pickpocket, Rig for Speed.'},
 {t:'Master and Commander',at:540,u:'New cards: Powder Monkey, Rousing Speech, Steel Nerve, Spread Rumours.'},
 {t:'Pirate Captain',at:720,u:'Begin every voyage with +25 silver.'},
 {t:'Pirate Lord',at:950,u:'Begin every voyage with +25 more silver. The Flying Gang knows your name.'},
];
const RANKCARDS=r=>Object.keys(POOLR).filter(k=>POOLR[k]===r);
const BUILD={
 shipyard:{n:'Shipyard',d:['Start with +1 Sheathing on your sloop.','Start with +1 Sheathing and +1 Guns.'],cost:[150,400]},
 powder:{n:'Powder House',d:['Start with +3 gunpowder.','Start with +6 gunpowder.'],cost:[120,300]},
 tavern:{n:'Harbour Tavern',d:['Start with +6 crew and +2 rations.','Start with +12 crew and +4 rations.'],cost:[120,300]},
 market:{n:'Market',d:['One extra card in every port and reward offer.','Ports also sell one upgraded card.'],cost:[200,450]},
 infirm:{n:'Infirmary',d:['Heal the captain 2 after every fight.','Heal the captain 4 after every fight.'],cost:[180,420]},
};
