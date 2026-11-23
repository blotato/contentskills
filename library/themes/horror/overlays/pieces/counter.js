import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A figure over the footage that rolls through wrong digits and settles, with a tracked line
// above and a label below a short accent rule. `y` is the centre of the figure.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 13, prefix: '', suffix: '', kicker: 'NIGHT', label: 'NOBODY SLEPT', y: 380, color: 'rose', seconds: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, y = props.y, value = `${props.prefix ?? ''}${typeof props.value === 'number' ? comma(props.value) : props.value}${props.suffix ?? ''}`, size = fit(value, 700, 280, {spacing: .04}), cap = capH(size), color = tone(props.color);
  const shade = pool(root, st, W / 2, y + 30, 560, cap * .5 + 250), num = letters(root, value, W / 2, y + cap / 2, size, {spacing: .04, halo: 12, accent: color, seed: 9});
  const kick = props.kicker ? txt(root, W / 2, y - cap / 2 - 40, up(props.kicker), {size: 40, anchor: 'middle', spacing: .4, weight: 600, halo: 7}) : null, rule = hair(root, `M${W / 2 - 50} ${y + cap / 2 + 50}H${W / 2 + 50}`, color, 4, .95);
  const label = txt(root, W / 2, y + cap / 2 + 120, up(props.label), {size: Math.min(56, fit(up(props.label), 860, 56, {font: F.head, spacing: .2})), font: F.head, weight: 400, anchor: 'middle', spacing: .2, halo: 8});
  return {seek(t) {
    const x = leave(t, props.life, .3), out = props.life ? props.life - .45 : null; shade.attr('opacity', span(t, 0, .3) * (1 - x)); num.show(t, {at: .1, spread: .3, out});
    num.units.forEach(u => { const final = value[u.at], rolling = /\d/.test(final) && t < .3 + props.seconds * (.5 + u.r2 * .5); u.g.select('text').text(rolling ? Math.floor(hash(step(t, 14), u.at) * 10) : final); });
    kick?.attr('opacity', flickerOn(t, 0, .3, 1) * (1 - x) * .9); draw(rule.attr('opacity', .95 * (1 - x)), span(t, .4 + props.seconds, .3)); label.attr('opacity', flickerOn(t, .5 + props.seconds, .3, 2) * (1 - x));
  }};
}
