const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{localStorage.clear()});await p.reload();
await p.evaluate(()=>{window.NOFX=1;M.maxNot=2;newRun('vane',0)});
// map after a couple of legs
await p.evaluate(()=>{S.row=2;S.col=1;S.map.slice(0,3).forEach(r=>r.forEach(n=>n.done=n.t!=='empty'?1:0));S.coin=134;S.cargo.powder=6;S.cargo.rations=5;S.cargo.kits=2;S.screen='map';render()});await p.waitForTimeout(500);await p.screenshot({path:'screenshot-v3-map.png'});
await p.evaluate(()=>{S.row=1;startFight(['rival'],'normal');E().hull=17;C().hand=['broadside','tack','cutlass','swivel','chain','hold'];C().energy=3;render()});await p.waitForTimeout(500);
await p.evaluate(()=>document.querySelector('#hand .card[data-i="3"]').click());await p.waitForTimeout(300);await p.screenshot({path:'screenshot-v3-combat.png'});
await p.evaluate(()=>{S.combat=null;S.shop=null;S.coin=140;S.hp=40;S.ship.hull=30;enterNode({t:'port'})});await p.waitForTimeout(500);await p.screenshot({path:'screenshot-v3-port.png'});
await p.evaluate(()=>{S.combat=null;enterNode({t:'cove'})});await p.waitForTimeout(400);await p.screenshot({path:'screenshot-v3-cove.png'});
await p.evaluate(()=>{S=null;renderCapSelect();});await p.waitForTimeout(300);
await b.close()})();
