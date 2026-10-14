"use strict";
/* v2.4 card redesign: descriptive text + refined parchment cards, inspect view, fanned hand. Presentation only. */
const KW={Evasion:['🌀','Absorbs hull damage this turn.'],Guard:['🛡️','Absorbs boarding damage this turn.'],Block:['🛡️','Absorbs damage this turn, in any phase.'],Weak:['😵','Deals 25% less damage; counts down each turn.'],
 Burns:['🔥','Loses that much hull each turn; fades by 1.'],Advantage:['⭐','Extra cards when you board (max 3).'],Strength:['💪','Adds to all your damage.'],Exhaust:['✖','Removed for the rest of the fight.']};
const kw=w=>`<span class="kw" data-kw="${w}">${KW[w][0]}${w}</span>`;
const GN=()=>{try{return ship().guns+S.ship.upg.guns}catch(e){return 0}};
const CT={
 broadside:()=>`<b>${6+2*GN()}</b> damage to the hull.`,
 swivel:()=>`<b>${3+GN()}</b> hull damage. No powder.`,
 chain:()=>`<b>${4+GN()}</b> damage. Enemy is ${kw('Weak')} 2.`,
 grape:()=>`<b>${2+GN()}</b> hull damage and kill <b>6</b> enemy crew.`,
 raking:()=>`<b>${4+2*GN()}</b> damage. No ${kw('Evasion')}? +6 and 1 ${kw('Advantage')}.`,
 tack:()=>`Gain <b>7</b> ${kw('Evasion')}.`,crowd:()=>`Gain <b>4</b> ${kw('Evasion')}. Draw 1.`,weather:()=>`Gain <b>3</b> ${kw('Evasion')} and 1 ${kw('Advantage')}.`,
 fireship:()=>`Enemy ${kw('Burns')} for <b>5</b> each turn.`,
 cutlass:()=>`Boarders kill <b>6</b> enemy crew.`,pistols:()=>`Kill <b>4</b> enemy crew. Enemy is ${kw('Weak')} 1.`,axes:()=>`Kill <b>13</b> enemy crew.`,
 hold:()=>`Gain <b>6</b> ${kw('Guard')}.`,rally:()=>`Gain <b>4</b> ${kw('Guard')}. +5 morale.`,grenades:()=>`Kill <b>9</b> enemy crew.`,
 fear:()=>`Enemy crew −10% and ${kw('Weak')} 2.`,command:()=>`Draw 2 cards.`,parry:()=>`Gain <b>7</b> ${kw('Block')}, in any phase.`,pistolshot:()=>`Deal <b>6</b> to the current target.`,
 resolve:()=>`Gain 1 energy and draw 1.`,smoke:()=>`Gain <b>5</b> ${kw('Block')}. Enemy is ${kw('Weak')} 2.`,shares:()=>`+8 morale and draw 1.`,
 defiance:()=>`+2 ${kw('Strength')} this fight.`,twin:()=>`Strike twice for <b>4</b> each.`,getaway:()=>`Gain <b>8</b> ${kw('Block')} and draw 1.`,
 fairshares:()=>`+12 morale and gain <b>5</b> ${kw('Guard')}.`,ledger:()=>`Draw 2 cards.`,allhands:()=>`Repair 6 hull. Gain 4 ${kw('Evasion')}.`,
 splice:()=>`Gain <b>5</b> ${kw('Evasion')}.`,doubleshot:()=>`<b>${10+3*GN()}</b> damage.`,hotshot:()=>`<b>${5+GN()}</b> damage. Enemy ${kw('Burns')} 3.`,
 readwind:()=>`Weather Gauge is yours. Draw 1.`,shoal:()=>`Gain <b>11</b> ${kw('Evasion')}.`};
const CI={broadside:'💥',swivel:'🔫',chain:'⛓️',grape:'🔫',raking:'🎯',tack:'⛵',crowd:'⛵',weather:'🌬️',fireship:'🔥',cutlass:'⚔️',pistols:'🔫',axes:'🪓',hold:'🛡️',rally:'📣',grenades:'💣',fear:'💀',
 command:'📜',parry:'🗡️',pistolshot:'🔫',resolve:'⚓',smoke:'🌫️',shares:'💰',defiance:'🏴‍☠️',twin:'⚔️',getaway:'💨',fairshares:'🪙',ledger:'📒',allhands:'🔧',splice:'🪢',doubleshot:'💥',hotshot:'🔥',readwind:'🧭',shoal:'🌊'};
