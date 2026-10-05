export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
// Relative gestures prevent jumps when hands appear or switch between rotate and zoom.
export function createGestureController(){let anchor=null,grips=new Map();return {reset(){anchor=null;grips.clear();},step(hands){const current=new Map();const pinched=hands.filter(h=>{const grip=h.pinch<(grips.get(h.id)?.6:.38);current.set(h.id,grip);return grip;});grips=current;
  if(!pinched.length){anchor=null;return {kind:'idle'};}
  if(pinched.length>=2){const separation=Math.hypot(pinched[0].x-pinched[1].x,pinched[0].y-pinched[1].y);if(separation<.05){anchor=null;return {kind:'idle'};}const ratio=anchor?.kind==='zoom'?clamp(anchor.distance/separation,.88,1.12):1;anchor={kind:'zoom',distance:separation};return {kind:'zoom',ratio};}
  const h=pinched[0];const matching=anchor?.kind==='rotate'&&anchor.id===h.id;const dx=matching?clamp(h.x-anchor.x,-.06,.06):0,dy=matching?clamp(h.y-anchor.y,-.06,.06):0;anchor={kind:'rotate',id:h.id,x:h.x,y:h.y};return {kind:'rotate',dx,dy};
}};}
