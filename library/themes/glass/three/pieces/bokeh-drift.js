import {studio, hash} from './_studio.js';

// Soft out-of-focus discs of light drifting across the dark, like street lights behind a model
// (loop): white ones, one poppy, optionally a cobalt and a sun partner. A ground for a word.
export const meta = {duration: 14, loop: true};
export const defaults = {field: 'noir', accent: 'poppy', count: 16, partners: false, seed: 1};

export function mount(el, props = defaults) {
  const {T, scene, render, view, disc, ink, dark} = studio(el, {field: props.field, accent: props.accent, z: 12, fov: 34, fog: false}), TAU = Math.PI * 2;
  const tints = [ink.accent, ...(props.partners ? ['#2450E6', '#6FE3C4'] : [])], s = props.seed;
  const discs = Array.from({length: props.count}, (_, i) => {
    const tint = i < tints.length ? tints[i] : dark ? '#FFFFFF' : '#0A0F1C', depth = hash(i, s + 1), r = .35 + 1.5 * hash(i, s + 2) * (1 - depth * .5), base = (i < tints.length ? .6 : .14 + .2 * hash(i, s + 3)) * (dark ? 1 : .6), home = [[1.6, -1.2], [-2.6, 1.9], [2.4, 2.3]][i];
    const m = disc(r, tint, base); if (dark) m.material.blending = T.AdditiveBlending; m.renderOrder = i; scene.add(m);
    return {m, base, x: home ? home[0] : (hash(i, s + 4) - .5) * 11, y: home ? home[1] : (hash(i, s + 5) - .5) * 11, z: home ? 0 : -6 + depth * 8, turns: 1 + Math.floor(hash(i, s + 6) * 2), ph: hash(i, s + 7) * TAU, dir: hash(i, s + 8) < .5 ? -1 : 1, sway: .5 + hash(i, s + 9)};
  });
  return {seek(t) {
    const ph = t / meta.duration * TAU;
    discs.forEach(({m, base, x, y, z, turns, ph: p, dir, sway}) => {
      m.position.set(x + Math.sin(ph * turns * dir + p) * sway * 1.6, y + Math.cos(ph * dir + p * 1.7) * sway, z);
      m.material.opacity = base * (.75 + .25 * Math.sin(ph * turns + p * 2.3)); m.scale.setScalar(1 + .08 * Math.sin(ph + p));
    });
    view(0, 0, 1); render();
  }};
}
