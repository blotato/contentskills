import {C, F, stage, card, line, label, rule, measure, fit, span, ease, glide, leave} from '../../kit.js';

// Things you no longer need: serif items rise one by one and a wine rule draws through each at its `strike` time.
// On a paper card, with a tracked title. An item may carry an `icon` drawn in the theme's line style before its name
// ('app': an editing-app window, 'timeline': tracks with a playhead, 'file', 'clock'); it is struck out with the word
// and tips away. Props: title, items [{label, at, strike, icon}], x, y (top), w, size, field, foot.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'No longer needed', items: [{label: 'Editing app', at: .2, strike: .9}, {label: 'Timeline', at: 1.2, strike: 1.9}], x: 150, y: 250, w: 780, size: 110, field: 'paper', foot: ''};

const ICONS = {
  app: (g, s, c) => { g.append('rect').attr('x', 0).attr('y', s * .08).attr('width', s).attr('height', s * .78).attr('rx', s * .08).attr('fill', 'none').attr('stroke', c).attr('stroke-width', s * .06); g.append('line').attr('x1', 0).attr('x2', s).attr('y1', s * .28).attr('y2', s * .28).attr('stroke', c).attr('stroke-width', s * .05);
    g.append('path').attr('d', `M${s * .38} ${s * .4}l${s * .24} ${s * .13}l${-s * .24} ${s * .13}z`).attr('fill', c); for (const k of [.12, .34, .6]) g.append('rect').attr('x', s * k).attr('y', s * .72).attr('width', s * .18).attr('height', s * .07).attr('fill', c); },
  timeline: (g, s, c) => { [[.16, .05, .6], [.42, .3, .62], [.68, .12, .4]].forEach(([y, x, w]) => { g.append('line').attr('x1', 0).attr('x2', s).attr('y1', s * (y + .07)).attr('y2', s * (y + .07)).attr('stroke', c).attr('stroke-width', s * .03).attr('stroke-opacity', .4); g.append('rect').attr('x', s * x).attr('y', s * y).attr('width', s * w).attr('height', s * .15).attr('rx', s * .03).attr('fill', c); });
    g.append('line').attr('x1', s * .56).attr('x2', s * .56).attr('y1', 0).attr('y2', s * .95).attr('stroke', c).attr('stroke-width', s * .05); g.append('path').attr('d', `M${s * .46} 0h${s * .2}l${-s * .1} ${s * .12}z`).attr('fill', c); },
  file: (g, s, c) => { g.append('path').attr('d', `M${s * .18} ${s * .04}h${s * .42}l${s * .22} ${s * .22}v${s * .66}h${-s * .64}z`).attr('fill', 'none').attr('stroke', c).attr('stroke-width', s * .06).attr('stroke-linejoin', 'round'); },
  clock: (g, s, c) => { g.append('circle').attr('cx', s / 2).attr('cy', s / 2).attr('r', s * .42).attr('fill', 'none').attr('stroke', c).attr('stroke-width', s * .06); g.append('path').attr('d', `M${s / 2} ${s * .24}v${s * .28}l${s * .18} ${s * .1}`).attr('fill', 'none').attr('stroke', c).attr('stroke-width', s * .06).attr('stroke-linecap', 'round'); },
};
export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 150, y = props.y ?? 250, w = props.w ?? 780, pad = 48, items = props.items ?? [];
  const hasIcons = items.some(i => ICONS[i.icon]), size = fit(items.map(i => i.label), w - pad * 2 - (hasIcons ? (props.size ?? 110) * 1.05 : 0), props.size ?? 110), ix = hasIcons ? size * 1.05 : 0, top = props.title ? 96 : 34, pitch = size * 1.08, h = top + items.length * pitch + (props.foot ? 84 : 30);
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  const ttl = props.title ? label(cd.body, x + pad, y + 56, props.title, {size: 28, color: f.sub}) : null, tr = props.title ? rule(cd.body, x + pad, y + 76, x + w - pad, y + 76, {color: f.fg}) : null;
  const rows = items.map((it, i) => { const by = y + top + size * .86 + i * pitch, ln = line(st, cd.body, it.label, x + pad + ix, by, size, {color: f.fg, accent: f.accent});
    const ic = ICONS[it.icon] ? cd.body.append('g') : null, is = size * .8; if (ic) ICONS[it.icon](ic.append('g').attr('transform', `translate(${x + pad} ${by - is * .88})`), is, f.fg);
    return {it, ln, ic, icx: x + pad + is / 2, icy: by - is * .4, st: rule(cd.body, x + pad - 10, by - size * .25, x + pad + ix + ln.w + 14, by - size * .25, {color: C.crimson, width: Math.max(5, size * .06)})}; });
  const foot = props.foot ? label(cd.body, x + pad, y + h - 36, props.foot, {size: 28, color: f.accent}) : null, last = Math.max(0, ...items.map(i => i.strike ?? 0));
  const life = props.life ?? meta.duration;
  return {seek(t) {
    cd.set({a: span(t, 0, .38), b: leave(t, life, .28)}); tr?.draw(glide(span(t, .08, .4)));
    for (const r of rows) { r.ln.set(span(t, r.it.at ?? 0, .4)); const s = r.it.strike == null ? 0 : glide(span(t, r.it.strike, .28)); r.st.draw(s); r.ln.g.attr('opacity', (r.it.at ?? 0) > t ? 0 : 1 - .45 * s);
      r.ic?.attr('opacity', ease(span(t, r.it.at ?? 0, .25)) * (1 - .5 * s)).attr('transform', `rotate(${(-10 * s).toFixed(1)} ${r.icx} ${r.icy}) translate(0 ${((1 - glide(span(t, r.it.at ?? 0, .35))) * 26).toFixed(1)})`); }
    foot?.attr('opacity', ease(span(t, last + .25, .3)));
  }};
}
