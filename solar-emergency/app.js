import {freshMission,stepMission,LIMIT} from './mission.js?v=3';
import {createHandControl} from './camera.js?v=3';

const $=id=>document.getElementById(id);
const ui={welcome:$('welcome'),hud:$('mission-hud'),result:$('result'),camera:$('camera-card')};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let state=freshMission(),mode='pointer',desired=-.6,scene,last=performance.now(),time=0,resultTimer=0,armedHold=0;
let soundOn=false,audioContext=null,noticeTimer,lastSystem=0,lastTone=0,cameraBusy=false,cameraGeneration=0;
const hand=createHandControl($('video'),$('hand-overlay'),$('tracking-label'));

function tone(freq=500,length=.14,volume=.06){if(!soundOn)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(volume,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+length);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+length);}catch{}}
function announce(text,duration=3500){clearTimeout(noticeTimer);$('announcement').textContent=text;$('announcement').classList.toggle('visible',!!text);noticeTimer=setTimeout(()=>$('announcement').classList.remove('visible'),duration);}
function show(screen){ui.welcome.hidden=screen!=='welcome';ui.hud.hidden=screen!=='mission';ui.result.hidden=screen!=='result';}
function cancelCameraSetup(){cameraGeneration++;hand.stop();cameraBusy=false;$('setup-note').textContent='';$('camera-start').disabled=$('switch-control').disabled=false;$('camera-start').innerHTML='ENABLE CAMERA';}
function startGame(nextMode=mode){if(nextMode==='pointer'&&cameraBusy)cancelCameraSetup();mode=nextMode;state=freshMission();state.phase='playing';desired=mode==='webcam'?0:-.6;state.angle=desired;$('tilt').value=desired;lastSystem=0;resultTimer=0;show('mission');updateUI(scene.sunAngle(0,'playing'));$('scene').focus({preventScroll:true});$('instruction').textContent=mode==='webcam'?'MOVE HAND LEFT / RIGHT TO ALIGN':'← → MOVE / DRAG SLIDER TO ALIGN';$('switch-control').textContent=mode==='webcam'?'MOUSE / TOUCH':'ENABLE CAMERA';$('tilt').disabled=mode==='webcam';announce('ALIGN GREEN PANEL WITH YELLOW SUN RING');tone(392);}
function home(){cancelCameraSetup();ui.camera.hidden=true;state=freshMission();desired=-.6;mode='pointer';show('welcome');$('camera-start').focus({preventScroll:true});$('setup-note').textContent='';announce('');}
async function enableCamera(fromWelcome=false){if(cameraBusy)return;cameraBusy=true;const generation=++cameraGeneration;const cameraBtn=$('camera-start'),switchBtn=$('switch-control');cameraBtn.disabled=switchBtn.disabled=true;cameraBtn.textContent='CONNECTING…';$('setup-note').textContent='Allow camera access, then raise one open hand. First setup downloads the hand-tracking model.';
  const oldPhase=state.phase;if(!fromWelcome)state.phase='setup';
  try{await hand.enable();if(generation!==cameraGeneration)return;mode='webcam';ui.camera.hidden=false;$('setup-note').textContent='';
    if(fromWelcome){state=freshMission();state.phase='armed';armedHold=0;show('mission');$('instruction').textContent='RAISE AN OPEN HAND TO BEGIN';$('switch-control').textContent='MOUSE / TOUCH';$('tilt').disabled=true;announce('CAMERA READY // RAISE AN OPEN HAND',6000);}
    else{state.phase=oldPhase;$('switch-control').textContent='MOUSE / TOUCH';$('tilt').disabled=true;$('instruction').textContent='MOVE HAND LEFT / RIGHT TO ALIGN';announce('SHOW OPEN HAND TO RESUME');}
  }catch(error){if(generation!==cameraGeneration)return;$('setup-note').textContent=error.name==='NotAllowedError'?'Camera permission was declined. You can play with mouse or touch.':error.name==='NotFoundError'?'No webcam found. You can play with mouse or touch.':error.message;mode='pointer';ui.camera.hidden=true;if(!fromWelcome){state.phase=oldPhase;announce('Camera unavailable. Mouse, touch and arrow keys still work.',6000);}}
  finally{if(generation!==cameraGeneration)return;cameraBusy=false;cameraBtn.disabled=switchBtn.disabled=false;cameraBtn.innerHTML='ENABLE CAMERA';}
}
function usePointer(){cancelCameraSetup();ui.camera.hidden=true;mode='pointer';$('tilt').disabled=false;$('switch-control').textContent='ENABLE CAMERA';$('instruction').textContent='← → MOVE / DRAG SLIDER TO ALIGN';if(state.phase==='armed')startGame('pointer');else announce('MOUSE / TOUCH / ARROW KEYS ACTIVE');}
function finish(){resultTimer=0;show('result');$('again').focus({preventScroll:true});const success=state.phase==='success';
  $('result-eyebrow').textContent=success?'RESTORATION COMPLETE':'BACKUP POWER EXHAUSTED';$('result-title').innerHTML=success?'OUTPOST<br><em>ONLINE.</em>':'POWER<br><em>INCOMPLETE.</em>';$('result-copy').textContent=success?'LIGHTS / COMMS / HABITAT — RESTORED':`You restored ${Math.round(state.power)}% power. Keep the green marker inside the yellow ring to charge faster.`;
  if(success){tone(523,.3);setTimeout(()=>tone(659,.3),180);setTimeout(()=>tone(784,.5),360);}else tone(262,.3);
}
$('pointer-start').addEventListener('click',()=>startGame('pointer'));
$('camera-start').addEventListener('click',()=>enableCamera(true));
$('switch-control').addEventListener('click',()=>mode==='webcam'?usePointer():enableCamera());
$('stop-camera').addEventListener('click',usePointer);
$('restart').addEventListener('click',()=>startGame(mode));$('exit').addEventListener('click',home);
$('again').addEventListener('click',()=>{if(mode==='webcam'&&!hand.ready){home();return;}startGame(mode);});
$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',soundOn);tone();});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('experience').requestFullscreen();}catch{announce('Full screen is unavailable in this browser.');}});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit full screen':'Full screen';$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen');});
$('tilt').addEventListener('input',e=>{if(mode==='pointer')desired=Number(e.target.value);});
function pointer(e){if(mode!=='pointer'||state.phase!=='playing')return;const r=$('scene').getBoundingClientRect();desired=((Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)))-.5)*LIMIT*2;$('tilt').value=desired;}
$('scene').addEventListener('pointermove',pointer);$('scene').addEventListener('pointerdown',e=>{$('scene').setPointerCapture?.(e.pointerId);pointer(e);});
$('scene').addEventListener('keydown',e=>{if(mode!=='pointer'||state.phase!=='playing')return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();desired=Math.max(-LIMIT,Math.min(LIMIT,desired+(e.key==='ArrowLeft'?-.055:.055)));$('tilt').value=desired;}});
window.addEventListener('pagehide',()=>hand.stop());

