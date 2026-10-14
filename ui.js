"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/'/g,"\\'");
function cardHTML(k,attrs='',extra=''){const cd=CARDS[k];const tagn={S:'Ship',C:'Crew',K:'Captain'}[cd.tag];
 return `<div class="card tag${cd.tag} ${extra}" ${attrs}><div class="cost">${S&&S.combat?cost(k):cd.c}</div><div class="tg">${tagn}${cd.pw?' · 💥'+cd.pw:''}</div><div class="nm">${cd.n}</div><div class="ds">${cd.d}</div></div>`}
function bar(v,m,cls){return `<div class="hpbar ${cls||''}"><i style="width:${clamp(v/m*100,0,100)}%"></i></div>`}
function hud(){const cp=CAPTAINS[S.cap];const offs=Object.keys(ROLES).map(r=>{const o=S.officers[r];return `<span class="chip ${o?(o.injured?'inj':''):'empty'}" title="${ROLES[r].n}">${ROLES[r].i} ${o?OFFICERS[o.id].n.split(' ').slice(-1)[0]+(o.injured?' 🤕':''):'—'}</span>`}).join('');
 return `<button class="menubtn" id="menu" onclick="showMenu()">☰</button>
 <div class="hud"><div class="row"><img class="portrait sm" src="${cp.img}"><div style="flex:1">
 <b>${cp.short}</b> ❤️ ${S.hp}/${S.maxHp} ${bar(S.hp,S.maxHp)}
 ⛵ ${ship().n} hull ${S.ship.hull}/${hullMax()} ${bar(S.ship.hull,hullMax(),'hull')}
 👥 Crew ${S.crew}/${crewMax()} · morale ${S.morale} ${bar(S.morale,100,'mor')}</div></div>
 <div class="cargo">🪙 <b>${S.coin}</b> coin · 📦 ${holdUsed()}/${holdMax()} · ${Object.keys(CARGO).map(k=>`<span title="${CARGO[k].n}">${CARGO[k].i}${S.cargo[k]}</span>`).join(' ')} ${S.cargo.rum>0&&!S.combat?`<button class="mini" onclick="drinkRum()">🍾 +15 morale</button>`:''}</div>
 <div class="offs">${offs}</div></div>`}
