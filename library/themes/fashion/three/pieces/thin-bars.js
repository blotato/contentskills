import {glide, span, fade, drift, clamp} from '../../kit.js';
import {studio} from './_studio.js';

// A bar chart as a row of thin standing blades on a hairline floor: each rises in turn, its
// figure in thin tall numerals above and its name in small print in front; the tallest (or
// `highlight`) is the poppy one. Sample data is illustrative.
export const meta = {duration: 6, live: true};
export const defaults = {field: 'noir', accent: 'poppy', title: 'Illustrative · hours per look', highlight: null, max: null, prefix: '', suffix: '', decimals: 0, speed: 1, times: null,
  items: [{label: 'Sketch', value: 6}, {label: 'Cut', value: 9}, {label: 'Sew', value: 14}, {label: 'Fit', value: 5}, {label: 'Press', value: 3}]};

export function mount(el, props = defaults) {
  const items = props.items, n = items.length, gap = 1.7, wide = (n - 1) * gap;
  const {T, scene, render, view, mat, bar, label, ink} = studio(el, {field: props.field, accent: props.accent, z: 14, fov: 30, width: wide + 4.2, y: 1.2, look: [0, .3, 0]}), k = 1 / Math.max(.1, props.speed || 1);
  const top = Math.max(...items.map(d => d.value)), max = props.max ?? top, lead = props.highlight ?? items.findIndex(d => d.value === top), full = 4.6, floorY = -2.2;
  const fmt = v => `${props.prefix}${Number(v).toLocaleString('en-US', {minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals})}${props.suffix}`;
  const rig = new T.Group(); scene.add(rig);
  const floor = bar([-wide / 2 - 1, floorY, .5], [wide / 2 + 1, floorY, .5], .014, ink.head, {transparent: true, opacity: .6}); rig.add(floor);
  const title = label(props.title, {h: .3, color: ink.dim}); title.position.set(0, floorY - 1.25, .5); rig.add(title);
  const bars = items.map((d, i) => {
    const hot = i === lead, x = -wide / 2 + i * gap, h = Math.max(.05, full * d.value / max), geo = new T.BoxGeometry(.09, 1, .9); geo.translate(0, .5, 0);
    const m = new T.Mesh(geo, mat(hot ? ink.accent : ink.head)); if (hot) m.material.emissive = new T.Color(ink.accent).multiplyScalar(.4); m.position.set(x, floorY, 0); rig.add(m);
    const value = label(fmt(d.value), {h: .95, role: 'num'}), name = label(d.label, {h: .27, color: hot ? ink.head : ink.dim});
    name.scale.setScalar(Math.min(1, (gap - .2) / name.userData.width)); name.position.set(x, floorY - .42, .5); value.position.x = x; rig.add(value, name);
    return {m, h, value, name, at: props.times?.[i] ?? (.3 + i * .14) * k};
  });
  return {seek(t) {
    floor.scale.y = glide(span(t, .1 * k, 1 * k)); title.material.opacity = fade(t, .2 * k, .6 * k);
    bars.forEach(({m, h, value, name, at}) => {
      const e = glide(span(t, at, 1.1 * k)); m.scale.y = Math.max(.001, h * e); m.visible = e > 0;
      value.position.y = floorY + h * e + .52; value.material.opacity = fade(t, at + .25 * k, .5 * k); name.material.opacity = fade(t, at, .5 * k);
    });
    rig.rotation.y = -.42 + .2 * glide(span(t, 0, 3.5 * k)) + .03 * Math.sin(t * .4);
    view(0, 0, 1 / drift(t, .04)); render();
  }};
}
