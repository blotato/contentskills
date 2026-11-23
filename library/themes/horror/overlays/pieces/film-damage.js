import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Old film stock over the whole clip: running vertical scratches, dust and hairs, a breathing
// dark gate at the edges, grain, and the odd flash frame. `strength` 0..1 scales all of it.
export const meta = {duration: 6, live: true};
export const defaults = {strength: .8, scratches: 5, dust: 12, flashes: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, s = props.strength;
  const gate = root.append('rect').attr('width', W).attr('height', H).attr('fill', st.fill('vig')), grain = root.append('rect').attr('x', -300).attr('y', -300).attr('width', W + 600).attr('height', H + 600).attr('fill', st.fill('grain')).attr('opacity', .6 * s);
  const lines = Array.from({length: props.scratches}, () => root.append('path').attr('fill', 'none')), specks = Array.from({length: props.dust}, () => root.append('path').attr('fill', 'none').attr('stroke-linecap', 'round')), flash = root.append('rect').attr('width', W).attr('height', H).attr('fill', '#fff');
  return {seek(t) {
    const f = step(t), v = span(t, 0, .3) * (props.life ? 1 - span(t, props.life - .3, .3) : 1); root.attr('opacity', v);
    gate.attr('opacity', s * (.55 + .2 * noise(t * 5, 3))).attr('transform', `translate(0 ${(hash(f, 8) - .5) * 10})`); grain.attr('transform', `translate(${Math.round(hash(f, 1) * 250)} ${Math.round(hash(f, 2) * 250)})`);
    lines.forEach((l, i) => { const run = Math.floor(t / (1.2 + i * .7)), on = hash(run, i + 20) < .55 && hash(f, i + 60) < .8, x = (.08 + .84 * hash(run, i + 30)) * W + Math.sin(t * 3 + i) * 6, dark = hash(run, i + 40) < .3; l.attr('opacity', on ? s * (.25 + hash(f, i + 50) * .4) : 0).attr('stroke', dark ? '#000' : C.bone).attr('stroke-width', 1.5 + hash(run, i + 45) * 2).attr('d', rough(x, -10, x + (hash(run, i) - .5) * 30, H + 10, f + i, 2, 160)); });
    specks.forEach((p, i) => { const on = hash(f * 3 + i, 70) < .3, x = hash(f, 80 + i) * W, y = hash(f, 90 + i) * H, hairy = i % 4 === 0, r = 2 + hash(f, 100 + i) * 5; p.attr('opacity', on ? s * .8 : 0).attr('stroke', i % 3 ? C.bone : '#000').attr('stroke-width', hairy ? 2 : r).attr('d', hairy ? `M${x} ${y}q${(hash(f, i) - .5) * 80} ${40 + hash(f, i + 1) * 40} ${(hash(f, i + 2) - .5) * 60} ${90}` : `M${x} ${y}l1 1`); });
    flash.attr('opacity', props.flashes && hash(f, 120) < .035 ? .22 * s : 0);
  }};
}
