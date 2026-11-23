import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A line of tracked capitals running up one edge of the frame beside a hairline, with a smaller
// line next to it. `side` is left or right; `top` and `bottom` bound it. (`band` is ignored.)
export const meta = {duration: 4, live: true};
export const defaults = {text: 'RECORDED AT NIGHT', sub: 'PART 02 / UNEDITED', side: 'left', color: 'rose', band: '', top: 300, bottom: 1560, edge: 36};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, len = props.bottom - props.top, left = props.side !== 'right', text = up(props.text), size = fit(text, len - 80, 76), cap = capH(size);
  const x = left ? props.edge + cap + 14 : W - props.edge - cap - 14, g = root.append('g').attr('transform', `translate(${x} ${left ? props.bottom : props.top}) rotate(${left ? -90 : 90})`);
  g.append('rect').attr('x', -40).attr('y', -cap - 40).attr('width', len + 80).attr('height', cap + 130).attr('fill', linear(st, [[0, '#000', 0], [.35, '#000', .5], [.7, '#000', .5], [1, '#000', 0]]));
  const rule = hair(g, `M0 ${-cap - 18}H${len}`, tone(props.color), 3, .9), l = letters(g, text, 0, 0, size, {anchor: 'start', halo: 7, accent: tone(props.color), seed: 6}), sub = txt(g, 0, 46, up(props.sub), {size: 30, color: C.bone, spacing: .3, weight: 600, halo: 6});
  return {seek(t) {
    const out = props.life ? props.life - .42 : null, x = leave(t, props.life, .25); g.select('rect').attr('opacity', span(t, 0, .3) * (1 - x));
    draw(rule.attr('opacity', .9 * (1 - x)), easeInOut(span(t, 0, .6))); l.show(t, {at: .2, spread: .7, out}); sub.attr('opacity', flickerOn(t, .9, .3, 2) * (1 - x) * .85);
  }};
}
