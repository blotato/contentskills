import {theme, textStage, up, fit, capH, measure, glyphs, pose, txt, readouts, plate, strip, halo, mark, clipBox, appear, span, spring, easeOut, easeBack, vel} from '../kit.js';

// The closing card and call to action. Headline lines rise out of the floor letter by letter, a
// filled button plate stretches open with an arrow that keeps nudging, the handle types on
// underneath and a marquee band runs along the bottom.
export const meta = {duration: 5, live: true};
export const defaults = {
  lines: ['FOLLOW', 'FOR MORE'], action: 'NEW VIDEO EVERY WEEK', handle: '@YOURNAME', strip: 'SEE YOU NEXT TIME',
  labels: ['THE END', 'OR IS IT', 'FIN.'], accent: 'amber',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 64, lines = props.lines.map(up);
  const ring = halo(root, stage, {color: ink.alt, ghosts: 5});
  const bandH = 120 * (.7 + .3 * k), bandY = H - bandH - 90 * k - 30, bh = 124, gapY = 70 * (.5 + .5 * k), size = Math.min(fit(lines, W - m * 2, H * .22), (bandY - 230 - gapY - bh - 96) / (lines.length * 1.2 * capH(1))), cap = capH(size), pitch = cap * 1.2, block = lines.length * pitch - (pitch - cap);
  const total = block + gapY + bh + 96, top = 160 + (bandY - 160 - total) / 2;
  const rows = lines.map((line, i) => glyphs(root.append('g').attr('clip-path', clipBox(stage, 0, top + i * pitch - 12, W, cap + 24)), line, W / 2, top + cap + i * pitch, size, {anchor: 'middle', color: ink.text}));
  const o = {role: 'text'}, asize = fit(up(props.action), W - m * 2 - 190, 54, o), aw = measure(up(props.action), asize, o), bw = aw + 190, by = top + block + gapY;
  const button = root.append('g').attr('transform', `translate(${W / 2} ${by + bh / 2})`).append('g'); plate(button, {fill: ink.accent, cut: 30}).set(-bw / 2, -bh / 2, bw, bh);
  txt(button, -bw / 2 + 50, capH(asize, o) / 2, up(props.action), {size: asize, color: ink.on});
  const arrow = button.append('g'); arrow.append('path').attr('d', theme.cell(46)).attr('transform', `translate(${bw / 2 - 66} 0)`).attr('fill', ink.on); arrow.append('path').attr('d', `M${bw / 2 - 86} 0h40m-16 -16l16 16l-16 16`).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 7);
  const handle = txt(root, W / 2, by + bh + 78, '', {size: 54, role: 'mono', color: ink.accent, anchor: 'middle'});
  const band = root.append('g').attr('transform', `translate(0 ${bandY + bandH / 2})`).append('g'); band.append('path').attr('d', `M-20 ${-bandH / 2}H${W + 20}M-20 ${bandH / 2}H${W + 20}`).attr('stroke', ink.alt).attr('stroke-width', 4);
  const ssize = bandH * .5 / capH(1), run = strip(band, stage, props.strip, capH(ssize) / 2, ssize, {color: ink.alt, ghost: .35});
  const labels = readouts(root, props.labels, 112), star = mark(root, m + 40, Math.max(230, top - 56 * k - 20), 34, ink.alt);
  return {
    seek(t) {
      rows.forEach((row, i) => row.forEach(u => { const q = span(t, .1 + i * .2 + u.i * .04, .5); pose(u, {y: (1 - easeBack(q)) * u.cap * 1.3, sy: 1 + vel(q) * .3, o: q > 0 ? 1 : 0}); }));
      const q = span(t, .8, .6), nudge = Math.max(0, Math.sin(t * 5)) ** 4 * 16;
      button.attr('transform', `scale(${spring(q)} ${q > 0 ? .4 + .6 * easeOut(span(t, .8, .25)) : 0})`); arrow.attr('transform', `translate(${nudge - 60 * (1 - easeOut(span(t, 1.1, .4)))} 0)`).attr('opacity', span(t, 1.1, .1));
      handle.text(up(props.handle).slice(0, Math.round(up(props.handle).length * span(t, 1.4, .5)))).attr('opacity', t > 1.4 ? 1 : 0);
      band.attr('transform', `scale(1 ${spring(span(t, .5, .5))})`); run.set(t * 190 + (1 - easeOut(span(t, .5, .8))) * 900);
      const b = span(t, 0, 1); ring.set(W * .84 + Math.sin(t * .6) * 36, top - 30 * k + Math.cos(t * .5) * 24 - (1 - easeOut(b)) * H * .4, 170 * (.6 + .4 * k), 40 * Math.cos(t * .6) + 30, -vel(b) * 240, b > 0 ? .85 : 0, t * 24);
      labels.forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06))); star.attr('transform', `rotate(${t * 70}) scale(${spring(span(t, 1, .5))})`);
    },
  };
}
