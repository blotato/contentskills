import {C, F, line, text, draw, span, easeOut, hash, clamp, flicker} from '../../hud.js';
import {card} from './_card.js';

// A spectrum equaliser: segmented columns that bounce, peak caps that hang and fall, and a
// faint reflection under the baseline. Loops seamlessly. Levels are generated, not measured audio.
export const meta = {duration: 4, loop: true};
export const defaults = {title: 'Audio spectrum', unit: 'Illustrative · level by band', bands: ['Bass', 'Mids', 'Highs'], columns: 24, clear: false};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), n = props.columns, x0 = 90, w = 820 / n, base = 760, cells = 18, step = 26, T = meta.duration, W = Math.PI * 2;
  // Whole numbers of cycles per loop keep the motion seamless.
  const level = (i, t) => { const shape = .92 - .5 * (i / n) + .12 * Math.sin(i * .9), a = hash(i, 1), b = hash(i, 2);
    return clamp(shape * (.42 + .3 * Math.sin(W * ((1 + i % 3) * t / T + a)) + .2 * Math.sin(W * (4 * t / T + b)) + .12 * Math.sin(W * (7 * t / T + a + b)))); };
  const peak = (i, t) => { let m = 0; for (let k = 0; k < 14; k++) m = Math.max(m, level(i, t - k * .05) - k * .028); return m; };
  line(root, `M${x0 - 10} ${base + 6}H${x0 + 830}`, C.dim, 2);
  const cols = Array.from({length: n}, (_, i) => {
    const x = x0 + i * w, segs = Array.from({length: cells}, (_, k) => root.append('rect').attr('x', x).attr('y', base - (k + 1) * step + 4).attr('width', w - 7).attr('height', step - 7).attr('fill', k > 14 ? C.magenta : k > 10 ? C.amber : C.cyan));
    const mirror = root.append('rect').attr('x', x).attr('y', base + 14).attr('width', w - 7).attr('fill', C.cyan).attr('opacity', .16);
    return {segs, mirror, cap: root.append('rect').attr('x', x).attr('width', w - 7).attr('height', 5).attr('fill', C.white)};
  });
  const third = 820 / props.bands.length, labels = props.bands.map((b, i) => { const g = root.append('g'), x = x0 + i * third;
    line(g, `M${x + 4} ${base + 96}v14H${x + third - 12}v-14`, C.dim, 2); text(g, x + third / 2 - 4, base + 146, b.toUpperCase(), {size: 26, color: C.white, anchor: 'middle', spacing: '.25em'}); return g; });
  const dot = root.append('circle').attr('cx', 96).attr('cy', 240).attr('r', 8).attr('fill', C.red), tag = text(root, 116, 249, 'LIVE INPUT', {size: 22, color: C.dim, spacing: '.2em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    cols.forEach((c, i) => {
      const on = easeOut(span(t, .15 + i * .025, .5)), v = level(i, t) * on * cells, p = peak(i, t) * on * cells;
      c.segs.forEach((s, k) => s.attr('opacity', k < Math.floor(v) ? 1 : k < v ? .5 : .07));
      c.cap.attr('y', base - Math.max(1, p) * step - 6).attr('opacity', on); c.mirror.attr('height', Math.max(0, v * step * .28));
    });
    labels.forEach((g, i) => g.attr('opacity', flicker(t, .5 + i * .15)));
    dot.attr('opacity', Math.floor(t * 2) % 2 ? .25 : 1); tag.attr('opacity', flicker(t, .3));
  }};
}
