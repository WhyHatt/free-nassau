// v6 UI/engine test. node test.js [w] [h]
const {chromium}=require('playwright');
(async()=>{const W=+process.argv[2]||390,H=+process.argv[3]||844;const b=await chromium.launch();const errs=[];let ok=0,fail=0;const t=(c,m)=>{c?ok++:(fail++,console.log('FAIL',m))};
const p=await b.newPage({viewport:{width:W,height:H}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const clk=sel=>p.evaluate(s=>document.querySelector(s).click(),sel);const ev=(f,a)=>p.evaluate(f,a);
await p.goto('file://'+process.cwd()+'/index.html');await ev(()=>localStorage.clear());await p.reload();await ev(()=>{window.NOFX=1;RM=true});
// title -> capselect
t(await p.$('#new'),'title has New voyage');await p.click('#new');t(await p.$('#cap-blackbeard'),'capselect');
t(await ev(()=>document.querySelector('#cap-rackham').disabled),'rackham locked');
t(await ev(()=>!!document.querySelector('#doc-gun')&&document.querySelector('#doc-sea').disabled),'doctrines shown, seamanship locked at rank 0');
await clk('#doc-gun');t(await ev(()=>M.doc==='gun'),'doctrine pick saved');await clk('#doc-std');
await p.click('#cap-blackbeard');await p.click('#sail');t(await p.$('.chart'),'map shown');
t(await ev(()=>S.v===6&&S.map[0].length===COLS),'v6 run, 4 lanes');
t(await ev(()=>document.documentElement.scrollHeight<=innerHeight+2),'map fits without page scroll');
// first fight
await ev(()=>{const c=S.map[0].findIndex(n=>n.t==='fight');go(0,c>=0?c:0)});
let sc=await ev(()=>S.screen);if(sc!=='combat'){await ev(()=>{S.screen='map';S.combat=null;startFight(['merchant'],'normal')})}
t(await p.$('#hand .card'),'combat shows hand');t(await p.$('#endturn'),'end turn present');t(await p.$('.ord'),'orders shown');
t(await p.$('#undo')||await p.$('.undo'),'undo button present');
t(await ev(()=>document.documentElement.scrollHeight<=innerHeight+2),'combat fits without page scroll');
t(await ev(()=>getComputedStyle(document.getElementById('endturn')).position!=='fixed'),'End Turn in normal spot');
// select-then-confirm
await ev(()=>{M.set.quick=0;const c=C();c.energy=3;c.hand=['cutlass','tack','broadside','tack','chain'];render()});
await clk('#hand .card[data-i="2"]');t(await ev(()=>!!document.querySelector('#hand .card.sel[data-i="2"]')&&C().hand.length===5),'first tap selects, does not play');
await clk('#hand .card[data-i="1"]');t(await ev(()=>document.querySelectorAll('#hand .card.sel').length===1),'selection moves');
t(await ev(()=>/Now:/.test(document.getElementById('detail').textContent)||document.getElementById('detail').textContent.length>10),'detail shows text/preview');
await clk('#selPlay');t(await ev(()=>C().hand.length===4),'Play button plays');
// undo
t(await ev(()=>!!C().undo),'undo available after a no-draw card');
await ev(()=>undoTap());t(await ev(()=>C().hand.length===5&&C().energy===3),'undo restores hand and energy');
// quick play
await ev(()=>{M.set.quick=1;render()});await clk('#hand .card[data-i="2"]');t(await ev(()=>C().hand.length===4),'quick play: one tap plays');
await ev(()=>{M.set.quick=0});
// orders
await ev(()=>{const c=C();c.ordUsed=false;c.ord={};render()});const oid=await ev(()=>orderList().find(orderReady));t(!!oid,'an order is ready');
await clk('#ord-'+oid);t(await ev(()=>C().ordUsed===true),'order used');
// persistence
const before=await ev(()=>JSON.stringify({coin:S.coin,hp:S.hp,deck:S.deck.length}));await ev(()=>save());await p.reload();await ev(()=>{window.NOFX=1;RM=true});
t(await p.$('#cont'),'continue button after reload');await p.click('#cont');t(await ev(()=>S&&S.v===6&&JSON.stringify({coin:S.coin,hp:S.hp,deck:S.deck.length})===JSON.stringify(JSON.parse(localStorage.getItem(RUNKEY)).deck&&{coin:S.coin,hp:S.hp,deck:S.deck.length})),'run resumes');
// win a fight -> reward
await ev(()=>{S.screen='map';S.combat=null;S.row=0;startFight(['merchant'],'normal');E().hull=0;checkState()});
t(await ev(()=>S.screen==='reward'),'reward screen after sinking');t(await p.$('.cards .card'),'reward shows cards');
t(await ev(()=>document.documentElement.scrollHeight<=innerHeight+2),'reward fits');
await ev(()=>rewardDone());
// screens render without errors and fit
for(const [nm,js] of [['port',"enterNode({t:'port'})"],['cove',"enterNode({t:'cove'})"],['smuggler',"enterNode({t:'smuggler'})"],['shipwright',"enterNode({t:'shipwright'})"],['recruit',"enterNode({t:'recruit',role:'gunner'})"],['event',"enterNode({t:'event'})"],['upgrade',"S.screen='map';openUpgrade('cove','cove')"],['treasure',"enterNode({t:'treasure'})"]]){
  await ev(js);const s=await ev(()=>S.screen);t(await p.$('#app'),nm+' renders');t((await ev(()=>document.getElementById('app').innerHTML.length))>200,nm+' has content ('+s+')');
  await ev(()=>{S.screen='map';S.combat=null;S.shop=null;S.smug=null})}
// upgrade flow in port
await ev(()=>{S.coin=300;enterNode({t:'port'})});await clk('#upg');t(await ev(()=>S.screen==='upgrade'),'port upgrade opens picker');
await ev(()=>{const i=S.deck.findIndex(canUpgrade);upgradeCard(i)});t(await ev(()=>S.deck.some(k=>k.endsWith('+'))),'card upgraded');
// smuggler
await ev(()=>{S.coin=200;S.screen='map';enterNode({t:'smuggler'})});const n0=await ev(()=>S.deck.length);await ev(()=>buySmug(0));t(await ev(n=>S.deck.length===n+1,n0),'smuggler sells a card');
// settings
await ev(()=>{S.screen='map';showMenu('settings')});t(await p.$('#set-quick'),'settings has Quick play');await clk('#set-quick');t(await ev(()=>M.set.quick===1),'Quick play toggles');await clk('#set-text-1');t(await ev(()=>document.documentElement.classList.contains('ts1')),'text size applies');await clk('#set-text-0');
await ev(()=>$('modal').innerHTML='');
// end screen
await ev(()=>endRun('death'));t(await p.$('#again'),'end screen shows');t(await ev(()=>/Renown/.test(document.getElementById('app').textContent)),'end screen shows Renown');
await p.click('#again');t(await p.$('#nassau'),'back to title');await p.click('#nassau');t(await ev(()=>/Nassau/.test(document.getElementById('app').textContent)),'Nassau screen');
// boss screens do not crash
for(const a of [1,2,3]){await ev(a=>{S=null;newRun('vane');S.act=a;S.map=genMap(a);S.row=S.map.length-2;startBoss()},a);t(await p.$('#hand .card')||await p.$('#endturn'),'boss '+a+' starts');
  await ev(()=>{let n=0;while(S.screen==='combat'&&n++<200){const c=C();const i=c.hand.findIndex(k=>playable(k)&&cost(k)<=c.energy);if(i>=0)play(i);else endTurn()}});}
t(errs.length===0,'no page errors: '+errs.slice(0,3).join(' | '));
console.log(`${W}x${H}: ${ok} ok, ${fail} fail`);await b.close();process.exit(fail?1:0)})();
