const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
for(const [label,god] of [['win',true],['lose',false],['normal',false]]){
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(label+': '+e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.click('#new');
if(label=='lose')await p.evaluate(()=>{S.hp=1;S.maxHp=1});
let steps=0,res;
while(steps++<3000){res=await p.evaluate(god=>{if(god)S.hp=Math.max(S.hp,500);
 if(S.screen=='map'){const n=document.querySelector('.node.avail');if(!n)return 'STUCK '+S.row+','+S.col+' '+document.getElementById('app').innerText.slice(0,200);n.click();return 'map'}
 if(S.screen=='combat'){const c=S.combat;const i=c.hand.findIndex(k=>CARDS[k].c<=c.energy);if(i>=0)play(i);else endTurn();return 'combat'}
 if(S.screen=='reward'){document.querySelector('.rw').click();return 'r'}
 if(S.screen=='merchant'){document.querySelector('#leave').click();return 'm'}
 if(S.screen=='rest'){document.querySelector('#rest').click();return 'rest'}
 if(S.screen=='event'){document.querySelector('.evopt').click();return 'e'}
 return S.screen},god);if(res=='win'||res=='lose'||res.startsWith('STUCK'))break;
 if(label=='normal'&&steps==40)await p.screenshot({path:'screenshot-combat.png'}).catch(()=>{});}
if(label=='normal'){await p.reload();console.log('after reload screen:',await p.evaluate(()=>!!document.querySelector('#cont')));}
console.log(label,'->',res,'steps',steps);await p.screenshot({path:`screenshot-${label}.png`});}
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push('ui: '+e.message));await p.goto('file://'+process.cwd()+'/index.html');await p.click('#new');await p.screenshot({path:'screenshot-map.png',fullPage:true});await p.click('#menu');console.log('legend shown',await p.isVisible('#legend'));await p.screenshot({path:'screenshot-legend.png'});await p.evaluate(()=>$('modal').innerHTML='');
await p.evaluate(()=>document.querySelector('.node.avail').click());await p.screenshot({path:'screenshot-fight.png'});await p.screenshot({path:'screenshot-fight-full.png',fullPage:true});console.log('endturn position',await p.evaluate(()=>getComputedStyle(document.getElementById('endturn').parentElement).position));
console.log('errors',errs);await b.close()})();
