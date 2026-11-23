import {C, F, stage, up, oneLine, fit, capH, measure, txt, typed, glyphs, arrive, bar, brush, cornerLabels, cardMove, span, settle} from '../../kit.js';

// A contents page: the title sets over a brush stroke, then each item is entered on a line of its
// own, `step` seconds apart, with its number on a charcoal box strung on a thin line; the newest
// entry's number turns crimson.
export const meta = {duration: 6, live: true};
export const defaults = {
  title: 'THE STORY', kicker: 'IN FOUR PARTS', items: ['THE WORLD BEFORE', 'THE TURNING POINT', 'THE LONG AFTERMATH', 'WHAT REMAINS'],
  labels: ['CONTENTS', 'TODAY', '', 'IN THIS ORDER'], step: .8, field: 'night',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, k} = st, m = 84, n = props.items.length, title = up(oneLine(props.title)), o = {weight: 700};
  const tsize = fit(title, W - m * 2, 170 * (.65 + .35 * k), o), tcap = capH(tsize, o), head0 = tcap + 90 + 40 * k, rowMax = 150 + 80 * k, top0 = H * .12 + 70 * k + 30, top = Math.max(top0, (H - head0 - n * rowMax) / 2 - 20);
  const stroke = brush(root, m - 30, top + tcap * .5, Math.min(W - m, measure(title, tsize, o) + 70), tcap * .62, {seed: 2, color: ink.accent === C.bone ? C.char : C.crimson}), head = glyphs(root, title, m, top + tcap, tsize, {color: ink.light ? ink.text : C.bone});
  const kick = props.kicker ? typed(root, m, top - 34, up(oneLine(props.kicker)), {size: 28 + 8 * k, color: ink.sub, spacing: .1}) : null;
  const y0 = top + head0, rowH = Math.min(rowMax, (H - y0 - m - 50) / n), ns = Math.min(64, rowH * .36), line = root.append('path').attr('stroke', ink.dim).attr('stroke-width', 3).attr('opacity', .6);
  const rows = props.items.map((item, i) => {
    const g = root.append('g').attr('transform', `translate(${m} ${y0 + i * rowH + rowH / 2})`), num = String(i + 1).padStart(2, '0'), a = bar(g, num, {size: ns, fill: 'char', weight: 700, seed: i}), hot = g.append('g'), b = bar(hot, num, {size: ns, fill: ink.bar, weight: 700, seed: i});
    const x = a.w + 30, str = up(oneLine(item)), size = fit(str, W - m * 2 - x, Math.min(62, rowH * .38)), tg = g.append('g'), label = txt(tg, x, capH(size) / 2, str, {size, color: ink.text});
    const dots = g.append('path').attr('d', `M${x} ${rowH * .34}H${W - m * 2}`).attr('stroke', ink.dim).attr('stroke-width', 2).attr('stroke-dasharray', '2 9').attr('opacity', .5);
    return {a, b, hot, tg, dots, cx: a.w / 2};
  }), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    stroke.reveal(settle(span(t, .25, .7))); head.forEach(u => arrive(u, span(t, .15 + u.i * .04, .7))); kick?.set(span(t, .3, .7));
    let reach = 0;
    rows.forEach(({a, b, hot, tg, dots}, i) => { const at = 1 + i * props.step, q = span(t, at, .7), cur = t >= at && (i === n - 1 || t < at + props.step);
      a.reveal(q); b.reveal(q); hot.attr('opacity', cur ? 1 : 0); tg.attr('opacity', span(t, at + .15, .5)).attr('transform', `translate(${-18 * (1 - settle(span(t, at + .1, .7)))} 0)`); dots.attr('opacity', .5 * span(t, at + .3, .5)); reach = Math.max(reach, i * settle(span(t, at - props.step * .6, props.step * .8))); });
    line.attr('d', `M${m + rows[0].cx} ${y0 + rowH / 2}v${reach * rowH}`); corners(t, .8);
  }};
}
