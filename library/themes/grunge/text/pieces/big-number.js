import {C, stage, look, up, fit, capH, measure, glyphs, pose, txt, chip, scribble, scrawl, halftone, cornerLabels, reveal, hash, hold, span, slam, jit, jtf} from '../../kit.js';

// One huge number: each digit is stamped down in turn (oversized, then a hit and a shake), a
// marker ring is thrown round it, and the label is slapped underneath on a paper scrap.
export const meta = {duration: 4, live: true};
export const defaults = {
  value: '2026', kicker: 'MARK THE YEAR', label: 'EVERYTHING CLICKS', note: 'SMALL STEPS, STACKED DAILY,\nLOOK LIKE LUCK FROM OUTSIDE',
  labels: ['DATA\nPOINT', 'NO. 01', 'COUNT\nIT UP'], accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, ink = look(props.accent), m = 70, value = String(props.value), o = {role: 'cond'};
  const size = Math.min(fit(value, W - m * 2 - 60, 700, o), H * .3 / capH(1, o)), cap = capH(size, o), cy = H * .47, base = cy + cap / 2, w = measure(value, size, o);
  root.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', Math.min(W * .46, cap * .9)).attr('fill', halftone(st, {color: C.ash, cell: 18, dot: .3})).attr('opacity', .8);
  const digits = glyphs(root, value, W / 2, base, size, {anchor: 'middle', ...o, color: ink.accent});
  const ring = scrawl(root, sd => scribble.circle(W / 2, cy, w / 2 + 60, cap / 2 + 60, sd), {color: ink.text, width: 8, seed: 5});
  const kicker = txt(fine, W / 2, cy - cap / 2 - 110, up(props.kicker), {size: 36, anchor: 'middle'});
  const tag = root.append('g'); chip(tag.append('g'), up(props.label), {size: Math.min(64, fit(up(props.label), W - m * 2 - 120, 64)), fill: C.bone, seedv: 6});
  const note = txt(fine, W / 2, cy + cap / 2 + 250, up(props.note), {size: 28, anchor: 'middle', color: C.paper});
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]], {accent: ink.accent});
  const end = .3 + digits.length * .14;
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    digits.forEach((u, i) => { const k = slam(t, .3 + i * .14), j = jit(s, i * 2.1, 1.5 + k.hit * 7, .4 + k.hit * 2); pose(u, {x: j.x, y: j.y, sx: k.s, rot: j.r + (hash(i, 2) - .5) * 3, o: k.o}); });
    ring.draw(span(h, end + .15, .4), s); kicker.attr('opacity', h >= .15 ? 1 : 0);
    const k = slam(t, end + .5); tag.attr('transform', jtf(W / 2, cy + cap / 2 + 120, s, 9, {tilt: -4, scale: k.s, amp: 2 + k.hit * 5})).attr('opacity', k.o);
    note.attr('opacity', !st.sq && h >= end + .9 ? 1 : 0); reveal(corners, t, .2);
  }};
}
