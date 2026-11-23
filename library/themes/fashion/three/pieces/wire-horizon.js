import {studio} from './_studio.js';

// A hairline floor running to the horizon and a thin wire globe turning slowly above it, one
// meridian in poppy (loop). Everything is thin solids, so the lines keep their weight in a render.
export const meta = {duration: 12, loop: true};
export const defaults = {field: 'noir', accent: 'poppy', globe: true, rows: 12, lines: 15};

export function mount(el, props = defaults) {
  const {T, scene, render, view, bar, hoop, ink, dark} = studio(el, {field: props.field, accent: props.accent, z: 13, fov: 34, width: 6.4, y: 1.1, look: [0, .9, 0]}), TAU = Math.PI * 2;
  const floor = new T.Group(); floor.position.y = -2.4; scene.add(floor);
  const o = {transparent: true, opacity: dark ? .55 : .5}, half = (props.lines - 1) / 2, step = 2.2, depth = props.rows * step;
  for (let i = 0; i < props.lines; i++) floor.add(bar([(i - half) * step, 0, 6], [(i - half) * step, 0, 6 - depth], .016, ink.head, o));
  const cross = Array.from({length: props.rows + 1}, () => { const b = bar([-half * step, 0, 0], [half * step, 0, 0], .016, ink.head, o); floor.add(b); return b; });
  const globe = new T.Group(); globe.position.set(0, 1.5, -1); if (props.globe) scene.add(globe);
  const R = 2.3; for (let i = 0; i < 4; i++) { const m = hoop(R, i === 0 ? .02 : .011, i === 0 ? ink.accent : ink.head, i === 0 ? {} : {transparent: true, opacity: .75}); m.rotation.y = i * Math.PI / 4; globe.add(m); }
  [-.6, 0, .6].forEach(s => { const m = hoop(R * Math.cos(Math.asin(s)), .011, ink.head, {transparent: true, opacity: .75}); m.rotation.x = Math.PI / 2; m.position.y = R * s; globe.add(m); });
  return {seek(t) {
    const u = t / meta.duration, ph = u * TAU, slide = (u * 3 % 1) * step;                         // the floor comes toward us three squares per loop
    cross.forEach((b, j) => b.position.z = 6 - j * step + slide);
    globe.rotation.set(.3, ph, .18); globe.position.y = 1.5 + Math.sin(ph) * .08;
    view(Math.sin(ph) * .035, 0, 1); render();
  }};
}
