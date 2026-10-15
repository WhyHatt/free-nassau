const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];let ok=0,fail=0;const t=(c,m)=>{c?ok++:(fail++,console.log('FAIL',m))};
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#new');t(await p.$('#cap-blackbeard'),'capselect');t(!(await p.$('#cap-rackham'))||await p.$eval('#cap-rackham',e=>e.disabled),'rackham locked');
await p.click('#cap-blackbeard');t(await p.$('.chart'),'map');await p.waitForTimeout(300);t(await p.$eval('#app .scr',e=>e.scrollHeight<=e.clientHeight+2),'map fits');await p.screenshot({path:'screenshot-v2-map.png'});t(await p.evaluate(()=>Object.keys(S.officers).length===0),'no officers '+await p.evaluate(()=>S.ship.type+JSON.stringify(S.officers)));
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
t(await p.evaluate(()=>!!document.querySelector('#hand .card.sel[data-i="0"]')&&document.querySelector('#detail').textContent.includes('Tap again')||document.querySelector('#detail').textContent.includes('Wrong phase')),'first tap selects + detail');
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

// full bot runs + meta persistence
await p.addScriptTag({path:'bot.js'});const r=await p.evaluate(()=>{const o=[];for(let i=0;i<8;i++)o.push(botRun('vane').kind);return o});t(r.every(k=>['death','win','extract'].includes(k)),'bot runs '+r);
const ex=await p.evaluate(()=>{const before=M.banked;botRun('bellamy',{extract:true});return [S.end.kind,M.banked>before,M.unlocked.rackham]});console.log('extract run',ex);
await p.reload();t(await p.evaluate(()=>JSON.parse(localStorage.getItem('fnv2meta')).banked>0),'meta persisted');
await p.click('#nassau');t(await p.$('button'),'nassau screen');
const txt=await p.evaluate(()=>document.documentElement.outerHTML+[...document.scripts].map(s=>s.src).join());
t(errs.length===0,'errors '+errs.join('|'));console.log(`pass ${ok} fail ${fail}`);await b.close();process.exit(fail?1:0)})();