const TAGN={S:'Ship',C:'Crew',K:'Captain'};
cardHTML=function(k,attrs='',extra=''){const cd=CARDS[k];const cv=S&&S.combat?cost(k):cd.c;const txt=(CT[k]?CT[k]():iconize(cd.d));
 if(/data-i="(\d+)"/.test(attrs)){const i=attrs.match(/data-i="(\d+)"/)[1];attrs=`data-i="${i}" onclick="inspectHand(${i})"`}
 return `<div class="card tag${cd.tag} ${extra}" ${attrs} data-k="${k}"><div class="chead"><span class="cost">${cv}</span><span class="ctype">${TAGN[cd.tag]}</span><span class="ctag">${TAGI[cd.tag]}</span></div>
 <div class="nm">${cd.n}</div><div class="vig"><span>${CI[k]||'⚓'}</span></div><div class="rule"></div><div class="ds">${txt}</div>
 <div class="cfoot">${cd.pw?`<span title="Gunpowder">${'💥'.repeat(cd.pw)}</span>`:''}${cd.x?`<span class="xh">${kw('Exhaust')}</span>`:''}</div></div>`};
/* inspect view */
function glossary(k){const cd=CARDS[k];const txt=(CT[k]?CT[k]():'')+(cd.x?' Exhaust':'')+(cd.d||'');const found=Object.keys(KW).filter(w=>new RegExp(w).test(txt));
 const extra=[];if(cd.pw)extra.push(['💥 Powder',`Uses ${cd.pw} gunpowder; with none the shot deals half damage.`]);
 return found.map(w=>[KW[w][0]+' '+w,KW[w][1]]).concat(extra).map(([a,b])=>`<div><b>${a}</b> ${b}</div>`).join('')}
function openInspect(k,btns){const m=$('modal');m.innerHTML=`<div class="modal inspect" onclick="if(event.target===this)closeInspect()"><div class="ibox">${cardHTML(k,'','big')}<div class="gloss">${glossary(k)}</div><div class="ibtns">${btns}</div></div></div>`}
function closeInspect(){$('modal').innerHTML=''}
function inspectHand(i){const c=C();if(!c)return;const k=c.hand[i];if(!k)return;const ok=playable(k),aff=cost(k)<=c.energy;let b='';
 if(ok&&aff)b+=`<button class="gold" id="insPlay" onclick="closeInspect();play(${i})">Play</button>`;
 else if(ok)b+=`<button disabled>Not enough energy</button>`;
 else b+=c.swap?`<button id="insSwap" onclick="closeInspect();swapCard(${i})">Swap for a new card</button>`:`<button disabled>Wrong phase (swap used)</button>`;
 b+=`<button onclick="closeInspect()">Close</button>`;openInspect(k,b)}
/* long-press / tap on non-hand cards */
let lpT=null,lpFired=false;
document.addEventListener('pointerdown',e=>{const el=e.target.closest('.card');if(!el||el.closest('#modal'))return;lpFired=false;clearTimeout(lpT);
 lpT=setTimeout(()=>{lpFired=true;if(el.closest('.hand'))inspectHand(+el.dataset.i);else openInspect(el.dataset.k,'<button onclick="closeInspect()">Close</button>')},450)},true);
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(lpT),true));
document.addEventListener('pointermove',e=>{if(Math.abs(e.movementX)+Math.abs(e.movementY)>8)clearTimeout(lpT)},true);
document.addEventListener('click',e=>{if(lpFired){lpFired=false;e.stopPropagation();e.preventDefault();return}
 const el=e.target.closest('.card');if(el&&!el.closest('#modal')&&!el.hasAttribute('onclick')&&el.dataset.k)openInspect(el.dataset.k,'<button onclick="closeInspect()">Close</button>')},true);
/* fan the hand */
const _r4=render;render=function(){_r4();const h=document.querySelector('#hand');if(!h)return;const cs=[...h.children],n=cs.length;
 const ov=n<=4?0:n===5?6:n===6?14:n===7?22:n===8?28:32;h.style.setProperty('--ov',ov+'px');h.classList.toggle('fan',n>=7);
 cs.forEach((c,i)=>{const m=(n-1)/2,d=i-m;const rot=n>=5?d*(n>=7?1.3:1.2):(i%2?1:-1);c.style.setProperty('--r',rot+'deg');c.style.setProperty('--dy',(n>=5?Math.abs(d)*Math.abs(d)*(n>=7?1.4:1):0)+'px')})};
render();
showDeck=function(){const a=$('app');a.dataset.screen='deck';
 a.innerHTML=hud()+`<div class="scr"><h2>Deck <span class="small">· tap a card to read it</span></h2><p class="small">Plus officer cards: ${officerCards().map(k=>CARDS[k].n).join(', ')||'none'}.</p><div class="cards">${S.deck.slice().sort().map(k=>cardHTML(k)).join('')}</div></div><div class="actions"><button onclick="render()">Back</button></div>`};
