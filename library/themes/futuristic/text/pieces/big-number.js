import {textStage, up, fit, measure, capH, glyphs, pose, txt, readouts, plate, clipBox, mark, streak, halo, appear, span, spring, easeOut, vel} from '../kit.js';

// One huge number or year. Each digit rolls like an odometer, stretched while it spins, and
// lands with a bounce; the label wipes in underneath on a filled plate. `value` may include
// signs such as % or K.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  value: '2026', kicker: 'MARK THE YEAR', label: 'EVERYTHING CLICKS', note: 'SMALL STEPS, STACKED DAILY,\nLOOK LIKE LUCK FROM OUTSIDE',
  labels: ['DATA\nPOINT', 'NO. 01', 'COUNT\nIT UP'], accent: 'amber',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 64, value = String(props.value), label = up(props.label);
  const size = fit(value, W - m * 2, H * .5), cap = capH(size), base = H * .46 + cap / 2, roll = cap * 1.22;
  const ring = halo(root, stage, {color: ink.alt}), dash = streak(root, stage, ink.alt);
  const box = root.append('g').attr('clip-path', clipBox(stage, 0, base - cap - 14, W, cap + 28));
  const digits = glyphs(box, value, W / 2, base, size, {anchor: 'middle', color: ink.head}).map(u => ({...u, digit: /\d/.test(u.str) ? Number(u.str) : null, next: /\d/.test(u.str) ? u.g.append('text').attr('text-anchor', 'middle').attr('fill', ink.head).attr('style', u.text.attr('style')) : null}));
  const lsize = fit(label, W - m * 2 - 48, Math.min(130, H * .07)), lcap = capH(lsize), ly = base + 60 + lcap, lw = measure(label, lsize) + 44, wipe = plate(root, {fill: ink.accent});
  const text = root.append('g'); txt(text, m + 22, ly, label, {size: lsize, role: 'head', color: ink.on});
  const kicker = txt(root, m, base - cap - 44, up(props.kicker), {size: 40, color: ink.text}), note = txt(root, m, ly + 84, up(props.note), {size: 32});
  const labels = readouts(root, props.labels, 112), star = mark(root, W - m - 34, base - cap - 58, 32, ink.alt);
  return {
    seek(t) {
      digits.forEach(u => {
        const q = span(t, .1 + u.i * .12, .9);
        if (u.digit == null) { pose(u, {sx: spring(q), o: q > 0 ? 1 : 0}); return; }
        const pos = u.digit + (1 - spring(q)) * (7 + u.i * 3), low = Math.floor(pos), frac = pos - low, mod = v => ((v % 10) + 10) % 10;
        u.text.text(mod(low)).attr('y', frac * roll); u.next.text(mod(low + 1)).attr('y', (frac - 1) * roll);
        pose(u, {sy: 1 + vel(q) * .35 + (q >= 1 ? Math.sin(t * 2 + u.i) * .012 : 0), o: q > 0 ? 1 : 0});
      });
      const w = easeOut(span(t, 1, .45)); wipe.set(m, ly - lcap - 18, lw * w, lcap + 36); text.attr('transform', `translate(${-60 * (1 - w)} 0)`).attr('opacity', span(t, 1.1, .12));
      kicker.attr('opacity', appear(t, .7)); note.attr('opacity', appear(t, 1.4)).attr('transform', `translate(0 ${24 * (1 - easeOut(span(t, 1.4, .4)))})`);
      const q = span(t, .2, .9); ring.set(W * .84 + Math.sin(t * .6) * 30, H * .15 + (1 - easeOut(q)) * -H * .4, 140 * (.6 + .4 * k), 40 * Math.cos(t * .6), -vel(q) * 240 - 30, q > 0 ? .9 : 0, t * 30);
      const d = (t * .26 + .5) % 1; dash.set(W + 200 - d * (W + 500), H - 130 * k - 40, 22, 220, 180, span(t, .8, .2));
      labels.forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06))); star.attr('transform', `rotate(${t * 70}) scale(${spring(span(t, 1.2, .5))})`);
    },
  };
}
