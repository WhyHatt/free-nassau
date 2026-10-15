const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{window.NOFX=1;localStorage.clear();M.banked=200;S={screen:'nassau'};render()});await p.waitForTimeout(300);await p.screenshot({path:'screenshot-v25-nassau.png'});
await p.evaluate(()=>{newRun('vane');enterNode({t:'tavern'});render()});await p.waitForTimeout(200);const f=async n=>console.log(n,await p.evaluate(()=>{const s=document.querySelector('#app>.scr');return s.scrollHeight+'/'+s.clientHeight}));await f('tavern');await p.screenshot({path:'screenshot-v25-tavern.png'});
await p.evaluate(()=>{enterNode({t:'recruit',role:'gunner'});render()});await p.waitForTimeout(200);await f('recruit');await p.evaluate(()=>{enterNode({t:'cove'});render()});await f('cove');
console.log(errs);await b.close()})();
