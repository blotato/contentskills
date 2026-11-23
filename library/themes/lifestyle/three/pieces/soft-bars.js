import {C, series, glide, span, fade} from '../../kit.js';
import {softStage} from './_soft.js';

// A bar chart as a row of matte rounded columns growing out of the paper, each with its value
// floating above and its name on the ground in front. Props: title, unit, items [{label, value}]
// (2-6), max. The default data is illustrative.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'Where the morning goes', unit: 'Illustrative · minutes', max: 40,
  items: [{label: 'Stretch', value: 12}, {label: 'Coffee', value: 18}, {label: 'Journal', value: 9}, {label: 'Walk', value: 34}]};

export function mount(el, props = defaults) {
  const {T, scene, render, view, mat, shadow, label} = softStage(el, {z: 13, width: 9.8, y: 4.4, look: [0, 3.1, 0]}), n = props.items.length, gap = Math.min(2.1, 8 / n), r = gap * .3, top = 4.4;
  const max = props.max || Math.max(...props.items.map(d => d.value));
  const title = label(props.title, {h: .62}), unit = label(props.unit, {h: .3, role: 'label', color: C.dim});
  const tw = Math.min(1, 8.6 / title.userData.width); title.scale.setScalar(tw); title.position.set(0, 6.5, 0); unit.position.set(0, 7.15, 0); scene.add(title, unit);
  const bars = props.items.map((d, i) => {
    const x = (i - (n - 1) / 2) * gap, h = Math.max(.05, d.value / max * top), g = new T.Group(); g.position.x = x; scene.add(g);
    const body = new T.Mesh(new T.CylinderGeometry(r, r, 1, 48), mat(series[i % series.length])), cap = new T.Mesh(new T.SphereGeometry(r, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), body.material);
    const sh = shadow(r * 2.3, .5); sh.position.set(.15, .01, .05); const value = label(String(d.value), {h: .62}), name = label(d.label, {h: .36, role: 'wide', color: C.ink});
    name.scale.setScalar(Math.min(1, gap * .92 / name.userData.width)); name.position.set(0, -.5, r + .3);
    g.add(body, cap, sh, value, name); return {g, body, cap, value, name, sh, h, d, i};
  });
  return {seek(t) {
    title.material.opacity = fade(t, .1, .7); unit.material.opacity = fade(t, 0, .7);
    bars.forEach(({body, cap, value, name, sh, h, i}) => {
      const e = glide(span(t, .5 + i * .22, 1.6)), now = Math.max(.02, h * e);
      body.scale.y = now; body.position.y = now / 2; cap.position.y = now; value.position.y = now + .75 + Math.sin(t * .9 + i) * .03; value.material.opacity = fade(t, 1.1 + i * .22, .6);
      name.material.opacity = fade(t, .4 + i * .15, .6); sh.material.opacity = .5 * e;
    });
    view(-.16 + .22 * (1 - Math.exp(-t / 4)), 0, 1.04 - .04 * glide(span(t, 0, 5))); render();
  }};
}
