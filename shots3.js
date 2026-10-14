const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{localStorage.clear();newRun('bonnyread');hireOfficer('hatch',0);hireOfficer('pruitt',0);hireOfficer('penhallow',0);S.officers.bosun.injured=true;go(0,1);const e=E();e.hull=Math.floor(e.hullMax*.3);render();board()});
await p.waitForTimeout(900);await p.screenshot({path:'screenshot-v23-boarding.png'});
await p.evaluate(()=>{S.combat=null;S.shop=null;enterNode({t:'recruit',role:'qm'});render()});await p.waitForTimeout(200);await p.screenshot({path:'screenshot-v23-recruit.png'});
await p.evaluate(()=>{S.shop=null;enterNode({t:'port'});render()});await p.waitForTimeout(200);await p.screenshot({path:'screenshot-v23-port.png'});
await p.evaluate(()=>{enterNode({t:'cove'});render()});await p.waitForTimeout(200);await p.screenshot({path:'screenshot-v23-cove.png'});
await p.evaluate(()=>{S.screen='capselect';S={screen:'capselect'};render()});await p.waitForTimeout(200);await p.screenshot({path:'screenshot-v23-capselect.png'});
console.log(errs);await b.close()})();
