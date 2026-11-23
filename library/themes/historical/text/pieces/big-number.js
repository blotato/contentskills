import {C, F, stage, up, oneLine, fit, capH, measure, txt, typed, bar, rule, sheet, brush, cornerLabels, cardMove, span, settle} from '../../kit.js';

// A year or figure in huge numerals on a torn charcoal block, counting up to its value, with a
// typewritten kicker, a crimson label bar hung off the block, a tick rule and a serif note.
// `value` may be any short string; plain whole numbers count up.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  value: '1900', kicker: 'MARK THE YEAR', label: 'A CENTURY TURNS', note: 'Sample figure, for illustration:\nput your own year here',
  labels: ['DATE', 'NO. 01', '', 'ON THE RECORD'], field: 'night',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, k} = st, m = 84, value = String(props.value), o = {weight: 700, spacing: 0}, cy = H * .45;
  const size = fit(value, W - m * 2 - 110, H * .3, o), cap = capH(size, o), bw = Math.min(W - m * 2 + 40, measure(value, size, o) + 130), bh = cap + 130;
  const g = root.append('g'), smear = brush(g, W / 2 - bw / 2 - 60, cy + bh / 2 - 60, bw * .7, 90, {seed: 6, color: ink.smear === C.ink ? C.blood : ink.smear}); sheet(g, W / 2 - bw / 2, cy - bh / 2, bw, bh, {fill: C.char, seed: 5, rough: 6, wear: .35});
  const num = txt(g, W / 2, cy + cap / 2, value, {size, weight: 700, anchor: 'middle', spacing: 0}), target = /^\d{1,7}$/.test(value) ? Number(value) : null, from = target == null ? 0 : target - Math.max(1, Math.round(target * .03));
  const kick = props.kicker ? typed(root, W / 2 - bw / 2 + 6, cy - bh / 2 - 40, up(oneLine(props.kicker)), {size: 30 + 8 * k, color: ink.sub, spacing: .1}) : null;
  const label = props.label ? bar(root, props.label, {size: Math.min(46 + 12 * k, fit(up(oneLine(props.label)), W - m * 2 - 120, 60, {weight: 500})), fill: ink.bar}) : null; label?.g.attr('transform', `translate(${W / 2 - bw / 2 + 46} ${cy + bh / 2 + 14})`);
  const ry = cy + bh / 2 + 130 * (.7 + .3 * k), rl = rule(root, m, ry, W - m, {color: ink.dim, every: 44}), pin = root.append('path').attr('d', `M0 -22l12 -20h-24Z`).attr('fill', ink.accent === C.bone ? C.bone : C.red);
  const note = txt(root, W - m, ry + 74 * (.7 + .3 * k), props.note, {size: 30 + 8 * k, font: F.italic, weight: 400, anchor: 'end', color: ink.sub, spacing: .01}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    const e = settle(span(t, .3, 1.6)); g.attr('transform', `rotate(${-1.6 + .3 * t / meta.duration} ${W / 2} ${cy})`).attr('opacity', settle(span(t, 0, .6)));
    if (target != null) num.select('tspan').text(String(Math.round(from + (target - from) * e)).padStart(value.length, '0')); num.attr('opacity', span(t, .25, .5));
    smear.reveal(settle(span(t, .1, .8))); kick?.set(span(t, .2, .7)); label?.reveal(span(t, 1.5, .7));
    rl.attr('opacity', span(t, 1, .6)); pin.attr('transform', `translate(${m + (W - m * 2) * (.12 + .6 * e)} ${ry})`).attr('opacity', span(t, 1, .4)); note.attr('opacity', span(t, 2.1, .6)); corners(t, .8);
  }};
}
