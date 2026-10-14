"use strict";
/* v2.1 visual layer: icon-first cards/HUD/intents, SVG ships, sea-chart map, juice. No rule changes. */
let RM=window.NOFX||window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAGI={S:'⛵',C:'⚔️',K:'👑'};
/* ---------- icon text ---------- */
function gunsNow(){try{return ship().guns+S.ship.upg.guns}catch(e){return null}}
function iconize(d){let s=d;const g=gunsNow();
 s=s.replace(/^(Quartermaster|Purser|Bosun|Master Gunner|Navigator|Blackbeard|Bellamy|Vane|Bonny & Read|Rackham): /,'');
 s=s.replace(/(\d+) \+ (?:(\d)×)?Guns( hull)? damage( to hull)?/g,(m,a,k,h1,h2)=>g==null?`🎯${a}+${k||1}×🔫`:`🎯<b>${+a+(+k||1)*g}</b>`);
 s=s.replace(/ Uses \d 💥\./g,'').replace(/Uses \d 💥\./g,'');
 s=s.replace(/Gain (\d+) Evasion(?: \([^)]*\))?/g,'🌀<b>$1</b>').replace(/gain (\d+) Evasion/g,'🌀<b>$1</b>');
 s=s.replace(/[Gg]ain (\d+) (?:Guard|Block)(?: \([^)]*\))?/g,'🛡️<b>$1</b>');
 s=s.replace(/(?:Your boarders )?[Kk]ill (\d+) enemy crew/g,'☠️<b>$1</b>👥');
 s=s.replace(/kill (\d+) enemy crew/g,'☠️<b>$1</b>👥');
 s=s.replace(/Enemy Weak (\d+)(?: \([^)]*\))?/g,'😵<b>$1</b>').replace(/enemy Weak (\d+)/g,'😵<b>$1</b>').replace(/is Weak (\d+)/g,'😵<b>$1</b>');
 s=s.replace(/Enemy Burns: (\d+) hull damage each turn/g,'🔥<b>$1</b>').replace(/enemy Burns (\d+)/g,'🔥<b>$1</b>');
 s=s.replace(/[Dd]raw (\d+)(?: cards?)?/g,'🃏<b>$1</b>').replace(/[Gg]ain (\d+) energy/g,'⚡<b>$1</b>');
 s=s.replace(/\+(\d+) morale/g,'🙂<b>+$1</b>').replace(/(?:gain )?(\d+) Advantage/g,'⭐<b>$1</b>');
 s=s.replace(/[Dd]eal (\d+) twice to the current target/g,'🗡️<b>$1</b>×2').replace(/Deal (\d+) to the current target \([^)]*\)/g,'🗡️<b>$1</b>');
 s=s.replace(/repair (\d+) hull[^)]*\)/g,'🔧<b>$1</b>').replace(/\+(\d+) Strength \(all your damage\) this fight/g,'💪<b>+$1</b>');
 s=s.replace(/ ?Exhaust\./g,'').replace(/\.\s*$/,'').replace(/\. /g,' · ').replace(/; /g,' · ').replace(/ and (?=[🌀🛡️⭐🃏😵🔥☠️])/gu,' · ');
 return s}
function cardHTML(k,attrs='',extra=''){const cd=CARDS[k];const tagn={S:'Ship',C:'Crew',K:'Captain'}[cd.tag];const cv=S&&S.combat?cost(k):cd.c;
 const tip=`${cd.n} (${tagn}${cd.pw?', uses '+cd.pw+' powder':''}${cd.x?', Exhaust':''}): ${cd.d}`;
 return `<div class="card tag${cd.tag} ${extra}" ${attrs} data-tip="${tip.replace(/"/g,'&quot;')}" title="${tip.replace(/"/g,'&quot;')}"><div class="cost">${cv}</div><div class="tg">${TAGI[cd.tag]}</div>${cd.pw?`<div class="pw">${'💥'.repeat(cd.pw)}</div>`:''}<div class="nm">${cd.n}</div><div class="ds">${iconize(cd.d)}</div>${cd.x?'<div class="xh" title="Exhaust">✖</div>':''}</div>`}
