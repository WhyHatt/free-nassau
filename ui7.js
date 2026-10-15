"use strict";
/* v6 layer (loads last): intent rail, captain's orders, traits, quick play, undo, auto end turn, damage preview. */
(function(){
const SET=()=>M&&M.set||SET_DEF;
const ORDI={fire:'powder',charge:'swords',hard:'anchor',litfuse:'flame',fairshare:'coin',noquarter:'skull',twinblades:'sword',getaway:'wind'};
const ORDS={fire:'Fire',charge:'Charge',hard:'Port',litfuse:'Fuses',fairshare:'Shares',noquarter:'Quarter',twinblades:'Twins',getaway:'Getaway'};
const INTG2={broad:'broad',grape:'grape',crit:'target',melee:'swords',rush:'sword',officer:'target',brace:'shield',slash:'sword',guard:'shield',lunge:'bolt',come:'wind',ram:'flame',skip:'q'};
const TARGET={broad:'ship',crit:'ship',ram:'ship',grape:'crew',melee:'crew',officer:'crew',rush:'heart',slash:'heart',lunge:'heart'};
const attackKind=k=>['broad','grape','crit','melee','rush','officer','slash','lunge','ram'].includes(k);
const tierOf=it=>['brace','guard','come','skip'].includes(it.k)?0:it.v<8?1:it.v<14?2:it.v<22?3:4;
/* ---- intent plate with net-after-Block, and the rail of the next two moves ---- */
intentHTML=function(it){const c=C();const tier=tierOf(it);const net=attackKind(it.k)?Math.max(0,it.v-c.block):null;
 const tip=`${it.tx}${net!==null&&c.block?` | after your ${c.block} Block: ${net?net+' gets through':'nothing gets through'}`:''}`;
 const tg=attackKind(it.k)?[TARGET[it.k]]:[];
 return `<div class="intent t${tier}" id="intent" data-tip="${tip}" title="${tip}" onclick="toggleTip(this)"><span class="ii">${ic(INTG2[it.k]||'q')}</span><b>${['come','skip'].includes(it.k)?'':it.v}</b><span class="tg2">${tg.map(g=>ic(g)).join('')}</span>${net!==null&&c.block?`<span class="net ${net?'':'ok'}">${net?'→'+net:'safe'}</span>`:''}</div>`};
function railHTML(){const c=C(),e=E();if(c.phase==='duel'&&false)return '';const a=[intent(1),intent(2)];
 const tip='Next moves: '+[intent(0),...a].map(i=>i.tx.replace(/<[^>]+>/g,'')).join(' → ');
 return `<div class="rail" data-tip="${tip}" title="${tip}" onclick="toggleTip(this)">${a.map((it,i)=>`<span class="rc t${tierOf(it)}" style="opacity:${1-i*.2}">${ic(INTG2[it.k]||'q')}${['come','skip'].includes(it.k)?'':`<b>${it.v}</b>`}</span>`).join('')}</div>`}
function traitsHTML(){const c=C(),e=E();if(!e.tr||!e.tr.length)return '';
 return `<div class="traits">${e.tr.map(t=>{const T=TRAITS[t];let lab=T[1];
  if(t==='runs'&&c.phase==='ship'){const n=e.run-c.turn+1;lab=n>0?`Flees in ${n}`:'Fleeing'}
  if(t==='grapple'&&c.phase==='ship'&&!c.boss){const n=e.gr-c.turn+1;lab=n>0?`Boards in ${n}`:'Boarding'}
  if(t==='fire'&&c.phase==='ship')lab=e.hull<=e.hullMax*.3?'About to ram!':'Fire ship';
  if(t==='plated')lab='Armour −2';
  return `<span class="trc t-${t}" data-tip="<b>${T[1]}</b>. ${T[2]}" title="${T[1]}: ${T[2]}" onclick="toggleTip(this)">${ic(TRG[t])}${lab}</span>`}).join('')}</div>`}
const TRG={plated:'shield',fire:'flame',runs:'wind',grapple:'anchor'};
function ordersHTML(){const c=C();return orderList().map(id=>{const o=ORDERS[id],cd=c.ord[id]||0,ready=orderReady(id);
  return `<button class="ord ${ready?'ready':cd?'cd':'used'}" id="ord-${id}" onclick="orderTap('${id}')" data-tip="<b>${o.n}</b> (free, once a turn, cooldown ${o.cd}). ${o.d}" title="${o.n}: ${o.d}">${ic(ORDI[id]||'star')}<span>${ORS(id)}</span>${cd?`<i>${cd}</i>`:''}</button>`}).join('')}
const ORS=id=>ORDS[id]||ORDERS[id].n;
window.orderTap=function(id){cancelAuto();if(!S||!S.combat)return;if(!orderReady(id)){return}SEL=null;useOrder(id)};
/* ---- combat screen ---- */
combatHTML=function(){const c=C(),e=E(),it=intent();const ph=c.phase;const W=WEATHER[c.weather];
 const key=c.turn+'|'+ph;if(c._ek!==key){c._ek=key;c._emx=3}c._emx=Math.max(c._emx||3,c.energy);
 const phases=`<div class="phases"><span class="${ph==='ship'?'on':''}" title="Phase 1: ship vs ship">${ic('ship')}</span><span class="${ph==='board'?'on':''}" title="Phase 2: boarding">${ic('swords')}</span>${c.boss===3||ph==='duel'?`<span class="${ph==='duel'?'on':''}" title="Duel">${ic('sword')}</span>`:''}</div>`;
 const big=ph==='ship'?gauge('',e.hull,e.hullMax,'g-hull','Enemy hull'):ph==='board'?gauge('',e.crew,e.crewMax,'g-crew','Enemy crew'):gauge('',e.hp,e.hpMax,'g-hp','Hornigold');
 const sub=ph==='ship'?`<span class="tag" title="Enemy crew">${ic('crew')}${e.crew}</span>`:'';
 const st=`${e.block?`<span class="tag" title="Block: absorbs damage">${ic('shield')}${e.block}</span>`:''}${e.weak?`<span class="tag" title="Weak: deals 25% less">😵${e.weak}</span>`:''}${e.burn?`<span class="tag" title="Burning: loses ${e.burn} each turn">${ic('flame')}${e.burn}</span>`:''}`;
 const dmg=ph==='ship'?1-e.hull/e.hullMax:0;const art=e.k==='fort'?fortSVG():ph==='duel'?duelSVG():shipSVG(e.k,false,dmg);
 const canBoard=ph==='ship'&&e.hull<=e.hullMax*.5&&!(c.boss)&&!c.queue.length;
 const sideBtn=(c.canFlee&&c.turn===1&&ph==='ship')?`<button class="side flee" onclick="flee()" title="Run before the wind: no loot">Flee</button>`:(ph==='board'&&!c.boss)?`<button class="side retreat" onclick="retreat()" title="Cut the grapples: lose 20% of your crew, no loot">Retreat</button>`:'';
 const pips=Array.from({length:c._emx},(_,i)=>`<i class="${i<c.energy?'on':''}"></i>`).join('');
 const dk=ph==='board'?`<span class="tag deckchip" data-tip="<b>${DECKN[c.deck][0]}</b>. ${DECKN[c.deck][1]}" title="${DECKN[c.deck][1]}" onclick="toggleTip(this)">${DECKN[c.deck][0]}</span>`:'';
 return `<div class="sea">
 <div class="topline">${phases}<span class="wx" data-tip="<b>${W.n}</b>. ${W.d}" title="${W.n}: ${W.d}" onclick="toggleTip(this)">${ic(WXI[c.weather]||'wind')} ${W.n}</span>${c.advT?`<span class="tag" title="Advantage for boarding">${ic('star')}${c.advT>0?'+':''}${c.advT}</span>`:''}${dk}${sideBtn}</div>
 ${inkArcs(it,ph)}
 <div class="enemy" id="foe"><div class="eart bob">${art}</div>
  <div class="eplate"><div class="ename">${e.n}${c.queue.length?` <small>+${c.queue.length}</small>`:''}</div><div class="estats">${big}${sub}${st}</div>${traitsHTML()}</div></div>
 ${intentHTML(it)}${railHTML()}
 <div class="myship">${miniShip(S.ship.type,false)}<div class="mycap">${ship().n}</div></div>
 ${canBoard?`<div class="boardrow"><button id="board" class="gold" onclick="board()" title="Full loot, risks crew, officers and captain">Board her!</button><span class="small">or keep firing to sink (≈40% loot)</span></div>`:''}
 </div>
 <div class="mine"><div class="pips" id="energy" data-e="${c.energy}" title="Energy: ${c.energy}">${pips}</div><span class="tag big" title="Block: absorbs damage this turn">${ic('shield')}${c.block}</span>${c.str||c.nBuff?`<span class="tag" title="+${(c.str||0)+(c.nBuff||0)} damage on your attacks">+${(c.str||0)+(c.nBuff||0)}</span>`:''}${c.fireBuff?`<span class="tag" title="Fire at will: cannon +${c.fireBuff} this turn">${ic('powder')}+${c.fireBuff}</span>`:''}<span class="mflex"></span><div class="orders" id="orders">${ordersHTML()}</div></div>
 <div class="tray"><div class="cards hand" id="hand">${c.hand.map((k,i)=>{const ok=playable(k);return cardHTML(k,`data-i="${i}" onclick="play(${i})"`,(ok?'':'off ')+(ok&&cost(k)>c.energy?'dim':''))}).join('')}</div></div>
 <div class="log" id="log" onclick="this.classList.toggle('open')" title="Tap for the full log">${c.log.map((l,i)=>`<div class="${i?'old':''}">${l}</div>`).join('')}</div>`};
combatFoot=function(){const c=C();const idle=!canAct();
 return `<div class="pile draw" title="Draw pile">${ic('cards')}<b>${c.draw.length}</b><small>Draw</small></div><button id="endturn" class="endturn ${idle&&autoEndReady()?'ready':''}" onclick="endTurn()">End Turn</button><button class="undo" id="undo" onclick="undoTap()" ${c.undo?'':'disabled'} aria-label="Undo last card" title="Undo the last card (not available after drawing cards)">↶<small>Undo</small></button><div class="pile disc" title="Discard pile">${ic('cards')}<b>${c.disc.length}</b><small>Discard</small></div>`};
window.undoTap=function(){cancelAuto();SEL=null;if(undoPlay())SFX&&SFX.play&&SFX.play('tick')};
/* ---- quick play + press-and-hold to inspect ---- */
let LP=false,LPT=null;
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('#hand .card');if(!el||!SET().quick||window.NOFX)return;clearTimeout(LPT);LP=false;LPT=setTimeout(()=>{LP=true;const i=+el.dataset.i,c=C();if(c&&c.hand[i]){SEL={type:'hand',i,k:c.hand[i],screen:S.screen};applySel()}},420)},true);
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(LPT),true));
document.addEventListener('click',e=>{if(LP&&e.target.closest&&e.target.closest('#hand .card')){e.stopPropagation();e.preventDefault();LP=false}},true);
tapHand=function(i){const c=C();if(!c)return;cancelAuto();const k=c.hand[i];if(!k)return;const el=document.querySelector(`#hand .card[data-i="${i}"]`);
 if(SET().quick&&!window.__forceSel){if(playable(k)&&cost(k)<=c.energy){SEL=null;play(i)}else{shakeEl(el);SEL={type:'hand',i,k,screen:S.screen};applySel()}return}
 if(SEL&&SEL.type==='hand'&&SEL.i===i&&SEL.k===k){if(playable(k)&&cost(k)<=c.energy){SEL=null;play(i)}else shakeEl(el);return}
 SEL={type:'hand',i,k,screen:S.screen};applySel()};
