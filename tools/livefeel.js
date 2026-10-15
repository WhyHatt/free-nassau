const {chromium}=require('playwright');
const URL=process.argv[2]||'https://whyhatt.github.io/free-nassau/',OUT=process.argv[3]||'/workspace/sh/lf';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const w=ms=>p.waitForTimeout(ms);
await p.tap('#new');await w(500);await p.tap('#cap-blackbeard');await w(300);await p.tap('#sail');await w(600);
await p.tap('.node.avail');await w(250);await p.screenshot({path:OUT+'1-banner.png'});await w(1200);
await p.tap('#hand .card[data-i="0"]');await w(250);await p.screenshot({path:OUT+'2-selected.png'});
const ok=await p.evaluate(()=>{const i=C().hand.findIndex(k=>playable(k)&&cost(k)<=C().energy);return i});
await p.tap(`#hand .card[data-i="${ok}"]`);await w(40);await p.tap('#selPlay').catch(()=>{});await w(110);await p.screenshot({path:OUT+'3-play.png'});await w(700);
await p.screenshot({path:OUT+'4-after.png'});
await p.tap('#endturn');await w(140);await p.screenshot({path:OUT+'5-endturn.png'});await w(1400);await p.screenshot({path:OUT+'6-newturn.png'});
console.log('turn',await p.evaluate(()=>C().turn),'errs',errs);await b.close()})()
