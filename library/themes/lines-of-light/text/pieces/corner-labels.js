import {C, stage, up, span, ease, light, dot, title, mono, pool, leave} from '../../kit.js';

// Four small labels in the corners of the frame, each under a corner bracket of light that opens
// from its corner point. The top-left corner carries the red dot. Empty labels are skipped.
export const meta = {duration: 4, live: true};
export const defaults = {topLeft: 'EP. 12\nBEHIND THE BUILD', topRight: 'UNSCRIPTED\nONE TAKE', bottomLeft: 'KEEP\nWATCHING', bottomRight: 'PT. 01\nOF 03', inset: 70};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W, H} = st, m = props.inset ?? 70, top = 260, bottom = 1450, len = 70;
  const spots = [[props.topLeft, m, top, 1, 1], [props.topRight, W - m, top, -1, 1], [props.bottomLeft, m, bottom, 1, -1], [props.bottomRight, W - m, bottom, -1, -1]];
  const items = spots.map(([label, x, y, sx, sy], i) => {
    if (!label) return null;
    const shade = pool(root, x + sx * 150, y + sy * 70, 260, 140, 0);
    const corner = light(root, [[x, y + sy * len], [x, y], [x + sx * len, y]], {width: 2.4}), lines = String(label).split('\n').map(up);
    const head = title(root, lines[0], x + sx * 26, y + sy * 26 + (sy > 0 ? 24 : -14 - 40 * (lines.length - 1)), 24, {anchor: sx > 0 ? 'start' : 'end', track: .3, halo: 5});
    const rest = lines.length > 1 ? mono(root, x + sx * 26, y + sy * 26 + (sy > 0 ? 62 : -14 - 40 * (lines.length - 2)), lines.slice(1).join('\n'), {size: 24, anchor: sx > 0 ? 'start' : 'end', track: .16, opacity: 0, halo: 4, weight: 500}) : null;
    return {shade, corner, head, rest, at: .1 + i * .18, red: i === 0 ? dot(root, x, y, {color: 'red', r: 10}) : null};
  });
  return {seek(t) {
    const x = leave(t, props.life, .5);
    items.forEach(it => { if (!it) return; it.shade.attr('opacity', ease(span(t, it.at, .4)) * (1 - x)); it.corner.range(ease(x), ease(span(t, it.at, .9))); it.head.show(ease(span(t, it.at + .4, .9)), 1 - x); it.rest?.attr('opacity', .85 * ease(span(t, it.at + .8, .6)) * (1 - x)); it.red?.set(span(t, 0, .2) * (1 - x)); });
  }};
}