function render(){const a=$('app');let h='',foot='';
 if(!S||S.screen==='title'){renderTitle();return}
 if(S.screen==='capselect'){renderCapSelect();return}
 if(S.screen==='logbook'){renderLogbook();return}
 if(S.screen==='nassau'){renderNassau();return}
 if(S.screen==='end'){renderEnd();return}
 h=hud();
 const sc=S.screen;
 if(sc==='map'){h+=`<h2>${ACTS[S.act].n} <span class="small">· leg ${S.row+1}/${S.map.length}</span></h2>${S.msg?`<p class="msg">${S.msg}</p>`:''}<div class="map">`;
  for(let r=S.map.length-1;r>=0;r--){h+='<div class="maprow">';S.map[r].forEach((n,c)=>{if(n.t==='empty'){h+='<div class="node empty"></div>';return}
   const av=avail(r,c),cur=r===S.row&&c===S.col;const ic=n.t==='recruit'?ROLES[n.role].i:(n.t==='wreck'&&S.cargo.maps>0?'🗺️':NODEI[n.t]);
   h+=`<div class="node ${av?'avail':''} ${n.done?'done':''} ${cur?'cur':''}" data-r="${r}" data-c="${c}" title="${NODEN[n.t]}${n.role?': '+ROLES[n.role].n:''}" onclick="go(${r},${c})">${ic}</div>`});h+='</div>'}
  h+=`</div><p class="small">⚔️ battle · ☠️ elite · ❓ event · ⚓ port · 💰 fence · 🛠️ shipwright · 📜🔨💣🧭 recruit (role) · 🍺 tavern · 🏝️ cove · 🧰 treasure · 🌫️ needs a chart · 👑 boss. Each leg uses 1 🍖 + 1 💧.</p>`;
  foot=`<button onclick="showDeck()">Deck (${S.deck.length})</button><button onclick="if(confirm('Abandon this run? It counts as a death.'))endRun('death')">Abandon run</button>`}
 else if(sc==='combat')h+=combatHTML(),foot=combatFoot();
 else if(sc==='reward'){const r=S.reward;h+=`<h2>Spoils</h2><p class="msg">${r.msg}</p>${r.note?`<p>${r.note}</p>`:''}`;
  if(r.paths){h+=`<p><b>Choose one reward${r.picks>1?` (${r.picks} picks left)`:''}:</b></p><h3>🃏 A card</h3><div class="cards">${r.cards.map(k=>cardHTML(k,`onclick="takeCard('${k}')"`,'rw')).join('')}</div>
   <div class="choices"><button id="rwShip" onclick="takeShipUp()">⛵ Ship: free upgrade level</button><button id="rwCrew" onclick="takeCrewUp()">👥 Crew: +8 hands, +10 morale</button><button id="rwCap" onclick="takeCaptainUp()">❤️ Captain: +4 max HP, heal 10</button></div>`}
  else if(r.cards){h+=`<h3>Pick a card (or skip)</h3><div class="cards">${r.cards.map(k=>cardHTML(k,`onclick="takeCard('${k}')"`,'rw')).join('')}</div>`}
  foot=`<button id="skip" onclick="rewardDone()">Skip</button>`}
 else if(sc==='prize'){const r=S.reward;h+=`<h2>After the battle</h2>`;
  if(r.prize)h+=`<div class="panel"><h3>Prize ship: ${SHIPS[r.prize].n}</h3><p>${SHIPS[r.prize].perk} Hull ${SHIPS[r.prize].hull}, crew ${SHIPS[r.prize].crew}, hold ${SHIPS[r.prize].hold}, guns ${SHIPS[r.prize].guns}. She is badly damaged (45% hull). Your current ship and her upgrades are left behind.</p><button id="takePrize" onclick="takePrize()">Take her as your ship</button><button onclick="skipPrize()">Scuttle her</button></div>`;
  if(r.officer){const o=OFFICERS[r.officer];h+=`<div class="panel"><h3>A prisoner offers to join: ${o.n}</h3><p>${ROLES[o.role].n}. Passive: ${o.passive}</p><div class="cards">${cardHTML(o.card)}</div><button onclick="hireOfficer('${r.officer}',0);S.reward.officer=null;render()">Sign on (free)</button><button onclick="S.reward.officer=null;render()">Put ashore</button></div>`}
  if(!r.prize&&!r.officer)foot=`<button id="leave" onclick="S.reward=null;S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='port'){if(!S.shop)S.shop={cards:rollCards(4).map(k=>({k,p:45+rnd(40)})),removedHere:0};const sh=S.shop;const sale=0;
  h+=`<h2>⚓ Port market</h2><h3>Supplies</h3><div class="choices">${Object.keys(PRICE).map(k=>`<button onclick="buy('${k}',${k==='powder'?2:2})">${CARGO[k].i} +2 ${CARGO[k].n} (${PRICE[k]*2})</button>`).join('')}</div>
  <h3>Cards</h3><div class="cards">${sh.cards.map((it,i)=>it.sold?'':`<div class="cardwrap">${cardHTML(it.k,`onclick="buyCard(${i})"`,S.coin<it.p?'dim':'')}<div class="price">${it.p} coin</div></div>`).join('')}</div>
  <h3>Remove a card</h3><button onclick="S.screen='remove';render()" ${S.shop.removedHere||S.coin<50+25*S.removed?'disabled':''}>Remove a card (${50+25*S.removed} coin, once per visit)</button>`;foot=`<button id="leave" onclick="S.shop=null;S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='remove'){h+=`<h2>Remove which card?</h2><div class="cards">${S.deck.map((k,i)=>cardHTML(k,`onclick="removeCard(${i})"`)).join('')}</div>`;foot=`<button onclick="S.screen='port';render()">Back</button>`}
 else if(sc==='fence'){const p=Math.round(12*(off('purser')?1.3:1)*(S.trophies.includes('letter')?1.3:1));h+=`<h2>💰 The Fence</h2><p>No questions asked. Silver and plunder sell for ${p} coin each. Paying shares lifts morale.</p><button id="sell" onclick="sellSilver()" ${S.cargo.silver?'':'disabled'}>Sell ${S.cargo.silver} silver (+${S.cargo.silver*p})</button><button onclick="sellMap()" ${S.cargo.maps?'':'disabled'}>Sell a chart (+25)</button>`;foot=`<button id="leave" onclick="S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='shipwright'){const sv=shipValue();const i=LADDER.indexOf(S.ship.type);
  h+=`<h2>🛠️ Shipwright</h2><p>${ship().n}: ${ship().perk} Trade-in value: <b>${sv}</b> coin (base × hull condition + 50% of upgrades).</p><h3>Upgrades</h3><div class="choices">${Object.keys(UPG).map(k=>{const l=S.ship.upg[k];return `<button onclick="upgradeShip('${k}')" ${l>=2||S.coin<UPG_COST[l]?'disabled':''}>${UPG[k].n} ${l}/2: ${UPG[k].d}${l<2?` (${UPG_COST[l]})`:''}</button>`}).join('')}</div>
  <button onclick="repairCoin()" ${S.ship.hull>=hullMax()?'disabled':''}>Repair hull (2 coin per point)</button>
  <h3>Ships for sale</h3><div class="choices">${LADDER.slice(i+1,i+3).map(t=>`<button onclick="buyShip('${t}')" ${S.coin<SHIPS[t].price-sv?'disabled':''}>${SHIPS[t].n}: hull ${SHIPS[t].hull}, crew ${SHIPS[t].crew}, hold ${SHIPS[t].hold}, guns ${SHIPS[t].guns}. ${SHIPS[t].perk} Price ${SHIPS[t].price} − trade-in ${sv} = <b>${Math.max(0,SHIPS[t].price-sv)}</b></button>`).join('')||'Nothing bigger for sale.'}</div>`;foot=`<button id="leave" onclick="S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='recruit'){const rc=S.recruit;h+=`<h2>${ROLES[rc.role].i} Recruiting: ${ROLES[rc.role].n}</h2>`;
  if(rc.offer){const o=OFFICERS[rc.offer],p=recruitCost(rc.offer);const cur=S.officers[o.role];h+=`<div class="panel row"><img class="portrait" src="${o.img}"><div><h3>${o.n}</h3><p>Passive: ${o.passive}</p>${cur?`<p class="small">Replaces ${OFFICERS[cur.id].n} (one officer per role).</p>`:''}</div></div><div class="cards">${cardHTML(o.card)}</div><button id="hire" onclick="if(hireOfficer('${rc.offer}',${p})){S.recruit.offer=null};save();render()" ${S.coin<p?'disabled':''}>Hire for ${p} coin</button>`}
  else h+=`<p>No officer worth hiring here today.</p>`;
  h+=`<h3>Hands</h3><button onclick="hireCrew(5,${S.cap==='bellamy'?2:3})">Hire 5 crew (${5*(S.cap==='bellamy'?2:3)} coin)</button>`;foot=`<button id="leave" onclick="S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='tavern'){h+=`<h2>🍺 Tavern</h2><img class="banner" src="img/nassau-day9.jpg"><div class="choices"><button id="heal" onclick="tavernHeal()" ${S.coin<20?'disabled':''}>Surgeon & a bed (20 coin): heal 30%, treat officers</button><button onclick="buy('rum',2)">Buy 2 rum (12)</button><button onclick="hireCrew(5,3)">Hire 5 crew (15)</button></div>
  <h3>🎲 Hazard (dice, just for fun)</h3><p class="small">Roll 2 dice against the house.</p><button onclick="dice(10)" ${S.coin<10?'disabled':''}>Bet 10</button><button onclick="dice(25)" ${S.coin<25?'disabled':''}>Bet 25</button>${S.diceMsg?`<p>${S.diceMsg}</p>`:''}`;foot=`<button id="leave" onclick="S.diceMsg='';S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='cove'){h+=`<h2>🏝️ Careening Cove</h2><p>Haul her over and scrape the hull. Each 🪵 timber + 🪢 rope pair repairs ${off('pruitt')?18:12} hull. Resting also treats injured officers and heals the captain 15%.</p>${S.msg?`<p class="msg">${S.msg}</p>`:''}<div class="choices"><button id="repair" onclick="repairCove();save();render()">Repair hull with timber & rope</button><button id="rest" onclick="coveRest();S.msg='';S.screen='map';save();render()">Rest & treat the wounded, then sail</button></div>`;foot=`<button id="leave" onclick="S.msg='';S.screen='map';save();render()">Set sail</button>`}
 else if(sc==='event'){const ev=EVENTS[S.ev];h+=`<h2>❓ ${ev.t}</h2><p>${ev.d}</p><div class="choices">${ev.o.map((o,i)=>`<button class="evopt" onclick="chooseEvent(${i})">${o[0]}</button>`).join('')}</div>`}
 else if(sc==='mutiny'){h+=`<h2>☠️ Mutiny!</h2><p>Morale has hit zero. The crew gathers at the mast.</p><div class="choices"><button class="evopt" onclick="resolveMutiny(0)" ${S.cargo.rum<2?'disabled':''}>Broach 2 casks of rum</button><button class="evopt" onclick="resolveMutiny(1)" ${S.coin<40?'disabled':''}>Pay extra shares (40 coin)</button><button class="evopt" onclick="resolveMutiny(2)">Stand firm (lose 25% crew and maybe an officer)</button></div>`}
 else if(sc==='abandon'){h+=`<h2>🔥 Abandon Ship!</h2><p>Your ship is lost. You escape in a periagua with what you could carry: half your cargo and coin, and the survivors. Her upgrades are gone, and an officer was hurt in the scramble.</p><p>The captain lives, so the voyage goes on. Rebuild at a shipwright or take a prize.</p>`;foot=`<button id="leave" onclick="S.screen='map';save();render()">Carry on</button>`}
 else if(sc==='extract'){const last=S.act===3;h+=`<h2>👑 Act boss defeated</h2><p class="msg">${S.reward.msg}</p>`;
  if(last){foot=`<button id="win" onclick="endRun('win')">Sail home victorious</button>`}
  else{h+=`<div class="panel"><h3>Take your plunder and sail home?</h3><p>Extract now: keep 75% of your plunder value (${payoutValue()}) as Banked Silver, and keep your trophies forever. Or sail on to ${ACTS[S.act+1].n}: a full win pays 125%, but death keeps only 25% and loses the trophies.</p></div>`;
   foot=`<button id="extract" onclick="endRun('extract')">⛵ Take your plunder and sail home</button><button id="sailon" onclick="nextAct()">Sail on</button>`}}
 a.innerHTML=h+(foot?`<div class="actions">${foot}</div>`:'')}
function combatHTML(){const c=C(),e=E(),it=intent();const ph=c.phase;
 const phaseN={ship:'Phase 1: Ship vs ship',board:'Phase 2: Boarding',duel:'Duel: captain alone'}[ph];
 let eStats=ph==='ship'?`Hull ${e.hull}/${e.hullMax} ${bar(e.hull,e.hullMax,'hull')} Crew ${e.crew}`:ph==='board'?`Crew ${e.crew}/${e.crewMax} ${bar(e.crew,e.crewMax)}`:`HP ${e.hp}/${e.hpMax} ${bar(e.hp,e.hpMax)}`;
 const loadout=ph==='ship'&&e.ints.length?`<div class="small">Loadout: guns ${e.gm>0?'heavy (+1)':e.gm<0?'light (−1)':'standard'} · ${e.ints.map(i=>({broad:'💥',grape:'🔫',crit:'🎯',evade:'🌀',load:'⬆️'})[i[0]]).join(' ')}</div>`:'';
 const canBoard=ph==='ship'&&e.hull<=e.hullMax*.5&&!(c.boss)&&!c.queue.length;
 return `<div class="phase">${phaseN} · <span title="${WEATHER[c.weather].d}">🌬️ ${WEATHER[c.weather].n}: ${WEATHER[c.weather].d}</span>${c.advT?` · Advantage ${c.advT>0?'+':''}${c.advT}`:''}</div>
 <div class="enemy"><div class="row"><img class="portrait" src="${e.img}"><div style="flex:1"><h3>${e.n}${c.queue.length?` <span class="small">(+${c.queue.length} more)</span>`:''}</h3>${eStats} ${e.block?`<span class="tag">🛡️${e.block}</span>`:''}${e.weak?`<span class="tag">Weak ${e.weak}</span>`:''}${e.burn?`<span class="tag">🔥${e.burn}</span>`:''}${e.str?`<span class="tag">⬆️${e.str}</span>`:''}${loadout}</div></div>
 <div class="intent" id="intent">Next: ${it.tx}</div></div>
 ${canBoard?`<div class="choices"><button id="board" class="gold" onclick="board()">⚓ Grapple & board (full loot, risk crew/officers/captain)</button><span class="small">or keep firing to sink her (safer, about 40% loot)</span></div>`:''}
 <div class="me">⚡ <b id="energy">${c.energy}</b> energy · ${ph==='ship'?'🌀 Evasion':'🛡️ Guard'} <b>${c.block}</b>${c.str?` · 💪${c.str}`:''} · Draw ${c.draw.length} · Discard ${c.disc.length} · 💥 ${S.cargo.powder}</div>
 <div class="cards" id="hand">${c.hand.map((k,i)=>{const ok=playable(k);return cardHTML(k,ok?`data-i="${i}" onclick="play(${i})"`:`data-i="${i}" onclick="swapCard(${i})"`,(ok?'':'off ')+(ok&&cost(k)>c.energy?'dim':''))}).join('')}</div>
 <p class="small">Greyed cards don't fit this phase. Tap one to swap it for a new draw (once per turn${c.swap?'':', used'}).</p>
 <div class="log">${c.log.join('<br>')}</div>`}
function combatFoot(){const c=C();let f=`<button id="endturn" onclick="endTurn()">End Turn ⏳</button>`;
 if(c.canFlee&&c.turn===1&&c.phase==='ship')f+=`<button onclick="flee()">Run before the wind</button>`;
 if(c.phase==='board'&&!c.boss)f+=`<button onclick="retreat()">Cut the grapples (retreat)</button>`;return f}
function renderTitle(){const run=loadRun();$('app').innerHTML=`<h1>Free Nassau</h1><h3 class="center">A Golden Age pirate deck builder · v2 rough draft</h3><img class="banner" src="img/ship.jpg">
 <p>Pick a real captain, sail out of Nassau with a sloop and a green crew, and fight your way through three acts to the pirate-hunter Benjamin Hornigold. Ship, crew and captain all take lasting damage. Only the captain's death ends the run.</p>
 <div class="choices center">${run&&run.screen!=='end'?'<button id="cont" onclick="S=loadRun();render()">Continue voyage</button>':''}<button id="new" onclick="S={screen:'capselect'};render()">New voyage</button><button id="logbook" onclick="S={screen:'logbook'};render()">📖 Logbook</button><button id="nassau" onclick="S={screen:'nassau'};render()">🏘️ Nassau</button></div><p class="small center">Banked Silver: ${M.banked}</p>`}
function renderCapSelect(){$('app').innerHTML=`<h2>Choose your captain</h2>${Object.keys(CAPTAINS).map(k=>{const c=CAPTAINS[k];const locked=c.unlock&&!M.unlocked[k];return `<div class="panel row ${locked?'dimmed':''}"><img class="portrait" src="${c.img}"><div style="flex:1"><h3>${c.n}</h3><p><b>${c.id}</b> ${c.passive} HP ${c.hp}, crew ${c.crew}.</p><p class="small">Deck: ${c.deck.map(d=>CARDS[d].n).join(', ')}</p>${locked?'<p class="small">🔒 Unlock by extracting or winning once.</p>':`<button class="capbtn" id="cap-${k}" onclick="newRun('${k}')">Sail as ${c.short}</button>`}</div></div>`}).join('')}<div class="actions"><button onclick="S=null;render()">Back</button></div>`}
function renderLogbook(){const caps=Object.keys(M.byCaptain).map(k=>`<li>${CAPTAINS[k].short}: ${M.byCaptain[k].wins} wins / ${M.byCaptain[k].runs} runs</li>`).join('');
 $('app').innerHTML=`<h2>📖 Logbook</h2><ul><li>Runs: ${M.runs} · Wins: ${M.wins} · Extractions: ${M.extracts} · Deaths: ${M.deaths}</li><li>Furthest act: ${M.bestAct}</li><li>Ships sunk: ${M.sunk} · Ships boarded: ${M.boarded}</li><li>Silver plundered: ${M.plunder} · Banked Silver: ${M.banked}</li>${caps}</ul><h3>🏆 Trophy room</h3><p>${M.trophies.length?M.trophies.map(t=>Object.values(ACTS).find(a=>a.trophy.id===t).trophy.n).join(', '):'No trophies yet. Beat an act boss and get home alive.'}</p><div class="actions"><button onclick="S=null;render()">Back</button></div>`}
function renderNassau(){$('app').innerHTML=`<h2>🏘️ Nassau</h2><img class="banner" src="img/nassau-day9.jpg"><p>Banked Silver: <b>${M.banked}</b>. Buildings give small head starts, not raw power.</p>${Object.keys(BUILD).map(k=>{const b=BUILD[k],l=M.buildings[k];return `<div class="panel"><h3>${b.n} (level ${l}/2)</h3>${l?`<p>Now: ${b.d[l-1]}</p>`:''}${l<2?`<p>Next: ${b.d[l]}</p><button onclick="buildUp('${k}')" ${M.banked<b.cost[l]?'disabled':''}>Build (${b.cost[l]} Banked Silver)</button>`:'<p>Fully built.</p>'}</div>`}).join('')}<div class="actions"><button onclick="S=null;render()">Back</button></div>`}
function buildUp(k){const l=M.buildings[k];if(l>=2||M.banked<BUILD[k].cost[l])return;M.banked-=BUILD[k].cost[l];M.buildings[k]++;saveMeta();renderNassau()}
function renderEnd(){const e=S.end;const t={death:'☠️ The captain is dead',extract:'⛵ Home with the plunder',win:'🏆 Victory over Hornigold!'}[e.kind];
 $('app').innerHTML=`<h1>${t}</h1><img class="banner" src="img/${e.kind==='death'?'ship':'nassau-day9'}.jpg"><p class="center">${CAPTAINS[S.cap].n} reached ${ACTS[e.act].n}.</p><p class="center">Banked Silver earned: <b>${e.banked}</b> (${e.kind==='death'?'25%':e.kind==='extract'?'75%':'125%'} of plunder value).${e.trophies.length?' Trophies kept: '+e.trophies.length:''}</p>${S.unlockMsg?`<p class="center msg">${S.unlockMsg}</p>`:''}<div class="actions"><button id="again" onclick="S=null;localStorage.removeItem(RUNKEY);render()">Back to Nassau</button></div>`}
function showDeck(){$('app').innerHTML=hud()+`<h2>Deck</h2><p class="small">Plus officer cards: ${officerCards().map(k=>CARDS[k].n).join(', ')||'none'}.</p><div class="cards">${S.deck.slice().sort().map(k=>cardHTML(k)).join('')}</div><div class="actions"><button onclick="render()">Back</button></div>`}
function showMenu(){$('modal').innerHTML=`<div class="modal" id="legend" onclick="if(event.target===this)$('modal').innerHTML=''"><div class="box"><h2>☰ Rules</h2><dl>
<dt>Three health tracks</dt><dd>⛵ Hull, 👥 Crew (number + morale) and ❤️ Captain HP. All carry over between fights; nothing tops off by itself. Only the captain's death ends the run.</dd>
<dt>Ship battles</dt><dd>Phase 1 is ship vs ship: play Ship and Captain cards. When the enemy hull is at 50% or less you may Grapple & board (full loot, prize ship, prisoners) or keep firing to sink her (safer, about 40% loot). Bosses are scripted.</dd>
<dt>Phase 1 shapes phase 2</dt><dd>Enemy hull ≤50%: their crew starts −15% (≤25%: −30%). Grapeshot thins their crew. Your hull damage kills your crew (about 1 per 4 damage), and aimed shots can injure officers. Advantage (max 3) adds cards on boarding turn 1; Disadvantage costs energy.</dd>
<dt>Boarding</dt><dd>Crew and Captain cards. Your crew also fights on its own each turn (crew ÷ 7). Low morale (&lt;25) weakens it. With no crew left, blows land on the captain.</dd>
<dt>Card tags</dt><dd>Ship (phase 1), Crew (boarding), Captain (any phase). Tap a greyed card to swap it for a new draw, once per turn.</dd>
<dt>Evasion / Guard / Block</dt><dd>Absorbs incoming damage this turn.</dd>
<dt>Weak</dt><dd>Deals 25% less. Counts down each turn.</dd>
<dt>Burn 🔥</dt><dd>Enemy loses that much hull each turn (it fades by 1).</dd>
<dt>Exhaust</dt><dd>Removed for the rest of the fight.</dd>
<dt>Weather</dt><dd>Shown before you fight: fair wind, weather gauge (yours or theirs), squall, calm, fog.</dd>
<dt>Cargo</dt><dd>💥 fuels cannon cards (none = half damage). 🪵+🪢 repair hull at coves. 🍖+💧: 1 each per leg; shortage hurts morale and crew. 🍾 rum: +15 morale. 🪙 silver: sell at a Fence; it counts toward Banked Silver. 🗺️ charts open 🌫️ wrecks. The hold has a limit.</dd>
<dt>Officers</dt><dd>One per role (Quartermaster, Bosun, Master Gunner, Navigator). Hire at Recruit nodes or through events. Each adds a signature card and a passive. Injured officers lose both until treated at a tavern or cove. They never die.</dd>
<dt>Abandon Ship</dt><dd>Hull 0: you lose the ship and her upgrades, half your cargo and coin, and 40% of your crew, and an officer is hurt. You go on in a periagua.</dd>
<dt>Extraction</dt><dd>After an act boss: "Take your plunder and sail home" banks 75%. A full win banks 125%; death banks 25%. Boss trophies are kept only if you get home.</dd>
</dl><div class="center"><button onclick="$('modal').innerHTML=''">Close</button></div></div></div>`}
loadMeta();render();
