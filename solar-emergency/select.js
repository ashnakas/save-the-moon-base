import {freshMission} from './mission.js';
import {createViewer} from './explore/viewer.js?v=1';
const solarHost=document.getElementById('solar-preview'),gatewayHost=document.getElementById('gateway-preview');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let solar,station,stopped=false,last=0;
try{const {createScene}=await import('./scene.js?v=4');solar=createScene(solarHost);}catch{solarHost.querySelector('canvas')?.remove();try{const {createFlatScene}=await import('./scene-flat.js?v=4');solar=createFlatScene(solarHost);}catch{}}
try{station=createViewer(gatewayHost);}catch{}
if(solar)solarHost.querySelector('.preview-loading')?.remove();
if(station)gatewayHost.querySelector('.preview-loading')?.remove();
const state=freshMission();state.phase='idle';state.power=70;state.alignment=1;state.angle=.06;
function frame(now){if(stopped)return;requestAnimationFrame(frame);if(document.hidden||now-last<50)return;const dt=last?Math.min(.1,(now-last)/1000):0;last=now;solar?.update(state,reduced?0:now/1000,dt,true);if(station){if(!reduced&&!station.fallback)station.rotate(dt*.045,0);station.render(now/1000,true);}}
requestAnimationFrame(frame);
window.addEventListener('pagehide',()=>{stopped=true;solar?.dispose();station?.dispose();});
