// Interactive Canvas fallback for computers where WebGL is unavailable.
export function createFlatScene(host,{preview=false}={}){
  const canvas=document.createElement('canvas');host.append(canvas);canvas.setAttribute('aria-hidden','true');const c=canvas.getContext('2d');
  if(!c)throw new Error('Canvas is unavailable');let w=0,h=0;const TAU=Math.PI*2;
  const observer=new ResizeObserver(()=>{w=host.clientWidth;h=host.clientHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0);});observer.observe(host);
  const ellipse=(x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();};
  const rounded=(x,y,bw,bh,r,color)=>{c.beginPath();c.roundRect(x,y,bw,bh,r);c.fillStyle=color;c.fill();};
  const segment=(a,b,color,width=1)=>{c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
  return {
    sunAngle(t,phase){return .06+Math.sin((phase==='idle'||phase==='armed'?0:t)*.16)*.46;},
    update(state,time,dt,reduced){
      const mobile=w<650;const scale=preview?Math.min(w/650,h/330):mobile?w/500:Math.min(w/1400,h/900),x=preview?w*.58:mobile?w*.53:w*.71,y=preview?h*.5:mobile?h*.52:h*.67;
      const target=this.sunAngle(state.elapsed,state.phase),power=state.power/100;
      c.clearRect(0,0,w,h);let sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#06111f');sky.addColorStop(1,'#142739');c.fillStyle=sky;c.fillRect(0,0,w,h);
      for(let i=0;i<180;i++){const sx=((i*197.31)%1000)/1000*w,sy=((i*103.71)%1000)/1000*h*.6;ellipse(sx,sy,i%3?1:.6,i%3?1:.6,'#7b97b277');}
      c.beginPath();c.moveTo(0,h);c.lineTo(0,y-120*scale);for(let i=0;i<=20;i++)c.lineTo(w*i/20,y-110*scale+Math.sin(i*.9)*16*scale);c.lineTo(w,h);c.closePath();let ground=c.createLinearGradient(0,y-130*scale,0,h);ground.addColorStop(0,'#586a79');ground.addColorStop(1,'#142536');c.fillStyle=ground;c.fill();
      for(let i=0;i<18;i++){const rx=((i*163)%1000)/1000*w,ry=y-35*scale+((i*129)%1000)/1000*(h-y);ellipse(rx,ry,(20+i%4*12)*scale,(6+i%4*3)*scale,'#263d50');ellipse(rx,ry-2*scale,(17+i%4*10)*scale,(4+i%4*2)*scale,'#425766');}
      const px=x-190*scale,py=y-50*scale,sx=px+Math.tan(target)*240*scale,sy=py-240*scale;
      let glow=c.createRadialGradient(sx,sy,2,sx,sy,95*scale);glow.addColorStop(0,'#ffe09e88');glow.addColorStop(1,'#ffd36e00');c.fillStyle=glow;c.fillRect(sx-100*scale,sy-100*scale,200*scale,200*scale);ellipse(sx,sy,30*scale,30*scale,'#f5d08a');
      // Sunlight lands on the rotating face, then energy follows the cable into the base.
      for(let i=-2;i<=2;i++){const dx=i*22*scale,hx=px+dx*Math.cos(state.angle),hy=py+dx*Math.sin(state.angle);segment([hx+Math.tan(target)*(hy-sy),sy+30*scale],[hx,hy],'rgba(245,204,98,'+(.18+state.alignment*.4)+')',1.3*scale);}
      ellipse(x,y+82*scale,150*scale,35*scale,'#253e4e');ellipse(x,y+78*scale,150*scale,35*scale,'#536778');c.beginPath();c.ellipse(x,y+78*scale,140*scale,30*scale,0,0,TAU);c.strokeStyle=power>.25?'#80efc9':'#82959f';c.lineWidth=2*scale;c.stroke();
      c.beginPath();c.moveTo(px,py+95*scale);c.bezierCurveTo(px+40*scale,py+130*scale,x-110*scale,y+85*scale,x-55*scale,y+45*scale);c.strokeStyle='#142c3c';c.lineWidth=5*scale;c.stroke();
      rounded(x-75*scale,y-30*scale,150*scale,115*scale,10*scale,'#c1cbce');ellipse(x,y-30*scale,75*scale,44*scale,'#dae1df');ellipse(x,y+81*scale,75*scale,10*scale,'#71858e');
      segment([x-75*scale,y-18*scale],[x+75*scale,y-18*scale],'#cbb46c',3*scale);
      for(let i=0;i<4;i++){const on=power>i*.25;c.shadowBlur=on?18:0;c.shadowColor='#80efc9';rounded(x-60*scale+i*34*scale,y+5*scale,22*scale,26*scale,3*scale,on?'#8ceacb':'#203c50');}c.shadowBlur=0;
      rounded(x-20*scale,y+36*scale,40*scale,48*scale,4*scale,'#20394a');rounded(x-12*scale,y+44*scale,24*scale,22*scale,2*scale,power>.6?'#a4f2d9':'#486171');
      for(let i=0;i<3;i++)rounded(x-33*scale-i*3*scale,y+83*scale+i*7*scale,(66+i*6)*scale,7*scale,1*scale,'#9cadb4');
      segment([x+105*scale,y+55*scale],[x+105*scale,y-85*scale],'#b1c1c8',7*scale);c.save();c.translate(x+105*scale,y-87*scale);c.rotate(-.4);ellipse(0,0,30*scale,12*scale,'#d1dbd9');segment([0,0],[0,-28*scale],'#d3b96c',3*scale);c.restore();
      rounded(px-6*scale,py,12*scale,100*scale,3*scale,'#243e52');ellipse(px,py+100*scale,30*scale,10*scale,'#899ea9');
      c.save();c.translate(px,py);c.rotate(state.angle);rounded(-95*scale,-25*scale,190*scale,58*scale,4*scale,'#b1c7d1');rounded(-90*scale,-21*scale,180*scale,49*scale,2*scale,'#19457b');
      for(let i=1;i<8;i++)segment([(-90+i*22.5)*scale,-21*scale],[(-90+i*22.5)*scale,28*scale],'#5d8dc5',.8*scale);for(let i=1;i<3;i++)segment([-90*scale,(-21+i*16)*scale],[90*scale,(-21+i*16)*scale],'#5d8dc5',.8*scale);c.restore();
      if(state.phase==='playing'&&state.alignment>.05||state.phase==='success')for(let i=0;i<9;i++){const t=(time*(reduced?.08:.25*Math.max(.1,state.alignment))+i/9)%1;ellipse(px+(x-55*scale-px)*t,py+95*scale-50*scale*t+Math.sin(t*Math.PI)*20*scale,3*scale,3*scale,'#80efc9');}
      const ax=x-107*scale,ay=y+52*scale;rounded(ax-9*scale,ay-22*scale,18*scale,28*scale,5*scale,'#e1e7e5');ellipse(ax,ay-35*scale,13*scale,13*scale,'#e1e7e5');ellipse(ax+2*scale,ay-35*scale,9*scale,8*scale,'#bba465');segment([ax-5*scale,ay+5*scale],[ax-7*scale,ay+22*scale],'#d6dfdf',7*scale);segment([ax+5*scale,ay+5*scale],[ax+7*scale,ay+22*scale],'#d6dfdf',7*scale);
      const wave=state.phase==='success';segment([ax-10*scale,ay-16*scale],[ax-22*scale,ay+(wave?-35+Math.sin(time*5)*3:-3)*scale],'#d6dfdf',6*scale);
      if(wave&&!reduced)for(let i=0;i<60;i++){const a=i*2.4+time*.15,r=(40+(time*40+i*9)%170)*scale;ellipse(x+Math.cos(a)*r,y-30*scale+Math.sin(a)*r*.6,2*scale,2*scale,i%2?'#80efc9':'#f5cc62');}
    },dispose(){observer.disconnect();canvas.remove();}
  };
}
