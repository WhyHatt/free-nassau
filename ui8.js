/* ui8: settings, rules text, title, captain select (doctrines), Nassau, run summary, logbook */
(function(){
const SET=()=>M.set;
const RMK0='fnrm';
window.applySettings=function(){const s=M.set,h=document.documentElement;h.classList.toggle('ts1',s.text===1);h.classList.toggle('ts2',s.text===2);h.classList.toggle('cb',!!s.cb);
 if(!window.NOFX){RM=!!s.rm;h.classList.toggle('rm',!!RM)}
 h.style.setProperty('--shake',s.shake?1:0)};
window.setSet=function(k,v,tab){M.set[k]=v;saveMeta();applySettings();if(k==='rm'){try{localStorage.setItem(RMK0,v?'1':'0')}catch(e){}}
 if(k==='mus'&&window.SFX&&SFX.setMusicVol)SFX.setMusicVol(v/100);if(k==='sfx'&&window.SFX&&SFX.setSfxVol)SFX.setSfxVol(v/100);
 if(tab!==false)(S&&S.cap&&$('bkpage'))?bkTab('settings'):(typeof renderSettingsPage==='function'&&renderSettingsPage())};
const sw=(k,label,sub)=>{const on=!!M.set[k];return `<button class="sw ${on?'on':''}" role="switch" aria-checked="${on}" id="set-${k}" onclick="setSet('${k}',${on?0:1})"><span>${label}${sub?`<small>${sub}</small>`:''}</span><i></i><em>${on?'On':'Off'}</em></button>`};
const seg=(k,label,opts)=>`<div class="seg"><span>${label}</span><div>${opts.map(([v,t])=>`<button class="${M.set[k]===v?'on':''}" id="set-${k}-${v}" onclick="setSet('${k}',${v})">${t}</button>`).join('')}</div></div>`;
const rng=(k,label)=>`<label class="rng"><span>${label}</span><input type="range" min="0" max="100" step="10" value="${M.set[k]}" oninput="M.set['${k}']=+this.value;saveMeta();if(window.SFX){SFX.setMusicVol&&SFX.setMusicVol(M.set.mus/100);SFX.setSfxVol&&SFX.setSfxVol(M.set.sfx/100)}"></label>`;
window.settingsBody=function(){const mu=SFX.isMuted();return `<div class="setl">
 <button class="sw ${mu?'':'on'}" id="mute" role="switch" aria-checked="${!mu}" onclick="SFX.setMuted(!SFX.isMuted());setSet('mus',M.set.mus)"><span>Sound</span><i></i><em>${mu?'Off':'On'}</em></button>
 ${rng('mus','Music')}${rng('sfx','Effects')}
 <h3 class="bkh"><span>Speed</span></h3>
 ${sw('quick','Quick play','Tap a card to play it straight away. Hold a card to inspect.')}
 ${sw('auto','Auto End Turn','End the turn by itself when nothing is playable.')}
 ${seg('fx','Animations',[[1,'Normal'],[2,'Fast'],[0,'Skip']])}
 <h3 class="bkh"><span>Comfort</span></h3>
 ${sw('rm','Reduce motion','No shake, flashes or flying cards.')}
 ${sw('shake','Screen shake')}${sw('vib','Vibration')}
 ${seg('text','Text size',[[0,'Normal'],[1,'Large'],[2,'Huge']])}
 ${sw('cb','Colour-blind palette','Blue and orange instead of red and green, plus shape markers.')}
 ${sw('tips','Show tips','Short hints the first time something appears.')}
 <h3 class="bkh"><span>Save</span></h3>
 <button id="export" onclick="exportSave()">Copy save code</button><button id="import" onclick="importSave()">Load save code</button></div>`};
window.exportSave=function(){const code=btoa(unescape(encodeURIComponent(JSON.stringify({m:M,r:S&&S.cap?S:null}))));try{navigator.clipboard.writeText(code);toast('Save code copied.')}catch(e){prompt('Copy your save code',code)}};
window.importSave=function(){const code=prompt('Paste a save code');if(!code)return;try{const o=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));if(!o.m||typeof o.m.banked!=='number')throw 0;localStorage.setItem(METAKEY,JSON.stringify(o.m));if(o.r&&o.r.v===6)localStorage.setItem(RUNKEY,JSON.stringify(o.r));location.reload()}catch(e){toast('That code did not work.')}};
window.toast=function(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),1800)};
bkSettings=function(){return `<h3 class="bkh"><span>Settings</span></h3>${settingsBody()}<div class="setl"><button id="quit" onclick="$('modal').innerHTML='';S=null;render()">Save and quit to title</button>
 <button id="giveup" class="danger" onclick="if(confirm('Abandon this run? It counts as a death.')){$('modal').innerHTML='';endRun('death')}">Give up this run</button></div><p class="sm center">Free Nassau · v6</p>`};
