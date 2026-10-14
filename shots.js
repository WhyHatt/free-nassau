const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{localStorage.clear();newRun('vane');go(0,1);const e=E();e.hull=Math.floor(e.hullMax*.4);render()});
await p.waitForTimeout(800);await p.screenshot({path:'screenshot-v2-sinkorboard.png'});
await p.evaluate(()=>board());await p.waitForTimeout(900);await p.screenshot({path:'screenshot-v2-boarding.png'});await b.close()})();
