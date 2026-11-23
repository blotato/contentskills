import {textStage, look, up, fit, capH, measure, glyphs, slam, txt, plate, shade, mark, streak, appear, span, spring, easeOut, leave, vel} from '../kit.js';

// Overlay: one keyword slammed across a tilted plate, for the top or bottom of the frame. The
// plate whips in from the left, the letters drop in oversized one by one with their colours
// split and keep breathing, and everything drops away before `life` ends. `y` is the plate's
// centre in frame pixels. `solid: true` inverts it: a filled plate with dark letters.
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'UNSTOPPABLE', kicker: 'WORD OF THE DAY', y: 330, accent: 'cyan', solid: false, tilt: -3};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), word = up(props.word), y = props.y;
  const size = fit(word, 900, 260), cap = capH(size), bh = cap + 84, g = root.append('g').attr('transform', `translate(${W / 2} ${y}) rotate(${props.tilt})`);
  const slab = props.solid ? plate(g, {fill: ink.accent, cut: 30}) : shade(g, .74, 30), edge = g.append('path').attr('fill', 'none').attr('stroke', props.solid ? ink.text : ink.accent).attr('stroke-width', 5), dash = streak(g, stage, ink.alt);
  const letters = glyphs(g, word, 0, cap / 2, size, {anchor: 'middle', color: props.solid ? ink.on : ink.head, echo: !props.solid});
  const o = {role: 'mono'}, kw = measure(up(props.kicker), 32, o) + 44, tag = g.append('g'), chip = plate(tag, {fill: ink.alt, cut: 12});
  const label = txt(tag, -W / 2 + 76, -bh / 2 + 10, up(props.kicker), {size: 32, role: 'mono', color: ink.on});
  const star = mark(g, W / 2 - 110, -bh / 2, 40, ink.third);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .35), e = easeOut(q), full = W + 120, w = full * e * (1 - x), x0 = -W / 2 - 60 + full * x;
      slab.set(x0, -bh / 2, w, bh); slab.node.attr('transform', `skewX(${-vel(q) * 20})`);
      edge.attr('d', w > 1 ? `M${x0} ${-bh / 2}h${w}M${x0} ${bh / 2}h${w}` : '').attr('opacity', appear(t, .2));
      letters.forEach(u => { const p = span(t, .16 + u.i * .045, .5); slam(u, p, span(x, u.i / u.n * .5, .5), {from: 2.4, live: p >= 1 && x <= 0 ? Math.sin(t * 2.4 - u.i * .5) * .025 : 0}); });
      const k = easeOut(span(t, .5, .35)); chip.set(-W / 2 + 54, -bh / 2 - 30, kw * k * (1 - x), 58); label.attr('opacity', appear(t, .65) * (1 - x));
      star.attr('transform', `rotate(${t * 80}) scale(${spring(span(t, .7, .5)) * (1 - x)})`);
      const d = (t * .5) % 1; dash.set(-W / 2 - 100 + d * (W + 400), bh / 2, 16, 180, 0, span(t, .5, .2) * (1 - x));
    },
  };
}