/* ---- card preview: what will this do right now? simulated on a copy of the run ---- */
function previewCard(i){if(!S||!S.combat)return null;const sv=S,m0=JSON.stringify(M),fl=window.NOFX;let out=null;const rr=window.render,ss=window.save;
 try{S=JSON.parse(JSON.stringify(S));const c=S.combat,e=c.enemy,k=c.hand[i];const h0=e.hull,cr0=e.crew,hp0=e.hp||0,b0=c.block,w0=e.weak,bu0=e.burn,sh0=sv.ship.hull,pc0=sv.crew,php0=sv.hp,hand0=c.hand.length,adv0=c.advT,en0=c.energy;
  window.NOFX=1;window.render=()=>{};window.save=()=>{};window.__prev=[];play(i);const parts=window.__prev;window.__prev=null;
  if(!S||!S.combat){out={won:1}}else{const c1=S.combat,e1=c1.enemy;const o=[];const dh=h0-e1.hull,dc=cr0-e1.crew,dp=hp0-(e1.hp||0);
   if(dh>0)o.push(`${dh} to their hull`);if(dc>0)o.push(`${dc} of their crew`);if(dp>0)o.push(`${dp} to their captain`);
   if(c1.block>b0)o.push(`+${c1.block-b0} Block`);if(e1.weak>w0)o.push(`Weak ${e1.weak}`);if(e1.burn>bu0)o.push(`Burn ${e1.burn}`);
   if(S.ship.hull>sh0)o.push(`+${S.ship.hull-sh0} hull`);if(S.crew>pc0)o.push(`+${S.crew-pc0} crew`);if(S.hp>php0)o.push(`+${S.hp-php0} HP`);
   if(c1.advT>adv0)o.push(`+${c1.advT-adv0} Advantage`);const dr=c1.hand.length-(hand0-1);if(dr>0)o.push(`draw ${dr}`);if(c1.energy>en0-cost(k))o.push('+1 energy');
   const pt=parts&&parts[0]?parts[0].filter(p=>p[1]).map(p=>`${p[0]} ${p[1]>0&&p[0]!=='Base'?'+':''}${p[1]}`).join(', '):'';
   out={txt:o.join(', ')||'No immediate effect',math:parts&&parts.length>1?parts.map(p=>p.filter(x=>x[1]).map(x=>`${x[0]} ${x[1]>0&&x[0]!=='Base'?'+':''}${x[1]}`).join(', ')).join(' | '):pt}}
 }catch(err){out=null}finally{S=sv;window.NOFX=fl;window.render=rr;window.save=ss;window.__prev=null;try{M=JSON.parse(m0)}catch(e){}}
 return out}
