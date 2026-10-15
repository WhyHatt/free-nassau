"use strict";
/* v5 polish layer: interaction, feel, in-flow card detail, compact hand grid, tap guards, settings. Loads last. */
(function(){
const RMK='fnrm';
function setRM(v){RM=!!v||!!window.NOFX;try{localStorage.setItem(RMK,v?'1':'0')}catch(e){}document.documentElement.classList.toggle('rm',!!v)}
window.setRM=setRM;
if(!window.NOFX){let st=null;try{st=localStorage.getItem(RMK)}catch(e){}if(st!==null){RM=st==='1'}document.documentElement.classList.toggle('rm',!!RM)}
/* ---------- tap guards: no accidental double taps, no carry-over taps after a screen change ---------- */
const buzz=ms=>{try{if(!RM&&!window.NOFX&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}};
const LK={};
function lk(name,ms){const f=window[name];if(typeof f!=='function')return;window[name]=function(...a){if(!window.NOFX){const n=performance.now();if(LK[name]&&n-LK[name]<(ms||450))return;LK[name]=n}return f.apply(this,a)}}
['endTurn','go','board','flee','retreat','takeCard','takeShipUp','takeCrewUp','takeCaptainUp','rewardDone','chooseEvent','nextAct','takePrize','skipPrize','coveRepair','coveRest','buyCard','removeCard','newRun','buyShip'].forEach(n=>lk(n));
let LASTSC=null,SCT=0;
document.addEventListener('click',e=>{if(window.NOFX||!e.isTrusted)return;if(performance.now()-SCT<240&&e.target.closest&&e.target.closest('#app')&&!e.target.closest('.hud')){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('click',e=>{const h=e.target.closest&&e.target.closest('.hud');if(h&&!e.target.closest('.ofc')&&!$('modal').innerHTML.trim()&&S&&S.screen!=='title'){showMenu('crew')}});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const m=$('modal');if(m&&m.innerHTML.trim()){m.innerHTML='';return}if(SEL)deselect()});
/* ---------- selection detail: one component, docked in the flow ---------- */
const hintFor=()=>{const c=S&&S.combat;if(!c||S.screen!=='combat')return 'Tap a card to read it.';
 const can=c.hand.some(k=>playable(k)&&cost(k)<=c.energy),off=c.hand.some(k=>!playable(k));
 const ph={ship:'Ship battle',board:'Boarding',duel:'Duel'}[c.phase];
 return `<div class="tl"><span class="tn">Turn ${c.turn}</span><span class="tp">${ph} · your move</span></div><p>${can?'Tap a card to read it, then play it.':'Nothing left to play. End your turn.'}${off?(c.swap?' Grey cards swap once a turn.':''):''}</p>`};
function dbody(k,cv,btn,note){const cd=CARDS[k];return `<div class="dmain"><div class="dhead${cd.n.length>15?' long':''}"><span class="cost">${cv}</span><b class="dn">${cd.n}</b><span class="dtype">${TAGN[cd.tag]}${cd.pw?' · '+'💥'.repeat(cd.pw):''}</span></div>
 <div class="dtxt">${dtext(k)}</div>${note?`<div class="dnote">${note}</div>`:`<div class="dgl">${glossary(k)}</div>`}</div>
 <div class="dside"><button class="dx" onclick="deselect()" aria-label="Close"><span>✕</span></button>${btn||''}</div>`}
let lastSel='';
window.playSel=function(){if(!SEL||SEL.type!=='hand')return;const i=SEL.i;SEL=null;applySel();play(i)};
applySel=function(){const a=$('app');document.querySelectorAll('.card.sel').forEach(e=>e.classList.remove('sel'));const old=$('detailOv');if(old)old.remove();a.classList.remove('docked');const d=$('detail');
 if(!SEL){lastSel='';if(d){d.className='detail empty';d.innerHTML=hintFor();emo(d)}return}
 const key=JSON.stringify([SEL.type,SEL.i,SEL.n,SEL.k]);const fresh=key!==lastSel;lastSel=key;
 if(SEL.type==='hand'){const c=C();const el=document.querySelector(`#hand .card[data-i="${SEL.i}"]`);if(!c||!el||!d){SEL=null;return}el.classList.add('sel');const k=SEL.k,ok=playable(k),aff=cost(k)<=c.energy;
  d.className='detail';let btn,note='';
  if(ok&&aff)btn=`<button class="gold dgo" id="selPlay" onclick="playSel()">Play</button>`;
  else if(ok){btn=`<button class="dgo off" id="selPlay" disabled>No energy</button>`;note=`Costs ${cost(k)}, you have ${c.energy}.`}
  else if(c.swap){btn=`<button class="dgo" id="selSwap" onclick="swapSel()">Swap</button>`;note='Wrong phase. Swap it for a new card.'}
  else{btn=`<button class="dgo off" disabled>Swapped</button>`;note='Wrong phase. Swap already used this turn.'}
  d.innerHTML=dbody(k,cost(k),btn,note);emo(d);if(fresh){SFX.play('tick');buzz(8)}return}
 const el=cardEls()[SEL.n];if(!el){SEL=null;return}el.classList.add('sel');const k=SEL.k;let lab=actLabel(el);lab=lab.replace('Take this card','Take card').replace(/^Buy \((.*)\)$/,'Buy $1').replace('Remove this card','Remove');const dim=el.classList.contains('dim');
 const ov=document.createElement('div');ov.id='detailOv';ov.className='detail docked';
 ov.innerHTML=dbody(k,CARDS[k].c,lab?`<button class="gold dgo" id="selCommit" onclick="commitCard(cardEls()[SEL.n])" ${dim?'disabled':''}>${dim?'Too dear':lab}</button>`:'',dim&&lab?'Not enough silver for this one.':'');
 const act=a.querySelector(':scope>.actions');a.insertBefore(ov,act||null);a.classList.add('docked');emo(ov);if(fresh)SFX.play('tick')};
const _se=shakeEl;shakeEl=function(el){_se(el);SFX.play('thud')};
/* ---------- juice: flying cards, discard sweep, hit bursts, damage numbers ---------- */
const STAR=(()=>{let p=[];for(let i=0;i<20;i++){const r=i%2?17:46,a=i/20*Math.PI*2;p.push((Math.cos(a)*r).toFixed(1)+','+(Math.sin(a)*r).toFixed(1))}return `<svg viewBox="-50 -50 100 100"><polygon points="${p.join(' ')}"/></svg>`})();
function burstAt(el,cls){if(RM||!el)return;const r=el.getBoundingClientRect();const b=document.createElement('div');b.className='burst '+(cls||'');b.innerHTML=STAR;b.style.left=(r.left+r.width/2)+'px';b.style.top=(r.top+r.height*.4)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),420)}
function hurtFx(n){if(RM)return;buzz(n>8?[40,30,40]:25);const d=document.createElement('div');d.className='hurtfx'+(n>8?' big':'');document.body.appendChild(d);setTimeout(()=>d.remove(),650)}
const _flo=floater;floater=function(el,txt,cls){_flo(el,txt,cls);const f=document.body.lastElementChild;if(f&&f.classList.contains('floater')){const n=document.querySelectorAll('.floater').length-1;if(n)f.style.top=(parseFloat(f.style.top)-n*30)+'px';const m=/(\d+)/.exec(txt);if(m&&+m[1]>=10)f.classList.add('big');emo(f)}};
const _juice=juice;juice=function(b){if(window.NOFX)return;_juice(b);if(!b||!S||!S.combat)return;const a=snap();
 if(a&&a.en===b.en&&(b.eh>a.eh||b.ec>a.ec||b.ep>a.ep))burstAt($('foe'),(b.eh-a.eh)+(b.ec-a.ec)+(b.ep-a.ep)>=10?'big':'');
 const lost=(b.h-S.ship.hull)+(b.p-S.hp)+(b.c-S.crew);if(lost>0){hurtFx(lost);[['h','g-hull',S.ship.hull],['p','g-hp',S.hp],['c','g-crew',S.crew]].forEach(([k,c,v])=>{if(b[k]>v){const g=document.querySelector('.hud .'+c);if(g){g.classList.add('hit');setTimeout(()=>g.classList.remove('hit'),600)}}})}
 if(C().block>b.b){const t=document.querySelector('.mine .tag.big');if(t){t.classList.remove('pop');void t.offsetWidth;t.classList.add('pop')}}};
flyCard=function(i){if(RM)return;const el=document.querySelector(`#hand .card[data-i="${i}"]`);if(!el)return;const k=C().hand[i];const tx=dtext(k).replace(/<[^>]+>/g,'');const atk=/damage|kill|deal |burn|weak|hull|enemy|crew|strip/i.test(tx)&&!/^gain \d+ block/i.test(tx.trim());
 const tg=atk?$('foe'):document.querySelector('.mine .tag.big')||document.querySelector('.mine');if(!tg)return;const r=el.getBoundingClientRect(),t=tg.getBoundingClientRect();
 const g=el.cloneNode(true);g.classList.remove('sel');g.classList.add('ghost');g.removeAttribute('onclick');Object.assign(g.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.appendChild(g);
 requestAnimationFrame(()=>{g.style.transform=`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) scale(.45) rotate(${atk?8:-6}deg)`;g.style.opacity='0'});setTimeout(()=>g.remove(),460)};
function discardFx(){if(RM)return;const disc=document.querySelector('.pile.disc');if(!disc)return;const t=disc.getBoundingClientRect();
 document.querySelectorAll('#hand .card').forEach((el,i)=>{const r=el.getBoundingClientRect();const g=el.cloneNode(true);g.classList.remove('sel','deal');g.classList.add('ghost','dis');g.removeAttribute('onclick');g.removeAttribute('data-i');
  Object.assign(g.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',transitionDelay:(i*24)+'ms'});document.body.appendChild(g);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{g.style.transform=`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) scale(.2) rotate(${(i%2?1:-1)*30}deg)`;g.style.opacity='0'}));setTimeout(()=>g.remove(),800)})}
const _et=endTurn;endTurn=function(){if(S&&S.combat&&S.screen==='combat')discardFx();_et()};
/* ---------- banners ---------- */
let BKEY='';
function banner(a,b){if(RM)return;document.querySelectorAll('.turnbn').forEach(e=>e.remove());const d=document.createElement('div');d.className='turnbn';d.innerHTML=`<b>${a}</b><small>${b}</small>`;document.body.appendChild(d);setTimeout(()=>d.remove(),1100)}
/* ---------- settings ---------- */
bkSettings=function(){const mu=SFX.isMuted();return `<h3 class="bkh"><span>Settings</span></h3><div class="setl">
 <button class="sw ${mu?'':'on'}" id="mute" role="switch" aria-checked="${!mu}" onclick="SFX.setMuted(!SFX.isMuted());bkTab('settings')"><span>Sound</span><i></i><em>${mu?'Off':'On'}</em></button>
 <button class="sw ${RM?'on':''}" id="rmtoggle" role="switch" aria-checked="${!!RM}" onclick="setRM(!RM);bkTab('settings')"><span>Reduce motion</span><i></i><em>${RM?'On':'Off'}</em></button>
 <button id="quit" onclick="$('modal').innerHTML='';S=null;render()">Save and quit to title</button>
 <button id="giveup" class="danger" onclick="if(confirm('Abandon this run? It counts as a death.')){$('modal').innerHTML='';endRun('death')}">Give up this run</button></div><p class="sm center">Free Nassau · v5</p>`};
const _sm=showMenu;showMenu=function(t){_sm(t);SFX.play('page')};


/* ---------- coastal fort: painted-style scene ---------- */
fortSVG=function(){const merl=(x0,x1,y)=>{let s='';for(let x=x0;x<x1-3;x+=7)s+=`<rect x="${x}" y="${y-4.500}" width="4.600" height="4.600" fill="url(#fW)" stroke="#2a1c10" stroke-width=".5"/>`;return s};
 const course=(x0,x1,y0,y1)=>{let s='';for(let y=y0+5;y<y1;y+=5.500){s+=`<path d="M${x0} ${y}H${x1}" stroke="#2a1c10" stroke-width=".35" opacity=".35"/>`;for(let x=x0+((y/5.5|0)%2?3:6);x<x1;x+=9)s+=`<path d="M${x} ${y-5.500}V${y}" stroke="#2a1c10" stroke-width=".3" opacity=".28"/>`}return s};
 const gun=(x,y,sm)=>`<rect x="${x-3.500}" y="${y-3}" width="7" height="6" rx="1" fill="#14090a"/><rect x="${x-1}" y="${y-1.500}" width="${sm?7:9}" height="3.200" rx="1.400" fill="#4a4d52" stroke="#16181b" stroke-width=".4"/><ellipse cx="${x+(sm?6:8)}" cy="${y}" rx="1.200" ry="1.600" fill="#0c0d0f"/><path d="M${x} ${y-1}h${sm?5:7}" stroke="#a9adb4" stroke-width=".5" opacity=".7"/>`;
 const puff=(x,y,r)=>`<g fill="#f4efe4" opacity=".78"><circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x+r*.9}" cy="${y-r*.4}" r="${r*.8}"/><circle cx="${x-r*.7}" cy="${y-r*.6}" r="${r*.7}"/></g><circle cx="${x+r*.2}" cy="${y+r*.3}" r="${r*.6}" fill="#9a8f80" opacity=".35"/>`;
 return `<svg viewBox="0 0 160 110" class="shipsvg fort" aria-hidden="true"><defs>
 <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f86ab"/><stop offset=".55" stop-color="#f0c88c"/><stop offset="1" stop-color="#f7e5b6"/></linearGradient>
 <linearGradient id="fW" x1="0" x2="1"><stop offset="0" stop-color="#d8c79f"/><stop offset=".5" stop-color="#b09b76"/><stop offset="1" stop-color="#6c5b42"/></linearGradient>
 <linearGradient id="fSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f8aa0"/><stop offset="1" stop-color="#1f4a63"/></linearGradient>
 <linearGradient id="fShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1c10" stop-opacity=".5"/></linearGradient>
 <radialGradient id="fSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6cc"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
 <rect width="160" height="110" fill="url(#fSky)"/><circle cx="126" cy="32" r="22" fill="url(#fSun)"/><circle cx="126" cy="32" r="7" fill="#fff6d0"/>
 <path d="M0 74q22-14 46-6t52-4q30-6 62 6V84H0z" fill="#5d7a62" opacity=".75"/><path d="M0 80q30-8 60-3t100-2V88H0z" fill="#3f5c4a" opacity=".8"/>
 <rect y="84" width="160" height="26" fill="url(#fSea)"/><path d="M0 90q8-2.500 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0M-6 98q8-2.500 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0" fill="none" stroke="#bfe0e6" stroke-width=".7" opacity=".45"/>
 <path d="M0 100q30-8 70-7t90 4V110H0z" fill="#e2cd96"/><path d="M0 100q30-8 70-7t90 4" fill="none" stroke="#f8f3e4" stroke-width="1.600" opacity=".85"/><path d="M0 104q40-4 90-3t70 3V110H0z" fill="#c9b27a" opacity=".6"/>
 <path d="M6 92L10 56H58V92z" fill="url(#fW)" stroke="#2a1c10" stroke-width=".8"/><path d="M154 92L150 56H102V92z" fill="url(#fW)" stroke="#2a1c10" stroke-width=".8"/>
 ${course(8,58,56,92)}${course(102,152,56,92)}
 <rect x="56" y="30" width="48" height="62" fill="url(#fW)" stroke="#2a1c10" stroke-width=".9"/>${course(56,104,30,92)}
 <rect x="94" y="30" width="10" height="62" fill="#2a1c10" opacity=".28"/><rect x="104" y="56" width="48" height="36" fill="#2a1c10" opacity=".22"/>
 <rect x="8" y="55" width="52" height="3" fill="#8a7654" stroke="#2a1c10" stroke-width=".5"/><rect x="100" y="55" width="52" height="3" fill="#7a6848" stroke="#2a1c10" stroke-width=".5"/><rect x="54" y="28" width="52" height="3" fill="#8a7654" stroke="#2a1c10" stroke-width=".5"/>
 ${merl(10,58,55)}${merl(102,152,55)}${merl(55,105,28)}
 ${gun(24,69)}${gun(44,69)}${gun(116,69,1)}${gun(136,69,1)}${gun(70,46)}${gun(90,46,1)}
 ${puff(34,63,4.500)}${puff(125,60,4)}${puff(98,41,3.500)}
 <path d="M70 92V74q10-14 20 0V92z" fill="#160c07" stroke="#2a1c10" stroke-width=".8"/><path d="M72 76h16M72 82h16M72 88h16M76 74v18M80 71v21M84 74v18" stroke="#6a5a48" stroke-width=".7" opacity=".8"/>
 <path d="M80 28V8" stroke="#2a1608" stroke-width="1.400"/><path d="M80 8q8-3 15 0t0 8q-7 3-15 0z" fill="#c60b1e" stroke="#4a0a10" stroke-width=".5"/><path d="M82 11.500q6-2 11 0" stroke="#f1bf00" stroke-width="1.200" fill="none"/>
 <path d="M10 92H152V96H10z" fill="url(#fShade)"/>
 <g stroke="#3a2614" stroke-linecap="round" fill="none"><path d="M140 98q-3-14 1-24" stroke-width="2"/><path d="M18 100q3-12-1-20" stroke-width="1.800"/></g><g fill="#3d6a3a" stroke="#1c3a1e" stroke-width=".4"><path d="M141 74q-9-3-13 3q8-2 13 0zM141 74q8-5 14-1q-8 0-14 1zM141 74q-3-8 3-10q0 6-3 10zM141 74q-8-8-14-6q8 1 14 6z"/><path d="M17 80q-8-3-12 2q7-2 12-1zM17 80q8-5 13-2q-7 1-13 2zM17 80q-2-8 4-9q-1 6-4 9z"/></g></svg>`};
/* ---------- screens: structure the plain text screens ---------- */
const strip=t=>t.replace(/^[^\p{L}\p{N}]+/u,'').trim();
function polishScreens(){const a=$('app'),sc=S.screen,scr=a.querySelector(':scope>.scr');if(!scr)return;
 if(sc==='cove'){scr.querySelectorAll('.choices button').forEach(b=>{const t=b.querySelector('b');if(t)t.textContent=strip(t.textContent);if(!b.querySelector('.mini-face,.rico'))b.insertAdjacentHTML('afterbegin',`<span class="rico">${ic(b.id==='repair'?'hammer':'island')}</span>`)})}
 if(sc==='event'){const ch=scr.querySelector('.choices');if(ch){ch.classList.add('opts');ch.querySelectorAll('.evopt').forEach((b,i)=>{const m=/^(.*?)\s*\((.*)\)\s*$/.exec(b.textContent);b.innerHTML=`<span class="eb">${'ABCDE'[i]}</span><span class="et"><b>${m?m[1]:b.textContent}</b>${m?`<small>${m[2]}</small>`:''}</span>`})}}
 if(sc==='reward'){const ps=[...scr.querySelectorAll(':scope>p:not(.msg)')];const pk=ps.find(p=>/Choose one reward/.test(p.textContent));let extra='';if(pk){const m=/\((\d+ picks? left)\)/.exec(pk.textContent);extra=m?' · '+m[1]:'';pk.remove()}
  const h3=scr.querySelector('h3');const ch=scr.querySelector('.choices');if(h3&&ch){h3.innerHTML='A card'+extra;ch.classList.add('rwc');ch.insertAdjacentHTML('beforebegin','<h3>Or improve the voyage</h3>')}
  const sk=$('skip');if(sk&&!scr.querySelector('.choices'))sk.textContent='Skip these'}
 if(sc==='shipwright'&&!scr.dataset.p6){scr.dataset.p6=1;const sv=shipValue(),i=LADDER.indexOf(S.ship.type),sh0=ship();
  const pips=l=>[0,1].map(j=>`<i class="${j<l?'on':''}"></i>`).join('');
  const up=Object.keys(UPG).map(k=>{const l=S.ship.upg[k],max=l>=2,poor=!max&&S.coin<UPG_COST[l];return `<button class="tile ${max?'max':''} ${poor?'poor':''}" onclick="upgradeShip('${k}')" ${max||poor?'disabled':''}><span class="tn">${UPG[k].n}</span><span class="pp">${pips(l)}</span><span class="td">${UPG[k].d}</span><span class="tc">${max?'Maxed':UPG_COST[l]+' 🪙'}</span></button>`}).join('');
  const ships=LADDER.slice(i+1,i+3).map(t=>{const s2=SHIPS[t],p=Math.max(0,s2.price-sv),poor=S.coin<s2.price-sv;return `<button class="shiprow ${poor?'poor':''}" onclick="buyShip('${t}')" ${poor?'disabled':''}><span class="sr1"><b>${s2.n}</b><span class="stat">⛵ ${s2.hull}</span><span class="stat">👥 ${s2.crew}</span><span class="stat">💥 ${s2.guns}</span></span><span class="sr2">${s2.perk}</span><span class="sr3">${s2.price} − ${sv} trade-in = <b>${p} 🪙</b></span></button>`}).join('')||'<p class="small">Nothing bigger for sale.</p>';
  const need=S.ship.hull<hullMax();
  scr.innerHTML=`<h2>🛠️ Shipwright</h2><div class="swinfo"><b>${sh0.n}</b><i>Hull ${S.ship.hull}/${hullMax()}</i><span>${sh0.perk}</span><em>Trade-in value ${sv} 🪙</em></div><h3>Upgrades</h3><div class="tiles">${up}</div>
  <button class="repair" onclick="repairCoin()" ${need&&S.coin>=2?'':'disabled'}><span>🔧 Repair hull</span><small>2 🪙 per point</small></button><h3>Ships for sale</h3><div class="ships">${ships}</div>`}}
/* ---------- per-render polish ---------- */
const _r6=render;
render=function(){_r6();polish()};
function polish(){const a=$('app');if(!S||!a)return;const sc=a.dataset.screen||S.screen;if(sc!==LASTSC){SCT=LASTSC===null?0:performance.now();LASTSC=sc}
 if(S.screen==='combat'&&S.combat){const c=C();const h=$('hand');
  if(h){const n=h.children.length;const grid=n>=6;h.classList.toggle('grid',grid);if(grid){h.classList.remove('fan','crowd');h.style.setProperty('--cols',Math.ceil(n/2))}h.dataset.n=n;[...h.children].forEach(c=>c.style.gridColumn='');if(grid){const cols=Math.ceil(n/2),k=n-cols;if(k>0&&k<cols)h.children[cols].style.gridColumn=(1+(cols-k))+' / span 2'}
   if(!RM){const dp=document.querySelector('.pile.draw');if(dp){const t=dp.getBoundingClientRect();h.querySelectorAll('.card.deal').forEach(el=>{const r=el.getBoundingClientRect();el.style.setProperty('--fx',(t.left+t.width/2-r.left-r.width/2)+'px');el.style.setProperty('--fy',(t.top+t.height/2-r.top-r.height/2)+'px')})}}}
  const can=c.hand.some(k=>playable(k)&&cost(k)<=c.energy);const et=$('endturn');if(et)et.classList.toggle('ready',!can);
  const key=c.turn+'|'+c.phase+'|'+c.enemy.n;if(key!==BKEY){const first=BKEY.split('|')[2]!==c.enemy.n||BKEY.split('|')[1]!==c.phase;BKEY=key;
   banner(first?({ship:'Ship battle',board:'Boarding!',duel:'Duel'}[c.phase]):'Turn '+c.turn,first?'Turn '+c.turn+' · your move':'Your move');if(!RM)SFX.play('turn')}}
 else BKEY='';
 const gold={cont:1,new:1,again:0};
 a.querySelectorAll('#leave,#sailon').forEach(b=>b.classList.add('lead'));
 ['takePrize','hire','extract','win'].forEach(id=>{const b=$(id);if(b)b.classList.add('gold')});
 const nc=$('new');if(nc&&!$('cont'))nc.classList.add('gold');const ct=$('cont');if(ct)ct.classList.add('gold');
 a.querySelectorAll('.cardwrap').forEach(w=>{const p=w.querySelector('.price'),c=w.querySelector('.card');if(p&&c)p.classList.toggle('poor',c.classList.contains('dim'))});
 polishScreens();
 emo(a)}
window.addEventListener('pageshow',()=>{});
})();
