import {glide, swell, span, drift, clamp} from '../../kit.js';
import {studio, hash} from './_studio.js';

// The theme's vertical-panel motif in 3D: tall thin cards of unequal width slide in at their own
// pace, from above and below, and close up into a row; one is the poppy accent. Then the row keeps
// turning a few degrees. `widths` sets the panels, `accentAt` which one takes the colour (-1 none).
export const meta = {duration: 6, live: true};
export const defaults = {field: 'noir', accent: 'poppy', widths: [1.1, .7, 1.6, .5, 1.2, .8], accentAt: 3, height: 5.2, gap: .1, speed: 1, times: null};

export function mount(el, props = defaults) {
  const total = props.widths.reduce((a, b) => a + b, 0) + props.gap * (props.widths.length - 1);
  const {T, scene, render, view, mat, shadow, ink, dark} = studio(el, {field: props.field, accent: props.accent, z: 13, fov: 30, width: total + 2.4}), k = 1 / Math.max(.1, props.speed || 1);
  const row = new T.Group(); scene.add(row); let x = -total / 2;
  const greys = dark ? ['#F1EEE8', '#FFFFFF', '#B9B6B0', '#E6E1D8'] : ['#FFFFFF', '#1B1B1F', '#B9B6B0', '#E6E1D8'];
  const panels = props.widths.map((w, i) => {
    const hot = i === props.accentAt, m = new T.Mesh(new T.BoxGeometry(w, props.height, .06), mat(hot ? ink.accent : greys[i % greys.length], {transparent: true}));
    m.material.emissive = new T.Color(hot ? ink.accent : greys[i % greys.length]).multiplyScalar(hot ? .35 : .22);
    const s = shadow(w, props.height, dark ? .55 : .22); s.position.set(.12, -.16, -.35); m.add(s);
    const cx = x + w / 2; x += w + props.gap; row.add(m);
    return {m, s, cx, from: (i % 2 ? -1 : 1) * (5.5 + 1.5 * hash(i, 5)), at: props.times?.[i] ?? (.02 + .3 * hash(i, 2)) * k, len: (.8 + .4 * hash(i, 9)) * k, z: (hash(i, 7) - .5) * .5};
  });
  return {seek(t) {
    panels.forEach(({m, s, cx, from, at, len, z}) => {
      const q = swell(span(t, at, len)), close = glide(span(t, at + len * .6, 1.2 * k));
      m.position.set(cx * (1.12 - .12 * close), from * (1 - q), z * (1 - close)); m.material.opacity = clamp(q * 3); s.material.opacity = (dark ? .55 : .22) * clamp(q * 2 - 1); m.visible = q > 0;
    });
    row.rotation.y = -.34 + .16 * glide(span(t, 0, 3 * k)) + .05 * Math.sin(t * .35); row.rotation.x = .04;
    view(0, 0, 1 / drift(t, .05)); render();
  }};
}
