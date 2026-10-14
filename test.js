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