function bar(v,m,cls){return `<div class="hpbar ${cls||''}"><i style="width:${clamp(v/m*100,0,100)}%"></i></div>`}
function gauge(ic,v,m,cls,tip){return `<div class="gauge ${cls}" data-tip="${tip}" title="${tip}"><span class="gi">${ic}</span><div class="gb"><i style="width:${clamp(v/m*100,0,100)}%"></i><span>${v}<small>/${m}</small></span></div></div>`}
function hud(){const cp=CAPTAINS[S.cap];
 const offs=Object.keys(ROLES).map(r=>{const o=S.officers[r];const t=o?`${ROLES[r].n}: ${OFFICERS[o.id].n}${o.injured?' (injured)':''}. ${OFFICERS[o.id].passive}`:`${ROLES[r].n}: none (hire at a Recruit node)`;return `<span class="ofc ${o?(o.injured?'inj':'on'):'empty'}" data-tip="${t}" title="${t}">${o?`<img src="${OFFICERS[o.id].img}" alt="">`:ROLES[r].i}${o&&o.injured?'<em>🩹</em>':''}</span>`}).join('');
 const cargo=Object.keys(CARGO).filter(k=>S.cargo[k]>0||['powder','food','water'].includes(k)).map(k=>`<span class="cg ${['food','water','powder'].includes(k)&&S.cargo[k]<2?'low':''}" data-tip="${CARGO[k].n}: ${S.cargo[k]}" title="${CARGO[k].n}">${CARGO[k].i}${S.cargo[k]}</span>`).join('');
 return `<button class="menubtn" id="menu" onclick="showMenu()" aria-label="Rules">☰</button>
 <div class="hud"><img class="portrait sm" src="${cp.img}" data-tip="${cp.n}. ${cp.passive}" title="${cp.n}">
 <div class="gauges">${gauge('❤️',S.hp,S.maxHp,'g-hp','Captain HP. At 0 the run ends.')}${gauge('⛵',S.ship.hull,hullMax(),'g-hull',ship().n+' hull. '+ship().perk)}
 ${gauge('👥',S.crew,crewMax(),'g-crew','Crew aboard. They fight when you board.')}${gauge(S.morale>=50?'🙂':S.morale>=25?'😐':'😠',S.morale,100,'g-mor','Morale. Under 25 weakens boarders; 0 means mutiny.')}</div>
 <div class="strip"><span class="coin" data-tip="Coin" title="Coin">🪙${S.coin}</span><span class="hold" data-tip="Hold used / capacity" title="Hold">📦${holdUsed()}/${holdMax()}</span>${cargo}${S.cargo.rum>0&&!S.combat?`<button class="mini" onclick="drinkRum()" title="Drink rum: +15 morale">🍾+</button>`:''}<span class="offs">${offs}</span></div></div>`}
/* ---------- SVG ships ---------- */
const SHIPLOOK={merchant:{m:2,flag:'#b3261e',hull:'#7a4b23',sail:'#efe6cf',jack:0},rival:{m:1,flag:'#111',hull:'#3b2a1a',sail:'#d9ccaa',jack:1},privateer:{m:2,flag:'#222',hull:'#5a2e1a',sail:'#e6dcc0',jack:1},
 patrol:{m:3,flag:'#c8102e',hull:'#24304a',sail:'#f4efe0',jack:0,stripe:'#e8c547'},guarda:{m:2,flag:'#c60b1e',hull:'#5b1f1f',sail:'#efe2bf',jack:0,stripe:'#f1bf00'},hunter:{m:3,flag:'#111',hull:'#2b2b2b',sail:'#cfc6ad',jack:1,stripe:'#9b2d20'},
 sqA:{m:1,flag:'#c8102e',hull:'#24304a',sail:'#f4efe0',stripe:'#e8c547'},sqB:{m:3,flag:'#c8102e',hull:'#1b2540',sail:'#f7f2e4',stripe:'#e8c547',big:1},horn:{m:3,flag:'#1d1d1d',hull:'#30261c',sail:'#bdb39a',jack:1,stripe:'#c9a24a',big:1},
 periagua:{m:1,flag:'#111',hull:'#7a5a2c',sail:'#e6d9b8',jack:1,small:1},sloop:{m:1,flag:'#111',hull:'#6b4a1f',sail:'#eee2c2',jack:1},brigantine:{m:2,flag:'#111',hull:'#5a3e1a',sail:'#eee2c2',jack:1},snow:{m:2,flag:'#111',hull:'#4a3318',sail:'#eee2c2',jack:1,stripe:'#c9a24a'},frigate:{m:3,flag:'#111',hull:'#3b2a14',sail:'#eee2c2',jack:1,stripe:'#c9a24a',big:1}};
