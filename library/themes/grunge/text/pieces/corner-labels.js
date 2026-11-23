import {C, stage, look, up, txt, chip, scribble, scrawl, hold, span, jtf, pop, presence} from '../../kit.js';

// Four typed labels in the corners of the footage, each with a registration cross scratched in
// marker, and a small scrap with a letter mark top centre. Keeps the middle of the frame clear.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  topLeft: 'EP. 12\nBEHIND THE BUILD', topRight: 'UNSCRIPTED\nONE TAKE', bottomLeft: 'KEEP\nWATCHING', bottomRight: 'PT. 01\nOF 03',
  mark: 'R', accent: 'red', inset: 48,
};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine, W, H} = st, ink = look(props.accent), p = props.inset, size = 30;
  const spots = [[p, p, 'start', props.topLeft], [W - p, p, 'end', props.topRight], [p, H - p, 'start', props.bottomLeft], [W - p, H - p, 'end', props.bottomRight]];
  const marks = spots.map(([x, y], i) => scrawl(root, sd => scribble.cross(x + (i % 2 ? -16 : 16), y + (i < 2 ? 16 : -16), 18, sd), {color: i === 1 ? ink.accent : C.bone, width: 6, seed: i + 1}));
  const labels = spots.map(([x, y, anchor, label], i) => { const lines = up(label).split('\n').length; return txt(fine, x + (anchor === 'start' ? 50 : -50), i < 2 ? y + 36 : y - 8 - (lines - 1) * size * 1.25, up(label), {size, anchor, shade: true, color: C.bone}); });
  const badge = fine.append('g'); if (props.mark) chip(badge.append('g'), up(props.mark), {size: 44, fill: ink.accent, seedv: 3});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), o = presence(t, props.life);
    marks.forEach((m, i) => m.draw(span(h, .05 + i * .1, .2), s).g.attr('opacity', o)); labels.forEach((l, i) => l.attr('opacity', h >= .2 + i * .12 ? o : 0));
    badge.attr('transform', jtf(W / 2, p + 34, s, 5, {tilt: -5, scale: pop(t, .5)})).attr('opacity', o);
  }};
}
