import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A thin meter over the footage: a label, a hairline that fills toward `to` percent with a small
// marker riding its end, and the figure. It trembles more the higher it gets. `y` is the line.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'DREAD', from: 0, to: 100, seconds: 2.4, y: 330, color: 'rose', unit: '%'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, y = props.y, x0 = 110, w = W - 220, color = tone(props.color);
  const shade = pool(root, st, W / 2, y - 20, 640, 190), g = root.append('g'); hair(g, `M${x0} ${y}H${x0 + w}`, C.bone, 2, .4); for (let i = 0; i <= 10; i++) hair(g, `M${x0 + i * w / 10} ${y + 10}v${i % 5 ? 12 : 22}`, C.bone, 2, .4);
  const fill = hair(g, '', color, 6, 1), marker = g.append('path').attr('d', 'M0 -12L12 -34H-12Z').attr('fill', C.bone), label = txt(g, x0, y - 54, up(props.label), {size: 44, font: F.head, weight: 400, spacing: .3, halo: 8}), num = txt(g, x0 + w, y - 54, '', {size: 72, font: F.head, weight: 400, spacing: .06, anchor: 'end', halo: 8});
  return {seek(t) {
    const q = easeInOut(span(t, .3, props.seconds)), value = mix(props.from, props.to, q), [jx, jy] = jitter(t, value / 100 * 3, 6); root.attr('opacity', presence(t, props.life, 6)); shade.attr('opacity', 1);
    g.attr('transform', `translate(${jx} ${jy})`); fill.attr('d', `M${x0} ${y}H${x0 + w * clamp(value / 100)}`); marker.attr('transform', `translate(${x0 + w * clamp(value / 100)} ${y})`); num.text(Math.round(value) + (props.unit ?? '')).attr('fill', value > 80 ? color : C.bone);
  }};
}