window.previewCard=previewCard;
/* ---- selection panel (no swap in v6) ---- */
const PH={ship:'Ship battle',board:'Boarding',duel:'Duel'};
function hintFor(){const c=S&&S.combat;if(!c||S.screen!=='combat')return 'Tap a card to read it.';
 const can=canAct();const idle=!can&&autoEndReady();
 const q=SET().quick?'Tap a card to play it. Press and hold to read it.':'Tap a card to read it, tap again to play it.';
 return `<div class="tl"><span class="tn">Turn ${c.turn}</span><span class="tp">${PH[c.phase]} · your move</span></div><p>${idle?'Nothing left to play. End your turn.':can?q:'No energy for these. End your turn.'}</p>`}
function dbody(k,cv,btn,note,pv){const cd=CARDS[k];return `<div class="dmain"><div class="dhead${cd.n.length>15?' long':''}"><span class="cost">${cv}</span><b class="dn">${cd.n}</b><span class="dtype">${TAGN[cd.tag]}${cd.pw?' · '+'💥'.repeat(cd.pw):''}</span></div>
 <div class="dtxt">${dtext(k)}</div>${note?`<div class="dnote">${note}</div>`:pv?`<div class="dnow" title="${pv.math||''}"><b>Now:</b> ${pv.txt}${pv.math?` <small>(${pv.math})</small>`:''}</div>`:`<div class="dgl">${glossary(k)}</div>`}</div>
 <div class="dside"><button class="dx" onclick="deselect()" aria-label="Close"><span>✕</span></button>${btn||''}</div>`}
