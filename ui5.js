"use strict";
/* v4 "chart table" layer: icon sprite, leather HUD, ship board on the chart, ink map, logbook drawer. Presentation only; rules untouched. */
const ICP={
 heart:'<path fill="currentColor" stroke="none" d="M12 21C5 15.5 2.5 12 2.5 8.4A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 9.5 1.8C21.5 12 19 15.5 12 21z"/>',
 ship:'<path d="M3 15.5h18l-3.2 4.5H6.2z"/><path d="M12 3v12.5M12 4.5c4.2 2 6 5.800 6 9H12M12 6.500c-3.200 1.800-5 4.500-5 7h5"/>',
 crew:'<circle cx="8.5" cy="8" r="3"/><circle cx="17" cy="9" r="2.400"/><path d="M2.500 20c0-3.800 2.800-6 6-6s6 2.200 6 6M15.500 14.200c3.800-.3 6 1.600 6 5.300"/>',
 coin:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6.600" stroke-width="1"/><path fill="currentColor" stroke="none" d="M12 7.800c-2.100 0-3.400 1.200-3.400 3 0 1 .5 1.800 1.300 2.300V15h4.200v-1.900c.8-.5 1.300-1.300 1.300-2.300 0-1.800-1.300-3-3.400-3z"/>',
 powder:'<path d="M6.500 4h11c1.500 4.500 1.500 11.500 0 16h-11c-1.500-4.500-1.500-11.500 0-16z"/><path d="M5.800 8.500h12.400M5.800 15.500h12.400M12 4V2M12 2c1-1 2.200-.8 3-1"/>',
 rations:'<path d="M9 3.500h6l-1.200 3c3 1.800 5.200 4.800 5.200 8.500 0 3.800-3 6-7 6s-7-2.200-7-6c0-3.700 2.200-6.700 5.200-8.500z"/><path d="M9.300 6.500h5.400M12 11v6M9.500 14h5"/>',
 kits:'<rect x="3" y="9" width="18" height="11" rx="1.600"/><path d="M9 9V6h6v3M3 14h18M11 13v3h2v-3"/>',
 anchor:'<circle cx="12" cy="5" r="2.200"/><path d="M12 7.200V21M7.500 11H16.500M4.500 14.500c.4 3.800 3.600 6.500 7.500 6.500s7.100-2.700 7.500-6.500M3 14.500l1.500 1.200 1.600-1.800M21 14.500l-1.500 1.200-1.600-1.800"/>',
 swords:'<path d="M4.500 4.500l15 15M19.500 4.500l-15 15M3.500 8.500l5-5M15.500 20.500l5-5M20.500 8.500l-5-5M8.500 20.500l-5-5"/>',
 skull:'<path fill="currentColor" stroke="none" fill-rule="evenodd" d="M12 2.800c-4.600 0-8 3-8 7.300 0 2.500 1.200 4.400 3 5.700V19.500h2.200v-2h1.300v2h3v-2h1.300v2H17v-3.700c1.800-1.300 3-3.200 3-5.700 0-4.300-3.400-7.300-8-7.300zM8.600 9.300a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM15.400 9.300a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 13.500l-1 2h2z"/>',
 q:'<path d="M8.500 8.800a3.500 3.500 0 1 1 5.400 2.900c-1.200.8-1.900 1.500-1.900 3M12 18.500v.8"/>',
 chest:'<rect x="3" y="10" width="18" height="10.500" rx="1.600"/><path d="M3 10c0-3.600 4-5.500 9-5.500s9 1.900 9 5.500M3 14.500h18M12 13v3.500"/>',
 crown:'<path d="M3.500 18.500L2.500 7.500l5 4.500L12 4l4.500 8 5-4.500-1 11z"/><path d="M4 21h16"/>',
 hammer:'<path d="M13.500 3.500l7 7-3 3-7-7z"/><path d="M12.200 8.800L3.800 17.200l3 3 8.400-8.400"/>',
 island:'<path d="M2.500 20c3-1.200 6-1.200 9.500 0s6.500 1.200 9.500 0"/><path d="M12 19V9.500M12 9.500C9 6.500 5.500 7 3.800 9.500M12 9.500c3-3 6.500-2.500 8.200 0M12 9.500c-1.200-3 0-5.500 2.500-6.500"/>',
 recruit:'<path d="M4.500 9.500h15L17 5H7zM8 9.500V12a4 4 0 0 0 8 0V9.500M3.500 21c0-4 3.200-6 8.500-6s8.500 2 8.500 6"/>',
 rose:'<path d="M12 2l2.600 8.400L22 12l-7.400 1.600L12 22l-2.600-8.400L2 12l7.400-1.600z"/>',
 shield:'<path d="M12 2.800l8 3v6.200c0 5-3.500 8.200-8 9.200-4.500-1-8-4.200-8-9.200V5.800z"/>',
 flame:'<path d="M12 2.500c1.200 4.500 5.500 6.500 5.500 11.800a5.500 5.500 0 0 1-11 0c0-2.200 1-3.800 2.200-4.800.2 2 1.200 3 2.300 3.200-.8-4.500-.8-6.500 1-10.200z"/>',
 star:'<path d="M12 3l2.700 5.600 6.100.8-4.500 4.200 1.100 6-5.400-3-5.400 3 1.100-6L3.200 9.400l6.100-.8z"/>',
 wind:'<path d="M3 8.500h11a3 3 0 1 0-3-3M3 12.500h16a3 3 0 1 1-3 3M3 16.500h8"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M18.700 5.300l-2.100 2.100M7.400 16.600l-2.100 2.100"/>',
 storm:'<path d="M7 16a4.500 4.500 0 0 1-.5-9 6 6 0 0 1 11.200 1.500A3.500 3.500 0 0 1 17.500 16z"/><path d="M12.500 13l-2 3.500h3l-2 3.500"/>',
 scroll:'<path d="M6.500 4h11.500v13.500a2.500 2.500 0 0 1-2.500 2.500h-9a2.500 2.500 0 0 0 2.500-2.500V6a2 2 0 0 0-2.500-2zM9.500 8.500h6M9.500 12h6"/>',
 cards:'<rect x="4.500" y="5" width="10" height="14.500" rx="1.600"/><path d="M9 4.600l6.300.9 3.200 14-4.500 1.200"/>',
 gear:'<circle cx="12" cy="12" r="3.200"/><path d="M12 2.500v3.300M12 18.200v3.300M2.500 12h3.300M18.200 12h3.300M5.300 5.300l2.300 2.300M16.400 16.400l2.300 2.300M18.700 5.300l-2.300 2.300M7.600 16.400l-2.300 2.300"/><circle cx="12" cy="12" r="7.500" stroke-width="1"/>',
 menu:'<path d="M4.500 7h15M4.500 12h15M4.500 17h15"/>',
 sword:'<path d="M5 19L19 5M14 5h5v5M8 14l4 4M4 20l3.500-3.500"/>',
 bolt:'<path d="M13 2.500L5 13.500h6l-1 8 8-11h-6z"/>',
 broad:'<path d="M3 11.500l11-4.500 3 3.500-11 5z"/><circle cx="8" cy="17.500" r="3"/><path d="M17.500 6l2-3M19 9.500l3-1M16 4.500l.5-2.500"/>',
 grape:'<circle cx="8" cy="8" r="2.200"/><circle cx="14" cy="8" r="2.200"/><circle cx="11" cy="13" r="2.200"/><circle cx="17" cy="13.500" r="2.200"/><circle cx="8" cy="18" r="2.200"/><circle cx="14" cy="18.500" r="2.200"/>',
 target:'<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.500"/><path d="M12 1.500v5M12 17.500v5M1.500 12h5M17.500 12h5"/>',
 plank:'<path d="M3 15.500l14-9 4 6.500-14 9z"/><circle cx="9" cy="14.500" r=".7" fill="currentColor"/><circle cx="15" cy="12" r=".7" fill="currentColor"/>'};
