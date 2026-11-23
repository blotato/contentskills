import {C, F, stage, up, oneLine, fit, capH, txt, bar, sheet, print, tone, cornerLabels, cardMove, span, settle} from '../../kit.js';
import {toneFor, DARK} from './_cards.js';

// Two sides set against each other as two prints of the same place: `a` above, `b` below, a torn
// paper strip between them carrying `mark`. Each side has its word on a bar and a note on a dark
// strip. `fields` gives the photographic tone of each side (sepia, steel/blue, anything else silver).
export const meta = {duration: 5, live: true};
export const defaults = {a: 'THEN', b: 'NOW', mark: 'AND', aNote: 'AS IT STOOD', bNote: 'AS IT STANDS', labels: ['SIDE BY SIDE', 'TWO VIEWS', '', 'COMPARE'], fields: ['sepia', 'night'], scenes: ['city', 'city'], images: [null, null]};

export function mount(el, props = defaults) {
  const f = props.fields ?? defaults.fields, st = stage(el, {field: f[1] ?? f[0]}), {root, W, H, ink, k, sq} = st, m = 70, ph = H * (sq ? .3 : .31), pw = W * .8, sc = props.scenes ?? defaults.scenes, im = props.images ?? [];
  const sides = [[props.a, props.aNote, H * .25, -2.2, W * .47, 0], [props.b, props.bNote, H * .725, 1.7, W * .53, 1]].map(([word, note, y, rot, x, i]) => {
    const pg = root.append('g'), pr = print(pg, pw, ph, {scene: sc[i] ?? 'city', image: im[i], seed: 21, tone: toneFor(f[i]), tapes: 1});
    const size = fit(up(oneLine(word)), W * .62, H * .07, {weight: 700}), wb = bar(root, word, {size, fill: i ? ink.bar : 'char', weight: 700, from: i ? 'right' : 'left', seed: i}), nb = note ? bar(root, note, {size: 30 + 8 * k, fill: 'glass', weight: 400, from: i ? 'right' : 'left', seed: i + 4}) : null;
    const by = y + ph / 2 - wb.h * (i ? .55 : .1); wb.g.attr('transform', `translate(${i ? W - m - wb.w : m} ${by})`); nb?.g.attr('transform', `translate(${i ? W - m - nb.w - 40 : m + 40} ${by + wb.h / 2 + nb.h / 2 - 4})`);
    return {pg, pr, wb, nb, x, y, rot, i};
  });
  const mid = root.append('g'), sw = W * .44, shh = 78 + 20 * k; sheet(mid, -sw / 2, -shh / 2, sw, shh, {fill: C.bone, seed: 31, rough: 6, step: 14});
  const ms = fit(up(oneLine(props.mark)), sw - 150, shh * .56, {weight: 700, spacing: .12}); txt(mid, 0, capH(ms, {weight: 700}) / 2, up(oneLine(props.mark)), {size: ms, weight: 700, anchor: 'middle', color: DARK, spacing: .12});
  mid.append('path').attr('d', `M${-sw / 2 + 26} 0h40M${sw / 2 - 66} 0h40`).attr('stroke', C.crimson).attr('stroke-width', 5);
  const corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration})); const q = t / meta.duration;
    sides.forEach(({pg, pr, wb, nb, x, y, rot, i}) => { const at = .1 + i * .9, e = settle(span(t, at, 1)); pr.pan(q, {dx: i ? -50 : 50});
      pg.attr('transform', `translate(${x + (i ? -12 : 12) * q} ${y + (1 - e) * (i ? 26 : -26)}) rotate(${rot + (i ? -.4 : .4) * q}) scale(${1 + .03 * q})`).attr('opacity', e); wb.reveal(span(t, at + .5, .7)); nb?.reveal(span(t, at + .75, .7)); });
    mid.attr('transform', `translate(${W * .6} ${H * .4875}) rotate(${-1.2 + .3 * q}) scale(${1.12 - .12 * settle(span(t, 1.7, .6))})`).attr('opacity', span(t, 1.7, .35)); corners(t, .8);
  }};
}
