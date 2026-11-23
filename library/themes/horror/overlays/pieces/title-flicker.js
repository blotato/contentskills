import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A title reveal over footage: a lamp flares and fails behind the words while a small tracked
// line, a one- or two-line title and a subtitle switch on between two hairlines. `y` is the centre.
export const meta = {duration: 5, live: true};
export const defaults = {kicker: 'A TRUE STORY', title: 'THE LAST\nHOUSE', sub: 'PART ONE', y: 360, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, y = props.y, lines = up(props.title).split('\n'), size = Math.min(fit(lines, 880, 190), 380 / lines.length / .72), color = tone(props.color);
  const shade = pool(root, st, W / 2, y, 700, 360), flare = root.append('ellipse').attr('cx', W / 2).attr('cy', y).attr('rx', 620).attr('ry', 250).attr('fill', radial(st, [[0, '#aebbd6', .5], [1, '#aebbd6', 0]]));
  const head = block(root, lines, W / 2, y, size, {halo: 10, accent: color, seed: 8}, 1.45), top = hair(root, `M${W / 2 - 200} ${head.top - 96}H${W / 2 + 200}`, C.bone, 2, .6), bottom = hair(root, `M${W / 2 - 200} ${head.bottom + 104}H${W / 2 + 200}`, C.bone, 2, .6);
  const kick = txt(root, W / 2, head.top - 40, up(props.kicker), {size: 36, anchor: 'middle', spacing: .4, weight: 600, halo: 7}), sub = txt(root, W / 2, head.bottom + 70, up(props.sub), {size: 36, anchor: 'middle', spacing: .4, weight: 600, color, halo: 7});
  return {seek(t) {
    const x = leave(t, props.life, .3), out = props.life ? props.life - .45 : null, f = step(t, 12); shade.attr('opacity', span(t, 0, .3) * (1 - x));
    flare.attr('opacity', (t < 1.1 ? (hash(f, 3) < .5 ? .5 : 0) : hash(f, 4) < .08 ? .3 : .06) * (1 - x));
    draw(top.attr('opacity', .6 * (1 - x)), easeInOut(span(t, .1, .6))); draw(bottom.attr('opacity', .6 * (1 - x)), easeInOut(span(t, .1, .6)));
    kick.attr('opacity', flickerOn(t, .1, .25, 1) * (1 - x) * .9); head.show(t, {at: .25, spread: .45, gap: .2, out}); sub.attr('opacity', flickerOn(t, 1.2, .3, 2) * (1 - x));
  }};
}