/* rules / legend */
bkLegend=function(){const row=(i,a,b)=>`<div class="lg"><span class="li">${i}</span><div><b>${a}</b> ${b}</div></div>`;
 return `<h3 class="bkh"><span>A fight, turn by turn</span></h3><p class="sm">Every turn you draw 5 cards and have 3 energy. Play cards, use your captain\u2019s free <b>Order</b> (it recharges), then End Turn. Your cards are never wasted: <b>Ship</b> cards fire in both phases (at half strength in a boarding), <b>Crew</b> cards also work at sea in a small way.</p>
 <p class="sm"><b>Phase 1, ship vs ship.</b> Sink her, or at half hull or less <b>board</b> her for full loot. <b>Phase 2, boarding.</b> Crew cards and your crew fight; at 0 enemy crew she is yours. Bosses add a final duel.</p>
 <h3 class="bkh"><span>Reading the enemy</span></h3>${row(ic('broad'),'Intent plate','shows this turn\u2019s blow, who it targets, and what is left after your Block. The two small icons are the next two moves.')}
 ${row(ic('sun'),'Wind','The weather gauge gives +1 card and a stronger broadside. A squall costs you. Orders and some cards can shift it.')}
 ${row(ic('skull'),'Traits','Plated: reduces each hull hit, pierce ignores it. Fireship: rams when low. Runs: flees if you are slow. Grapple: forces boarding.')}
 <h3 class="bkh"><span>Words on cards</span></h3>${Object.keys(KW).map(w=>row(ic({Block:'shield',Weak:'wind',Burn:'flame',Advantage:'star',Exhaust:'skull'}[w]||'star'),w,KW[w][1])).join('')}
 <h3 class="bkh"><span>The voyage</span></h3><p class="sm">Hull, crew and captain HP carry over; nothing tops off alone. Only the captain's death ends the run. After an act boss you may sail home with your plunder, or push on for more.</p>`};
/* ---------- title ---------- */
renderTitle=function(){const run=loadRun();const rk=rank(),R=RANKS[rk];
 $('app').dataset.screen='title';
 $('app').innerHTML=`<div class="scr titlescr"><h1>Free Nassau</h1><h3 class="center">A Golden Age pirate deck builder</h3><img class="banner" src="img/ship.jpg" alt="">
 <p class="tagl">Pick a real captain. Build a deck. Sail three acts to Benjamin Hornigold.</p>
 <div class="choices center">${run&&run.screen!=='end'&&run.v===6?'<button id="cont" class="gold" onclick="S=loadRun();render()">Continue voyage</button>':''}<button id="new" ${run&&run.v===6?'':'class="gold"'} onclick="S={screen:'capselect'};render()">New voyage</button><button id="nassau" onclick="S={screen:'nassau'};render()">Nassau</button><button id="logbook" onclick="S={screen:'logbook'};render()">Captain's log</button><button id="setbtn" onclick="S={screen:'settings'};render()">Settings</button></div>
 <p class="small center">${R.t} · ${M.renown||0} Renown · Banked Silver ${M.banked}</p></div>`};