function shipSVG(k,flip,dmg){const L=SHIPLOOK[k]||SHIPLOOK.merchant;const w=L.big?150:L.small?90:120;const x0=(160-w)/2;const deck=78;
 let s=`<svg viewBox="0 0 160 110" class="shipsvg ${flip?'flip':''}" aria-hidden="true">`;
 const mx=L.m===1?[80]:L.m===2?[62,100]:[50,80,110];
 mx.forEach((x,i)=>{const h=(L.small?36:52)-(i===mx.length-1&&L.m>1?6:0)+(L.big?6:0);
  s+=`<line x1="${x}" y1="${deck}" x2="${x}" y2="${deck-h-6}" stroke="#3a2614" stroke-width="2.2"/>`;
  const sw=L.small?16:L.big?22:19;
  for(let j=0;j<(L.small?1:2);j++){const top=deck-h+j*(h/2)-2,bh=h/2-3;s+=`<path d="M${x-sw} ${top} Q${x} ${top+4} ${x+sw} ${top} L${x+sw-2} ${top+bh} Q${x} ${top+bh+7} ${x-sw+2} ${top+bh} Z" fill="${L.sail}" stroke="#8a7a5a" stroke-width=".8" ${dmg>.5&&j===1?'opacity=".55"':''}/>`}
  if(i===0||L.m===1)s+=`<path d="M${x} ${deck-h-6} l14 3 l-14 4 z" fill="${L.flag}"/>${L.jack?`<circle cx="${x+5}" cy="${deck-h-3}" r="1.6" fill="#eee"/>`:''}`});
 s+=`<line x1="${x0+w-6}" y1="${deck-6}" x2="${x0+w+16}" y2="${deck-26}" stroke="#3a2614" stroke-width="2"/>`;
 s+=`<path d="M${x0} ${deck-8} L${x0+w} ${deck-8} L${x0+w-14} ${deck+16} Q80 ${deck+22} ${x0+10} ${deck+16} Z" fill="${L.hull}" stroke="#1d130a" stroke-width="1.5"/>`;
 if(L.stripe)s+=`<path d="M${x0+3} ${deck-1} L${x0+w-3} ${deck-1}" stroke="${L.stripe}" stroke-width="3"/>`;
 const ports=L.small?2:L.big?7:4;for(let i=0;i<ports;i++){const px=x0+16+i*((w-34)/Math.max(1,ports-1));s+=`<rect x="${px-2.5}" y="${deck+3}" width="5" height="4" fill="#120c06"/>`}
 if(dmg>.5)s+=`<g class="smoke"><circle cx="70" cy="60" r="7" fill="#555" opacity=".5"/><circle cx="76" cy="48" r="9" fill="#666" opacity=".35"/></g>`;
 if(dmg>.75)s+=`<path d="M90 ${deck-6} l5 -10 l4 8 l4 -12 l3 14 z" fill="#e8742a" class="fire"/>`;
 s+=`<path d="M0 ${deck+14} Q20 ${deck+8} 40 ${deck+14} T80 ${deck+14} T120 ${deck+14} T160 ${deck+14} V110 H0 Z" fill="#2c5d74" opacity=".85"/><path d="M0 ${deck+20} Q20 ${deck+15} 40 ${deck+20} T80 ${deck+20} T120 ${deck+20} T160 ${deck+20}" fill="none" stroke="#cfe3ea" stroke-width="1" opacity=".6"/></svg>`;return s}
