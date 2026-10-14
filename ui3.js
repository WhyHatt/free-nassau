"use strict";
/* v2.2: painted art, captain's-desk frame, simpler card text, sound hooks. Presentation only. */
const ART='img/art/';
const PORT={blackbeard:'portrait-blackbeard',bellamy:'portrait-bellamy',vane:'portrait-vane',bonnyread:'portrait-bonny-read',rackham:'portrait-rackham'};
Object.keys(PORT).forEach(k=>{if(CAPTAINS[k])CAPTAINS[k].img=ART+PORT[k]+'.webp'});
if(ENEMIES.horn)ENEMIES.horn.img=ART+'portrait-hornigold.webp';
const SHIPART={merchant:'enemy-merchant',rival:'enemy-pirate',privateer:'enemy-pirate',patrol:'enemy-navy',guarda:'enemy-galleon',hunter:'enemy-hunter',sqA:'enemy-navy',sqB:'enemy-navy',horn:'enemy-flagship'};
const EVART={'A Drifting Wreck':'event-wreck','The 1715 Fleet Wrecks':'event-wreck','Storm on the Horizon':'enemy-flagship','An Officer Without a Ship':'event-tavern','Rum Smugglers':'event-tavern','Mutterings Below Deck':'event-tavern','Fishing Village':'event-wreck'};
const SCRART={tavern:'event-tavern',recruit:'event-tavern',fence:'event-tavern',cove:'event-wreck',mutiny:'event-tavern',abandon:'enemy-flagship',extract:'event-wreck'};
/* simpler one-line card text */
const _iconize=iconize;
iconize=function(d){let s=d
 .replace(/^Fire the guns: /,'').replace(/^Light gun: /,'').replace(/ No powder\./,' · no 💥')
 .replace(/if the enemy has no Evasion, \+6 and gain 1 Advantage/,'vs no 🌀: +6 ⭐1')
 .replace(/Enemy crew loses 10% of its number and is Weak 2/,'👥−10% · 😵2')
 .replace(/weather becomes Weather Gauge \(yours\)/,'🌬️ gauge is yours')
 .replace(/ \(any phase\)/,'').replace(/ \(deals 25% less\)/,'').replace(/ this fight/,'')
 .replace(/\(uses 1 🪵 if you have it, else 3\)/,'(🪵)');
 return _iconize(s).replace(/ · $/,'')};
/* ship art with code-drawn damage on top */
function dmgOverlay(dmg){if(dmg<=.25)return '';let s='<svg viewBox="0 0 160 90" class="dmgsvg" aria-hidden="true">';
 if(dmg>.25)s+='<g class="smoke"><circle cx="72" cy="40" r="9" fill="#444" opacity=".45"/><circle cx="80" cy="26" r="12" fill="#555" opacity=".32"/><circle cx="90" cy="14" r="14" fill="#666" opacity=".22"/></g>';
 if(dmg>.5)s+='<path d="M52 22 l6 4 l-3 6 l7 3 l-5 5z M104 30 l5 -3 l2 7 l6 1 l-4 6z" fill="#2a1a0e" opacity=".55"/>';
 if(dmg>.7)s+='<g class="fire"><path d="M84 62 l5 -12 l4 9 l4 -14 l4 17z" fill="#f08a2a"/><path d="M60 64 l3 -8 l3 6 l3 -9 l3 11z" fill="#ffc04a"/></g>';
 return s+'</svg>'}
function artPass(){const a=$('app');if(!S)return;
 if(S.screen==='combat'&&S.combat){const c=C(),e=E(),el=a.querySelector('.eart');if(el){
  if(c.phase==='duel')el.innerHTML=`<img class="duelport" src="${ART}portrait-hornigold.webp" alt="Benjamin Hornigold">`;
  else if(SHIPART[e.k])el.innerHTML=`<div class="painted"><img src="${ART+SHIPART[e.k]}.webp" alt="${e.n}">${dmgOverlay(c.phase==='ship'?1-e.hull/e.hullMax:0)}</div>`;
  el.classList.toggle('boardart',c.phase==='board')}}
 const scr=a.querySelector('.scr');if(!scr)return;
 a.querySelectorAll('img[src="img/ship.jpg"]').forEach(i=>i.src=ART+(S.screen==='end'?'enemy-flagship':'enemy-pirate')+'.webp');
 if(S.screen==='end'&&S.end&&S.end.kind!=='death')a.querySelectorAll('img.banner').forEach(i=>i.src=ART+'event-wreck.webp');
 let key=SCRART[S.screen];if(S.screen==='event'&&EVENTS[S.ev])key=EVART[EVENTS[S.ev].t]||'event-wreck';
 if(S.screen==='prize'&&S.reward&&S.reward.prize)key={sloop:'enemy-pirate',brigantine:'enemy-galleon',snow:'enemy-hunter'}[S.reward.prize]||'enemy-navy';
 if(key){const ex=scr.querySelector('img.banner');if(ex)ex.src=ART+key+'.webp';else{const im=document.createElement('img');im.className='banner';im.src=ART+key+'.webp';im.alt='';const h=scr.querySelector('h2');h?h.after(im):scr.prepend(im)}}}
/* sound hooks */
let lastCoin=null;
const _r3=render;render=function(){_r3();artPass();if(S&&typeof S.coin==='number'){if(lastCoin!==null&&S.coin>lastCoin)SFX.play('coins');lastCoin=S.coin}else lastCoin=null;
 if(S&&(S.screen==='map'||S.screen==='combat'))SFX.startAmb()};
const _p3=play,_e3=endTurn,_b3=board;
play=function(i){const c=C();if(!c)return _p3(i);const k=c.hand[i];const ok=k&&playable(k)&&cost(k)<=c.energy;const ph=c.phase,ec=E().crew,eh=E().hp||0,bl=c.block;
 if(ok)SFX.play(CARDS[k].pw&&ph==='ship'?'cannon':'card');_p3(i);
 if(ok&&S.combat){const e=E();if(ph!=='ship'&&(e.crew<ec||(e.hp||0)<eh))setTimeout(()=>SFX.play('clash'),110);if(C().block>bl)setTimeout(()=>SFX.play('block'),90)}};
endTurn=function(){const h=S.ship.hull,p=S.hp,cr=S.crew,ph=C()&&C().phase;_e3();
 if(S.ship.hull<h){SFX.play('cannon');setTimeout(()=>SFX.play('hit'),140)}else if(ph!=='ship'&&(S.crew<cr||S.hp<p)){SFX.play('clash');setTimeout(()=>SFX.play('hit'),120)}else if(S.hp<p||S.crew<cr)SFX.play('hit')};
board=function(){_b3();if(S.combat&&C().phase==='board')SFX.play('clash')};
/* mute toggle in the rules menu */
const _menu=showMenu;showMenu=function(){_menu();const box=document.querySelector('#modal .box');if(!box)return;const d=document.createElement('div');d.className='center';
 d.innerHTML=`<button id="mute" onclick="SFX.setMuted(!SFX.isMuted());this.textContent=SFX.isMuted()?'🔇 Sound off':'🔊 Sound on'">${SFX.isMuted()?'🔇 Sound off':'🔊 Sound on'}</button>`;box.prepend(d)};
render();
