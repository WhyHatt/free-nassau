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
 if(/data-i="(\d+)"/.test(attrs)){const i=attrs.match(/data-i="(\d+)"/)[1];attrs=`data-i="${i}" onclick="tapHand(${i})"`}
 else{const m=attrs.match(/onclick="([^"]*)"/);attrs=m?`data-act="${m[1]}" onclick="tapCard(this)"`:`onclick="tapCard(this)"`}
 return `<div class="card tag${cd.tag} ${extra}" ${attrs} data-k="${k}"><div class="chead"><span class="cost">${cv}</span><span class="ctype">${TAGN[cd.tag]}</span><span class="ctag">${TAGI[cd.tag]}</span></div>
 <div class="nm">${cd.n}</div><div class="vig"><span>${CI[k]||'⚓'}</span></div><div class="rule"></div><div class="ds">${txt}</div>
 <div class="cfoot">${cd.pw?`<span title="Gunpowder">${'💥'.repeat(cd.pw)}</span>`:''}${cd.x?`<span class="xh">${kw('Exhaust')}</span>`:''}</div></div>`};
/* inspect view */
function glossary(k){const cd=CARDS[k];const txt=(CT[k]?CT[k]():'')+(cd.x?' Exhaust':'')+(cd.d||'');const found=Object.keys(KW).filter(w=>new RegExp(w).test(txt));
 const extra=[];if(cd.pw)extra.push(['💥 Powder',`Uses ${cd.pw} gunpowder; with none the shot deals half damage.`]);
 return found.map(w=>[KW[w][0]+' '+w,KW[w][1]]).concat(extra).map(([a,b])=>`<div><b>${a}</b> ${b}</div>`).join('')}
/* ---- select, then confirm ---- */
let SEL=null;
const cardEls=()=>[...document.querySelectorAll('#app .card')];
function shakeEl(el){if(!el)return;el.classList.remove('nope');void el.offsetWidth;el.classList.add('nope');setTimeout(()=>el.classList.remove('nope'),380)}
function deselect(){SEL=null;applySel()}
function tapHand(i){const c=C();if(!c)return;const k=c.hand[i];if(!k)return;const el=document.querySelector(`#hand .card[data-i="${i}"]`);
 if(SEL&&SEL.type==='hand'&&SEL.i===i&&SEL.k===k){if(playable(k)&&cost(k)<=c.energy){SEL=null;play(i)}else shakeEl(el);return}
 SEL={type:'hand',i,k,screen:S.screen};applySel()}
function tapCard(el){const els=cardEls(),n=els.indexOf(el),k=el.dataset.k;
 if(SEL&&SEL.type==='card'&&SEL.n===n&&SEL.k===k){if(!el.dataset.act){deselect();return}if(el.classList.contains('dim')){shakeEl(el);return}commitCard(el);return}
 SEL={type:'card',n,k,screen:S.screen};applySel()}
function commitCard(el){const act=el.dataset.act;SEL=null;applySel();new Function(act)()}
function actLabel(el){const a=el.dataset.act||'';const pr=el.parentElement&&el.parentElement.querySelector('.price');
 if(/^takeCard/.test(a))return 'Take this card';if(/^buyCard/.test(a))return 'Buy'+(pr?' ('+pr.textContent.trim()+')':'');if(/^removeCard/.test(a))return 'Remove this card';return a?'Choose':''}
function dtext(k){return CT[k]?CT[k]():iconize(CARDS[k].d)}
function detailBody(k,cv,hint,btns){const cd=CARDS[k];return `<div class="dhead"><span class="cost">${cv}</span><b class="dn">${cd.n}</b><span class="dtype">${TAGN[cd.tag]}${cd.pw?' · '+'💥'.repeat(cd.pw):''}</span><button class="dx" onclick="deselect()" aria-label="Cancel">✕</button></div>
 <div class="dtxt">${dtext(k)}</div><div class="dgl">${glossary(k)}</div><div class="dfoot"><span class="dhint">${hint}</span>${btns||''}</div>`}
