import {C, stage, txt, label, leave, fade, glide, span, swell} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// Before and after as two bars drawn to the same scale: the long one first, then the short one in the
// accent racing out under it, each with its figure in thin tall numerals, and the difference as a
// percentage. With `use: 'project'` the two figures are the real length of the recording and of the
// cleaned clip (the edit decision list); otherwise pass a and b: {label, value} and say if illustrative.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Length', use: '', a: {label: 'Recorded', value: 60}, b: {label: 'Kept', value: 32}, unit: 's', decimals: 1, bAt: .8, x: 70, y: 1180, w: 940, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, edl = props.use === 'project' ? props.project?.edl : null;
  const a = edl ? {label: props.a.label, value: edl.before} : props.a, b = edl ? {label: props.b.label, value: edl.after} : props.b, max = Math.max(a.value, b.value), h = 470, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); small(card, x + 44, y + 60, props.title, ink);
  const bx = x + 44, bw = w - 88 - 250, row = (d, cy, color, thick) => ({d, bar: card.append('rect').attr('x', bx).attr('y', cy - thick / 2).attr('height', thick).attr('fill', color), name: label(card, bx, cy - 34, d.label, {size: 22, color: ink.head}),
    num: txt(card, x + w - 44, cy + 26, '', {size: 96, role: 'num', color: color === ink.head ? ink.head : color, anchor: 'end'}).style('font-variant-numeric', 'tabular-nums')});
  const ra = row(a, y + 170, ink.head, 14), rb = row(b, y + 300, st.ink.accent, 26), pct = Math.round((1 - b.value / a.value) * 100), foot = small(card, x + 44, y + h - 44, `${Math.abs(pct)}% ${pct >= 0 ? 'shorter' : 'longer'}  ·  ${(a.value - b.value).toFixed(props.decimals)} ${props.unit} gone`, ink, {color: ink.head});
  const fmt = v => v.toFixed(props.decimals) + ' ' + props.unit;
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26));
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      [[ra, .15], [rb, props.bAt]].forEach(([r, at]) => { const q = swell(span(t, at, .55)); r.bar.attr('width', bw * r.d.value / max * q); r.num.text(fmt(r.d.value * q)).attr('opacity', fade(t, at, .15)); r.name.attr('opacity', fade(t, at - .05, .2)); });
      foot.attr('opacity', fade(t, props.bAt + .5, .25));
    },
  };
}
