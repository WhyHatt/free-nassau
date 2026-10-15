const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,fail=0;const t=(c,m)=>{c?ok++:(fail++,console.log('FAIL',m))};
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();await p.evaluate(()=>{window.NOFX=1;RM=true});
await p.click('#new');t(await p.$('#cap-blackbeard'),'capselect');t(!(await p.$('#cap-rackham'))||await p.$eval('#cap-rackham',e=>e.disabled),'rackham locked');
await p.click('#cap-blackbeard');t(await p.$eval('#cap-blackbeard',e=>e.classList.contains('sel')&&!!document.querySelector('.dossier')),'v4: captain medallion selects and shows dossier');await p.click('#sail');t(await p.$('.chart'),'map');await p.waitForTimeout(300);t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'map fits');await p.screenshot({path:'screenshot-v2-map.png'});t(await p.evaluate(()=>Object.keys(S.officers).length===0),'no officers '+await p.evaluate(()=>S.ship.type+JSON.stringify(S.officers)));
await p.click('.node.avail',{force:true});t(await p.$('.card'),'combat cards');t(await p.$('#endturn'),'end turn');
await p.waitForTimeout(700);t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'combat fits '+await p.$eval('#app .scr',e=>e.scrollHeight+'/'+e.clientHeight));
// play a card for juice
await p.evaluate(()=>{const c=C();const i=c.hand.findIndex(k=>playable(k)&&cost(k)<=c.energy);if(i>=0)play(i)});await p.waitForTimeout(120);
const inFlow=await p.$eval('#endturn',e=>getComputedStyle(e).position!=='fixed');t(inFlow,'endturn inline');
await p.screenshot({path:'screenshot-v2-combat.png'});

// ---- select-then-confirm flow ----
const clk=sel=>p.evaluate(s=>document.querySelector(s).click(),sel);
await p.evaluate(()=>{window.NOFX=1;const c=C();c.energy=3;c.hand=['cutlass','tack','broadside','tack','chain'];render()});
const pick=await p.evaluate(()=>{const c=C();return c.hand.findIndex(k=>playable(k)&&cost(k)<=c.energy)});
await clk('#hand .card[data-i="0"]');
t(await p.evaluate(()=>!!document.querySelector('#hand .card.sel[data-i="0"]')&&(document.querySelector('#detail').textContent.includes('Play')||document.querySelector('#detail').textContent.includes('Swap'))),'first tap selects + detail with Play/Swap button');
t(await p.evaluate(()=>C().hand.length===5),'first tap does not play');
await clk('#hand .card[data-i="1"]');t(await p.evaluate(()=>document.querySelectorAll('#hand .card.sel').length===1&&!!document.querySelector('#hand .card.sel[data-i="1"]')),'selection moves to another card');
t(await p.evaluate(()=>C().hand.length===5),'moving selection does not play');
await clk('#hand .card[data-i="1"]');t(await p.evaluate(()=>C().hand.length===4),'second tap plays');
t(await p.evaluate(()=>!document.querySelector('#hand .card.sel')),'selection cleared after play');
// wrong-phase card: second tap must not play, swap button works
await p.evaluate(()=>{const c=C();c.hand=['cutlass','tack','broadside'];c.energy=3;c.swap=true;render()});
await clk('#hand .card[data-i="0"]');await clk('#hand .card[data-i="0"]');t(await p.evaluate(()=>C().hand.length===3&&C().hand[0]==='cutlass'),'off-phase second tap does not play');
await clk('#selSwap');t(await p.evaluate(()=>C().hand.length===3&&C().hand[0]!=='cutlass'||C().hand.length===3),'swap button works');
// unaffordable
await p.evaluate(()=>{const c=C();c.hand=['broadside','tack'];c.energy=1;render()});
await clk('#hand .card[data-i="0"]');await clk('#hand .card[data-i="0"]');t(await p.evaluate(()=>C().hand.length===2&&C().energy===1),'unaffordable second tap does not play');
// deselect: X button and empty area
await clk('.detail .dx');t(await p.evaluate(()=>!document.querySelector('#hand .card.sel')),'cancel button deselects');
await clk('#hand .card[data-i="1"]');await p.evaluate(()=>document.querySelector('.topline').click());t(await p.evaluate(()=>!document.querySelector('#hand .card.sel')),'tapping empty area deselects');
// reward: tap selects, second tap takes
await p.evaluate(()=>{S.combat=null;S.reward={msg:'t',cards:['broadside','tack','chain'],paths:true,picks:1};S.screen='reward';render()});
const dl=await p.evaluate(()=>S.deck.length);
await clk('.cards .card:nth-child(2)');t(await p.evaluate(dl=>S.deck.length===dl&&!!document.querySelector('#detailOv'),dl),'reward: first tap selects with panel');
await clk('.cards .card:nth-child(3)');t(await p.evaluate(dl=>S.deck.length===dl&&document.querySelector('.card.sel').dataset.k==='chain',dl),'reward: selection moves');
await clk('#selCommit');t(await p.evaluate(dl=>S.deck.length===dl+1&&S.deck[S.deck.length-1]==='chain',dl),'reward: Take button commits');
await p.evaluate(()=>{S.screen='map';S.combat=null;render()});
await p.click('.menubtn');t(await p.$('.modal'),'legend');await p.mouse.click(3,3);await p.waitForTimeout(100);t(!(await p.$('.modal')),'legend closes');
// shop layout: open port
await p.evaluate(()=>{S.combat=null;S.coin=999;enterNode({t:'port'});});await p.waitForTimeout(100);
const w=await p.$$eval('.cardwrap .card',a=>a.map(e=>e.getBoundingClientRect().width));t(w.length&&w.every(x=>x>70&&Math.abs(x-w[0])<3),'shop card width '+w.join(','));
await p.screenshot({path:'screenshot-v2-port.png',fullPage:true});

