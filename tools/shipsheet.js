const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:520}});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{window.NOFX=1});
await p.evaluate(()=>{document.body.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:#d6b97c;padding:6px;width:900px">'+['periagua','sloop','brigantine','snow','frigate','horn'].map(k=>'<div style="background:url(img/chart/chart.webp) center/cover;height:240px;display:flex;align-items:center;justify-content:center">'+miniShip(k).replace('class="shipsvg','style="width:270px" class="shipsvg')+'</div>').join('')+'</div>'});
await p.waitForTimeout(300);await p.screenshot({path:process.argv[2]||'/workspace/sh/ships.png'});await b.close()})()
