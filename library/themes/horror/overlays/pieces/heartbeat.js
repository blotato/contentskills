import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A heart-monitor trace running across the lower frame with a bright head, and a BPM readout that
// climbs from `bpm` to `to` while it is up. `y` is the baseline.
export const meta = {duration: 5, live: true};
export const defaults = {label: 'PULSE', bpm: 72, to: 128, y: 1640, height: 110, color: 'rose', seconds: 4};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, color = tone(props.color), y = props.y, x0 = 60, w = W - 120;
  root.append('rect').attr('y', y - props.height - 80).attr('width', W).attr('height', props.height * 2 + 190).attr('fill', linear(st, [[0, '#000', 0], [.3, '#000', .6], [.75, '#000', .6], [1, '#000', 0]]));
  hair(root, `M${x0} ${y}H${x0 + w}`, C.bone, 1.5, .25); for (let i = 0; i <= 12; i++) hair(root, `M${x0 + i * w / 12} ${y - 10}v20`, C.bone, 1.5, .25);
  const ghost = hair(root, '', color, 3, .25), trace = hair(root, '', color, 5, 1).attr('stroke-linejoin', 'round'), clip = st.defs.append('clipPath').attr('id', st.id + '-hb').append('rect').attr('y', y - 300).attr('height', 600).attr('x', x0); trace.attr('clip-path', `url(#${st.id}-hb)`);
  const head = root.append('circle').attr('r', 9).attr('fill', C.bone), label = txt(root, x0, y - props.height - 26, up(props.label), {size: 34, weight: 600, spacing: .34, color: C.bone, halo: 6}), num = txt(root, x0 + w, y - props.height - 20, '', {size: 96, font: F.head, weight: 400, spacing: .04, anchor: 'end', halo: 8}), unit = txt(root, x0 + w, y + props.height + 44, 'BPM', {size: 30, weight: 600, spacing: .34, anchor: 'end', color: C.fog, halo: 6});
  return {seek(t) {
    root.attr('opacity', presence(t, props.life, 5)); const q = easeInOut(span(t, .3, props.seconds)), bpm = mix(props.bpm, props.to, q), beats = 3 + q * 2, sweep = (t * .45) % 1;
    const d = ekg(x0, y, w, props.height * (.8 + .2 * q), beats, 0); ghost.attr('d', d); trace.attr('d', d); clip.attr('width', w * sweep);
    const bw = 1 / beats, ph = (sweep / bw) % 1, pulse = ph > .44 && ph < .62; head.attr('cx', x0 + w * sweep).attr('cy', y - (ph > .44 && ph < .5 ? (ph - .44) / .06 : ph >= .5 && ph < .56 ? 1 - (ph - .5) / .06 * 1.4 : 0) * props.height * .8).attr('r', pulse ? 13 : 9);
    num.text(Math.round(bpm)).attr('fill', bpm > 110 ? color : C.bone);
  }};
}