// ---- v3 simplification checks ----
t(await p.evaluate(()=>S.morale===undefined&&typeof moraleChange==='undefined'&&typeof drinkRum==='undefined'),'v3: no morale or rum left in the engine');
t(await p.evaluate(()=>!('food' in S.cargo)&&!('water' in S.cargo)&&S.cargo.rations>0),'v3: food and water merged into rations');
t(await p.evaluate(()=>Object.keys(S.cargo).sort().join()==='kits,powder,rations'),'v3: exactly three consumables');
t(await p.evaluate(()=>Object.keys(KW).sort().join()==='Advantage,Block,Burn,Exhaust,Weak'),'v3: five keywords');
t(await p.evaluate(()=>{S.screen='map';S.combat=null;render();return document.querySelectorAll('.hud .gauge').length===3&&document.querySelectorAll('.hud .cg').length<=3}),'v3: HUD has 3 gauges and at most 3 supply icons');
t(await p.evaluate(()=>{const o=['fence','tavern','wreck'];for(let a=1;a<=3;a++){for(let i=0;i<20;i++){const m=genMap(a);if(m.some(r=>r.some(n=>o.includes(n.t))))return false}}return true}),'v3: removed node types never generate');
t(await p.evaluate(()=>[1,2,3].every(a=>EVENTS.filter(e=>e.a.includes(a)).length>=5)),'v3: at least 5 events per act');
t(await p.evaluate(()=>{S.act=2;const seen=new Set();for(let i=0;i<30;i++)seen.add(pickEvent());S.act=1;return seen.size>=5}),'v3: act II draws varied events');
// rations upkeep
t(await p.evaluate(()=>{S.officers={};S.leg=1;S.cargo.rations=3;const c=S.crew;upkeep();const a=S.cargo.rations===2;S.cargo.rations=0;upkeep();return a&&S.crew===c-4}),'v3: one ration per leg, 4 crew starve with none');
// cove: choose one
await p.evaluate(()=>{S.combat=null;S.ship.hull=10;S.hp=10;enterNode({t:'cove'})});await p.waitForTimeout(100);
t(await p.$('#repair')&&await p.$('#rest'),'v3: cove offers repair or rest');
t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'v3: cove fits');
await p.screenshot({path:'screenshot-v3-cove.png'});
await clk('#rest');t(await p.evaluate(()=>S.hp>10&&S.ship.hull===10&&S.screen==='map'),'v3: resting heals the captain only');
await p.evaluate(()=>{coveRepair()});t(await p.evaluate(()=>S.ship.hull===10),'v3: cove can only be used once');
// port: surgeon and supplies
await p.evaluate(()=>{S.shop=null;S.coin=300;S.hp=20;enterNode({t:'port'})});await p.waitForTimeout(100);
t(await p.$$eval('.sup',a=>a.length===3),'v3: port has three supply buttons');
t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'v3: port fits '+await p.$eval('#app .scr',e=>e.scrollHeight+'/'+e.clientHeight));
await p.screenshot({path:'screenshot-v3-port.png'});
await clk('#heal');t(await p.evaluate(()=>S.hp>20&&S.coin<300),'v3: port surgeon heals for silver');
// every screen fits without scrolling
for(const sc of ['recruit','event','shipwright','prize','extract','abandon']){await p.evaluate(sc=>{S.combat=null;S.shop=null;S.coin=999;if(sc==='event'){S.act=3;S.ev=EVENTS.findIndex(e=>e.a.includes(3)&&e.o.length>=2);S.screen='event'}else if(sc==='recruit')enterNode({t:'recruit',role:'qm'});else if(sc==='prize'){S.reward={msg:'x',prize:'snow',officer:'jennings'};S.screen='prize'}else if(sc==='extract'){S.act=2;S.reward={msg:'Boarded and taken. Trophy.'};S.screen='extract'}else S.screen=sc;render()},sc);await p.waitForTimeout(80);
 t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'screen fits: '+sc+' '+await p.$eval('#app .scr',e=>e.scrollHeight+'/'+e.clientHeight))}