function applySel(){document.querySelectorAll('.card.sel').forEach(e=>e.classList.remove('sel'));const old=$('detailOv');if(old)old.remove();const d=$('detail');
 if(!SEL){if(d){d.className='detail empty';d.innerHTML='Tap a card to read it. Tap it again to play.'}return}
 if(SEL.type==='hand'){const c=C();const el=document.querySelector(`#hand .card[data-i="${SEL.i}"]`);if(!c||!el||!d){SEL=null;return}el.classList.add('sel');const k=SEL.k,ok=playable(k),aff=cost(k)<=c.energy;
  d.className='detail';
  const hint=ok?(aff?'<b>Tap again to play</b>':'Not enough energy'):'Wrong phase for this card';
  const btn=(!ok&&c.swap)?`<button class="mini" id="selSwap" onclick="swapSel()">Swap for a new card</button>`:(!ok?'<span class="small">(swap used this turn)</span>':'');
  d.innerHTML=detailBody(k,cost(k),hint,btn);return}
 const el=cardEls()[SEL.n];if(!el){SEL=null;return}el.classList.add('sel');const k=SEL.k;const lab=actLabel(el);const dim=el.classList.contains('dim');
 const ov=document.createElement('div');ov.id='detailOv';ov.className='detail over';
 ov.innerHTML=detailBody(k,CARDS[k].c,lab?(dim?'Cannot afford this':'<b>Tap again to confirm</b>'):'Tap again to close',lab?`<button class="gold mini" id="selCommit" onclick="commitCard(cardEls()[SEL.n])" ${dim?'disabled':''}>${lab}</button>`:'');
 $('app').appendChild(ov)}
function swapSel(){if(!SEL||SEL.type!=='hand')return;const i=SEL.i;SEL=null;swapCard(i)}
document.addEventListener('click',e=>{if(!SEL)return;if(!e.target.closest('.card,.detail,button,.hud'))deselect()},true);
/* fan the hand */
const _r4=render;render=function(){_r4();
 if(SEL&&(SEL.screen!==S.screen||(SEL.type==='hand'&&(!S.combat||C().hand[SEL.i]!==SEL.k))))SEL=null;
 const h=document.querySelector('#hand');
 if(h){const mine=document.querySelector('.sea .mine');if(mine&&!$('detail')){const d=document.createElement('div');d.id='detail';d.className='detail empty';mine.before(d)}}
 applySel();if(!h)return;const cs=[...h.children],n=cs.length;
 const ov=n<=4?0:n===5?6:n===6?14:n===7?22:n===8?28:32;h.style.setProperty('--ov',ov+'px');h.classList.toggle('fan',n>=7);
 cs.forEach((c,i)=>{const m=(n-1)/2,d=i-m;const rot=n>=5?d*(n>=7?1.3:1.2):(i%2?1:-1);c.style.setProperty('--r',rot+'deg');c.style.setProperty('--dy',(n>=5?Math.abs(d)*Math.abs(d)*(n>=7?1.4:1):0)+'px')})};
render();
showDeck=function(){const a=$('app');a.dataset.screen='deck';
 a.innerHTML=hud()+`<div class="scr"><h2>Deck <span class="small">· tap a card to read it</span></h2><p class="small">Plus officer cards: ${officerCards().map(k=>CARDS[k].n).join(', ')||'none'}.</p><div class="cards">${S.deck.slice().sort().map(k=>cardHTML(k)).join('')}</div></div><div class="actions"><button onclick="render()">Back</button></div>`};
/* v2.5 extra art: Nassau base, Surgeon and Boarding Master portraits */
const _r5=render;render=function(){_r5();if(!S)return;const a=$('app');const face=(f,t)=>`<img class="mini-face" src="img/art/${f}.webp" alt="" title="${t}">`;
 if(S.screen==='nassau'||S.screen==='title'||S.screen==='end'&&S.end&&S.end.kind!=='death'){a.querySelectorAll('img.banner').forEach(i=>i.src='img/art/bg-nassau-base.webp')}
 if(S.screen==='tavern'){const h=$('heal');if(h&&!h.querySelector('img'))h.insertAdjacentHTML('afterbegin',face('officer-surgeon','The ship\'s surgeon'))}
 if(S.screen==='cove'){const h=$('rest');if(h&&!h.querySelector('img'))h.insertAdjacentHTML('afterbegin',face('officer-surgeon','The ship\'s surgeon'))}
 if(S.screen==='recruit'){const b=[...a.querySelectorAll('button')].find(x=>/Hire 5 crew/.test(x.textContent));if(b&&!b.querySelector('img'))b.insertAdjacentHTML('afterbegin',face('officer-boarding-master','Boarding master'))}};
render();
