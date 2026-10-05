const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';
const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
export function createHandControl(video, overlay, label) {
  let stream=null,landmarker=null,epoch=0,ready=false,lastPrediction=0,lastVideoTime=-1,lastSeen=0,lastX=.5;
  function stop(){epoch++;ready=false;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;lastSeen=0;overlay.getContext('2d').clearRect(0,0,overlay.width,overlay.height);}
  async function enable(){stop();const token=epoch;
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access needs HTTPS or localhost. You can still play with mouse or touch.');
    let timeout;
    try{
      const work=(async()=>{
        const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
        if(token!==epoch){acquired.getTracks().forEach(t=>t.stop());throw new Error('Camera setup cancelled.');}stream=acquired;
        const track=stream.getVideoTracks()[0];track.addEventListener('ended',()=>{ready=false;label.textContent='Camera disconnected';});
        if(!landmarker){const {FilesetResolver,HandLandmarker}=await import('./vendor/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks(WASM);
          const created=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.55,minTrackingConfidence:.55});
          if(token!==epoch){created.close();throw new Error('Camera setup cancelled.');}landmarker=created;}
        if(token!==epoch)throw new Error('Camera setup cancelled.');video.srcObject=stream;await video.play();
        if(token!==epoch)throw new Error('Camera setup cancelled.');ready=true;lastVideoTime=-1;lastSeen=0;label.textContent='Raise one open hand';
      })();
      await Promise.race([work,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Camera setup took too long. Check your connection or try mouse control.')),35000);})]);
    }catch(error){if(token===epoch)stop();throw error;}finally{clearTimeout(timeout);}
  }
  function predict(now){
    if(!ready||video.readyState<2)return {active:false,x:lastX};
    if(now-lastPrediction<85||video.currentTime===lastVideoTime)return {active:lastSeen>0&&now-lastSeen<650,x:lastX};
    lastPrediction=now;lastVideoTime=video.currentTime;
    try{
      const result=landmarker.detectForVideo(video,now);const points=result.landmarks?.[0];
      const ctx=overlay.getContext('2d');overlay.width=320;overlay.height=240;ctx.clearRect(0,0,320,240);
      if(points){lastSeen=now;const palm=(points[0].x+points[5].x+points[9].x+points[17].x)/4;lastX=Math.max(0,Math.min(1,(1-palm-.12)/.76));
        ctx.strokeStyle='#80efc9';ctx.lineWidth=2;for(const chain of [[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[0,17]]){ctx.beginPath();chain.forEach((index,i)=>{const p=points[index];i?ctx.lineTo((1-p.x)*320,p.y*240):ctx.moveTo((1-p.x)*320,p.y*240);});ctx.stroke();}
        for(const p of points){ctx.beginPath();ctx.arc((1-p.x)*320,p.y*240,2.7,0,Math.PI*2);ctx.fillStyle='#f5cc62';ctx.fill();}label.textContent='Hand connected';
      }else label.textContent='Show your hand to continue';
      return {active:lastSeen>0&&now-lastSeen<650,x:lastX};
    }catch(error){ready=false;label.textContent='Tracking interrupted';return {active:false,x:lastX,error};}
  }
  return {enable,stop,predict,get ready(){return ready;}};
}
