/* ui9: FX queue player (cannon volleys, hits, boarding, sinking, cinematics). Never blocks input except tap-to-skip cards. */
(function(){
const spd=()=>{const f=M.set.fx;return f===0?0:f===2?.5:1};
const calm=()=>window.NOFX||RM;
let L=null;const layer=()=>{if(!L||!L.isConnected){L=document.createElement('div');L.id='fxl';document.body.appendChild(L)}return L};
const R=sel=>{const e=typeof sel==='string'?document.querySelector(sel):sel;return e?e.getBoundingClientRect():null};
const cx=r=>r.left+r.width/2,cy=r=>r.top+r.height/2;
function el(cls,x,y,life,html,vars){const d=document.createElement('div');d.className='fxe '+cls;d.style.left=x+'px';d.style.top=y+'px';if(html)d.innerHTML=html;if(vars)Object.entries(vars).forEach(([k,v])=>d.style.setProperty(k,v));layer().appendChild(d);setTimeout(()=>d.remove(),life);return d}
const later=(ms,f)=>setTimeout(()=>{try{f()}catch(e){}},ms*spd());
function shakeBy(n){if(calm()||!M.set.shake)return;const a=$('app');if(!a)return;a.classList.remove('shake','shake2','shake3');void a.offsetWidth;a.classList.add(n>=14?'shake3':n>8?'shake2':'shake');setTimeout(()=>a.classList.remove('shake','shake2','shake3'),520)}
function sparks(x,y,n,cls){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,d=18+Math.random()*34;el('spark '+(cls||''),x,y,600,'',{'--dx':Math.cos(a)*d+'px','--dy':(Math.sin(a)*d-8)+'px'})}}
function ball(from,to,delay,enemy){later(delay,()=>{const dx=to.x-from.x,dy=to.y-from.y;const b=el('ball',from.x,from.y,520,'',{'--dx':dx+'px','--dy':dy+'px'});later(0,()=>{});
 later(300*0+0,()=>{});const t=setTimeout(()=>{sparks(to.x+(Math.random()*24-12),to.y+(Math.random()*14-7),4,enemy?'red':'');el('puff',to.x,to.y,500)},330*spd())})}
function volley(fromEl,toEl,n,enemy){const a=R(fromEl),b=R(toEl);if(!a||!b)return;const k=Math.min(4,Math.max(2,Math.round(n/5)+1));
 for(let i=0;i<k;i++){const f={x:cx(a)+(i-k/2)*14,y:cy(a)};const t={x:cx(b)+(Math.random()*40-20),y:cy(b)+(Math.random()*16-8)};later(i*90,()=>{el('puff',f.x,f.y,600);el('flash',f.x,f.y,200)});ball(f,t,i*90+40,enemy)}
 const ms=document.querySelector(enemy?'.eart':'.myship');if(ms){ms.classList.remove('recoil');void ms.offsetWidth;ms.classList.add('recoil')}}
function bigText(txt,cls){if(calm())return;const d=document.createElement('div');d.className='bigtxt '+(cls||'');d.textContent=txt;layer().appendChild(d);setTimeout(()=>d.remove(),1100*Math.max(.4,spd()))}
function crewRun(fromEl,toEl,n){const a=R(fromEl),b=R(toEl);if(!a||!b)return;for(let i=0;i<n;i++){later(i*70,()=>{const x=cx(a)+(Math.random()*30-10),y=cy(a)+(Math.random()*10);el('runner',x,y,700,FIG,{'--dx':(cx(b)-x+(Math.random()*30-15))+'px','--dy':(cy(b)-y)+'px'})})}}
const FIG='<svg viewBox="0 0 12 18"><circle cx="6" cy="3" r="2.4"/><path d="M6 5.4v6M6 7L2.5 10M6 7l3.5-2M6 11.4L3.5 17M6 11.4L8.5 17"/><path d="M9.5 5l2-3" class="bl"/></svg>';
/* ---------- cinematic cards ---------- */
let cine=null;
function closeCine(){if(cine){cine.classList.add('out');const c=cine;cine=null;setTimeout(()=>c.remove(),300)}}
function card(html,cls,ms){if(window.NOFX||spd()===0)return;if(cine)closeCine();const d=document.createElement('div');d.className='cine '+(cls||'')+(RM?' still':'');d.innerHTML=html+'<small class="skip">tap to continue</small>';d.onclick=closeCine;document.body.appendChild(d);cine=d;
 if(window.cancelAuto)cancelAuto();setTimeout(()=>{if(cine===d)closeCine()},ms*Math.max(.5,spd()))}
const BOSS={1:['Act I boss','The Pirate-Hunter Squadron','Two Navy ships sail out of Nassau\u2019s own harbour. Break the escort, then the flagship.','img/art/enemy-navy.webp'],
 2:['Act II boss','The Guarda Costa Stockade','A walled fort on a sandy cay. Your guns are useless; this is a crew assault.','img/art/event-port.webp'],
 3:['Final boss','Benjamin Hornigold','Once your friend. Now he carries the King\u2019s pardon and hunts his own. Ship, boarding, then captain to captain.','img/art/portrait-hornigold.webp']};
const ACTT={1:['Act I','The Flying Gang','Nassau is a pirate republic. The Navy is not far behind.','img/art/bg-nassau-base.webp'],2:['Act II','The Treasure Coast','Spanish silver, plate fleets and the Guarda Costa.','img/art/event-wreck.webp'],3:['Act III','The Hunter','Hornigold is coming. Pardoned, and hungry.','img/art/portrait-hornigold.webp']};
function introCard(d){const b=BOSS[d.boss];if(!b)return;card(`<div class="cimg" style="background-image:url(${b[3]})"></div><div class="ct"><i>${b[0]}</i><b>${b[1]}</b><p>${b[2]}</p></div>`,'boss',2800);SFX.play('intro')}
function actCard(d){const a=ACTT[d.act];if(!a)return;card(`<div class="cimg" style="background-image:url(${a[3]})"></div><div class="ct"><i>${a[0]}</i><b>${a[1]}</b><p>${a[2]}</p></div>`,'act',2400);SFX.play('intro')}
function endCard(d){if(d.kind==='death')card(`<div class="cimg dark"></div><div class="ct"><i>Lost</i><b>The captain falls</b><p>The sea keeps what it takes.</p></div>`,'death',1800);else card(`<div class="cimg rays" style="background-image:url(img/nassau-day9.jpg)"></div><div class="ct"><i>${d.kind==='win'?'Victory':'Home'}</i><b>${d.kind==='win'?'Free Nassau!':'Sailed home'}</b><p>${d.kind==='win'?'Hornigold is beaten. The flag still flies.':'The plunder is banked.'}</p></div>`,'win',2200);SFX.play(d.kind==='death'?'lose':'win')}
/* ---------- the player ---------- */
function play(q){if(!q.length)return;if(window.NOFX){q.length=0;return}const s=spd();let t=0;const gap={volley:380,enemyfire:360,clash:260,slash:200,sink:500};
 const mine='.myship',foe='.eart';
 q.forEach(f=>{const dly=t;const run=fn=>later(dly,fn);
  switch(f.t){
   case 'intro':if(f.boss){introCard(f)}break;
   case 'act':actCard(f);break;
   case 'end':endCard(f);break;
   case 'volley':if(calm()){SFX.play('cannon');break}run(()=>{SFX.play('cannon');if(f.ph==='ship')volley(mine,foe,f.n,false);else{const b=R(foe);if(b)sparks(cx(b),cy(b),5,'')}});t+=gap.volley;break;
   case 'enemyfire':if(calm()){break}run(()=>{if(f.k==='melee'){const b=R(mine);if(b)sparks(cx(b),cy(b),5,'red');SFX.play('clash')}else{SFX.play('cannon');volley(foe,mine,f.k==='crit'?12:8,true);if(f.k==='crit')later(240,()=>{const b=R(mine);if(b)el('reticle',cx(b),cy(b),600)})}});t+=gap.enemyfire;break;
   case 'slash':case 'clash':if(calm()){SFX.play('clash');break}run(()=>{const b=R(foe);if(!b)return;SFX.play('clash');el('xslash',cx(b),cy(b)+8,420,'<svg viewBox="-20 -20 40 40"><path d="M-16 -16L16 16M16 -16L-16 16"/></svg>');sparks(cx(b),cy(b),6,'')});t+=gap.slash;break;
   case 'hit':run(()=>{SFX.play('hit');if(f.big)shakeBy(f.d);if(f.d>=18)bigText('CRUSHING!','crit');else if(f.big)bigText('HEAVY!','crit')});break;
   case 'hurt':run(()=>{shakeBy(f.d)});break;
   case 'sink':run(()=>{const a=document.querySelector('.eart');if(a)a.classList.add('sinking');const r=R(foe);if(r){for(let i=0;i<10;i++)el('splash',cx(r)+(Math.random()*70-35),cy(r)+14,900,'',{'--dx':(Math.random()*60-30)+'px','--dy':(-20-Math.random()*40)+'px'})}shakeBy(16);SFX.play('thud');bigText('SUNK!','sunk')});t+=gap.sink;break;
   case 'wind':run(()=>{if(calm())return;for(let i=0;i<5;i++)later(i*80,()=>el('windln',-30,120+i*46+Math.random()*30,900))});break;
   case 'grapple':run(()=>{const a=R(foe),b=R(mine);if(!a||!b||calm())return;for(let i=0;i<3;i++)later(i*120,()=>el('hook',cx(a),cy(a),600,'🪝',{'--dx':(cx(b)-cx(a)+i*16-16)+'px','--dy':(cy(b)-cy(a))+'px'}));bigText('GRAPPLED!','board');SFX.play('thud')});break;
   case 'boarding':run(()=>{if(calm())return;crewRun(mine,foe,Math.min(8,3+Math.round(S.crew/8)));bigText('BOARDERS AWAY!','board');SFX.play('clash')});t+=300;break;
   case 'duel':run(()=>{if(!calm())bigText('CAPTAIN TO CAPTAIN','duel');SFX.play('intro');if(!calm())card(`<div class="cimg" style="background-image:url(img/art/portrait-hornigold.webp)"></div><div class="ct"><i>Duel</i><b>Hornigold steps forward</b><p>No crew now. Only the captains.</p></div>`,'boss',2200)});break;
   case 'order':run(()=>{const o=ORDERS[f.id];if(!o)return;SFX.play('order');if(!calm()){const b=R(mine);if(b)el('orderglow',cx(b),cy(b),700);bigText(o.n,'order')}});break;
   case 'upgrade':run(()=>{SFX.play('coins');const b=R('#hand')||R('#app');if(b&&!calm())sparks(cx(b),cy(b),10,'gold')});break;
   case 'block':run(()=>{if(calm())return;const b=R(mine);if(b){el('shieldglint',cx(b),cy(b)-6,500);SFX.play('block')}});break;
   case 'escape':run(()=>bigText('SHE RUNS!','sunk'));break;
   case 'victory':run(()=>{SFX.play('coins')});break}});
 q.length=0}
/* the fight screen lingers for a beat so you see her go down / strike her colours */
/* ---------- one-time coach tips (skippable, stored in M.tips) ---------- */
const TIPS={ship:['Ship vs ship','Tap a card to read it, then Play (or turn on Quick play in Settings). Your Order button is free once a turn. At half enemy hull you can Board her for full loot. Press End Turn when done.',()=>S.screen==='combat'&&S.combat.phase==='ship'],
 board:['Boarding','Crew cards and your crew fight now. Your ship cards still work at half strength. Win Advantage and keep your crew alive: at 0 enemy crew the ship is yours.',()=>S.screen==='combat'&&S.combat.phase==='board'],
 recruit:['Officers','Officers give a permanent bonus while they are fit; one per role. A wound benches them until you rest at a cove or port.',()=>S.screen==='recruit'],
 extract:['Sail home?','Taking your plunder home keeps 75% of its value as Banked Silver and your trophies. Pushing on pays more, but death loses the trophies.',()=>S.screen==='extract'],
 cove:['Careening cove','Choose one job: patch the ship, rest the captain and officers, or drill the crew to improve a card.',()=>S.screen==='cove']};
function tips(){if(window.NOFX||!M.set.tips||!S||!S.cap||document.getElementById('coach'))return;M.tips=M.tips||{};
 for(const k in TIPS){if(M.tips[k])continue;let ok=false;try{ok=TIPS[k][2]()}catch(e){}if(!ok)continue;M.tips[k]=1;saveMeta();
  const d=document.createElement('div');d.id='coach';d.className='coach';d.innerHTML=`<b>${TIPS[k][0]}</b><p>${TIPS[k][1]}</p><button onclick="this.parentElement.remove()">Got it</button><button class="off" onclick="M.set.tips=0;saveMeta();this.parentElement.remove()">No more tips</button>`;document.body.appendChild(d);return}}
 const _r=render;render=function(){let ghost=false;const app=document.getElementById('app');
 if(app&&!calm()&&spd()>0&&FXQ.some(f=>f.t==='victory')&&document.getElementById('foe')&&S&&S.screen!=='combat'){const sunk=FXQ.some(f=>f.t==='sink');FXQ.splice(0,FXQ.length,...FXQ.filter(f=>f.t!=='sink'));const clone=app.cloneNode(true);_r();document.body.appendChild(clone);clone.id='app';const r=app.getBoundingClientRect();clone.classList.add('ghostapp');Object.assign(clone.style,{position:'fixed',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',zIndex:44,pointerEvents:'none',margin:0});clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  const a=clone.querySelector('.eart');if(sunk&&a){a.classList.add('sinking');const b=a.getBoundingClientRect();for(let i=0;i<10;i++)el('splash',cx(b)+(Math.random()*70-35),cy(b)+14,900,'',{'--dx':(Math.random()*60-30)+'px','--dy':(-20-Math.random()*40)+'px'});shakeBy(16);SFX.play('thud');bigText('SUNK!','sunk')}else{bigText('SHE STRIKES HER COLOURS!','board');SFX.play('clash')}
  setTimeout(()=>{clone.style.transition='opacity .35s';clone.style.opacity=0;setTimeout(()=>clone.remove(),380)},1100*spd());
  const q=FXQ.splice(0,FXQ.length);requestAnimationFrame(()=>play(q));return}
 _r();setTimeout(tips,600);if(FXQ.length){const q=FXQ.splice(0,FXQ.length);requestAnimationFrame(()=>play(q))}};
document.addEventListener('keydown',e=>{if(cine&&(e.key==='Escape'||e.key===' '))closeCine()});
render();
})();
