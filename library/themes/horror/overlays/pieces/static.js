import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Signal loss: bursts of dead-channel noise across the whole frame with torn horizontal bands, a
// NO SIGNAL box at the top, and a thin crawl of noise in between. `bursts` are start times in
// seconds (each lasts `length`).
export const meta = {duration: 4, live: true};
export const defaults = {text: 'NO SIGNAL', sub: 'CH 03', bursts: [0, 2.1], length: .45, strength: .85, y: 300};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, noiseR = root.append('rect').attr('x', -300).attr('y', -300).attr('width', W + 600).attr('height', H + 600).attr('fill', st.fill('static'));
  const bands = [0, 1, 2, 3, 4].map(() => root.append('rect').attr('width', W + 400).attr('x', -200).attr('fill', st.fill('static'))), dark = [0, 1].map(() => root.append('rect').attr('width', W).attr('fill', '#000'));
  const box = root.append('g'), size = 96, tw = measure(up(props.text), size, {font: F.vhs, spacing: .08}) + 70; box.append('rect').attr('x', W / 2 - tw / 2).attr('y', props.y - 76).attr('width', tw).attr('height', 150).attr('fill', '#000').attr('opacity', .8);
  txt(box, W / 2, props.y, up(props.text), {size, font: F.vhs, weight: 400, spacing: .08, anchor: 'middle'}); txt(box, W / 2, props.y + 50, up(props.sub), {size: 44, font: F.vhs, weight: 400, spacing: .2, anchor: 'middle', color: C.rose});
  return {seek(t) {
    const f = step(t, 24), burst = Math.max(0, ...props.bursts.map(b => t >= b && t < b + props.length ? 1 - (t - b) / props.length * .4 : 0)), s = props.strength, gone = props.life && t > props.life - .05 ? 0 : 1;
    noiseR.attr('opacity', burst * s * (.55 + .3 * hash(f, 1)) * gone).attr('transform', `translate(${Math.round(hash(f, 2) * 250)} ${Math.round(hash(f, 3) * 250)}) scale(${1 + Math.floor(hash(f, 9) * 2)})`);
    bands.forEach((b, i) => { const on = burst > 0 || hash(f + i * 7, 4) < .1; b.attr('opacity', on ? (burst ? .9 : .5) * gone : 0).attr('y', hash(f, 5 + i) * H).attr('height', 8 + hash(f, 11 + i) * (burst ? 150 : 34)).attr('transform', `translate(${hash(f, 20 + i) * 200} 0) scale(3 1)`); });
    dark.forEach((d, i) => d.attr('opacity', burst ? .7 * gone : 0).attr('y', hash(f, 30 + i) * H).attr('height', 20 + hash(f, 33 + i) * 120));
    box.attr('opacity', burst ? (hash(f, 40) < .8 ? 1 : .3) * gone : 0).attr('transform', `translate(${burst ? (hash(f, 41) - .5) * 24 : 0} 0)`);
  }};
}
