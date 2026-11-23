import {C, stage, look, up, fit, capH, glyphs, pose, txt, sheet, tapeStrip, xerox, chip, cornerLabels, reveal, span, hold, jit, jtf, pop, easeOut} from '../../kit.js';

// Two extra-wide words shoved in from opposite sides in held steps, overlapping a taped-down
// photocopy that is slapped between them; a caption scrap and a typed note hang off the picture.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  top: 'THINK', bottom: 'BIGGER', caption: 'START BEFORE\nYOU FEEL READY', note: 'THE FIRST DRAFT\nCAN BE BAD',
  labels: ['PART\nTWO', 'MINDSET', 'NOTES\nTO SELF', 'PG. 04'], marks: ['A', 'R'], image: null, accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, ink = look(props.accent), m = 60, a = up(props.top), b = up(props.bottom), o = {role: 'wide'};
  const size = Math.min(fit([a, b], W - m * 2, 300, o), H * .12 / capH(1, o)), cap = capH(size, o), pw = W * .66, ph = Math.min(H * .34, pw * .9), cy = H / 2;
  const pic = root.append('g'), card = pic.append('g');
  sheet(card, {fill: C.char, seed: 9, sides: 'tb', amp: 6}).set(-pw / 2 - 18, -ph / 2 - 18, pw + 36, ph + 36);
  xerox(card, st, pw, ph, {seed: 4, image: props.image});
  tapeStrip(card, 170, 50, {seed: 2}).attr('transform', `translate(${-pw / 2 + 30} ${-ph / 2 - 14}) rotate(-28)`); tapeStrip(card, 170, 50, {seed: 5}).attr('transform', `translate(${pw / 2 - 30} ${ph / 2 + 12}) rotate(-20)`);
  const ua = glyphs(root, a, m, cy - ph / 2 + cap * .3, size, {by: 'all', ...o, color: ink.text})[0], ub = glyphs(root, b, W - m, cy + ph / 2 + cap * .72, size, {by: 'all', anchor: 'end', ...o, color: ink.accent})[0];
  const cap1 = fine.append('g'); chip(cap1.append('g'), up(props.caption).split('\n')[0], {size: 30, role: 'type', fill: C.bone, seedv: 3}); 
  const cap2 = fine.append('g'); if (up(props.caption).split('\n')[1]) chip(cap2.append('g'), up(props.caption).split('\n')[1], {size: 30, role: 'type', fill: C.soot, color: C.bone, seedv: 8});
  const note = txt(fine, W - m, cy + ph / 2 + cap * .72 + 70, up(props.note), {size: 28, anchor: 'end', color: C.paper});
  const corners = cornerLabels(fine, st, props.labels, {accent: ink.accent});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), qa = easeOut(span(h, .15, .35)), qb = easeOut(span(h, .4, .35)), ja = jit(s, 1, 2, .3), jb = jit(s, 2, 2, .3);
    pose(ua, {x: -(1 - qa) * W + ja.x, y: ja.y, rot: ja.r, o: qa > 0 ? 1 : 0}); pose(ub, {x: (1 - qb) * W + jb.x, y: jb.y, rot: jb.r, o: qb > 0 ? 1 : 0});
    pic.attr('transform', jtf(W / 2, cy, s, 3, {tilt: -3, scale: pop(t, .75), amp: 2, rot: .4}));
    cap1.attr('transform', jtf(W - m - 170, cy - 30, s, 4, {tilt: -5, scale: pop(t, 1.15)})); cap2.attr('transform', jtf(W - m - 130, cy + 28, s, 5, {tilt: -2, scale: pop(t, 1.3)}));
    note.attr('opacity', h >= 1.55 ? 1 : 0); reveal(corners, t, .3);
  }};
}
