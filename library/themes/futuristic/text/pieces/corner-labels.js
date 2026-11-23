import {theme, textStage, look, up, measure, txt, plate, aura, mark, badge, streak, appear, span, spring, easeOut, leave} from '../kit.js';

// Overlay: a set of labels pinned in the four corners with bracket marks, a reticle mark and a
// badge, leaving the middle of the frame clear. Corners snap outward into place and a streak
// keeps running along the top edge. Each label's first line sits on a filled chip; the rest are readouts.
export const meta = {duration: 4, live: true};
export const defaults = {
  topLeft: 'EP. 12\nBEHIND THE BUILD', topRight: 'UNSCRIPTED\nONE TAKE', bottomLeft: 'KEEP\nWATCHING', bottomRight: 'PT. 01\nOF 03',
  mark: 'R', accent: 'cyan', inset: 48,
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, W, H} = stage, ink = look(props.accent), p = props.inset, len = 84;
  const dash = streak(root, stage, ink.alt);
  const corners = [[0, 0, props.topLeft], [1, 0, props.topRight], [0, 1, props.bottomLeft], [1, 1, props.bottomRight]].map(([cx, cy, label], i) => {
    const sx = cx ? -1 : 1, sy = cy ? -1 : 1, g = root.append('g').attr('transform', `translate(${cx ? W - p : p} ${cy ? H - p : p})`).append('g'), [first = '', ...rest] = up(label).split('\n');
    aura(g, theme.corner(sx, sy, len), ink.accent, 7); g.append('path').attr('d', theme.corner(sx, sy, len)).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 7).attr('stroke-linecap', 'square');
    const w = measure(first, 38, {role: 'text'}) + 30, x = sx * 34, top = cy ? -34 - 56 - rest.length * 40 : 34, text = g.append('g');
    plate(text, {fill: ink.accent, cut: 12}).set(cx ? x - w : x, top, w, 56);
    txt(text, cx ? x - 14 : x + 16, top + 42, first, {size: 38, color: ink.on, anchor: cx ? 'end' : 'start'});
    rest.forEach((line, j) => txt(text, cx ? x - 2 : x + 2, top + 56 + 36 + j * 40, line, {size: 30, role: 'mono', anchor: cx ? 'end' : 'start', shade: true}));
    return {g, text, sx, sy, i, tall: 34 + 56 + rest.length * 40};
  });
  const star = mark(root, p + 46, p + corners[0].tall + 70, 28, ink.third), seal = badge(root, W - p - 44, H - p - corners[3].tall - 74, 32, props.mark, {color: ink.third});
  return {
    seek(t) {
      const x = leave(t, props.life);
      corners.forEach(c => {
        const q = span(t, c.i * .07, .55), s = spring(q), away = (1 - s) * 150 - x * 120, breathe = q >= 1 ? Math.sin(t * 2 + c.i) * 4 : 0;
        c.g.attr('transform', `translate(${c.sx * (away + breathe)} ${c.sy * (away + breathe)})`).attr('opacity', appear(t, c.i * .07) * (1 - x));
        c.text.attr('opacity', appear(t, .35 + c.i * .08)).attr('transform', `translate(${-c.sx * 30 * (1 - easeOut(span(t, .35 + c.i * .08, .35)))} 0)`);
      });
      star.attr('transform', `rotate(${t * 70}) scale(${spring(span(t, .6, .5)) * (1 - x)})`); seal.attr('transform', `rotate(${Math.sin(t * 1.6) * 14}) scale(${spring(span(t, .75, .5)) * (1 - x)})`);
      const d = (t * .45 + .1) % 1; dash.set(p + 160 + d * (W - p * 2 - 320), p, 14, 150 * Math.sin(Math.PI * d), 0, span(t, .6, .2) * (1 - x) * Math.min(1, Math.sin(Math.PI * d) * 4));
    },
  };
}
