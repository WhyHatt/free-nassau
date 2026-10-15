const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[360,740],[430,932],[1280,800]]){const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>{localStorage.clear()});await p.reload();
await p.evaluate(()=>{window.NOFX=1;newRun('vane',0);S.row=1;startFight(['rival'],'normal');C().hand=['broadside','tack','cutlass','swivel','chain','hold'];render()});await p.waitForTimeout(500);
console.log(w,h,await p.evaluate(()=>{const s=document.querySelector('#app .scr');return [s.scrollHeight,s.clientHeight]}));await p.screenshot({path:`/tmp/vp-${w}.png`});await p.close()}
await b.close()})()
