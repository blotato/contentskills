import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A dark band across the footage with a line of tracked capitals crawling through it between two
// hairlines, and a slower, dimmer line of small text under it. `y` is its centre. (`tilt` is ignored.)
export const meta = {duration: 4, live: true, loop: true};
export const defaults = {text: 'DO NOT WATCH ALONE', sub: 'NEW EPISODE', y: 1760, height: 130, color: 'rose', second: 'bone', tilt: 0, speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, h = props.height, y0 = props.y - h / 2, size = h * .5 / capH(1), cap = capH(size), g = root.append('g').attr('clip-path', clipBox(st, 0, y0 - 4, W, h + 60));
  g.append('rect').attr('y', y0).attr('width', W).attr('height', h).attr('fill', '#000').attr('opacity', .72); g.append('rect').attr('y', y0).attr('width', W).attr('height', h).attr('fill', st.fill('grain')).attr('opacity', .5);
  hair(g, `M0 ${y0}H${W}M0 ${y0 + h}H${W}`, C.bone, 2, .5);
  const str = up(props.text) + '   ', unit = measure(str, size, {spacing: .2}) + size * .9, reps = Math.ceil(W / unit) + 2, line = g.append('g');
  for (let i = 0; i < reps; i++) { txt(line, i * unit, props.y + cap / 2, str, {size, font: F.head, weight: 400, spacing: .2, color: tone(props.second)}).style('white-space', 'pre'); line.append('rect').attr('x', i * unit - size * .62).attr('y', props.y - 5).attr('width', 10).attr('height', 10).attr('fill', tone(props.color)); }
  const sub = up(props.sub) + '  ·  ', subW = measure(sub, 28, {font: F.sub, weight: 600, spacing: .4}), subLine = txt(g, 0, y0 + h + 40, sub.repeat(Math.ceil(W / subW) + 2), {size: 28, weight: 600, spacing: .4, color: C.bone, halo: 3}).style('white-space', 'pre');
  return {seek(t) {
    const q = (t / meta.duration) % 1; root.attr('opacity', presence(t, props.life, 4));
    line.attr('transform', `translate(${-q * unit * Math.max(1, Math.round(props.speed))} 0)`); subLine.attr('transform', `translate(${-subW + q * subW} 0)`).attr('opacity', .7);
  }};
}