let lastSel='';
window.playSel=function(){if(!SEL||SEL.type!=='hand')return;const i=SEL.i;SEL=null;applySel();play(i)};
applySel=function(){const a=$('app');document.querySelectorAll('.card.sel').forEach(e=>e.classList.remove('sel'));const old=$('detailOv');if(old)old.remove();a.classList.remove('docked');const d=$('detail');
 if(!SEL){lastSel='';if(d){d.className='detail empty';d.innerHTML=hintFor();emo(d)}return}
 const key=JSON.stringify([SEL.type,SEL.i,SEL.n,SEL.k]);const fresh=key!==lastSel;lastSel=key;
 if(SEL.type==='hand'){const c=C();const el=document.querySelector(`#hand .card[data-i="${SEL.i}"]`);if(!c||!el||!d){SEL=null;return}el.classList.add('sel');const k=SEL.k,ok=playable(k),aff=cost(k)<=c.energy;
  d.className='detail';let btn,note='',pv=null;
  if(ok&&aff){btn=`<button class="gold dgo" id="selPlay" onclick="playSel()">Play</button>`;pv=previewCard(SEL.i)}
  else if(ok){btn=`<button class="dgo off" id="selPlay" disabled>No energy</button>`;note=`Costs ${cost(k)}, you have ${c.energy}.`}
  else{btn=`<button class="dgo off" disabled>Dead weight</button>`;note='Cannot be played. Dismiss it at a port or smuggler.'}
  d.innerHTML=dbody(k,cost(k),btn,note,pv);emo(d);if(fresh){SFX.play('tick');try{if(!RM&&!window.NOFX&&SET().vib&&navigator.vibrate)navigator.vibrate(8)}catch(e){}}return}
 const el=cardEls()[SEL.n];if(!el){SEL=null;return}el.classList.add('sel');const k=SEL.k;let lab=actLabel(el);lab=lab.replace('Take this card','Take card').replace(/^Buy \((.*)\)$/,'Buy $1').replace('Remove this card','Remove').replace(/^Upgrade this card$/,'Improve');const dim=el.classList.contains('dim');
 const ov=document.createElement('div');ov.id='detailOv';ov.className='detail docked';
 ov.innerHTML=dbody(k,CARDS[k].c,lab?`<button class="gold dgo" id="selCommit" onclick="commitCard(cardEls()[SEL.n])" ${dim?'disabled':''}>${dim?'Too dear':lab}</button>`:'',dim&&lab?'Not enough silver for this one.':'');
 const act=a.querySelector(':scope>.actions');a.insertBefore(ov,act||null);a.classList.add('docked');emo(ov);if(fresh)SFX.play('tick')};
