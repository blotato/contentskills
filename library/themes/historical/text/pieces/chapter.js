import {C, F, stage, up, oneLine, fit, capH, measure, txt, typed, glyphs, arrive, bar, rule, stamp, brush, cornerLabels, cardMove, span, settle, easeOut} from '../../kit.js';

// An era card: the chapter number in very large numerals with the word "Chapter" written across
// its shoulder in copperplate, a tick rule, the title on a bar, a serif note and a pressed stamp.
export const meta = {duration: 4.5, live: true};
export const defaults = {number: '02', kicker: 'Chapter', title: 'THE TURNING POINT', note: 'Where one age ends\nand another begins', labels: ['SECTION', 'KEEP WATCHING', '', 'PT. 02'], mark: 'II', field: 'night'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, k} = st, m = 84, number = String(props.number), title = up(oneLine(props.title)), o = {weight: 700, spacing: 0};
  const nsize = fit(number, W * .58, H * .36, o), ncap = capH(nsize, o), tsize = fit(title, W - m * 2 - 120, H * .062, {weight: 700}), total = ncap + 300 * (.6 + .4 * k), base = (H - total) / 2 + ncap + 30;
  const smear = brush(root, m - 40, base - ncap * .34, measure(number, nsize, o) + 110, ncap * .3, {seed: 9, color: ink.smear === C.ink ? C.char : C.blood, opacity: .9});
  const num = glyphs(root, number, m, base, nsize, {color: ink.text, spacing: 0}), ksize = 110 * (.7 + .3 * k);
  const kick = props.kicker ? typed(root, m + 14, base - ncap - 26, oneLine(props.kicker), {size: ksize, font: F.script, weight: 400, color: ink.sub, spacing: 0}) : null;
  const ry = base + 54, rl = rule(root, m, ry, W - m, {color: ink.dim, every: 40}), tb = bar(root, title, {size: tsize, fill: ink.bar, weight: 700}); tb.g.attr('transform', `translate(${m + 30} ${ry + 44 + tb.h / 2})`);
  const note = txt(root, m + 34, ry + 44 + tb.h + 62 * (.7 + .3 * k), props.note, {size: 30 + 8 * k, font: F.italic, weight: 400, color: ink.sub, spacing: .01});
  const r = Math.min(120, W * .1 + 20 * k), sg = root.append('g').attr('transform', `translate(${W - m - r - 6} ${base - ncap * .5}) rotate(12)`), stp = props.mark ? stamp(sg.append('g'), r, {ring: `${oneLine(props.kicker || 'Chapter')} ${number}`, word: props.mark, color: ink.accent === C.bone ? C.bone : C.red, seed: 6}) : null;
  const corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    smear.reveal(settle(span(t, .1, .8))); num.forEach(u => arrive(u, span(t, .2 + u.i * .14, .9), 0, {from: 1.25, rise: 40})); kick?.set(span(t, .7, .8));
    rl.attr('opacity', span(t, 1, .6)); tb.reveal(span(t, 1.3, .7)); note.attr('opacity', span(t, 1.9, .6));
    if (stp) { const q = span(t, 2.3, .3); stp.attr('opacity', .88 * Math.min(1, q * 3)).attr('transform', `scale(${1.5 - .5 * easeOut(q)})`); } corners(t, .8);
  }};
}
