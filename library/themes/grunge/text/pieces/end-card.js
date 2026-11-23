import {C, stage, look, up, fit, capH, measure, glyphs, typeOn, cursor, txt, sheet, chip, tapeStrip, strip, scribble, scrawl, cornerLabels, reveal, hold, span, slam, jit, jtf, pop} from '../../kit.js';

// The sign-off: the call to action typed on in two colours, the handle written in marker on a
// length of tape with an arrow scrawled at it, and a torn strip scrolling along the bottom.
export const meta = {duration: 5, live: true};
export const defaults = {
  lines: ['FOLLOW', 'FOR MORE'], action: 'NEW VIDEO EVERY WEEK', handle: '@YOURNAME', strip: 'SEE YOU NEXT TIME',
  labels: ['THE END', 'OR IS IT', 'FIN.'], accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, ink = look(props.accent), m = 70, lines = props.lines.map(up);
  const size = Math.min(fit(lines, W - m * 2, 300), H * .12 / capH(1)), cap = capH(size), pitch = cap * 1.16, block = pitch * (lines.length - 1) + cap, top = H * .4 - block / 2 + cap;
  const rows = lines.map((line, i) => glyphs(root, line, W / 2, top + i * pitch, size, {anchor: 'middle', color: i ? ink.accent : ink.text})), cur = cursor(root, ink.text);
  const act = root.append('g'); chip(act.append('g'), up(props.action), {size: Math.min(44, fit(up(props.action), W - m * 2 - 100, 44)), fill: C.bone, seedv: 4});
  const hs = Math.min(84, fit(props.handle, W * .56, 84, {role: 'hand'})), hw = measure(props.handle, hs, {role: 'hand'}), hy = top + block - cap + (st.sq ? 225 : 300);
  const tape = root.append('g'), ti = tape.append('g'); tapeStrip(ti, hw + 130, hs * 1.5, {seed: 3, opacity: .95}); txt(ti, 0, capH(hs, {role: 'hand'}) / 2, props.handle, {size: hs, role: 'hand', color: C.soot, anchor: 'middle'});
  const arrow = scrawl(root, sd => scribble.arrow(W * .13, hy - 150, W / 2 - hw / 2 - 90, hy - 6, sd, .3), {color: ink.mark, width: 9, seed: 6});
  const band = root.append('g'), bh = 110; sheet(band, {fill: ink.accent, seed: 8, sides: 'tb', amp: 9, rim: null}).set(-60, -bh / 2, W + 120, bh);
  const bsize = bh * .44 / capH(1), run = strip(band, st, props.strip, capH(bsize) / 2, bsize, {color: ink.on});
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', ''], {accent: ink.accent});
  return {seek(t) {
    const s = st.tick(t), h = hold(t); let at = .3;
    rows.forEach((row, i) => { const len = .12 + row.length * .055, q = span(h, at, len); typeOn(row, q, s, {seed: i * 20}); if (q > 0 && (q < 1 || i === rows.length - 1)) cur.set(row, q, t); at += len + .1; });
    const k = slam(t, at + .1); act.attr('transform', jtf(W / 2, top + block - cap + 110, s, 3, {tilt: -3, scale: k.s, amp: 2 + k.hit * 6})).attr('opacity', k.o);
    tape.attr('transform', jtf(W / 2 + 30, hy, s, 5, {tilt: 3, scale: pop(t, at + .5)})); arrow.draw(span(h, at + .85, .35), s);
    const j = jit(s, 9, 2, .2); band.attr('transform', `translate(${j.x} ${H - m - (st.sq ? 30 : 150) + j.y}) rotate(${-1.5 + j.r} ${W / 2} 0)`).attr('opacity', h >= at + .3 ? 1 : 0); run.set(h * 170);
    reveal(corners, t, .2);
  }};
}
