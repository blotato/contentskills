import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Atmosphere for the whole clip: a heavy vignette, slow fog rolling across the top and bottom of
// the frame, and fine grain. `strength` is the vignette, `fog` the mist, both 0..1.
export const meta = {duration: 8, live: true};
export const defaults = {strength: .85, fog: .55, color: 'fog', grain: .5};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, color = tone(props.color), paint = radial(st, [[0, color, .95], [.55, color, .5], [1, color, 0]]);
  const blobs = Array.from({length: 7}, (_, i) => root.append('ellipse').attr('fill', paint));
  root.append('rect').attr('width', W).attr('height', H).attr('fill', st.fill('vig')).attr('opacity', Math.max(0, props.strength * 2 - 1));
  const vig = root.append('rect').attr('width', W).attr('height', H).attr('fill', st.fill('vig')).attr('opacity', Math.min(1, props.strength * 2));
  const grain = root.append('rect').attr('x', -300).attr('y', -300).attr('width', W + 600).attr('height', H + 600).attr('fill', st.fill('grain')).attr('opacity', props.grain);
  return {seek(t) {
    const v = span(t, 0, .8) * (props.life ? 1 - span(t, props.life - .6, .6) : 1), f = step(t); root.attr('opacity', v);
    blobs.forEach((b, i) => { const low = i % 2, drift = ((t * (.018 + hash(i, 1) * .02) + hash(i, 2)) % 1) * 1.8 - .4; b.attr('cx', W * (low ? drift : 1 - drift)).attr('cy', H * (low ? .86 + hash(i, 3) * .12 : .04 + hash(i, 3) * .1) + Math.sin(t * .3 + i) * 20).attr('rx', W * (.5 + hash(i, 4) * .3)).attr('ry', H * (.08 + hash(i, 5) * .06)).attr('opacity', props.fog * (.6 + .4 * noise(t * .4, i))); });
    grain.attr('transform', `translate(${Math.round(hash(f, 1) * 250)} ${Math.round(hash(f, 2) * 250)})`);
  }};
}
