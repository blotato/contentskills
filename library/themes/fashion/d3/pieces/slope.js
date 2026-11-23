import {card, txt, label, stroke, dot, draw, fit, up, mix, fade, glide, span} from '../../kit.js';
import {cues, pace, hold, fmt, spread} from './_local.js';

// Before and after on two vertical hairlines, a thin line joining each pair. One line (the
// biggest change, or `highlight`) takes the accent; the rest stay quiet.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'What changed', unit: 'Illustrative · wears per month', clear: false, field: 'bone', accent: 'poppy', highlight: null, min: null, max: null, decimals: 0, prefix: '', suffix: '', speed: 1, times: null,
  labels: ['Last year', 'This year'], items: [{label: 'Denim', from: 8, to: 21}, {label: 'Tailoring', from: 14, to: 16}, {label: 'Knitwear', from: 19, to: 11}, {label: 'Occasion', from: 3, to: 5}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, items = props.items, n = items.length, k = pace(props), at = cues(props, n, .35, .12);
  const xa = 400, xb = 720, ya = 350, yb = 850, all = items.flatMap(d => [d.from, d.to]), lo = props.min ?? Math.min(...all), hi = props.max ?? Math.max(...all), y = v => mix(yb, ya, hi > lo ? (v - lo) / (hi - lo) : .5);
  const lead = props.highlight ?? items.reduce((best, d, i) => Math.abs(d.to - d.from) > Math.abs(items[best].to - items[best].from) ? i : best, 0);
  const posts = [xa, xb].map((x, i) => ({bar: g.append('rect').attr('x', x - .75).attr('y', ya - 30).attr('width', 1.5).attr('fill', ink.line).attr('opacity', .3), name: label(g, x, ya - 52, props.labels?.[i] ?? '', {size: 15, color: ink.dim, anchor: 'middle'})}));
  const la = spread(items.map(d => y(d.from)), 46, ya, yb), lb = spread(items.map(d => y(d.to)), 46, ya, yb), size = 40;
  const rows = items.map((d, i) => {
    const hot = i === lead, col = hot ? ink.accent : ink.line, a = [xa, y(d.from)], b = [xb, y(d.to)], vw = 78;
    const path = stroke(g, `M${a}L${b}`, col, hot ? 3 : 1.5).attr('opacity', hot ? 1 : .55), left = g.append('g'), right = g.append('g');
    txt(left, xa - 24, la[i] + size * .36, fmt(d.from, props), {size, role: 'num', color: ink.head, anchor: 'end'});
    label(left, xa - 24 - vw, la[i] + 6, d.label, {size: Math.min(16, fit(up(d.label), xa - 24 - vw - 90, 16, {role: 'label'})), color: hot ? ink.head : ink.dim, anchor: 'end'});
    txt(right, xb + 24, lb[i] + size * .36, fmt(d.to, props), {size, role: 'num', color: ink.head});
    const diff = d.to - d.from; label(right, xb + 24 + vw, lb[i] + 6, (diff > 0 ? '+' : diff < 0 ? '−' : '') + fmt(Math.abs(diff), {decimals: props.decimals}), {size: 15, color: hot ? ink.accent : ink.dim});
    return {path, left, right, da: dot(g, a[0], a[1], hot ? 6 : 4, col), db: dot(g, b[0], b[1], hot ? 7 : 4, col)};
  });
  return {seek(t) {
    hold(st, t);
    posts.forEach(({bar, name}, i) => { bar.attr('height', (yb - ya + 60) * glide(span(t, (.15 + i * .08) * k, .9 * k))); name.attr('opacity', fade(t, (.2 + i * .08) * k, .4 * k)); });
    rows.forEach(({path, left, right, da, db}, i) => {
      draw(path, glide(span(t, at[i], .8 * k))); left.attr('opacity', fade(t, at[i], .35 * k)); da.attr('opacity', fade(t, at[i], .25 * k));
      right.attr('opacity', fade(t, at[i] + .3 * k, .4 * k)); db.attr('opacity', fade(t, at[i] + .3 * k, .3 * k));
    });
  }};
}