function fortSVG(){return `<svg viewBox="0 0 160 110" class="shipsvg" aria-hidden="true"><path d="M0 92 Q40 80 80 86 T160 84 V110 H0Z" fill="#c9b27a"/>${[20,40,60,80,100,120].map(x=>`<path d="M${x} 90 V50 l5 -7 l5 7 V90" fill="#7a5a2c" stroke="#3a2614"/>`).join('')}<rect x="66" y="34" width="28" height="56" fill="#8a6a3a" stroke="#3a2614"/><path d="M66 34 h28 l-4 -8 h-20z" fill="#5a3e1a"/><line x1="80" y1="26" x2="80" y2="6" stroke="#3a2614" stroke-width="2"/><path d="M80 6 l16 4 l-16 5z" fill="#c60b1e"/><rect x="80" y="9" width="10" height="2" fill="#f1bf00"/><path d="M0 100 Q40 94 80 100 T160 98 V110 H0Z" fill="#2c5d74"/></svg>`}
function duelSVG(){return `<svg viewBox="0 0 160 110" class="shipsvg" aria-hidden="true"><path d="M30 95 L120 20" stroke="#c9c9c9" stroke-width="4" stroke-linecap="round"/><path d="M130 95 L40 20" stroke="#c9c9c9" stroke-width="4" stroke-linecap="round"/><rect x="25" y="88" width="16" height="6" rx="2" fill="#c9a24a" transform="rotate(-40 33 91)"/><rect x="119" y="88" width="16" height="6" rx="2" fill="#c9a24a" transform="rotate(40 127 91)"/></svg>`}
/* ---------- intents ---------- */
const INTI={broad:'💥',grape:'🔫',crit:'🎯',evade:'🌀',load:'⬆️',melee:'⚔️',rush:'🗡️',officer:'🎯',brace:'🛡️',slash:'🗡️',guard:'🛡️',lunge:'⚡'};
function intentHTML(it){const tier=['evade','brace','guard','load'].includes(it.k)?0:it.v<6?1:it.v<11?2:it.v<16?3:4;const tgt={broad:'⛵',crit:'⛵❤️',grape:'👥',melee:'👥',rush:'❤️',officer:'👥📜',slash:'❤️',lunge:'❤️'}[it.k]||'';
 return `<div class="intent t${tier}" id="intent" data-tip="${it.tx}" title="${it.tx}" onclick="toggleTip(this)"><span class="ii">${INTI[it.k]||'❔'}</span>${['load'].includes(it.k)?'':`<b>${it.v}</b>`}<small>${tgt}</small></div>`}
