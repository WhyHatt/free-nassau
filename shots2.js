const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(500);
const fits=async n=>{const r=await p.evaluate(()=>{const s=document.querySelector('#app>.scr');return s?[s.scrollHeight,s.clientHeight]:[0,0]});console.log(n,r,r[0]<=r[1]+2?'fits':'SCROLLS')};
await fits('title');await p.screenshot({path:'screenshot-v22-title.png'});
await p.click('#new');await fits('capselect');await p.screenshot({path:'screenshot-v22-capselect.png'});
await p.click('#cap-blackbeard');await p.waitForTimeout(400);await fits('map');await p.screenshot({path:'screenshot-v22-map.png'});
await p.evaluate(()=>{go(0,1);const e=E();e.hull=Math.floor(e.hullMax*.3);render()});await p.waitForTimeout(900);await fits('combat');await p.screenshot({path:'screenshot-v22-combat.png'});
for(const sc of ['tavern','recruit','event','cove','port','shipwright','fence']){await p.evaluate(sc=>{S.combat=null;S.shop=null;if(sc==='event'){S.ev=1;S.screen='event'}else if(sc==='recruit')enterNode({t:'recruit',role:'gunner'});else if(['port','tavern','cove','fence','shipwright'].includes(sc))enterNode({t:sc});render()},sc);await p.waitForTimeout(150);await fits(sc);if(sc==='event')await p.screenshot({path:'screenshot-v22-event.png'})}
await p.evaluate(()=>{S.screen='map';startBoss();const c=C();c.phase='duel';c.enemy.hp=40;c.enemy.hpMax=40;render()});await p.waitForTimeout(500);await fits('duel');await p.screenshot({path:'screenshot-v22-duel.png'});
console.log('errors',errs);await b.close()})();
