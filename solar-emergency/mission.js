export const LIMIT = 0.8;
export function alignmentFor(panelAngle, sunAngle) {
  const error = Math.abs(panelAngle - sunAngle);
  return Math.max(0, Math.cos(error));
}
export function stepMission(state, dt, sunAngle, inputActive = true) {
  if (state.phase !== 'playing' || !inputActive) return state;
  state.remaining = Math.max(0, state.remaining - dt);
  state.elapsed += dt;
  state.alignment = alignmentFor(state.angle, sunAngle);
  const error = Math.abs(state.angle - sunAngle);
  const chargeRate = error < 0.16 ? 5.5 : error < 0.35 ? 2.2 : 0;
  state.power = Math.min(100, state.power + chargeRate * dt);
  state.locked = error < 0.16;
  if (state.power >= 100) state.phase = 'success';
  else if (state.remaining <= 0) state.phase = 'timeout';
  return state;
}
export function freshMission() {
  return {phase:'idle',angle:-0.6,power:0,remaining:45,elapsed:0,alignment:0,locked:false};
}
