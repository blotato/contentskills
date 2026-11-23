import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A light in the dark: a cold shaft falling from one upper corner that flares, dips and cuts out
// like a bad bulb, with dust drifting through it. The rest of the frame is pushed darker.
// `x` 0..1 is where along the top it comes from; `angle` is its lean in degrees.
export const meta = {duration: 6, live: true};
export const defaults = {x: .86, angle: 24, spread: 300, length: 1500, color: 'cold', strength: .55, dark: .35, motes: 22};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, color = props.color === 'cold' ? '#b9c8ee' : tone(props.color), ox = props.x * W, L = props.length;
  const dark = root.append('rect').attr('width', W).attr('height', H).attr('fill', '#000'), g = root.append('g').attr('transform', `translate(${ox} -40) rotate(${props.angle})`), paint = linear(st, [[0, color, .85], [.5, color, .3], [1, color, 0]]);
  const beams = [1, .55].map(k => g.append('path').attr('d', `M${-30 * k} 0L${30 * k} 0L${props.spread * k} ${L}L${-props.spread * k} ${L}Z`).attr('fill', paint).attr('filter', st.soft)), bulb = root.append('circle').attr('cx', ox).attr('cy', -10).attr('r', 150).attr('fill', radial(st, [[0, color, .9], [1, color, 0]]));
  const motes = Array.from({length: props.motes}, (_, i) => g.append('circle').attr('r', 1.5 + hash(i, 1) * 3).attr('fill', '#fff'));
  return {seek(t) {
    const v = span(t, 0, .2) * (props.life ? 1 - span(t, props.life - .3, .3) : 1), light = lamp(t, 14, .92, 1.6) * (t < .6 ? (hash(step(t, 14), 2) < .5 ? .2 : 1) : 1);
    dark.attr('opacity', props.dark * v * (1.25 - light * .25)); beams.forEach((b, i) => b.attr('opacity', props.strength * light * v * (i ? .8 : .6))); bulb.attr('opacity', light * v * .8);
    motes.forEach((m, i) => { const q = (t * (.02 + hash(i, 2) * .03) + hash(i, 3)) % 1, y = q * L * .8 + 60, half = props.spread * y / L * .8; m.attr('cx', (hash(i, 4) * 2 - 1) * half + Math.sin(t * .7 + i) * 12).attr('cy', y).attr('opacity', light * v * (.25 + .5 * noise(t * 1.5, i)) * Math.sin(q * Math.PI)); });
  }};
}
