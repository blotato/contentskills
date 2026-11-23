import {C, stage, look, up, fit, capH, glyphs, pose, typeOn, cursor, txt, sheet, chip, halftone, scribble, scrawl, cornerLabels, reveal, hold, span, slam, jit, jtf, pop} from '../../kit.js';

// A chapter break printed in one flat colour: the wall floods with the accent, a huge number is
// stamped down in black, and the title is typed onto a black strip torn across the frame.
export const meta = {duration: 4, live: true};
export const defaults = {number: '02', kicker: 'CHAPTER', title: 'THE BUILD', note: 'WHERE THE IDEA\nBECOMES A THING', labels: ['SECTION', 'KEEP\nWATCHING', 'PT. 02'], mark: 'N', accent: 'red'};

export function mount(el, props = defaults) {
  const flood = (props.accent ?? 'red') === 'red', st = stage(el, {tall: true, field: flood ? 'red' : 'soot'}), {root, fine, W, H} = st, ink = look(props.accent), m = 72, number = String(props.number), title = up(props.title), o = {role: 'cond'};
  const dark = flood ? C.soot : ink.accent, nsize = Math.min(fit(number, W * .7, 900, o), H * .36 / capH(1, o)), ncap = capH(nsize, o), ny = H * .4 + ncap / 2;
  root.append('rect').attr('x', 0).attr('y', H * .56).attr('width', W).attr('height', H * .44).attr('fill', halftone(st, {color: flood ? C.soot : C.ash, cell: 20, dot: .26})).attr('opacity', .35);
  const num = glyphs(root, number, W / 2, ny, nsize, {anchor: 'middle', ...o, color: dark});
  const ring = scrawl(root, sd => scribble.underline(W / 2 - 200, W / 2 + 200, ny + 50, sd, 10), {color: flood ? C.bone : C.bone, width: 10, seed: 2});
  const kick = fine.append('g'); chip(kick.append('g'), up(props.kicker), {size: 40, role: 'type', fill: flood ? C.soot : C.bone, color: flood ? C.bone : C.soot, seedv: 3, tape: true});
  const band = root.append('g'), tsize = Math.min(fit(title, W - m * 2 - 40, 190), H * .085 / capH(1)), tcap = capH(tsize), by = ny + 150 + tcap;
  sheet(band, {fill: flood ? C.soot : C.bone, seed: 5, sides: 'tb', amp: 12, rim: flood ? null : C.white}).set(-60, -tcap * .95, W + 120, tcap * 1.9);
  const letters = glyphs(band, title, W / 2, tcap / 2, tsize, {anchor: 'middle', color: flood ? C.bone : C.soot}), cur = cursor(band, flood ? C.bone : C.soot);
  const note = txt(fine, W / 2, by + tcap * 1.2 + 80, up(props.note), {size: 32, anchor: 'middle', color: C.bone});
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]], {color: C.bone, accent: flood ? C.soot : ink.accent});
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    num.forEach((u, i) => { const k = slam(t, .25 + i * .16), j = jit(s, i * 2, 1.5 + k.hit * 8, .3 + k.hit * 2); pose(u, {x: j.x, y: j.y, sx: k.s, rot: j.r, o: k.o}); });
    kick.attr('transform', jtf(W / 2, ny - ncap - 60, s, 4, {tilt: -4, scale: pop(t, .1)}));
    ring.draw(span(h, .8, .3), s);
    const j = jit(s, 8, 2, .3), open = h >= .95; band.attr('transform', `translate(${j.x} ${by - tcap / 2 + j.y}) rotate(${-2 + j.r} ${W / 2} 0)`).attr('opacity', open ? 1 : 0);
    const q = span(h, 1.1, .15 + letters.length * .06); typeOn(letters, q, s, {seed: 5}); cur.set(letters, q, t);
    note.attr('opacity', !st.sq && h >= 1.5 + letters.length * .06 ? 1 : 0); reveal(corners, t, .2);
  }};
}
