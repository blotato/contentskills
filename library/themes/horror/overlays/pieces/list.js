import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Case notes over the footage: a heading and up to five short lines that switch on one at a time
// (at `times`, seconds after the list appears), each numbered in the accent colour. `x`, `y`:
// top-left corner.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'WHAT WE KNOW', items: ['THE DOOR WAS LOCKED', 'THE LIGHTS WERE ON', 'NOBODY CALLED'], times: [.5, 1.4, 2.3], x: 80, y: 190, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, x = props.x, y = props.y, items = props.items.map(up), size = Math.min(60, fit(items, W - x * 2 - 110, 60)), pitch = size * 1.5, color = tone(props.color), h = 90 + items.length * pitch;
  const shade = root.append('rect').attr('x', 0).attr('y', y - 80).attr('width', W).attr('height', h + 130).attr('fill', linear(st, [[0, '#000', 0], [.2, '#000', .6], [.8, '#000', .6], [1, '#000', 0]]));
  const title = letters(root, up(props.title), x, y + 40, 50, {anchor: 'start', spacing: .26, marks: false, color: C.fog, halo: 7, seed: 2}), rule = hair(root, rough(x, y + 66, W - x, y + 66, 6, 1.2, 60), C.bone, 2, .5);
  const rows = items.map((item, i) => { const yy = y + 90 + i * pitch + pitch * .62; return {num: txt(root, x, yy, pad(i + 1), {size: size * .8, font: F.head, weight: 400, spacing: .1, color, halo: 7}), line: letters(root, item, x + 100, yy, size, {anchor: 'start', marks: false, halo: 8, seed: 20 + i})}; });
  return {seek(t) {
    const xo = leave(t, props.life, .3), out = props.life ? props.life - .45 : null; shade.attr('opacity', span(t, 0, .3) * (1 - xo)); title.show(t, {at: 0, spread: .4, out}); draw(rule.attr('opacity', .5 * (1 - xo)), span(t, .2, .5));
    rows.forEach((r, i) => { const at = props.times?.[i] ?? .5 + i * .8; r.num.attr('opacity', flickerOn(t, at, .25, i) * (1 - xo)); r.line.show(t, {at, spread: .3, out}); });
  }};
}
