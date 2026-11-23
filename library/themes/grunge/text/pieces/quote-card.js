import {C, stage, look, up, flow, capH, measure, glyphs, pose, txt, brush, tapeStrip, cornerLabels, reveal, clipLive, hash, hold, span, jit, easeOut} from '../../kit.js';

// A quote on a sheet of bone paper taped to the wall: black heavy caps typed word by word, a
// huge quote mark in the accent, a marker swipe under the last line, the name scrawled by hand.
export const meta = {duration: 5, live: true};
export const defaults = {
  quote: 'Done beats perfect every single time', by: 'NOTE TO SELF', role: 'PINNED SINCE DAY ONE',
  labels: ['QUOTED', 'WORDS\nTO KEEP', 'NO. 12'], mark: 'Q', accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true, field: 'paper'}), {root, fine, W, H} = st, ink = look(props.accent), m = 80;
  const {size, lines, pitch} = flow(up(props.quote), W - m * 2, H * .4, 160, 54, {role: 'head'}, 1.22), cap = capH(size), block = pitch * (lines.length - 1) + cap, top = (H - block) / 2 + cap + H * .02;
  const qm = txt(root, m - 14, top - cap - 30, '“', {size: Math.min(520, H * .3), role: 'head', color: ink.accent === C.bone ? C.red : ink.accent});
  const lw = measure(lines.at(-1), size), swipe = root.append('path').attr('d', brush(m - 16, top + block - cap + size * .1, lw + 40, size * .26, {seed: 3})).attr('fill', ink.accent === C.bone ? C.red : ink.accent).attr('fill-rule', 'evenodd'), sclip = clipLive(st); swipe.attr('clip-path', sclip.url);
  const words = lines.flatMap((line, i) => glyphs(root, line, m, top + i * pitch, size, {by: 'word', color: C.soot}));
  const by = txt(root, m, top + block - cap + size * .5 + 100, '— ' + props.by, {size: 58, role: 'hand', color: C.soot}), role = txt(fine, m, top + block - cap + size * .5 + 156, up(props.role), {size: 28, color: C.ash});
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]], {color: C.soot, accent: C.red});
  const tapes = [[W * .2, -24], [W * .78, 20]].map(([x, r], i) => tapeStrip(root, 240, 64, {seed: i + 1, color: C.char, opacity: .92}).attr('transform', `translate(${x} 14) rotate(${r / 6})`));
  const at = k => .5 + k * .13, end = at(words.length);
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    qm.attr('opacity', h >= .15 ? 1 : 0).attr('transform', `rotate(${(hash(s, 1) - .5) * 1.2} ${m} ${top - cap})`);
    words.forEach((u, k) => { const d = h - at(k), j = jit(s, k * 1.3, 1.4, .4); pose(u, {x: j.x, y: j.y - (d >= 0 && d < .1 ? size * .06 : 0), sx: d >= 0 && d < .1 ? 1.14 : 1, rot: j.r, o: d < 0 ? 0 : 1}); });
    sclip.set(m - 40, top + block - cap, (lw + 100) * easeOut(span(h, end + .1, .3)), size);
    by.attr('opacity', h >= end + .45 ? 1 : 0); role.attr('opacity', h >= end + .7 ? 1 : 0); reveal(corners, t, .2);
  }};
}