window.renderSettingsPage=function(){$('app').dataset.screen='settings';$('app').innerHTML=`<div class="scr"><h2>Settings</h2>${settingsBody()}</div><div class="actions"><button id="back" onclick="S=null;render()">Back</button></div>`};
const _r=render;render=function(){if(S&&S.screen==='settings'&&!S.cap){renderSettingsPage();return}_r()};
/* ---------- captain select with doctrines ---------- */
const lockD=k=>DOCTRINES[k].rank>rank();
renderCapSelect=function(){const keys=Object.keys(CAPTAINS);const lock=k=>CAPTAINS[k].unlock&&!M.unlocked[k];if(!CAPTAINS[CSEL]||lock(CSEL))CSEL=keys.find(k=>!lock(k));
 if(!DOCTRINES[M.doc]||lockD(M.doc))M.doc='std';
 const c=CAPTAINS[CSEL],locked=lock(CSEL),D=DOCTRINES[M.doc];
 $('app').dataset.screen='capselect';
 $('app').innerHTML=`<div class="scr capscr"><h2>Choose your captain</h2>
 <div class="caps">${keys.map(k=>{const cc=CAPTAINS[k];return `<button class="med ${k===CSEL?'sel':''} ${lock(k)?'locked':''}" id="cap-${k}" ${lock(k)?'disabled':''} onclick="CSEL='${k}';renderCapSelect()" aria-label="${cc.short}"><span class="mr"><img src="${cc.img}" alt=""></span><b>${cc.short}</b>${lock(k)?`<span class="lk">${ic('skull')}</span>`:''}</button>`}).join('')}</div>
 <div class="dossier"><div class="dh"><div><h3>${c.n}</h3><i>${c.id}</i></div>${propSeal('dseal')}</div>
 <p class="dp">${c.passive}</p>
 <div class="dstats"><span>${ic('heart')} ${c.hp}</span><span>${ic('crew')} ${c.crew}</span><span>${ic('ship')} Sloop</span>${c.order?`<span>${ic('star')} ${ORDERS[c.order].n}</span>`:''}</div>
 <div class="ddeck">${deckChips(c)}</div></div>
 <div class="docts"><b>Doctrine</b><div>${Object.keys(DOCTRINES).map(k=>`<button class="doc ${M.doc===k?'on':''}" id="doc-${k}" ${lockD(k)?'disabled':''} onclick="M.doc='${k}';saveMeta();renderCapSelect()">${DOCTRINES[k].n}${lockD(k)?` <small>Rank ${DOCTRINES[k].rank}</small>`:''}</button>`).join('')}</div><p class="small">${D.d}</p></div>
 ${notPicker()}</div>
 <div class="actions"><button id="back" onclick="S=null;render()">Back</button><button id="sail" class="gold" ${locked?'disabled':''} onclick="newRun('${CSEL}')">${locked?'Locked':'Take the helm'}</button></div>`;emo($('app'))};
/* ---------- Nassau ---------- */
renderNassau=function(){const rk=rank(),R=RANKS[rk],N=RANKS[rk+1];const pct=N?Math.round(((M.renown-R.at)/(N.at-R.at))*100):100;
 $('app').dataset.screen='nassau';
 $('app').innerHTML=`<div class="scr nassauscr"><h2>Nassau</h2><img class="banner" src="img/nassau-day9.jpg" alt="">
 <div class="rankbox"><div><b>${R.t}</b> <small>Rank ${rk}</small></div><div class="rbar"><i style="width:${pct}%"></i></div><small>${N?`${M.renown}/${N.at} Renown. Next: ${N.t}. ${N.u}`:'The highest rank. The Flying Gang knows your name.'}</small></div>
 <p class="small">Banked Silver: <b>${M.banked}</b>. Buildings give head starts, not raw power.</p>
 ${Object.keys(BUILD).map(k=>{const b=BUILD[k],l=M.buildings[k];return `<div class="panel bld"><h3>${b.n} <small>${l}/2</small></h3><p>${l?`Now: ${b.d[l-1]}`:'Not built.'}${l<2?` Next: ${b.d[l]}`:''}</p>${l<2?`<button onclick="buildUp('${k}')" ${M.banked<b.cost[l]?'disabled':''}>Build · ${b.cost[l]} silver</button>`:''}</div>`}).join('')}</div>
 <div class="actions"><button id="back" onclick="S=null;render()">Back</button></div>`};
