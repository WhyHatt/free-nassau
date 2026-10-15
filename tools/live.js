const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('https://whyhatt.github.io/free-nassau/?'+Date.now());await p.evaluate(()=>localStorage.clear());await p.reload();
await p.click('#new');await p.click('#cap-bellamy');await p.click('#sail');await p.waitForTimeout(500);
console.log(await p.evaluate(()=>[S.cap,!!document.querySelector('.chart .node svg'),getComputedStyle(document.body).backgroundImage.slice(0,60),document.fonts.size]),errs);
await p.click('.node.avail',{force:true});await p.waitForTimeout(600);console.log(await p.evaluate(()=>[S.screen,!!document.querySelector('.sea .ink path'),document.querySelectorAll('#hand .card').length]));
const r=await p.evaluate(async()=>{const o=[];for(const u of ['img/chart/table.webp','img/chart/chart.webp','img/chart/paper.webp','img/chart/leather.webp','chart.css','ui5.js']){const x=await fetch(u);o.push(u+':'+x.status)}return o});console.log(r.join(' '));
await b.close()})()