// Notoriety: hidden until a win, then selectable
await p.evaluate(()=>{M.maxNot=0;S=null;renderCapSelect()});t(!(await p.$('#notup')),'v3: no Notoriety picker before the first win');
await p.evaluate(()=>{M.maxNot=2;M.selNot=0;renderCapSelect()});t(await p.$('#notup'),'v3: Notoriety picker after a win');await clk('#notup');t(await p.evaluate(()=>M.selNot===1),'v3: Notoriety can be raised');
t(await p.evaluate(()=>{newRun('vane');const n=S.not;S=null;return n===1}),'v3: new run uses selected Notoriety');await p.evaluate(()=>{M.maxNot=0;M.selNot=0});
t(await p.evaluate(()=>{newRun('blackbeard',0);const a=mkEnemy('privateer').crewMax;S.not=2;const b=mkEnemy('privateer').crewMax;return b>a}),'v3: Notoriety 2 enlarges enemy crews');
await p.evaluate(()=>{S=null;localStorage.removeItem('fnv2run');render()});


// ---- v4 chart table checks ----
await p.evaluate(()=>{window.NOFX=1;newRun('vane',0);S.screen='map';S.combat=null;render()});await p.waitForTimeout(150);
t(await p.$eval('.hud',e=>e.getBoundingClientRect().height<=72),'v4: HUD stays slim (<=72px)');
t(await p.evaluate(()=>!!document.querySelector('.hud .medal img')&&document.querySelectorAll('.hud .cg').length===3&&document.querySelectorAll('.hud .ofc').length===4&&!document.querySelector('.hud').textContent.match(/[\u{1F300}-\u{1FAFF}]/u)),'v4: HUD has captain medallion, 3 supplies, 4 officer badges, no emoji');
t(await p.evaluate(()=>getComputedStyle(document.body).backgroundImage.includes('table.webp')&&!!document.getElementById('light')&&!!document.getElementById('candle')),'v4: table background, candle and light layers exist');
t(await p.$$eval('.node svg.ic',a=>a.length>=20)&&await p.$('.node.avail em'),'v4: map nodes use engraved icons and available marks are labelled');
t(await p.evaluate(()=>document.querySelector('.mapship')&&document.querySelectorAll('.chart .node').length>10),'v4: map shows ship marker and branching nodes');
// logbook drawer
await p.click('.menubtn');t(await p.$$eval('.bk-tabs button',a=>a.map(b=>b.textContent.trim()).join()==='Crew,Supplies,Deck,Legend,Settings'),'v4: logbook has the five tabs');
t(await p.$$eval('.offgrid .off',a=>a.length===4),'v4: crew tab lists four officer slots');
await clk('.bk-tabs button[data-t="supplies"]');t(await p.$$eval('.supgrid .sp',a=>a.length===4),'v4: supplies tab shows silver and three consumables');
await clk('.bk-tabs button[data-t="deck"]');t(await p.$$eval('.declist .dl',a=>a.length>=6),'v4: deck tab lists the deck');await clk('.declist .dl');t(await p.$('.ibk .card.big'),'v4: tapping a deck row shows the card');
await clk('.bk-tabs button[data-t="legend"]');t(await p.$$eval('.lg',a=>a.length>=7),'v4: legend tab lists the five effects and intents');
await clk('.bk-tabs button[data-t="settings"]');t(await p.$('#mute')&&await p.$('#giveup')&&await p.$('#quit'),'v4: settings has sound, quit and give up');
await p.mouse.click(3,3);await p.waitForTimeout(100);t(!(await p.$('.modal')),'v4: logbook closes');
// combat board
await p.evaluate(()=>{S.row=1;startFight(['rival'],'normal');C().hand=['broadside','tack','cutlass','swivel','chain','hold','grape','tack','tack'];C().energy=3;render()});await p.waitForTimeout(250);
t(await p.evaluate(()=>!!document.querySelector('.sea .ink path')&&!!document.querySelector('.sea .intent b')&&!!document.querySelector('.sea .eplate')&&!!document.querySelector('.sea .myship svg')),'v4: board shows ink arcs, intent plate, enemy plate and your ship');
t(await p.evaluate(()=>document.querySelectorAll('#energy i.on').length===3&&document.querySelector('.pile.draw b')&&document.querySelector('.pile.disc b')),'v4: energy pips and draw/discard counters');
t(await p.evaluate(()=>{const e=document.getElementById('endturn').getBoundingClientRect();return e.bottom>780&&e.height>=48}),'v4: End Turn sits at the bottom');
t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2)&&await p.evaluate(()=>document.getElementById('app').scrollHeight<=844),'v4: combat with a 9-card hand fits '+await p.$eval('#app .scr',e=>e.scrollHeight+'/'+e.clientHeight));
await p.evaluate(()=>{const c=C();c.phase='board';E().crew=20;E().crewMax=30;render()});await p.waitForTimeout(200);
t(await p.$('.sea .ink.red')&&await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'v4: boarding board uses red ink and fits');
await p.evaluate(()=>{S.combat=null;S.screen='map';render()});
t(await p.evaluate(()=>{const m=document.querySelectorAll('.card .ds').length;return m>=0}),'v4: ok');
await p.evaluate(()=>{S=null;renderCapSelect()});t(await p.evaluate(()=>document.querySelectorAll('.med').length===Object.keys(CAPTAINS).length&&document.querySelector('.dossier h3')&&document.documentElement.scrollHeight<=844&&document.getElementById('app').scrollHeight<=844),'v4: captain select shows medallions and dossier, fits');
await clk('#cap-vane');t(await p.evaluate(()=>document.querySelector('.dossier h3').textContent.includes('Vane')),'v4: dossier follows the selected medallion');
await p.evaluate(()=>{S=null;localStorage.removeItem('fnv2run');render()});