buildUp=function(k){const l=M.buildings[k];if(l>=2||M.banked<BUILD[k].cost[l])return;M.banked-=BUILD[k].cost[l];M.buildings[k]++;saveMeta();renderNassau()};
/* ---------- run summary (Captain's Log) ---------- */
renderEnd=function(){const e=S.end;const t={death:'The captain is dead',extract:'Home with the plunder',win:'Hornigold is beaten!'}[e.kind];const st=e.stats||{};
 const up=[];for(let r=e.rankBefore+1;r<=e.rankAfter;r++)up.push(`<li><b>${RANKS[r].t}</b>: ${RANKS[r].u}</li>`);
 const R=RANKS[e.rankAfter],N=RANKS[e.rankAfter+1];const pct=N?Math.round(((e.total-R.at)/(N.at-R.at))*100):100;
 $('app').dataset.screen='end';
 $('app').innerHTML=`<div class="scr endscr ${e.kind}"><h1>${t}</h1><img class="banner" src="${e.kind==='death'?'img/ship.jpg':'img/nassau-day9.jpg'}" alt="">
 <p class="center">${CAPTAINS[S.cap].n} reached ${ACTS[e.act].n}${e.kind==='death'&&e.by?`, felled by ${e.by}`:''}.</p>
 <div class="stats"><div><b>${st.fights||0}</b><small>Battles</small></div><div><b>${st.sunk||0}</b><small>Sunk</small></div><div><b>${st.boarded||0}</b><small>Boarded</small></div><div><b>${st.plunder||0}</b><small>Plunder</small></div></div>
 <div class="rankbox"><div><b>+${e.ren} Renown</b> <small>${R.t}</small></div><div class="rbar"><i style="width:${pct}%"></i></div>${up.length?`<ul class="unl">${up.join('')}</ul>`:`<small>${N?`${N.at-e.total} to ${N.t}`:'Top rank'}</small>`}</div>
 <p class="center">Banked Silver earned: <b>${e.banked}</b> (${e.kind==='death'?'25%':e.kind==='extract'?'75%':'125%'} of plunder value).${e.trophies.length?` Trophies kept: ${e.trophies.length}.`:''}</p>${S.unlockMsg?`<p class="center msg">${S.unlockMsg}</p>`:''}</div>
 <div class="actions"><button id="again" class="gold" onclick="S=null;localStorage.removeItem(RUNKEY);render()">Back to Nassau</button></div>`};
/* ---------- captain's log ---------- */
renderLogbook=function(){const caps=Object.keys(M.byCaptain).map(k=>`<tr><td>${CAPTAINS[k].short}</td><td>${M.byCaptain[k].wins}</td><td>${M.byCaptain[k].runs}</td></tr>`).join('');
 const log=(M.log||[]).slice(0,8).map(r=>`<li>${CAPTAINS[r.cap]?CAPTAINS[r.cap].short:r.cap}: ${r.kind==='win'?'Victory':r.kind==='extract'?'Sailed home':'Died'} in act ${r.act}${r.not?` (Notoriety ${r.not})`:''}, ${r.fights} battles, +${r.ren} Renown</li>`).join('');
 $('app').dataset.screen='logbook';
 $('app').innerHTML=`<div class="scr"><h2>Captain's log</h2><ul><li>Runs ${M.runs} · Wins ${M.wins} · Sailed home ${M.extracts} · Deaths ${M.deaths}</li><li>Furthest act ${M.bestAct} · Ships sunk ${M.sunk} · Boarded ${M.boarded}</li><li>Plundered ${M.plunder} · Banked ${M.banked} · Renown ${M.renown||0}</li></ul>
 ${caps?`<table class="lt"><tr><th></th><th>Wins</th><th>Runs</th></tr>${caps}</table>`:''}
 <h3>Trophy room</h3><p>${M.trophies.length?M.trophies.map(t=>Object.values(ACTS).find(a=>a.trophy.id===t).trophy.n).join(', '):'No trophies yet. Beat an act boss and get home alive.'}</p>
 ${log?`<h3>Recent voyages</h3><ul>${log}</ul>`:''}</div><div class="actions"><button id="back" onclick="S=null;render()">Back</button></div>`};
/* resilience: offline service worker, persistent storage, autosave when the app is backgrounded */
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)&&!window.NOFX)navigator.serviceWorker.register('sw.js').catch(()=>{});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
const flush=()=>{try{if(S&&S.cap&&S.screen!=='end')save();saveMeta()}catch(e){}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});addEventListener('pagehide',flush);
applySettings();render();
})();
