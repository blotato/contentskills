import {C, F, stage, up, oneLine, fit, capH, measure, txt, typed, glyphs, arrive, bar, brush, print, cornerLabels, cardMove, span, settle, hash} from '../../kit.js';

// The opening title: an archival print lies tilted on the table, the headline sets itself in tall
// condensed capitals across its lower edge, the last line over a dry crimson brush stroke. A
// typewritten kicker, a serif note and corner references. `lines` is one to three short lines.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  lines: ['THE LONG', 'ROAD HOME'], kicker: 'A short history', note: 'What the records keep,\nand what they leave out',
  labels: ['VOL. 01', 'FROM THE ARCHIVE', '', 'NO. 26'], foot: ['PART ONE'], field: 'night', scene: 'city', image: null,
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, k, sq} = st, m = 84, lines = props.lines.map(up), n = lines.length;
  const size = fit(lines, W - m * 2, H * (sq ? .13 : .105) * (n > 2 ? .8 : 1), {weight: 700}), cap = capH(size, {weight: 700}), pitch = cap * 1.28;
  const ph = H * (sq ? .36 : .4), pw = W * .84, py = H * (sq ? .355 : .37), top = py + ph / 2 - cap * .35;
  const pg = root.append('g'), pr = print(pg, pw, ph, {scene: props.scene, image: props.image, seed: 4, tapes: 1});
  const dim = root.append('rect').attr('width', W).attr('height', H).attr('fill', ink.bg[1]);
  const last = top + (n - 1) * pitch, lw = measure(lines[n - 1], size, {weight: 700}), stroke = brush(root, m - 34, last - cap * .12, lw + 80, cap * 1.3, {seed: 3, color: ink.accent === C.bone ? C.char : C.crimson});
  const rows = lines.map((line, i) => glyphs(root, line, m, top + i * pitch + cap, size, {color: i === n - 1 ? C.bone : ink.text}));
  const kick = props.kicker ? typed(root, m, py - ph / 2 - 62 * (.7 + .3 * k), oneLine(props.kicker), {size: 30 + 8 * k, color: ink.sub}) : null;
  const noteY = last + cap + 86 * (.6 + .4 * k), note = txt(root, W - m, noteY, props.note, {size: 30 + 8 * k, font: F.italic, weight: 400, anchor: 'end', color: ink.sub, spacing: .01});
  const foot = props.foot?.[0] ? bar(root, props.foot[0], {size: 30 + 6 * k, fill: ink.box}) : null, corners = cornerLabels(st, props.labels);
  if (foot) foot.g.attr('transform', `translate(${m} ${noteY + 6})`);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    const q = t / meta.duration; pr.pan(q); pg.attr('transform', `translate(${W / 2 + 14 * q} ${py - 10 * q}) rotate(${-2.4 + .5 * q}) scale(${1 + .03 * q})`);
    dim.attr('opacity', .9 * (1 - settle(span(t, 0, 1.1))) + .18 * span(t, .5, .8));
    stroke.reveal(settle(span(t, .55 + (n - 1) * .3, .6)));
    rows.forEach((row, r) => row.forEach(u => arrive(u, span(t, .35 + r * .3 + u.i * .035, .7))));
    kick?.set(span(t, .2, .8)); note.attr('opacity', span(t, 1.2 + n * .25, .6)); foot?.reveal(span(t, 1.5 + n * .25, .7)); corners(t, .8);
  }};
}