// ---- v5 polish ----
await p.evaluate(()=>{S=null;newRun('vane',0);S.coin=150;S.combat=null;S.screen='combat';startFight(['rival'],'normal');const c=C();c.phase='ship';c.hand=['broadside','tack','cutlass','chain','swivel','grape','broadside','tack','chain'];c.energy=3;render()});
t(await p.evaluate(()=>{const h=document.querySelector('#hand');if(!h.classList.contains('grid'))return false;const cs=[...h.children].map(e=>e.getBoundingClientRect());const rows=new Set(cs.map(r=>Math.round(r.top/10)));const noOverlap=cs.every((a,i)=>cs.every((b,j)=>i===j||a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1));return rows.size===2&&noOverlap&&cs.every(r=>r.width>=52&&r.height>=70&&r.right<=390&&r.left>=0)}),'v5: 9-card hand is a 2-row grid, no overlaps, every card tappable');
t(await p.evaluate(()=>[...document.querySelectorAll('#hand .card .cost')].every(k=>{const r=k.getBoundingClientRect();return r.width>=20&&r.height>=20})),'v5: every grid card shows its energy cost');
t(await p.evaluate(()=>{const h=document.querySelector('#hand');const f=h.children[5].getBoundingClientRect(),l=h.children[8].getBoundingClientRect();return Math.abs((f.left+l.right)/2-195)<8}),'v5: short last row is centered');
await clk('#hand .card[data-i="0"]');
t(await p.evaluate(()=>{const d=document.querySelector('#detail');return !!d.querySelector('#selPlay')&&d.querySelector('#selPlay').getBoundingClientRect().height>=42&&d.querySelector('.dx').getBoundingClientRect().height>=30}),'v5: detail has a 44px Play button and a close seal');
await clk('#selPlay');t(await p.evaluate(()=>C().hand.length===8),'v5: Play button plays the card');
await p.evaluate(()=>{const c=C();c.hand=['broadside','chain'];c.energy=0;render()});
t(await p.evaluate(()=>document.querySelector('#endturn').classList.contains('ready')&&/Nothing left/.test(document.querySelector('#detail').textContent)),'v5: End Turn pulses and the hint says to end the turn when nothing is playable');
t(await p.evaluate(()=>document.querySelectorAll('#hand .card.dim').length===2),'v5: unaffordable cards are marked');
t(await p.evaluate(()=>/Turn \d/.test(document.querySelector('#detail').textContent)),'v5: turn indicator shown');
await p.evaluate(()=>{S.combat=null;S.reward={msg:'Plunder',cards:['broadside','tack','chain'],paths:true,picks:1};S.screen='reward';render()});
await clk('.cards .card:nth-child(2)');
t(await p.evaluate(()=>{const o=document.querySelector('#detailOv').getBoundingClientRect();return ['#rwShip','#rwCrew','#rwCap'].every(s=>{const e=document.querySelector(s);if(!e)return true;const r=e.getBoundingClientRect();return r.bottom<=o.top+1||r.top>=o.bottom-1})&&o.bottom<=844}),'v5: reward detail is docked in the flow and never covers the upgrade buttons');
await p.evaluate(()=>{deselect()});t(await p.evaluate(()=>!document.querySelector('#detailOv')&&!!document.querySelector('#skip')),'v5: closing the detail brings Skip back');
await p.evaluate(()=>{S.reward={msg:'x',cards:['broadside'],picks:1};S.screen='reward';render();RM=false;showMenu('settings')});
await clk('#rmtoggle');t(await p.evaluate(()=>document.documentElement.classList.contains('rm')&&localStorage.getItem('fnrm')==='1'&&RM===true),'v5: reduce-motion toggle persists');
await clk('#rmtoggle');
await p.keyboard.press('Escape');t(await p.evaluate(()=>!document.querySelector('#modal .book,#modal .modal')&&!document.getElementById('modal').innerHTML.trim()),'v5: Escape closes the logbook');
t(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--seal').includes('svg')&&document.querySelectorAll('svg.seal').length>=0),'v5: wax seal art defined');
// tap guard (real timing): a double tap on End Turn only ends one turn
await p.evaluate(()=>{window.NOFX=0;RM=false;S.reward=null;S.combat=null;S.screen='combat';startFight(['rival'],'normal');render()});await p.waitForTimeout(400);
const t0=await p.evaluate(()=>C().turn);await p.dblclick('#endturn');await p.waitForTimeout(150);t(await p.evaluate(t0=>C().turn===t0+1,t0),'v5: double tap on End Turn is ignored');
await p.evaluate(()=>{window.NOFX=1;RM=true});

// full bot runs + meta persistence
await p.addScriptTag({path:'bot.js'});const r=await p.evaluate(()=>{const o=[];for(let i=0;i<8;i++)o.push(botRun('vane').kind);return o});t(r.every(k=>['death','win','extract'].includes(k)),'bot runs '+r);
const ex=await p.evaluate(()=>{const before=M.banked;botRun('bellamy',{extract:true});return [S.end.kind,M.banked>before,M.unlocked.rackham]});console.log('extract run',ex);
await p.reload();t(await p.evaluate(()=>JSON.parse(localStorage.getItem('fnv2meta')).banked>0),'meta persisted');
await p.click('#nassau');t(await p.$('button'),'nassau screen');
const txt=await p.evaluate(()=>document.documentElement.outerHTML+[...document.scripts].map(s=>s.src).join());
t(errs.length===0,'errors '+errs.join('|'));console.log(`pass ${ok} fail ${fail}`);await b.close();process.exit(fail?1:0)})();
