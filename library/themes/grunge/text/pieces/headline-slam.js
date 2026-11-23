import {C, stage, look, up, fit, capH, measure, glyphs, typeOn, cursor, txt, brush, scribble, scrawl, rip, chip, span, hold, jtf, pop, clipLive, easeOut} from '../../kit.js';

// A headline typed onto the wall line by line: first line bone, the rest in the accent, a marker
// stroke under the kicker, a pen-test zigzag below, typewriter labels in the corners. Opens on a rip.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  lines: ['MAKE IT', 'LOUD'], kicker: 'ONE IDEA. FULL VOLUME.', note: 'SAY THE THING YOU MEAN\nAND SAY IT BIG',
  labels: ['VOL. 01', 'KINETIC\nTYPE', 'A SHORT\nSERIES', 'NO. 26'], foot: ['PLAY IT LOUD', 'END OF SIDE A'], accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, ink = look(props.accent), m = 70, lines = props.lines.map(up);
  const size = Math.min(fit(lines, W - m * 2, 330), H * .2 / capH(1)), cap = capH(size), pitch = cap * 1.16, block = pitch * (lines.length - 1) + cap, top = (H - block) / 2 + cap - H * .01;
  const stroke = root.append('path').attr('fill', ink.mark).attr('fill-rule', 'evenodd'), sclip = clipLive(st); stroke.attr('clip-path', sclip.url);
  const ksize = fit(up(props.kicker), W - m * 2 - 80, 40, {role: 'small'}), kw = measure(up(props.kicker), ksize, {role: 'small'}), ky = top - cap - 70;
  stroke.attr('d', brush(W / 2 - kw / 2 - 24, ky - ksize * .9, kw + 48, ksize * 1.5, {seed: 4}));
  const kicker = txt(fine, W / 2, ky + ksize * .2, up(props.kicker), {size: ksize, role: 'small', anchor: 'middle', color: C.soot, weight: 800});
  const rows = lines.map((line, i) => glyphs(root, line, W / 2, top + i * pitch, size, {anchor: 'middle', color: i ? ink.accent : ink.text}));
  const cur = cursor(root, ink.text), last = rows.at(-1), lw = last.length ? last[0].total : 300;
  const zig = scrawl(root, s => scribble.zigzag(W / 2 - lw * .3, W / 2 + lw * .22, top + block - cap + 78, s, 30, 4), {color: ink.text, width: 8, seed: 3});
  const note = txt(fine, W / 2, top + block - cap + 190, up(props.note), {size: 30, anchor: 'middle', color: C.paper});
  const corners = [[m, m + 30, 'start'], [W - m, m + 30, 'end'], [m, H - m - 44, 'start'], [W - m, H - m - 44, 'end']].map(([x, y, a], i) => txt(fine, x, y, up(props.labels?.[i] ?? ''), {size: 26, anchor: a, color: i === 1 ? ink.accent : ink.text}));
  const tag = fine.append('g'), tagChip = props.foot?.[0] && !st.sq ? chip(tag.append('g'), up(props.foot[0]), {size: 30, role: 'type', fill: C.bone, sides: 'rl', seedv: 6, tape: true}) : null;
  const foot2 = txt(fine, W / 2, H - m - 4, up(props.foot?.[1] ?? ''), {size: 24, anchor: 'middle', color: ink.dim});
  const tear = root.append('path').attr('fill', C.white);
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    tear.attr('d', t < .34 ? rip(-20, H * .3 + (s % 2) * 30, W + 20, H * .42, {seed: 2 + s, thick: 26, amp: 26}) : '');
    let at = .35;
    rows.forEach((row, i) => { const len = .12 + row.length * .055, q = span(h, at, len); typeOn(row, q, s, {seed: i * 20}); if (q > 0 && (q < 1 || i === rows.length - 1)) cur.set(row, q * (q >= 1 ? 2 : 1) >= 1 && t - at - len > 1.2 ? 2 : q, t); at += len + .12; });
    sclip.set(W / 2 - kw / 2 - 60, ky - 80, (kw + 120) * easeOut(span(h, at, .25)), 160); kicker.attr('opacity', h >= at + .08 ? 1 : 0);
    zig.draw(span(h, at + .25, .35), s);
    note.attr('opacity', h >= at + .55 ? 1 : 0);
    corners.forEach((c, i) => c.attr('opacity', h >= .2 + i * .17 ? 1 : 0));
    tag.attr('transform', jtf(W / 2, H - m - 96, s, 5, {tilt: -3, scale: pop(t, at + .7)})); foot2.attr('opacity', h >= at + .9 ? 1 : 0);
  }};
}