const ic=(n,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${n}"/></svg>`;
(function(){const sp=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${Object.keys(ICP).map(k=>`<symbol id="i-${k}" viewBox="0 0 24 24">${ICP[k]}</symbol>`).join('')}
 <radialGradient id="gBrass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f3d98a"/><stop offset=".5" stop-color="#c39a45"/><stop offset="1" stop-color="#6e4f1c"/></radialGradient>
 <radialGradient id="gWax" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#c8402c"/><stop offset=".6" stop-color="#8e2418"/><stop offset="1" stop-color="#4f0f0a"/></radialGradient>
 <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a2c"/><stop offset="1" stop-color="#4a2c14"/></linearGradient></defs></svg><div id="light"></div>`;
 document.body.insertAdjacentHTML('afterbegin',sp)})();
document.addEventListener('DOMContentLoaded',()=>{});
let _cd=0;const GI={hp:'heart',hull:'ship',crew:'crew'};
/* ---------- tiny props ---------- */
const SKULL=`<g transform="translate(20.900 21.300) scale(.93)">${ICP.skull.replace('currentColor','#f08a6c')}</g><g transform="translate(20 20.300) scale(.93)">${ICP.skull.replace('currentColor','#3a0904')}</g>`;
function waxPath(cx,cy,r,seed,amp){const p=[],N=72;for(let i=0;i<N;i++){const a=i/N*Math.PI*2;const rr=r*(1+amp*(.55*Math.sin(3*a+seed)+.35*Math.sin(5*a+seed*2)+.5*Math.sin(11*a+seed*3)));p.push((cx+Math.cos(a)*rr).toFixed(1)+','+(cy+Math.sin(a)*rr).toFixed(1))}return 'M'+p.join('L')+'Z'}
const SEALIN=`<defs><radialGradient id="swA" cx=".34" cy=".26" r=".9"><stop offset="0" stop-color="#e5694f"/><stop offset=".42" stop-color="#ab2e1f"/><stop offset="1" stop-color="#561109"/></radialGradient><radialGradient id="swB" cx=".7" cy=".78" r=".95"><stop offset="0" stop-color="#d04a33"/><stop offset=".5" stop-color="#8d2216"/><stop offset="1" stop-color="#4f0f08"/></radialGradient></defs>
<ellipse cx="33.500" cy="37" rx="27" ry="25.500" fill="#000" opacity=".3"/>
<path d="${waxPath(32,32,27,.6,.045)}" fill="url(#swA)" stroke="#45100a" stroke-width="1"/>
<path d="${waxPath(32,32,24.500,1.9,.03)}" fill="none" stroke="#ff9d80" stroke-width="1.300" opacity=".32"/>
<path d="${waxPath(32,32,22.500,.2,.02)}" fill="none" stroke="#3c0a05" stroke-width=".8" opacity=".5"/>
<circle cx="32" cy="32" r="17.500" fill="url(#swB)" stroke="#45100a" stroke-width="1.200"/>
<circle cx="32.600" cy="32.600" r="16.200" fill="none" stroke="#ff9d80" stroke-width=".8" opacity=".4"/>
${SKULL}
<ellipse cx="21" cy="14.500" rx="10" ry="4.600" transform="rotate(-32 21 14.500)" fill="#fff" opacity=".26"/><ellipse cx="45" cy="47" rx="6" ry="2.400" transform="rotate(-32 45 47)" fill="#ffb59a" opacity=".16"/>`;
const propSeal=(c='')=>`<svg class="seal ${c}" viewBox="0 0 64 64" aria-hidden="true">${SEALIN}</svg>`;
try{document.documentElement.style.setProperty('--seal0','url("data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${SEALIN.replace(SKULL,'')}</svg>`)+'")');document.documentElement.style.setProperty('--seal','url("data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${SEALIN}</svg>`)+'")')}catch(e){}
const propCandle=`<svg class="candle" viewBox="0 0 40 70" aria-hidden="true"><defs><radialGradient id="gFl" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffc24a"/><stop offset="1" stop-color="#e8641a" stop-opacity="0"/></radialGradient><linearGradient id="gCw" x1="0" x2="1"><stop offset="0" stop-color="#f4dfb0"/><stop offset=".6" stop-color="#d9b878"/><stop offset="1" stop-color="#9c7a44"/></linearGradient></defs>
 <ellipse cx="20" cy="62" rx="17" ry="6" fill="#1a0e06"/><ellipse cx="20" cy="60" rx="15" ry="5" fill="#6e4f1c"/><ellipse cx="20" cy="58" rx="12" ry="3.600" fill="#c9a24a"/>
 <path d="M11 58V26c0-3 18-3 18 0v32c0 3-18 3-18 0z" fill="url(#gCw)"/><path d="M13 30c2 6-1 10 1 16M26 28c-1 7 2 10 0 18" stroke="#fff3d0" stroke-width="1.400" fill="none" opacity=".6"/><ellipse cx="20" cy="26" rx="9" ry="2.200" fill="#f8e8c0"/>
 <line x1="20" y1="26" x2="20" y2="21" stroke="#2a1608" stroke-width="1.200"/><g class="flame"><path d="M20 4c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="url(#gFl)"/><ellipse cx="20" cy="15" rx="2.200" ry="4" fill="#fffbe8"/></g></svg>`;
const propCompass=`<svg class="compass" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="url(#gBrass)" stroke="#3a2208" stroke-width="1.500"/><circle cx="24" cy="24" r="17" fill="#e8d6a8" stroke="#6e4f1c" stroke-width="1.200"/><circle cx="24" cy="24" r="14" fill="none" stroke="#8a6a3a" stroke-width=".6"/><path d="M24 7l3.200 14L24 41l-3.200-20z" fill="#2a1608"/><path d="M7 24l14-3.200L41 24l-14 3.200z" fill="#8e2418"/><path d="M24 7l3.200 14h-6.400z" fill="#8e2418"/><circle cx="24" cy="24" r="2.200" fill="#c9a24a" stroke="#3a2208" stroke-width=".8"/><circle cx="24" cy="2.500" r="2.600" fill="none" stroke="#6e4f1c" stroke-width="1.400"/></svg>`;
const propBook=`<svg class="book-ic" viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="4" width="28" height="32" rx="2.500" fill="#4a2a16" stroke="#c9a24a" stroke-width="1.600"/><rect x="5" y="4" width="5" height="32" rx="2" fill="#2d1809"/><circle cx="22" cy="18" r="7" fill="none" stroke="#e1c071" stroke-width="1.200"/><path d="M22 10.500l1.600 6.400 6.400 1.100-6.400 1.100-1.600 6.400-1.600-6.400-6.400-1.100 6.400-1.100z" fill="#e1c071"/><path d="M8 33l-3 5 6-3z" fill="#c9a24a"/></svg>`;
/* ---------- HUD: slim leather plate ---------- */
const WXI={fair:'sun',gauge:'wind',enemygauge:'wind',squall:'storm'};
function gauge(ic_,v,m,cls,tip){const k=cls.replace('g-','');return `<div class="gauge ${cls}" data-tip="${tip}" title="${tip}"><span class="gi">${ic(GI[k]||ic_)}</span><div class="gb"><i style="width:${clamp(v/m*100,0,100)}%"></i><span>${v}<small>/${m}</small></span></div></div>`}
hud=function(){const cp=CAPTAINS[S.cap];
 const offs=Object.keys(ROLES).map(r=>{const o=S.officers[r];const t=o?`${ROLES[r].n}: ${OFFICERS[o.id].n}${o.injured?' (injured)':''}. ${OFFICERS[o.id].passive}`:`${ROLES[r].n}: none (hire at a Recruit node)`;
  return `<span class="ofc ${o?(o.injured?'inj':'on'):'empty'}" data-tip="${t}" title="${t}" onclick="showMenu('crew')">${o?`<img src="${OFFICERS[o.id].img}" alt="">`:ic('recruit')}</span>`}).join('');
 const SK={powder:'powder',rations:'rations',kits:'kits'};
 const cargo=CARGOKEYS.map(k=>`<span class="cg ${['rations','powder'].includes(k)&&S.cargo[k]<2?'low':''}" data-tip="${CARGO[k].n}: ${S.cargo[k]}. ${CARGO[k].d}" title="${CARGO[k].n}">${ic(SK[k])}${S.cargo[k]}</span>`).join('');
 return `<button class="menubtn" id="menu" onclick="showMenu()" aria-label="Logbook">${propBook}</button>
 <div class="hud"><div class="medal"><img class="portrait sm" src="${cp.img}" data-tip="${cp.n}. ${cp.passive}" title="${cp.n}" alt=""></div>
 <div class="gauges">${gauge('',S.hp,S.maxHp,'g-hp','Captain HP. At 0 the run ends.')}${gauge('',S.ship.hull,hullMax(),'g-hull',ship().n+' hull. '+ship().perk)}${gauge('',S.crew,crewMax(),'g-crew','Crew aboard. They fight when you board.')}</div>
 <div class="strip"><span class="coin" data-tip="Silver: buys everything, and counts as your score when you sail home" title="Silver">${ic('coin')}${S.coin}</span>${cargo}<span class="offs">${offs}</span></div></div>`};

/* detailed side-view ship: shaded hull with planking, ports and stern lights; billowed, seamed sails; rigging, flag, bow wave */
function miniShip(k,flip){const L=SHIPLOOK[k]||SHIPLOOK.sloop;const big=L.big,sm=L.small,m=L.m;const mx=sm?[84]:m===1?[84]:m===2?[66,104]:[50,84,118];
 const hx0=sm?34:big?8:16,hx1=sm?130:big?150:142,deck=76,mid=(hx0+hx1)/2;const sc=L.stripe||'#c9a24a';const flag=['#111','#222','#1d1d1d'].includes(L.flag)?'#1a1410':L.flag;
 const f=v=>v.toFixed(1);
 let s=`<svg viewBox="0 0 160 110" class="shipsvg mini ${flip?'flip':''}" aria-hidden="true"><defs>
 <linearGradient id="shH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8" stop-opacity=".38"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>
 <linearGradient id="shS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffdf2" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a3c14" stop-opacity=".5"/></linearGradient>
 <linearGradient id="shM" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2210"/><stop offset=".45" stop-color="#9a6e3c"/><stop offset="1" stop-color="#2a1608"/></linearGradient>
 <radialGradient id="shL" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ffb030" stop-opacity="0"/></radialGradient></defs>`;
 /* water: ink ripples and soft shadow */
 s+=`<ellipse cx="${f(mid+2)}" cy="96" rx="${f((hx1-hx0)/2+10)}" ry="6.500" fill="#1a0e04" opacity=".3"/>`;
 s+=`<path d="M${hx0-12} 95q6-3 12 0t12 0M${hx1-18} 97q6-3 12 0t12 0M${hx0+14} 100q7-3.500 14 0t14 0t14 0t14 0" fill="none" stroke="#2e1d0c" stroke-width="1" opacity=".5" stroke-linecap="round"/>`;
 /* masts + sails (behind hull top edge) */
 const top0=sm?42:big?14:20;
 mx.forEach((x,i)=>{const last=i===mx.length-1&&mx.length>1;const mh=(sm?40:big?62:52)-(last?8:0)-(i===0&&mx.length===3?-4:0);const my=deck-mh-6;const sw=sm?16:big?22:19;
  s+=`<rect x="${x-1.500}" y="${my-7}" width="3" height="${mh+15}" fill="url(#shM)" stroke="#1a0e04" stroke-width=".4"/>`;
  const rows=sm?1:big||m===3?(mx.length>1?2:2):2;const gap=(mh-6)/rows;
  for(let j=0;j<rows;j++){const y1=my+4+j*gap,y2=y1+gap-3.5,bu=3.600+j*1.200,w2=sw*(1-j*.14);
   s+=`<line x1="${f(x-w2-3)}" y1="${f(y1)}" x2="${f(x+w2+3)}" y2="${f(y1)}" stroke="#2a1608" stroke-width="2" stroke-linecap="round"/>`;
   const p=`M${f(x-w2)} ${f(y1)} L${f(x+w2)} ${f(y1)} Q${f(x+w2+bu)} ${f((y1+y2)/2)} ${f(x+w2-1)} ${f(y2)} Q${f(x)} ${f(y2+bu)} ${f(x-w2+1)} ${f(y2)} Q${f(x-w2-bu*.6)} ${f((y1+y2)/2)} ${f(x-w2)} ${f(y1)} Z`;
   s+=`<path d="${p}" fill="${L.sail}" stroke="#4a3418" stroke-width=".8"/><path d="${p}" fill="url(#shS)"/>`;
   s+=`<path d="M${f(x-w2*.5)} ${f(y1+1)}Q${f(x-w2*.5+1.500)} ${f((y1+y2)/2)} ${f(x-w2*.5)} ${f(y2+.5)}M${f(x+w2*.1)} ${f(y1+1)}Q${f(x+w2*.1+2)} ${f((y1+y2)/2)} ${f(x+w2*.1)} ${f(y2+1)}M${f(x+w2*.6)} ${f(y1+1)}Q${f(x+w2*.6+2.500)} ${f((y1+y2)/2)} ${f(x+w2*.6)} ${f(y2)}M${f(x-w2+1)} ${f(y1+(y2-y1)*.5)}Q${f(x)} ${f(y1+(y2-y1)*.5+bu*.8)} ${f(x+w2-1)} ${f(y1+(y2-y1)*.5)}" fill="none" stroke="#6a5028" stroke-width=".5" opacity=".5"/>`;
   s+=`<rect x="${f(x-w2)}" y="${f(y1)}" width="${f(w2*2)}" height="2.600" fill="#3a2410" opacity=".22"/>`}
  if(i===mx.length-1||mx.length===1){const fy=my-9;
   s+=`<path d="M${x} ${fy+1}q5-3 9.500 0t9.500 0v6q-4.700 3-9.500 0t-9.500 0z" fill="${flag}" stroke="#120a04" stroke-width=".6"/>`;
   if(L.jack&&flag==='#1a1410')s+=`<circle cx="${x+9.500}" cy="${fy+4.200}" r="1.900" fill="#efe6cf"/><path d="M${x+7} ${fy+7}l5-5M${x+12} ${fy+7}l-5-5" stroke="#efe6cf" stroke-width=".7"/>`;
   else if(L.stripe)s+=`<path d="M${x} ${fy+4}h19" stroke="${L.stripe}" stroke-width="1.400"/>`}
  });
 /* bowsprit, jib and rigging */
 const jt=deck-(sm?24:big?38:31);
 s+=`<path d="M${hx1-8} ${deck-8}L${hx1+17} ${deck-19}" stroke="#2a1608" stroke-width="2.200" stroke-linecap="round"/>`;
 if(!sm){const fm=mx[mx.length-1];s+=`<path d="M${hx1+14} ${deck-18.500}L${fm+2} ${jt}L${fm+2} ${deck-12}Z" fill="${L.sail}" stroke="#4a3418" stroke-width=".7"/><path d="M${hx1+14} ${deck-18.500}L${fm+2} ${jt}L${fm+2} ${deck-12}Z" fill="url(#shS)"/>`}
 s+=`<g stroke="#1e1208" stroke-width=".5" opacity=".7" fill="none">`;mx.forEach((x,i)=>{const ty=deck-(sm?36:big?58:48);s+=`<path d="M${x} ${ty}L${x-12} ${deck-6}M${x} ${ty}L${x+12} ${deck-6}M${x} ${ty+8}L${x-8} ${deck-6}M${x} ${ty+8}L${x+8} ${deck-6}"/>`});
 s+=`<path d="M${mx[mx.length-1]} ${deck-(sm?36:big?58:48)}L${hx1+17} ${deck-19}M${mx[0]} ${deck-(sm?36:big?58:48)}L${hx0+6} ${deck-9}"/></g>`;
 /* hull */
 const sh=`M${hx0} ${deck-9}L${hx0+20} ${deck-9}L${hx0+22} ${deck-3}Q${f(mid)} ${deck+1} ${hx1-14} ${deck-4}L${hx1-5} ${deck-8}L${hx1+2} ${deck-9}Q${hx1-2} ${deck+16} ${hx1-24} ${deck+20}L${hx0+22} ${deck+20}Q${hx0+3} ${deck+14} ${hx0} ${deck-9}Z`;
 s+=`<path d="${sh}" fill="${L.hull}" stroke="#120a04" stroke-width="1.300" stroke-linejoin="round"/><path d="${sh}" fill="url(#shH)"/>`;
 s+=`<g fill="none" stroke-linecap="round"><path d="M${hx0+3} ${deck-1}Q${f(mid)} ${deck+5} ${hx1-6} ${deck-1}M${hx0+5} ${deck+8}Q${f(mid)} ${deck+13} ${hx1-10} ${deck+7}M${hx0+12} ${deck+15}Q${f(mid)} ${deck+18} ${hx1-17} ${deck+14}" stroke="#000" stroke-width=".7" opacity=".38"/><path d="M${hx0+3} ${deck}Q${f(mid)} ${deck+6} ${hx1-6} ${deck}M${hx0+5} ${deck+9}Q${f(mid)} ${deck+14} ${hx1-10} ${deck+8}" stroke="#fff" stroke-width=".5" opacity=".14"/>
  <path d="M${hx0+1} ${deck-6}L${hx0+20} ${deck-6}L${hx0+22} ${deck-1}Q${f(mid)} ${deck+3} ${hx1-14} ${deck-2}L${hx1-5} ${deck-6}L${hx1+1} ${deck-7}" stroke="${sc}" stroke-width="1.700" opacity=".95"/><path d="M${hx0} ${deck-9}L${hx0+20} ${deck-9}L${hx0+22} ${deck-3}Q${f(mid)} ${deck+1} ${hx1-14} ${deck-4}L${hx1-5} ${deck-8}L${hx1+2} ${deck-9}" stroke="#e3c47a" stroke-width="1.100" opacity=".85"/></g>`;
 const ports=sm?0:big?6:m===1?3:4;for(let i=0;i<ports;i++){const px=hx0+30+i*((hx1-hx0-58)/Math.max(1,ports-1));
  s+=`<rect x="${f(px-2.800)}" y="${deck+3}" width="5.600" height="4.600" rx="1" fill="#0c0603" stroke="#e3c47a" stroke-width=".4" opacity=".95"/><rect x="${f(px+.8)}" y="${deck+4.600}" width="3.800" height="1.800" rx=".8" fill="#6a6a66"/>`}
 if(!sm){for(let i=0;i<3;i++)s+=`<rect x="${hx0+3+i*5.600}" y="${deck-7.500}" width="3.600" height="3.200" rx=".6" fill="#ffd978" stroke="#2a1608" stroke-width=".5"/>`;
  s+=`<circle cx="${hx0+10}" cy="${deck-6}" r="9" fill="url(#shL)" opacity=".45"/><path d="M${hx0} ${deck-9}l-3 2v9l3 2z" fill="#2a1608" opacity=".8"/>`}
 else s+=`<path d="M${hx0+10} ${deck-9}L${hx1-14} ${deck-9}" stroke="#2a1608" stroke-width="1.300" opacity=".6"/>`;
 /* bow wave and waterline */
 s+=`<path d="M${hx1-6} ${deck+16}q8-1 13-7q-1 8-9 12q-10 3-20 0q9 1 16-5z" fill="#f4ecd6" stroke="#2e1d0c" stroke-width=".7" opacity=".92"/><path d="M${hx0+14} ${deck+21}Q${f(mid)} ${deck+25} ${hx1-22} ${deck+21}" fill="none" stroke="#f4ecd6" stroke-width="2.200" stroke-linecap="round" opacity=".75"/><path d="M${hx0+14} ${deck+21}Q${f(mid)} ${deck+25} ${hx1-22} ${deck+21}" fill="none" stroke="#2e1d0c" stroke-width=".6" opacity=".5" transform="translate(0 1.800)"/>`;
 return s+'</svg>'}

/* ---------- ink threat arcs ---------- */
function inkArcs(it,ph){const tier=['brace','guard'].includes(it.k)?0:it.v<6?1:it.v<11?2:it.v<16?3:4;if(tier===0)return `<svg class="ink brace" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M52 40 Q30 48 24 70"/></svg>`;
 const n=2+tier,red=ph!=='ship';let s='';
 for(let i=0;i<n;i++){const t=n===1?0:i/(n-1)-.5;const sx=66+t*8,sy=30+t*14;const ex=14+t*30+8,ey=72+t*10;const cx=sx-30+t*10,cy=sy+8+(t+.5)*10;const w=2.2+tier*1.5-Math.abs(t)*2;
  s+=`<path class="${red?'red':''}" d="M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey} Q${cx+w*1.6} ${cy-w*1.4} ${sx+w} ${sy+w*.7} Z" style="animation-delay:${i*70}ms"/>`}
 return `<svg class="ink ${red?'red':''}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`}
/* ---------- intent plate ---------- */
const INTG={broad:'broad',grape:'grape',crit:'target',melee:'swords',rush:'sword',officer:'target',brace:'shield',slash:'sword',guard:'shield',lunge:'bolt'};
intentHTML=function(it){const tier=['brace','guard'].includes(it.k)?0:it.v<6?1:it.v<11?2:it.v<16?3:4;
 const tg={broad:[['ship']],crit:[['ship'],['heart']],grape:[['crew']],melee:[['crew']],rush:[['heart']],officer:[['crew']],slash:[['heart']],lunge:[['heart']]}[it.k]||[];
 return `<div class="intent t${tier}" id="intent" data-tip="${it.tx}" title="${it.tx}" onclick="toggleTip(this)"><span class="ii">${ic(INTG[it.k]||'q')}</span><b>${it.v}</b><span class="tg2">${tg.map(g=>ic(g[0])).join('')}</span></div>`};
/* ---------- combat ---------- */
combatHTML=function(){const c=C(),e=E(),it=intent();const ph=c.phase;const W=WEATHER[c.weather];
 const key=c.turn+'|'+ph;if(c._ek!==key){c._ek=key;c._emx=3}c._emx=Math.max(c._emx||3,c.energy);
 const phases=`<div class="phases"><span class="${ph==='ship'?'on':''}" title="Phase 1: ship vs ship">${ic('ship')}</span><span class="${ph==='board'?'on':''}" title="Phase 2: boarding">${ic('swords')}</span>${c.boss===3||ph==='duel'?`<span class="${ph==='duel'?'on':''}" title="Duel">${ic('sword')}</span>`:''}</div>`;
 const big=ph==='ship'?gauge('',e.hull,e.hullMax,'g-hull','Enemy hull'):ph==='board'?gauge('',e.crew,e.crewMax,'g-crew','Enemy crew'):gauge('',e.hp,e.hpMax,'g-hp','Hornigold');
 const sub=ph==='ship'?`<span class="tag" title="Enemy crew">${ic('crew')}${e.crew}</span>`:'';
 const st=`${e.block?`<span class="tag" title="Block: absorbs damage">${ic('shield')}${e.block}</span>`:''}${e.weak?`<span class="tag" title="Weak: deals 25% less">😵${e.weak}</span>`:''}${e.burn?`<span class="tag" title="Burning">${ic('flame')}${e.burn}</span>`:''}`;
 const dmg=ph==='ship'?1-e.hull/e.hullMax:0;const art=e.k==='fort'?fortSVG():ph==='duel'?duelSVG():shipSVG(e.k,false,dmg);
 const canBoard=ph==='ship'&&e.hull<=e.hullMax*.5&&!(c.boss)&&!c.queue.length;
 const sideBtn=(c.canFlee&&c.turn===1&&ph==='ship')?`<button class="side flee" onclick="flee()" title="Run before the wind: no loot">Flee</button>`:(ph==='board'&&!c.boss)?`<button class="side retreat" onclick="retreat()" title="Cut the grapples: lose 20% of your crew, no loot">Retreat</button>`:'';
 const pips=Array.from({length:c._emx},(_,i)=>`<i class="${i<c.energy?'on':''}"></i>`).join('');
 return `<div class="sea">
 <div class="topline">${phases}<span class="wx" data-tip="${W.n}: ${W.d}" title="${W.n}: ${W.d}" onclick="toggleTip(this)">${ic(WXI[c.weather]||'wind')} ${W.n}</span>${c.advT?`<span class="tag" title="Advantage for boarding">${ic('star')}${c.advT>0?'+':''}${c.advT}</span>`:''}${sideBtn}</div>
 ${inkArcs(it,ph)}
 <div class="enemy" id="foe"><div class="eart bob">${art}</div>
  <div class="eplate"><div class="ename">${e.n}${c.queue.length?` <small>+${c.queue.length}</small>`:''}</div><div class="estats">${big}${sub}${st}</div></div></div>
 ${intentHTML(it)}
 <div class="myship">${miniShip(S.ship.type,false)}<div class="mycap">${S.ship.type==='periagua'?'Periagua':ship().n}</div></div>
 ${canBoard?`<div class="boardrow"><button id="board" class="gold" onclick="board()" title="Full loot, risks crew, officers and captain">Board her!</button><span class="small">or keep firing to sink (≈40% loot)</span></div>`:''}
 </div>
 <div class="mine"><div class="pips" id="energy" data-e="${c.energy}" title="Energy: ${c.energy}">${pips}</div><span class="tag big" title="Block: absorbs damage this turn">${ic('shield')}${c.block}</span>${c.str?`<span class="tag" title="+${c.str} damage on all your attacks this fight">+${c.str}</span>`:''}<span class="mflex"></span></div>
 <div class="tray"><div class="cards hand" id="hand">${c.hand.map((k,i)=>{const ok=playable(k);return cardHTML(k,ok?`data-i="${i}" onclick="play(${i})"`:`data-i="${i}" onclick="swapCard(${i})"`,(ok?'':'off ')+(ok&&cost(k)>c.energy?'dim':''))}).join('')}</div></div>
 <div class="log" id="log" onclick="this.classList.toggle('open')" title="Tap for the full log">${c.log.map((l,i)=>`<div class="${i?'old':''}">${l}</div>`).join('')}</div>`};
combatFoot=function(){const c=C();
 let f=`<div class="pile draw" title="Draw pile">${ic('cards')}<b>${c.draw.length}</b><small>Draw</small></div><button id="endturn" class="endturn" onclick="endTurn()">End Turn</button><div class="pile disc" title="Discard pile">${ic('cards')}<b>${c.disc.length}</b><small>Discard</small></div>`;
 return f};
/* ---------- map: branching ink route ---------- */
const jit=(r,c,k)=>{let h=Math.sin(r*127.1+c*311.7+k*74.7)*43758.5453;return h-Math.floor(h)-.5};
function mapHTML(){const R=S.map.length;let nodes='',path='',gold='';
 const pos=(r,c)=>{const last=r===R-1;return [(c+.5)/3*100+(last?0:jit(r,c,1)*9),4+(R-1-r+.5)/R*90+(last?0:jit(r,c,2)*3)]};
 for(let r=0;r<R-1;r++)S.map[r].forEach((n,c)=>{if(n.t==='empty')return;S.map[r+1].forEach((m,c2)=>{if(m.t==='empty')return;if(r+1===R-1?c2!==1:Math.abs(c-c2)>1)return;const[a,b]=pos(r,c),[x,y]=pos(r+1,c2);
  const mx=(a+x)/2+jit(r,c*3+c2,3)*9,my=(b+y)/2+jit(r,c*3+c2,4)*2;const walked=n.done&&m.done;const hot=r===S.row&&c===S.col&&avail(r+1,c2);
  const d=`M${a.toFixed(1)} ${b.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  path+=`<path d="${d}" class="${walked?'walked':''} ${hot?'hot':''}"/>`})});
 for(let r=R-1;r>=0;r--)S.map[r].forEach((n,c)=>{if(n.t==='empty')return;const av=avail(r,c),cur=r===S.row&&c===S.col;const[x,y]=pos(r,c);
  const g=n.t==='recruit'?'recruit':NODEG[n.t];const tip=NODEN[n.t]+(n.role?': '+ROLES[n.role].n:'');
  nodes+=`<div class="node ${av?'avail':''} ${n.done?'done':''} ${cur?'cur':''} n-${n.t}" style="left:${x}%;top:${y}%" data-r="${r}" data-c="${c}" title="${tip}" data-tip="${tip}" onclick="go(${r},${c})"><span class="nb">${ic(g)}</span>${av?`<em>${n.t==='recruit'?ROLES[n.role].n:NODEN[n.t].replace('Careening c','C').replace(' market','')}</em>`:''}</div>`});
 const cp=S.row>=0?pos(S.row,S.col):[50,96];
 return `<div class="chart" style="--rows:${R}"><svg class="routes" viewBox="0 0 100 100" preserveAspectRatio="none">${path}</svg>${nodes}
  <div class="mapship ${S.row<0?'start':''}" style="left:${cp[0]}%;top:${cp[1]}%">${miniShip(S.ship.type,false)}</div></div>`}
const NODEG={fight:'swords',elite:'skull',event:'q',port:'anchor',shipwright:'hammer',recruit:'recruit',cove:'island',treasure:'chest',boss:'crown'};
function mapScreen(){const a=$('app');const R=S.map.length;
 a.innerHTML=hud()+`<div class="scr mapscr"><div class="maphead"><h2>${ACTS[S.act].n}</h2><span class="leg" title="Leg">${ic('rose')} ${S.row+1}/${R}</span></div>${S.msg?`<p class="msg">${S.msg}</p>`:''}${mapHTML()}</div>
 <div class="actions maprow"><div class="plate"><span class="pl-ic">${propCompass}</span><span class="pl-t">Choose your heading<small>1 ration per leg · hold a mark for info</small></span></div><button class="side" onclick="showMenu('deck')">Deck ${S.deck.length}</button></div>`;a.dataset.screen='map'}
/* ---------- logbook drawer: Crew, Supplies, Deck, Legend, Settings ---------- */
const BKTABS=[['crew','skull','Crew'],['supplies','powder','Supplies'],['deck','cards','Deck'],['legend','scroll','Legend'],['settings','gear','Settings']];
let BK='crew';
const capBar=(v,m,cls)=>`<div class="gauge ${cls}"><div class="gb"><i style="width:${clamp(v/m*100,0,100)}%"></i><span>${v}<small>/${m}</small></span></div></div>`;
function bkCrew(){const cp=CAPTAINS[S.cap];
 const offs=Object.keys(ROLES).map(r=>{const o=S.officers[r];const od=o&&OFFICERS[o.id];
  return `<div class="off ${o?(o.injured?'inj':''):'empty'}"><div class="medal sm">${o?`<img src="${od.img}" alt="">`:ic('recruit')}</div><div class="ot"><b>${o?od.n:'Vacant'}</b><i>${ROLES[r].n}${o&&o.injured?' · injured':''}</i><span>${o?(o.injured?'Out of action until treated at a port surgeon or a cove.':od.passive.replace(/^[^:]+: /,'')):'Hire at a Recruit mark on the map.'}</span></div></div>`}).join('');
 const up=S.ship.upg;return `<h3 class="bkh"><span>Officers</span></h3><div class="offgrid">${offs}</div>
 <div class="capline"><div class="medal sm"><img src="${cp.img}" alt=""></div><div class="ot"><b>${cp.n}</b><span>${cp.passive}</span></div></div>
 <div class="bk2"><div><h4>Crew</h4>${capBar(S.crew,crewMax(),'g-crew')}<p class="sm">${S.crew} hands fight when you board, 1 per 7 each turn.</p></div>
 <div><h4>${ship().n}</h4>${capBar(S.ship.hull,hullMax(),'g-hull')}<p class="sm">Guns ${ship().guns+up.guns} · Sheathing ${up.hull} · Rigging ${up.rig}</p></div></div>`}
function bkSupplies(){const tr=S.trophies.map(t=>{const T=Object.values(ACTS).map(a=>a.trophy).find(x=>x.id===t);return T?`<li><b>${T.n}</b> ${T.d}</li>`:''}).join('');
 return `<h3 class="bkh"><span>Hold</span></h3><div class="supgrid"><div class="sp"><span class="si">${ic('coin')}</span><b>${S.coin}</b><i>Silver</i><span>Buys everything. What you sail home with is your score.</span></div>
 ${CARGOKEYS.map(k=>`<div class="sp ${S.cargo[k]<2&&k!=='kits'?'low':''}"><span class="si">${ic(k)}</span><b>${S.cargo[k]}<small>/${CAP[k]}</small></b><i>${CARGO[k].n}</i><span>${CARGO[k].d}</span></div>`).join('')}</div>
 <h3 class="bkh"><span>Voyage</span></h3><ul class="vy"><li>Act ${S.act} · leg ${Math.max(0,S.row+1)}${S.not?` · Notoriety ${S.not}: ${NOT[S.not].n}`:''}</li><li>Plunder so far is worth about <b>${payoutValue()}</b> silver.</li>${tr?tr:'<li class="dim">No trophies yet. Beat an act boss to win one.</li>'}</ul>`}
function bkDeck(){const cnt={};S.deck.forEach(k=>cnt[k]=(cnt[k]||0)+1);const oc=officerCards();oc.forEach(k=>cnt[k]=(cnt[k]||0)+1);
 const ks=Object.keys(cnt).sort((a,b)=>CARDS[a].c-CARDS[b].c||CARDS[a].n.localeCompare(CARDS[b].n));
 return `<h3 class="bkh"><span>Deck · ${S.deck.length+oc.length} cards</span></h3><div class="declist">${ks.map(k=>{const cd=CARDS[k];return `<button class="dl tag${cd.tag}" onclick="bkInspect('${k}')"><span class="cost">${cd.c}</span><span class="dn2">${cd.n}</span>${cnt[k]>1?`<b>×${cnt[k]}</b>`:''}<span class="dtg">${TAGI[cd.tag]}</span></button>`}).join('')}</div><p class="sm">Gold-edged cards come from officers. Tap a card to read it.</p>`}
function bkInspect(k){$('bkpage').innerHTML=`<h3 class="bkh"><span>${CARDS[k].n}</span></h3><div class="ibk">${cardHTML(k,'','big').replace(/ onclick="[^"]*"/,'')}<div class="gloss">${glossary(k)||'<div>No special keywords.</div>'}</div></div><div class="center"><button onclick="bkTab('deck')">Back to deck</button></div>`}
function bkLegend(){const row=(i,a,b)=>`<div class="lg"><span class="li">${i}</span><div><b>${a}</b> ${b}</div></div>`;
 return `<h3 class="bkh"><span>Effects</span></h3>${Object.keys(KW).map(w=>row(ic({Block:'shield',Weak:'wind',Burn:'flame',Advantage:'star',Exhaust:'skull'}[w]),w,KW[w][1])).join('')}
 <h3 class="bkh"><span>Enemy intent</span></h3>${row(ic('broad'),'Ink arcs','sweep from the enemy toward you: more arcs and a bigger number mean a heavier blow. The plate names the target: ship, crew or captain.')}
 ${row(ic('sun'),'Weather','Fair wind gives +1 card on turn 1; the weather gauge and squalls are shown before you fight.')}
 <h3 class="bkh"><span>How a fight goes</span></h3><p class="sm">Phase 1, ship vs ship: Ship and Captain cards. At half hull or less you may Board her for full loot, or keep firing to sink her. Phase 2, boarding: Crew and Captain cards; your crew also fights each turn. Select a greyed card to swap it once a turn. Hull 0 means Abandon Ship; only the captain's death ends the run.</p>`}
function bkSettings(){return `<h3 class="bkh"><span>Settings</span></h3><div class="setl"><button id="mute" onclick="SFX.setMuted(!SFX.isMuted());this.innerHTML=(SFX.isMuted()?'Sound off':'Sound on')">${SFX.isMuted()?'Sound off':'Sound on'}</button>
 <button id="quit" onclick="$('modal').innerHTML='';S=null;render()">Save and quit to title</button>
 <button id="giveup" class="danger" onclick="if(confirm('Abandon this run? It counts as a death.')){$('modal').innerHTML='';endRun('death')}">Give up this run</button></div><p class="sm center">Free Nassau · chart table build</p>`}
function bkTab(t){BK=t;const f={crew:bkCrew,supplies:bkSupplies,deck:bkDeck,legend:bkLegend,settings:bkSettings}[t];$('bkpage').innerHTML=f();
 document.querySelectorAll('.bk-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t))}
showMenu=function(tab){if(!S||!S.cap){return}
 $('modal').innerHTML=`<div class="modal bookm" id="legend" onclick="if(event.target===this)$('modal').innerHTML=''"><div class="book"><div class="bk-tabs">${BKTABS.map(([t,i,l])=>`<button data-t="${t}" onclick="bkTab('${t}')">${ic(i)}<span>${l}</span></button>`).join('')}</div>
 <div class="bk-page" id="bkpage"></div><button class="bk-close" onclick="$('modal').innerHTML=''" aria-label="Close logbook">${propSeal()}<span>Close</span></button></div></div>`;
 bkTab(typeof tab==='string'?tab:BK)};
showDeck=function(){showMenu('deck')};
render();
/* looser hand fan than v2.4 so names stay readable */
const _r6=render;render=function(){_r6();const h=document.querySelector('#hand');if(!h)return;const n=h.children.length;
 h.style.setProperty('--ov',(n<=5?0:n===6?4:n===7?10:n===8?15:19)+'px');h.classList.toggle('crowd',n>=7);
 [...h.children].forEach((c,i)=>{const d=i-(n-1)/2;c.style.setProperty('--r',(n>=3?d*.9:(i%2?.8:-.8))+'deg');c.style.setProperty('--dy',(n>=5?d*d*.7:0)+'px')})};
render();

document.body.insertAdjacentHTML('beforeend',`<div id="candle">${propCandle}</div>`);
/* ---------- emoji -> engraved icons (cards, buttons, headings) ---------- */
const EMO={'🪙':'coin','💥':'powder','🍖':'rations','🔧':'kits','⛵':'ship','👥':'crew','❤':'heart','🛡':'shield','🔥':'flame','⭐':'star','🃏':'cards','👑':'crown','☠':'skull','❓':'q','⚔':'swords','⚓':'anchor','🏝':'island','🛠':'hammer','🔨':'hammer','🩺':'heart','🗑':'skull','🎯':'target','🗡':'sword','💪':'bolt','🧭':'rose','📜':'scroll','🌬':'wind','🏘':'anchor','📖':'scroll','🏆':'crown','🔫':'broad'};
const EMORE=new RegExp('('+Object.keys(EMO).join('|')+')\\uFE0F?','gu');
function emo(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const hit=[];let n;while(n=w.nextNode()){if(EMORE.test(n.nodeValue)&&!(n.parentElement&&n.parentElement.closest('.vig,script,style')))hit.push(n);EMORE.lastIndex=0}
 hit.forEach(t=>{const html=t.nodeValue.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(EMORE,(m,e)=>ic(EMO[e]));const sp=document.createElement('span');sp.className='emo';sp.innerHTML=html;t.replaceWith(sp)})}
const _as5=applySel;applySel=function(){_as5();emo($('detail'));emo($('detailOv'))};
/* ---------- table props on empty-table screens ---------- */
const propDividers=`<svg class="dividers" viewBox="0 0 60 110" aria-hidden="true"><defs><linearGradient id="gSteel" x1="0" x2="1"><stop offset="0" stop-color="#e8cc7c"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs><path d="M26 14L6 104l4 2 22-86zM34 14l20 90-4 2-22-86z" fill="url(#gSteel)" stroke="#3a2208" stroke-width="1.200"/><path d="M12 62Q30 70 48 62" fill="none" stroke="#3a2208" stroke-width="1.600"/><circle cx="30" cy="13" r="8" fill="url(#gBrass)" stroke="#3a2208" stroke-width="1.400"/><circle cx="30" cy="13" r="3" fill="#3a2208"/></svg>`;
const propCoins=`<svg class="coins" viewBox="0 0 60 40" aria-hidden="true"><g fill="url(#gBrass)" stroke="#3a2208" stroke-width="1.200"><ellipse cx="18" cy="30" rx="14" ry="6"/><ellipse cx="18" cy="26" rx="14" ry="6"/><ellipse cx="18" cy="22" rx="14" ry="6"/><ellipse cx="44" cy="31" rx="13" ry="5.500" transform="rotate(-8 44 31)"/><ellipse cx="38" cy="14" rx="9" ry="9" transform="rotate(-20 38 14)"/></g><circle cx="38" cy="14" r="5" fill="none" stroke="#3a2208" stroke-width=".8"/></svg>`;
const TPROPS=['event','cove','extract','abandon','prize','recruit','reward','shipwright'];
function tableProps(){const a=$('app');a.querySelectorAll('.tprops').forEach(e=>e.remove());if(!S||!TPROPS.includes(S.screen))return;
 a.insertAdjacentHTML('beforeend',`<div class="tprops" aria-hidden="true"><span class="tp-compass">${propCompass}</span><span class="tp-div">${propDividers}</span><span class="tp-coin">${propCoins}</span></div>`)}
const _r7=render;render=function(){_r7();const a=$('app');tableProps();emo(a)};
/* ---------- captain select: medallions on the chart + dossier ---------- */
let CSEL='blackbeard';
function deckChips(c){const cnt={};c.deck.forEach(k=>cnt[k]=(cnt[k]||0)+1);return Object.keys(cnt).map(k=>`<span class="chip tag${CARDS[k].tag}"><i>${CARDS[k].c}</i>${CARDS[k].n}${cnt[k]>1?` <b>×${cnt[k]}</b>`:''}</span>`).join('')}
renderCapSelect=function(){const keys=Object.keys(CAPTAINS);const lock=k=>CAPTAINS[k].unlock&&!M.unlocked[k];if(!CAPTAINS[CSEL]||lock(CSEL))CSEL=keys.find(k=>!lock(k));
 const c=CAPTAINS[CSEL],locked=lock(CSEL);
 $('app').dataset.screen='capselect';
 $('app').innerHTML=`<div class="scr capscr"><h2>Choose your captain</h2>
 <div class="caps">${keys.map(k=>{const cc=CAPTAINS[k];return `<button class="med ${k===CSEL?'sel':''} ${lock(k)?'locked':''}" id="cap-${k}" ${lock(k)?'disabled':''} onclick="CSEL='${k}';renderCapSelect()" aria-label="${cc.short}"><span class="mr"><img src="${cc.img}" alt=""></span><b>${cc.short}</b>${lock(k)?`<span class="lk">${ic('skull')}</span>`:''}</button>`}).join('')}</div>
 <div class="dossier"><div class="dh"><div><h3>${c.n}</h3><i>${c.id}</i></div>${propSeal('dseal')}</div>
 <p class="dp">${c.passive}</p>
 <div class="dstats"><span>${ic('heart')} ${c.hp}</span><span>${ic('crew')} ${c.crew}</span><span>${ic('ship')} Sloop</span></div>
 <div class="ddeck">${deckChips(c)}</div></div>
 ${notPicker()}</div>
 <div class="actions"><button id="back" onclick="S=null;render()">Back</button><button id="sail" class="gold" ${locked?'disabled':''} onclick="newRun('${CSEL}')">${locked?'Locked':'Take the helm'}</button></div>`;emo($('app'))};
setNot=function(d){M.selNot=clamp((M.selNot||0)+d,0,M.maxNot||0);saveMeta();renderCapSelect()};
render();
