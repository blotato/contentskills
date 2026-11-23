import {textStage, up, fit, capH, glyphs, slam, txt, readouts, mark, halo, streak, appear, span, spring, easeOut, vel} from '../kit.js';

// A headline that slams onto the field letter by letter: each letter drops in oversized with its
// colours split, overshoots and snaps together; targeting rings smear in behind, marks spin, and
// readouts run along the top and bottom. `lines` are the headline (1-3 short lines); `accent`
// picks the colour that leads.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  lines: ['MAKE IT', 'LOUD'], kicker: 'ONE IDEA.\nFULL VOLUME.', note: 'SAY THE THING YOU MEAN\nAND SAY IT BIG',
  labels: ['VOL. 01', 'KINETIC\nTYPE', 'A SHORT\nSERIES', 'NO. 26'], foot: ['PLAY IT LOUD', 'END OF SIDE A'], accent: 'cyan',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 64, lines = props.lines.map(up);
  const size = Math.min(fit(lines, W - m * 2, H * .3), H * .5 / (lines.length * 1.2 * capH(1))), cap = capH(size), pitch = cap * 1.2, top = H * .5 - (lines.length * pitch - (pitch - cap)) / 2;
  const rings = [0, 1].map(() => halo(root, stage, {color: ink.alt})), dash = streak(root, stage, ink.third);
  const head = readouts(root, props.labels, 112), foot = readouts(root, props.foot, H - 70, {color: ink.accent, size: 22}), kickerRows = up(props.kicker).split('\n').length;
  const kicker = txt(root, m, top - 48 - (kickerRows - 1) * 46, up(props.kicker), {size: 38}), note = txt(root, W - m, top + lines.length * pitch + 36, up(props.note), {size: 38, anchor: 'end'});
  const rows = lines.map((line, i) => glyphs(root, line, W / 2, top + cap + i * pitch, size, {anchor: 'middle', color: ink.head, echo: true}));
  const marks = [mark(root, W - m - 40, top - 76, 34, ink.third), mark(root, m + 40, top + lines.length * pitch + 64, 26, ink.third)];
  return {
    seek(t) {
      let n = 0;
      rows.forEach((row, i) => row.forEach(u => { const start = .12 + i * .22 + u.i * .045, q = span(t, start, .55); slam(u, q, 0, {from: 2.2, drop: 60, live: q >= 1 ? Math.sin(t * 2.2 - (n++) * .5) * .018 : 0}); }));
      rings.forEach((b, i) => {
        const q = span(t, .05 + i * .25, .9), e = easeOut(q), dir = i ? -1 : 1, r = (i ? 250 : 190) * (k * .4 + .6);
        const x = W / 2 + dir * (W * .9 - e * W * .62) + Math.sin(t * .5 + i * 2) * 26, y = (i ? top + lines.length * pitch + 30 * k : top - 60 * k) + Math.cos(t * .4 + i) * 22;
        b.set(x, y, r, -dir * (60 + vel(q) * 260 + 30 * Math.sin(t * .5 + i * 2 + 1.2)), 0, q > 0 ? .9 : 0, t * (i ? -24 : 30));
      });
      const d = (t * .22 + .2) % 1; dash.set(-80 + d * (W + 400), H - 150 * k - 40, 22, 200, 0, span(t, .8, .2));
      [...head, ...foot].forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06)));
      kicker.attr('opacity', appear(t, .9)).attr('transform', `translate(${-40 * (1 - easeOut(span(t, .9, .4)))} 0)`);
      note.attr('opacity', appear(t, 1.1)).attr('transform', `translate(${40 * (1 - easeOut(span(t, 1.1, .4)))} 0)`);
      marks.forEach((s, i) => s.attr('transform', `rotate(${t * (i ? -50 : 70)}) scale(${spring(span(t, 1 + i * .2, .5))})`));
    },
  };
}
