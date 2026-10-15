const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#new');await p.click('#cap-blackbeard');await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{const s=document.querySelector('#app .scr');return [s.scrollHeight,s.clientHeight,document.querySelector('.chart').getBoundingClientRect().height,document.querySelector('#app').scrollHeight]}));
await b.close()})()
