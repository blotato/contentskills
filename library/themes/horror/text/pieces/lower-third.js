import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// Names the speaker: a short accent bar, the name in tracked capitals, the role beneath, in a
// pool of shadow at the lower left. `y` is the centre line.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'ALEX RIVERA', role: 'WAS THERE THAT NIGHT', y: 1540, color: 'rose', second: 'bone'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, y = props.y, x0 = 84, name = up(props.name), size = fit(name, 760, 96), cap = capH(size);
  const shade = pool(root, st, x0 + 340, y, 620, 170), bar = root.append('rect').attr('x', x0 - 28).attr('width', 6).attr('fill', tone(props.color));
  const l = letters(root, name, x0, y + 6, size, {anchor: 'start', marks: false, halo: 8, seed: 5}), role = txt(root, x0, y + 62, up(props.role), {size: 36, color: tone(props.second), spacing: .3, weight: 600, halo: 7});
  return {seek(t) {
    const out = props.life ? props.life - .42 : null, x = leave(t, props.life, .25), h = (cap + 66) * easeOut(span(t, 0, .35)) * (1 - x);
    shade.attr('opacity', span(t, 0, .25) * (1 - x)); bar.attr('y', y + 6 - cap).attr('height', h); l.show(t, {at: .2, spread: .5, out}); role.attr('opacity', flickerOn(t, .7, .3, 3) * (1 - x) * .9);
  }};
}
