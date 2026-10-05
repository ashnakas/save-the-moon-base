import * as THREE from './vendor/three.module.js';

export function createScene(host) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#071321');
  scene.fog = new THREE.FogExp2('#071321',0.017);
  const camera = new THREE.PerspectiveCamera(43,1,0.1,180);
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor('#071321');
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
  host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  scene.add(new THREE.HemisphereLight('#b7dbff','#17283b',2.2));
  const sunLight = new THREE.DirectionalLight('#ffdfa0',3.4);sunLight.position.set(-6,12,5);sunLight.castShadow=true;
  sunLight.shadow.mapSize.set(1024,1024);Object.assign(sunLight.shadow.camera,{left:-15,right:15,top:15,bottom:-15});sunLight.shadow.bias=-.001;scene.add(sunLight);
  const rim=new THREE.DirectionalLight('#73b7ff',2);rim.position.set(4,4,-8);scene.add(rim);
  const world=new THREE.Group();scene.add(world);
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.15,...extra});
  const gray=mat('#aeb7bf'), dark=mat('#25394c'), white=mat('#e4e9e5'), gold=mat('#d3a949',{metalness:.7});
  function mesh(geo,material,x=0,y=0,z=0,parent=world){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,material,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);}
  function cylinder(rt,rb,h,material,x,y,z,parent,n=24){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),material,x,y,z,parent);}
  function lineBetween(a,b,color,parent=world){const g=new THREE.BufferGeometry().setFromPoints([a,b]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.6}));parent.add(l);return l;}
  // Procedural terrain and geometry are deliberately stylized, not lunar survey data.
  const terrainGeo=new THREE.PlaneGeometry(65,65,90,90);terrainGeo.rotateX(-Math.PI/2);
  const pv=terrainGeo.attributes.position;
  for(let i=0;i<pv.count;i++){const x=pv.getX(i),z=pv.getZ(i);let h=.15*Math.sin(x*.7)*Math.cos(z*.6)+.08*Math.sin(x*2+z);const flat=Math.exp(-(x*x+z*z)/80);h*=1-flat;pv.setY(i,h-.3);}
  terrainGeo.computeVertexNormals();mesh(terrainGeo,mat('#727e8a'),0,0,0);
  let seed=27;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<95;i++){const x=(rand()-.5)*48,z=(rand()-.5)*45;if(Math.abs(x)<7&&Math.abs(z)<5)continue;const s=.12+rand()*.7;const r=mesh(new THREE.DodecahedronGeometry(s,0),mat(i%3?'#5c6976':'#8a969e'),x,s*.25-.25,z);r.scale.y=.55;r.rotation.set(rand()*3,rand()*3,rand()*3);}
  for(const [x,z,r] of [[-9,-7,2.7],[9,3,1.9],[-6,7,1.4],[12,-12,3.7]]){const cr=mesh(new THREE.TorusGeometry(r,.16,6,40),mat('#63717d'),x,-.22,z);cr.rotation.x=Math.PI/2;const floor=mesh(new THREE.CircleGeometry(r,40),mat('#596572'),x,-.26,z);floor.rotation.x=-Math.PI/2;}
  const landing=cylinder(4.4,4.6,.18,mat('#526373'),2,-.06,-.3);landing.receiveShadow=true;
  const ring=mesh(new THREE.TorusGeometry(4.0,.022,5,90),mat('#8af0d0',{emissive:'#59d9ae',emissiveIntensity:.15}),2,.05,-.3);ring.rotation.x=Math.PI/2;
  const base=new THREE.Group();base.position.set(2.6,0,-.6);world.add(base);
  cylinder(1.55,1.65,1.8,white,0,1,0,base);
  const dome=mesh(new THREE.SphereGeometry(1.57,32,16,0,Math.PI*2,0,Math.PI/2),gray,0,1.9,0,base);dome.scale.y=.6;
  cylinder(1.63,1.63,.13,dark,0,.25,0,base);cylinder(1.62,1.62,.12,gold,0,1.84,0,base);
  const windowMats=[];
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const wm=mat('#143341',{emissive:'#8cf3cb',emissiveIntensity:0,metalness:.4});windowMats.push(wm);const w=box(.54,.48,.07,wm,Math.sin(a)*1.57,1.17,Math.cos(a)*1.57,base);w.rotation.y=a;}
  box(1.15,1.55,1.2,dark,0,.85,1.65,base);box(.84,1.26,.05,mat('#bac7c9'),0,.85,2.27,base);box(.4,.65,.06,windowMats[0],0,1.04,2.31,base);
  for(let i=0;i<3;i++)box(1.4,.13,.45,gray,0,.15-i*.06,2.6+i*.3,base);
  cylinder(.15,.18,2.4,gray,1.6,1.2,-1.7,base);const dish=mesh(new THREE.SphereGeometry(.68,20,10,0,Math.PI*2,0,Math.PI/2),white,1.6,2.6,-1.7,base);dish.rotation.z=.55;
  cylinder(.05,.05,.9,gold,1.8,3,-1.7,base);
  const beaconMat=mat('#a15336',{emissive:'#f59a50',emissiveIntensity:1});mesh(new THREE.SphereGeometry(.1,12,8),beaconMat,0,3,0,base);
  const baseLight=new THREE.PointLight('#7ef0c6',0,12);baseLight.position.set(2.6,2,1.8);scene.add(baseLight);
  // Rotating solar array: its upward normal turns toward the Sun.
  const panelRoot=new THREE.Group();panelRoot.position.set(-3.1,2.1,1.1);world.add(panelRoot);
  cylinder(.13,.24,2.1,dark,-3.1,.95,1.1);cylinder(.65,.85,.22,gray,-3.1,0,1.1);
  const panel=box(4.1,.14,2.45,gray,0,0,0,panelRoot);
  const cell=mat('#174785',{metalness:.65,roughness:.32,emissive:'#205daf',emissiveIntensity:.18});
  for(let x=0;x<8;x++)for(let z=0;z<5;z++)box(.46,.025,.42,cell,-1.78+x*.51,.085,-.94+z*.47,panelRoot);
  for(const z of [-1.24,1.24])box(4.2,.1,.05,white,0,.06,z,panelRoot);
  const cableCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-3.1,0,1.1),new THREE.Vector3(-1.2,.1,2.4),new THREE.Vector3(1.0,.1,2.1),new THREE.Vector3(2.6,.6,1.4)]);
  mesh(new THREE.TubeGeometry(cableCurve,32,.055,6,false),dark);
  const energyOrbs=[];const orbMat=new THREE.MeshBasicMaterial({color:'#80efc9'});
  for(let i=0;i<16;i++){const o=mesh(new THREE.SphereGeometry(.055,7,5),orbMat);o.visible=false;energyOrbs.push(o);}
  // Small astronaut, with a waving arm during mission success.
  const astronaut=new THREE.Group();astronaut.position.set(.4,0,3.5);world.add(astronaut);
  cylinder(.25,.29,.64,white,0,.84,0,astronaut);box(.42,.5,.28,dark,0,.84,-.25,astronaut);
  const helmet=mesh(new THREE.SphereGeometry(.29,20,12),white,0,1.42,0,astronaut);
  const visor=mesh(new THREE.SphereGeometry(.255,20,12,0,Math.PI,Math.PI*.25,Math.PI*.6),mat('#d6b65b',{metalness:.85,roughness:.16}),0,1.42,.035,astronaut);visor.rotation.y=0;
  for(const s of [-1,1]){cylinder(.11,.13,.48,white,s*.16,.3,0,astronaut);box(.23,.13,.35,dark,s*.16,.09,.06,astronaut);}
  const arm=new THREE.Group();arm.position.set(-.29,1.05,0);astronaut.add(arm);cylinder(.09,.1,.5,white,0,-.2,0,arm);mesh(new THREE.SphereGeometry(.105,10,8),gray,0,-.48,0,arm);cylinder(.09,.1,.55,white,.33,.83,0,astronaut);
  const sunMat=new THREE.MeshBasicMaterial({color:'#ffd787'});
  const sun=mesh(new THREE.SphereGeometry(.68,32,20),sunMat,-3,9,1.1);
  function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const cx=c.getContext('2d'),g=cx.createRadialGradient(64,64,2,64,64,64);g.addColorStop(0,'rgba(255,225,135,1)');g.addColorStop(.2,'rgba(255,196,100,.5)');g.addColorStop(1,'rgba(255,166,50,0)');cx.fillStyle=g;cx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture(),color:'#ffe6aa',blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.set(5,5,1);sun.add(glow);
  const beamMat=new THREE.LineBasicMaterial({color:'#f5cc62',transparent:true,opacity:.1});const rays=[];
  for(let i=0;i<5;i++){const geo=new THREE.BufferGeometry().setFromPoints([sun.position,new THREE.Vector3(-3.1,2.1,1.1)]);const ray=new THREE.Line(geo,beamMat);world.add(ray);rays.push(ray);}
  const starGeo=new THREE.BufferGeometry();const stars=[];
  for(let i=0;i<1000;i++)stars.push((rand()-.5)*140,8+rand()*65,-20-rand()*70);
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#adc8df',size:.075,transparent:true,opacity:.8,sizeAttenuation:true})));
  const earth=mesh(new THREE.SphereGeometry(1.15,36,24),mat('#256dba',{emissive:'#183863',emissiveIntensity:.25}),10,8,-15);
  for(let i=0;i<12;i++){const a=rand()*Math.PI*2,b=rand()*Math.PI;const c=mesh(new THREE.SphereGeometry(.25+rand()*.22,8,6),mat('#6e9c91'),Math.sin(b)*Math.cos(a)*1.07,Math.cos(b)*1.07,Math.sin(b)*Math.sin(a)*1.07,earth);c.scale.y=.5;}
  const confettiGeo=new THREE.BufferGeometry(), confPos=new Float32Array(240*3), velocities=[];
  for(let i=0;i<240;i++){confPos.set([2.6,1.5,-.6],i*3);velocities.push(new THREE.Vector3((rand()-.5)*8,2+rand()*7,(rand()-.5)*8));}
  confettiGeo.setAttribute('position',new THREE.BufferAttribute(confPos,3));const confetti=new THREE.Points(confettiGeo,new THREE.PointsMaterial({color:'#80efc9',size:.09,transparent:true,opacity:1}));confetti.visible=false;scene.add(confetti);
  let burstTime=0, previousSuccess=false;
  const small=()=>host.clientWidth<650;
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;
    if(small()){camera.position.set(12,10,20);camera.lookAt(0,2.5,0);camera.zoom=.72;camera.clearViewOffset();}
    else{camera.clearViewOffset();camera.position.set(13,10,19);camera.lookAt(-1.0,3.0,0);camera.zoom=1;camera.setViewOffset(w,h,-w*.12,0,w,h);}
    camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  return {
    sunAngle(t,phase){return .06+Math.sin((phase==='idle'||phase==='armed'?0:t)*.16)*.46;},
    update(state,time,dt,reduced){const target=this.sunAngle(state.elapsed,state.phase);sun.position.set(-3.1+Math.tan(target)*6.9,9,1.1);sunLight.position.copy(sun.position);panelRoot.rotation.z=-state.angle;
      const energized=state.phase==='success'?1:state.power/100;windowMats.forEach((m,i)=>{m.emissiveIntensity=energized>(i%3)*.3?energized*2.2:0;});baseLight.intensity=energized*6;ring.material.emissiveIntensity=.15+energized*2;
      beaconMat.emissiveIntensity=state.phase==='success'?0.15:.5+.5*Math.sin(time*4);beamMat.opacity=.15+state.alignment*.4;
      panelRoot.updateMatrixWorld(true);rays.forEach((ray,i)=>{const hit=panelRoot.localToWorld(new THREE.Vector3((i-2)*.55,.1,0));const p=ray.geometry.attributes.position;p.setXYZ(0,hit.x+Math.tan(target)*(9-hit.y),9,hit.z);p.setXYZ(1,hit.x,hit.y,hit.z);p.needsUpdate=true;});
      energyOrbs.forEach((o,i)=>{o.visible=state.phase==='playing'&&state.alignment>.05||state.phase==='success';o.position.copy(cableCurve.getPoint((time*(reduced?.08:.27*Math.max(.1,state.alignment))+i/16)%1));});
      if(state.phase==='success'&&!previousSuccess){burstTime=0;confetti.visible=!reduced;for(let i=0;i<240;i++)confPos.set([2.6,1.5,-.6],i*3);}
      previousSuccess=state.phase==='success';if(!previousSuccess)confetti.visible=false;if(confetti.visible){burstTime+=dt;for(let i=0;i<240;i++){confPos[i*3]+=velocities[i].x*dt;confPos[i*3+1]+=velocities[i].y*dt-dt*burstTime*2.5;confPos[i*3+2]+=velocities[i].z*dt;}confettiGeo.attributes.position.needsUpdate=true;confetti.material.opacity=Math.max(0,1-burstTime/5);if(burstTime>5)confetti.visible=false;}
      arm.rotation.z=state.phase==='success'?2.6+(reduced?0:Math.sin(time*5)*.3):-.15;earth.rotation.y=reduced?0:time*.018;
      renderer.render(scene,camera);
    },dispose(){observer.disconnect();renderer.dispose();}
  };
}