/* ---------- combat ---------- */
function combatHTML(){const c=C(),e=E(),it=intent();const ph=c.phase;const W=WEATHER[c.weather];
 const WI={fair:'🌤️',gauge:'🌬️',enemygauge:'🌬️⚠️',squall:'⛈️',calm:'🌫️',fog:'🌁'}[c.weather]||'🌬️';
 const phases=`<div class="phases"><span class="${ph==='ship'?'on':''}" title="Phase 1: ship vs ship">⛵</span><span class="${ph==='board'?'on':''}" title="Phase 2: boarding">⚔️</span>${c.boss===3||ph==='duel'?`<span class="${ph==='duel'?'on':''}" title="Duel">🤺</span>`:''}</div>`;
 const big=ph==='ship'?gauge('⛵',e.hull,e.hullMax,'g-hull','Enemy hull'):ph==='board'?gauge('👥',e.crew,e.crewMax,'g-crew','Enemy crew'):gauge('❤️',e.hp,e.hpMax,'g-hp','Hornigold');
 const sub=ph==='ship'?`<span class="tag" title="Enemy crew">👥${e.crew}</span>`:'';
 const st=`${e.block?`<span class="tag" title="Evasion/Guard">🛡️${e.block}</span>`:''}${e.weak?`<span class="tag" title="Weak: deals 25% less">😵${e.weak}</span>`:''}${e.burn?`<span class="tag" title="Burning">🔥${e.burn}</span>`:''}${e.str?`<span class="tag" title="Loaded guns">⬆️${e.str}</span>`:''}`;
 const dmg=ph==='ship'?1-e.hull/e.hullMax:0;const art=e.k==='fort'?fortSVG():ph==='duel'?duelSVG():shipSVG(e.k,false,dmg);
 const canBoard=ph==='ship'&&e.hull<=e.hullMax*.5&&!(c.boss)&&!c.queue.length;
 const seq=ph==='ship'&&e.ints.length?`<div class="seq" title="Their pattern (next is highlighted)">${e.ints.map((x,i)=>`<i class="${i===e.ii%e.ints.length?'nx':''}">${INTI[x[0]]}</i>`).join('')}</div>`:'';
 return `<div class="sea">
 <div class="topline">${phases}<span class="wx" data-tip="${W.n}: ${W.d}" title="${W.n}: ${W.d}" onclick="toggleTip(this)">${WI} ${W.n}</span>${c.advT?`<span class="tag" title="Advantage for boarding">⭐${c.advT>0?'+':''}${c.advT}</span>`:''}</div>
 <div class="enemy" id="foe"><div class="ename">${e.n}${c.queue.length?` <small>+${c.queue.length}</small>`:''}</div>
 <div class="ebody"><div class="eart bob">${art}</div><div class="eside">${intentHTML(it)}${seq}</div></div>
 <div class="estats">${big}${sub}${st}</div></div>
 ${canBoard?`<div class="boardrow"><button id="board" class="gold" onclick="board()" title="Full loot, risks crew, officers and captain">⚓ Board her!</button><span class="small">or keep firing to sink (≈40% loot)</span></div>`:''}
 <div class="mine"><span class="nrg" id="energy" title="Energy">${c.energy}</span><span class="tag big" title="${ph==='ship'?'Evasion (blocks hull damage)':'Guard (blocks damage)'}">${ph==='ship'?'🌀':'🛡️'}${c.block}</span>${c.str?`<span class="tag" title="Strength">💪${c.str}</span>`:''}<span class="tag" title="Draw pile">🂠${c.draw.length}</span><span class="tag" title="Discard">♻️${c.disc.length}</span><span class="tag" title="Gunpowder">💥${S.cargo.powder}</span><span class="myship" title="${ship().n}">${shipSVG(S.ship.type,true,1-S.ship.hull/hullMax())}</span></div>
 </div>
 <div class="cards hand" id="hand">${c.hand.map((k,i)=>{const ok=playable(k);return cardHTML(k,ok?`data-i="${i}" onclick="play(${i})"`:`data-i="${i}" onclick="swapCard(${i})"`,(ok?'':'off ')+(ok&&cost(k)>c.energy?'dim':''))}).join('')}</div>
 <div class="log" id="log" onclick="this.classList.toggle('open')" title="Tap for the full log">${c.log.map((l,i)=>`<div class="${i?'old':''}">${l}</div>`).join('')}</div>
 ${c.hand.some(k=>!playable(k))?`<div class="small hint">Grey cards don't fit this phase: tap one to swap it${c.swap?'':' (used this turn)'}.</div>`:''}`}
function combatFoot(){const c=C();let f=`<button id="endturn" class="endturn" onclick="endTurn()">End Turn ⏳</button>`;
 if(c.canFlee&&c.turn===1&&c.phase==='ship')f+=`<button onclick="flee()">💨 Flee</button>`;
 if(c.phase==='board'&&!c.boss)f+=`<button onclick="retreat()" title="Cut the grapples: -15 morale, no loot">✂️ Retreat</button>`;return f}
/* ---------- map as a sea chart ---------- */
function mapHTML(){const R=S.map.length;let nodes='',lines='',path='';
 const pos=(r,c)=>[(c+.5)/3*100,(R-1-r+.5)/R*100];
 for(let r=0;r<R-1;r++)S.map[r].forEach((n,c)=>{if(n.t==='empty')return;S.map[r+1].forEach((m,c2)=>{if(m.t==='empty')return;if(r+1===R-1?c2!==1:Math.abs(c-c2)>1)return;const[a,b]=pos(r,c),[x,y]=pos(r+1,c2);
  const walked=n.done&&m.done;lines+=`<line x1="${a}%" y1="${b}%" x2="${x}%" y2="${y}%" class="${walked?'walked':''}"/>`})});
 for(let r=R-1;r>=0;r--)S.map[r].forEach((n,c)=>{if(n.t==='empty')return;const av=avail(r,c),cur=r===S.row&&c===S.col;const[x,y]=pos(r,c);
  const ic=n.t==='recruit'?ROLES[n.role].i:(n.t==='wreck'&&S.cargo.maps>0?'🗺️':NODEI[n.t]);const tip=NODEN[n.t]+(n.role?': '+ROLES[n.role].n:'');
  nodes+=`<div class="node ${av?'avail':''} ${n.done?'done':''} ${cur?'cur':''} n-${n.t}" style="left:${x}%;top:${y}%" data-r="${r}" data-c="${c}" title="${tip}" data-tip="${tip}" onclick="go(${r},${c})">${ic}${cur?'<span class="you">⛵</span>':''}</div>`});
 return `<div class="chart" style="--rows:${R}"><svg class="routes" width="100%" height="100%">${lines}</svg><svg class="rose" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#6b4a1f" stroke-width="1"><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="22"/></g><path d="M50 8 L56 50 L50 92 L44 50Z" fill="#6b4a1f"/><path d="M8 50 L50 44 L92 50 L50 56Z" fill="#9b2d20" opacity=".8"/><text x="50" y="7" font-size="9" text-anchor="middle" fill="#3b2a1a">N</text></svg>${nodes}</div>`}
/* ---------- render wrapper: fit to viewport, deal/juice ---------- */
const _render=render;let lastDealKey='';
render=function(){
 if(S&&S.screen==='map'){const a=$('app');a.innerHTML=hud()+`<div class="scr"><div class="maphead"><h2>${ACTS[S.act].n}</h2><span class="leg" title="Leg">🧭 ${S.row+1}/${S.map.length}</span></div>${S.msg?`<p class="msg">${S.msg}</p>`:''}${mapHTML()}<div class="small center legend-line">Tap and hold a mark to see what it is · each leg uses 🍖1 💧1</div></div><div class="actions"><button onclick="showDeck()">🃏 Deck ${S.deck.length}</button><button onclick="if(confirm('Abandon this run? It counts as a death.'))endRun('death')">🏳️ Give up</button></div>`;a.dataset.screen='map';return}
 _render();const a=$('app');a.dataset.screen=S?S.screen:'title';
 // wrap content (everything except hud/menu/actions) in a scroll area so actions sit at the bottom
 if(!a.querySelector(':scope>.scr')){const scr=document.createElement('div');scr.className='scr';[...a.children].forEach(ch=>{if(!ch.matches('.hud,.menubtn,.actions'))scr.appendChild(ch)});const act=a.querySelector(':scope>.actions');a.insertBefore(scr,act||null)}
 if(S&&S.screen==='combat'&&S.combat){const c=C();const key=c.turn+'|'+c.phase+'|'+c.enemy.n;if(key!==lastDealKey&&!RM){lastDealKey=key;a.querySelectorAll('#hand .card').forEach((el,i)=>{el.classList.add('deal');el.style.animationDelay=(i*70)+'ms'})}}};
function snap(){if(!S||!S.combat)return null;const e=E();return{eh:e.hull,ec:e.crew,ep:e.hp||0,eb:e.block,h:S.ship.hull,c:S.crew,p:S.hp,b:C().block,en:e.n}}
function floater(el,txt,cls){if(!el||RM&&false)return;const r=el.getBoundingClientRect();const f=document.createElement('div');f.className='floater '+cls;f.textContent=txt;f.style.left=(r.left+r.width/2+(Math.random()*40-20))+'px';f.style.top=(r.top+r.height*.35)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1100)}
function shake(n){if(RM)return;const a=$('app');a.classList.remove('shake','shake2');void a.offsetWidth;a.classList.add(n>8?'shake2':'shake');setTimeout(()=>a.classList.remove('shake','shake2'),450)}
function juice(b){if(window.NOFX)return;const a=snap();if(!b)return;const foe=$('foe'),hudEl=document.querySelector('.hud');
 if(a&&a.en===b.en){if(b.eh>a.eh)floater(foe,'-'+(b.eh-a.eh)+' ⛵','hit');if(b.ec>a.ec)floater(foe,'-'+(b.ec-a.ec)+' 👥','hit');if(b.ep>a.ep)floater(foe,'-'+(b.ep-a.ep)+' ❤️','hit');if(a.eb>b.eb&&b.eh===a.eh&&b.ec===a.ec)floater(foe,'🛡️','blk');
  if(foe&&(b.eh>a.eh||b.ec>a.ec||b.ep>a.ep)){foe.classList.add('struck');setTimeout(()=>foe&&foe.classList.remove('struck'),300)}}
 const S2=S;const lost=(b.h-S2.ship.hull)+(b.p-S2.hp)+(b.c-S2.crew);
 if(b.h>S2.ship.hull)floater(hudEl,'-'+(b.h-S2.ship.hull)+' ⛵','ouch');if(b.p>S2.hp)floater(hudEl,'-'+(b.p-S2.hp)+' ❤️','ouch');if(b.c>S2.crew)floater(hudEl,'-'+(b.c-S2.crew)+' 👥','ouch');
 if(S2.combat&&C().block>b.b)floater(document.querySelector('.mine'),'+'+(C().block-b.b)+(C().phase==='ship'?' 🌀':' 🛡️'),'gain');
 if(lost>0)shake(lost)}