const _al=actLabel;actLabel=function(el){const a=el.dataset.act||'';if(/^upgradeCard/.test(a))return 'Improve';if(/^removeSmug/.test(a))return 'Remove';if(/^buySmug/.test(a)){const pr=el.parentElement&&el.parentElement.querySelector('.price');return 'Buy'+(pr?' ('+pr.textContent.trim()+')':'')}return _al(el)};
/* ---- auto End Turn when nothing can be played ---- */
let AUTO=null;
window.cancelAuto=function(){if(AUTO){clearTimeout(AUTO);AUTO=null}const e=document.getElementById('endturn');if(e)e.classList.remove('counting')};
function scheduleAuto(){cancelAuto();if(window.NOFX||!SET().auto||!S||S.screen!=='combat'||!S.combat)return;const c=S.combat;if(c.hand.length===0&&c.turn>0)return;
 if(!autoEndReady())return;const turn=c.turn,ph=c.phase;const e=document.getElementById('endturn');if(e)e.classList.add('counting');
 AUTO=setTimeout(()=>{AUTO=null;if(S&&S.screen==='combat'&&S.combat&&S.combat.turn===turn&&S.combat.phase===ph&&autoEndReady()&&!SEL)endTurn()},SET().fx===0?500:1300)}
const _rr=render;render=function(){_rr();if(S&&S.screen==='combat')scheduleAuto()};
document.addEventListener('pointerdown',e=>{if(AUTO&&!e.target.closest('#endturn'))cancelAuto()},true);
render();
})();
/* ---------- map: four lanes, new node types ---------- */
(function(){
Object.assign(NODEG,{smuggler:'coin',wreck:'skull',storm:'storm'});
const NODEL={fight:'Battle',elite:'Elite',event:'Event',port:'Port',shipwright:'Shipwright',cove:'Cove',treasure:'Treasure',smuggler:'Smuggler',wreck:'Wreck',storm:'Storm',boss:'Boss'};
const jit=(r,c,k)=>{let h=Math.sin(r*127.1+c*311.7+k*74.7)*43758.5453;return h-Math.floor(h)-.5};
mapHTML=function(){const R=S.map.length;let nodes='',path='';
 const pos=(r,c)=>{const last=r===R-1;return [last?50:(c+.5)/COLS*100+jit(r,c,1)*7,4+(R-1-r+.5)/R*90+(last?0:jit(r,c,2)*3)]};
 for(let r=0;r<R-1;r++)S.map[r].forEach((n,c)=>{if(n.t==='empty')return;S.map[r+1].forEach((m,c2)=>{if(m.t==='empty')return;if(r+1!==R-1&&Math.abs(c-c2)>1)return;const[a,b]=pos(r,c),[x,y]=pos(r+1,c2);
  const mx=(a+x)/2+jit(r,c*3+c2,3)*7,my=(b+y)/2+jit(r,c*3+c2,4)*2;const walked=n.done&&m.done;const hot=r===S.row&&c===S.col&&avail(r+1,c2);
  path+=`<path d="M${a.toFixed(1)} ${b.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" class="${walked?'walked':''} ${hot?'hot':''}"/>`})});
 for(let r=R-1;r>=0;r--)S.map[r].forEach((n,c)=>{if(n.t==='empty')return;const av=avail(r,c),cur=r===S.row&&c===S.col;const[x,y]=pos(r,c);
  const g=n.t==='recruit'?'recruit':NODEG[n.t];const nm=n.t==='recruit'?ROLES[n.role].n:NODEN[n.t];const tip=`<b>${nm}</b>. ${NODED[n.t]||''}`;
  nodes+=`<div class="node ${av?'avail':''} ${n.done?'done':''} ${cur?'cur':''} n-${n.t}" style="left:${x}%;top:${y}%" data-r="${r}" data-c="${c}" title="${nm}" data-tip="${tip}" onclick="go(${r},${c})"><span class="nb">${ic(g)}</span>${av?`<em>${n.t==='recruit'?ROLES[n.role].n.replace('Master ','').replace('Boarding Master','Boarding'):NODEL[n.t]}</em>`:''}</div>`});
 const cp=S.row>=0?pos(S.row,S.col):[50,96];
 return `<div class="chart" style="--rows:${R}"><svg class="routes" viewBox="0 0 100 100" preserveAspectRatio="none">${path}</svg>${nodes}
  <div class="mapship ${S.row<0?'start':''}" style="left:${cp[0]}%;top:${cp[1]}%">${miniShip(S.ship.type,false)}</div></div>`};
mapScreen=function(){const a=$('app');const R=S.map.length;
 a.innerHTML=hud()+`<div class="scr mapscr"><div class="maphead"><h2>${ACTS[S.act].n}</h2><span class="leg" title="Leg">${ic('rose')} ${Math.max(0,S.row+1)}/${R}</span></div>${S.msg?`<p class="msg">${S.msg}</p>`:''}${mapHTML()}</div>
 <div class="actions maprow"><div class="plate"><span class="pl-ic">${propCompass}</span><span class="pl-t">Choose your heading<small>1 ration per leg · hold a mark for info</small></span></div><button class="side" onclick="showMenu('deck')">Deck ${S.deck.length}</button></div>`;a.dataset.screen='map'};
})();
