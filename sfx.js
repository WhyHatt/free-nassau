"use strict";
/* Procedural WebAudio sound effects. No audio files. */
const SFX=(()=>{let ctx=null,master=null,amb=null,muted=localStorage.getItem('fnv2mute')==='1';
 function init(){if(ctx||window.NOFX)return ctx;try{ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=muted?0:.5;master.connect(ctx.destination)}catch(e){ctx=null}return ctx}
 function noiseBuf(sec,brown){const n=ctx.sampleRate*sec,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}return b}
 function env(g,t,a,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+dec)}
 function noise(t,dur,type,freq,q,peak,sweepTo){const s=ctx.createBufferSource();s.buffer=noiseBuf(dur+.05);const f=ctx.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);if(sweepTo)f.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);f.Q.value=q||1;const g=ctx.createGain();env(g,t,.005,peak,dur);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+dur+.05)}
 function tone(t,type,f0,f1,dur,peak){const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=ctx.createGain();env(g,t,.004,peak,dur);o.connect(g).connect(master);o.start(t);o.stop(t+dur+.05)}
 const P={
  cannon(){const t=ctx.currentTime;tone(t,'sine',120,35,.6,.9);noise(t,.7,'lowpass',900,.7,.8,120);noise(t+.02,.18,'bandpass',2500,1,.25)},
  hit(){const t=ctx.currentTime;tone(t,'triangle',180,60,.18,.6);noise(t,.22,'lowpass',1400,1,.5,300);noise(t+.03,.3,'highpass',3000,.5,.12)},
  card(){const t=ctx.currentTime;noise(t,.16,'bandpass',900,1.5,.35,4200)},
  coins(){const t=ctx.currentTime;[0,.07,.15,.21].forEach((d,i)=>{tone(t+d,'sine',2400+i*300+Math.random()*200,0,.25,.18);tone(t+d,'sine',3700+i*200,0,.12,.07)})},
  clash(){const t=ctx.currentTime;[1180,1530,2210,3010].forEach(f=>tone(t,'square',f,f*.97,.35,.05));noise(t,.25,'highpass',2500,.7,.4);tone(t+.12,'square',1320,1290,.3,.03);noise(t+.12,.18,'highpass',3000,.7,.25)},
  tick(){const t=ctx.currentTime;tone(t,'sine',1700,1250,.05,.09);noise(t,.03,'highpass',4000,.7,.05)},
  thud(){const t=ctx.currentTime;tone(t,'sine',150,80,.12,.22)},
  page(){const t=ctx.currentTime;noise(t,.22,'bandpass',1100,1.2,.2,2600)},
  turn(){const t=ctx.currentTime;tone(t,'sine',440,440,.25,.07);tone(t+.08,'sine',660,660,.3,.06)},
  block(){const t=ctx.currentTime;tone(t,'sine',520,420,.15,.18);noise(t,.08,'bandpass',1800,3,.15)}};
 function play(n){if(muted||window.NOFX)return;if(!init())return;if(ctx.state==='suspended')ctx.resume();try{P[n]&&P[n]()}catch(e){}}
 function startAmb(){if(muted||window.NOFX||!init()||amb)return;const s=ctx.createBufferSource();s.buffer=noiseBuf(6,true);s.loop=true;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=500;
  const g=ctx.createGain();g.gain.value=.12;const lfo=ctx.createOscillator();lfo.frequency.value=.12;const lg=ctx.createGain();lg.gain.value=.08;lfo.connect(lg).connect(g.gain);
  const lfo2=ctx.createOscillator();lfo2.frequency.value=.07;const lg2=ctx.createGain();lg2.gain.value=250;lfo2.connect(lg2).connect(f.frequency);
  s.connect(f).connect(g).connect(master);s.start();lfo.start();lfo2.start();amb={s,lfo,lfo2}}
 function setMuted(m){muted=m;localStorage.setItem('fnv2mute',m?'1':'0');if(master)master.gain.value=m?0:.5;if(!m)startAmb()}
 document.addEventListener('pointerdown',()=>{if(!muted){init();if(ctx&&ctx.state==='suspended')ctx.resume();startAmb()}},{once:false,passive:true});
 return{play,setMuted,isMuted:()=>muted,startAmb}})();