function flyCard(i){if(RM)return;const el=document.querySelector(`#hand .card[data-i="${i}"]`);const foe=$('foe');if(!el||!foe)return;const r=el.getBoundingClientRect(),t=foe.getBoundingClientRect();
 const g=el.cloneNode(true);g.classList.add('ghost');g.removeAttribute('onclick');Object.assign(g.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.appendChild(g);
 requestAnimationFrame(()=>{g.style.transform=`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) scale(.5) rotate(8deg)`;g.style.opacity='0'});setTimeout(()=>g.remove(),420)}
const _play=play,_endTurn=endTurn,_board=board,_swap=swapCard;
play=function(i){const c=C();if(!c)return;const k=c.hand[i];const ok=k&&playable(k)&&cost(k)<=c.energy;const b=snap();if(ok)flyCard(i);else if(k){const el=document.querySelector(`#hand .card[data-i="${i}"]`);if(el){el.classList.add('nope');setTimeout(()=>el.classList.remove('nope'),350)}}_play(i);if(ok)juice(b)};
endTurn=function(){const b=snap();_endTurn();juice(b)};
board=function(){const b=snap();_board();if(S.combat){floater($('foe'),'⚓ Boarding!','gain');shake(3)}};
/* ---------- tooltips: hover title on desktop, press-and-hold or tap-toggle on phones ---------- */
let tipT=null,tipShown=false;
function showTip(el,x,y){const t=$('tip')||Object.assign(document.body.appendChild(document.createElement('div')),{id:'tip'});t.innerHTML=el.dataset.tip;t.style.display='block';
 const w=Math.min(280,innerWidth-16);t.style.width=w+'px';t.style.left=Math.max(8,Math.min(innerWidth-w-8,x-w/2))+'px';t.style.top=Math.max(8,y-90)+'px';tipShown=true}
function hideTip(){const t=$('tip');if(t)t.style.display='none'}
function toggleTip(el){const r=el.getBoundingClientRect();const t=$('tip');if(t&&t.style.display==='block'){hideTip();return}showTip(el,r.left+r.width/2,r.top)}
document.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-tip]');hideTip();if(!el)return;tipShown=false;clearTimeout(tipT);tipT=setTimeout(()=>showTip(el,e.clientX,e.clientY),420)},true);
['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(tipT),true));
document.addEventListener('pointermove',e=>{if(Math.abs(e.movementX)+Math.abs(e.movementY)>6)clearTimeout(tipT)},true);
document.addEventListener('click',e=>{if(tipShown){e.stopPropagation();e.preventDefault();tipShown=false}},true);
document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-tip]'))e.preventDefault()});
render();
