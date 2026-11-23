import {glide, span, fade} from '../../kit.js';
import {studio} from './_studio.js';

// Thin hoops turning slowly inside one another like a mobile, one small poppy bead riding the
// inner one (loop). `rings` sets how many; `word` adds small print under them.
export const meta = {duration: 12, loop: true};
export const defaults = {field: 'noir', accent: 'poppy', rings: 3, word: ''};

export function mount(el, props = defaults) {
  const {T, scene, render, view, hoop, flat, label, ink} = studio(el, {field: props.field, accent: props.accent, z: 13, fov: 30, width: 8.4, fog: false}), TAU = Math.PI * 2;
  const n = Math.max(1, Math.min(5, props.rings)), group = new T.Group(); scene.add(group); group.position.y = props.word ? .4 : 0;
  const rings = Array.from({length: n}, (_, i) => { const r = 3.3 - i * (2.2 / Math.max(1, n - 1 || 1)) * (n > 1 ? 1 : 0), pivot = new T.Group(), ring = hoop(r, i === 0 ? .022 : .016, ink.head, {transparent: true, opacity: i === 0 ? 1 : .8}); pivot.add(ring); group.add(pivot); return {pivot, ring, r, i}; });
  const last = rings[n - 1], bead = new T.Mesh(new T.SphereGeometry(.11, 24, 16), flat(ink.accent)); last.ring.add(bead);
  const word = props.word ? label(props.word, {h: .42, color: ink.dim}) : null; if (word) { word.position.set(0, -4.3, 0); scene.add(word); }
  return {seek(t) {
    const ph = t / meta.duration * TAU;
    rings.forEach(({pivot, ring, i}) => { pivot.rotation.set(.35 + i * .5, ph * (i % 2 ? -1 : 1) + i * 1.1, i * .4); ring.rotation.x = Math.sin(ph + i) * .25; });
    bead.position.set(Math.cos(ph * 2) * last.r, Math.sin(ph * 2) * last.r, 0);
    group.rotation.z = Math.sin(ph) * .06; view(0, 0, 1); render();
  }};
}
