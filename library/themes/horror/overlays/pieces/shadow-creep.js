import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Darkness creeping in from the edges of the frame: soft-edged fingers of shadow that lengthen
// slowly toward the middle and never quite hold still. `reach` 0..1 is how far in they get,
// `seconds` how long that takes; `sides` is 'both', 'left', 'right', 'top' or 'bottom'.
export const meta = {duration: 6, live: true};
export const defaults = {reach: .34, seconds: 5, strength: .92, sides: 'both', fingers: 7};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, n = props.fingers, paint = radial(st, [[0, '#000', 1], [.45, '#000', .9], [.75, '#000', .45], [1, '#000', 0]]);
  const sides = props.sides === 'both' ? ['left', 'right'] : [props.sides], blobs = sides.flatMap((side, s) => Array.from({length: n * 2}, (_, i) => ({side, s, i, tip: i % 2, node: root.append('ellipse').attr('fill', paint)})));
  return {seek(t) {
    root.attr('opacity', props.strength * span(t, 0, .5) * (props.life ? 1 - span(t, props.life - .4, .4) : 1)); const grow = easeInOut(span(t, 0, props.seconds));
    for (const {side, s, i, tip, node} of blobs) {
      const vertical = side === 'top' || side === 'bottom', len = vertical ? W : H, depth = (vertical ? H : W) * props.reach;
      const reach = 70 + depth * grow * (tip ? .5 + .5 * hash(i, s + 3) : .28) * (.88 + .12 * Math.sin(t * (.5 + hash(i, s) * .8) + i)), a = (i + .5) / (n * 2) * len + Math.sin(t * .35 + i) * 18, across = len / n * (tip ? .55 : .95);
      const [cx, cy] = side === 'left' ? [0, a] : side === 'right' ? [W, a] : side === 'top' ? [a, 0] : [a, H];
      node.attr('cx', cx).attr('cy', cy).attr('rx', vertical ? across : reach * 1.5).attr('ry', vertical ? reach * 1.5 : across);
    }
  }};
}