function updateUI(target){const power=Math.round(state.power),error=state.angle-target;
  $('power-value').innerHTML=`${power}<span>%</span>`;$('power-fill').style.width=state.power+'%';$('battery').setAttribute('aria-valuenow',power);
  $('timer').textContent=Math.ceil(state.remaining);document.querySelector('.clock').classList.toggle('urgent',state.remaining<10);
  // Alignment display is a forgiving aiming score; energy follows angular incidence in mission.js.
  const aim=Math.max(0,Math.round(100-Math.abs(error)/1.0*100));$('alignment-value').textContent=aim+'%';
  $('lock-label').textContent=state.phase==='armed'?'AWAITING HAND INPUT':state.locked?'ARRAY ALIGNED // CHARGING':'ARRAY ANGLE // ALIGN TO SUN';$('alignment-card').classList.toggle('locked',state.locked);
  $('panel-marker').style.left=((state.angle+LIMIT)/(LIMIT*2)*100)+'%';$('target-marker').style.left=((target+LIMIT)/(LIMIT*2)*100)+'%';
  $('direction-hint').textContent=state.locked?'HOLD POSITION':error<0?'MOVE RIGHT →':'← MOVE LEFT';
  for(let i=1;i<=3;i++){const online=power>=[25,60,100][i-1];$('sys'+i).classList.toggle('online',online);$('sys'+i).innerHTML=['LIGHTS','COMMS','HABITAT'][i-1]+'<b>'+(online?'ONLINE':'OFFLINE')+'</b>';}
  const systems=power>=100?3:power>=60?2:power>=25?1:0;if(state.phase==='playing'&&systems>lastSystem){lastSystem=systems;announce(['','LIGHTS ONLINE // 25% POWER','COMMS ONLINE // 60% POWER',''][systems]);tone(600+systems*100,.2);}
}
function frame(now){const dt=Math.min(.06,(now-last)/1000);last=now;if(document.hidden){requestAnimationFrame(frame);return;}time+=dt;let active=true;
  if(mode==='webcam'){const tracked=hand.predict(now);active=tracked.active;if(active){desired=(tracked.x-.5)*LIMIT*2;$('tilt').value=desired;}
    if(state.phase==='armed'){armedHold=active?armedHold+dt:0;if(armedHold>.7)startGame('webcam');}
    if(state.phase==='playing')$('instruction').textContent=active?'MOVE HAND LEFT / RIGHT TO ALIGN':'Hand out of view. Mission paused. Show your hand, or use mouse / touch.';
  }
  state.angle+=(desired-state.angle)*(1-Math.exp(-dt*9));const target=scene.sunAngle(state.elapsed,state.phase);const before=state.phase;
  stepMission(state,dt,target,active);if(before==='playing'&&state.phase!=='playing')finish();
  if(state.phase==='success'||state.phase==='timeout'){resultTimer+=dt;$('reset-countdown').textContent=`AUTOMATIC RESET IN ${Math.max(0,Math.ceil(25-resultTimer))}s`;if(resultTimer>=25)home();}
  if(state.locked&&state.phase==='playing'&&soundOn&&time-lastTone>1.2){lastTone=time;tone(330+state.power*3,.08,.018);}
  updateUI(target);scene.update(state,time,dt,reduced);requestAnimationFrame(frame);
}
try{const {createScene}=await import('./scene.js?v=3');try{scene=createScene($('scene'));}catch{$('scene').replaceChildren();const {createFlatScene}=await import('./scene-flat.js?v=3');scene=createFlatScene($('scene'));}$('loading').hidden=true;show('welcome');requestAnimationFrame(frame);}catch(error){console.error(error);$('loading').innerHTML='This browser could not start the 3D scene.<br>Try Chrome or Edge with hardware acceleration enabled.';}
