import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A case-file card on aged paper: a typed heading and number, a few typed rows, and a worn stamp
// thumped across the corner. Sits at the top of the frame by default; `x`, `y`, `w` place it.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'CASE FILE', number: 'NO. 0417', rows: [['SUBJECT', 'UNIDENTIFIED'], ['LOCATION', 'THE OLD ROAD'], ['STATUS', 'OPEN']], stamp: 'UNSOLVED', x: 60, y: 130, w: 700, tilt: -1.5, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, w = props.w, n = props.rows.length, h = 150 + n * 62 + 30, g = root.append('g'), page = sheet(g, st, 0, 0, w, h, {seed: 5});
  txt(page, 36, 70, up(props.title), {size: 50, font: F.type, weight: 400, spacing: .1, color: C.ink}); txt(page, w - 36, 70, up(props.number), {size: 32, font: F.mono, weight: 700, spacing: .06, color: C.ink, anchor: 'end'});
  hair(page, rough(30, 100, w - 30, 100, 2, 1.2, 50), C.ink, 3, .7);
  const rows = props.rows.map(([key, value], i) => { const y = 164 + i * 62; txt(page, 36, y, up(key), {size: 26, font: F.sub, weight: 600, spacing: .28, color: C.ink, opacity: .65}); hair(page, `M250 ${y + 12}H${w - 36}`, C.ink, 1.5, .3); return {value: up(value), node: txt(page, 250, y, '', {size: 36, font: F.type, weight: 400, spacing: .04, color: C.ink})}; });
  const mark = props.stamp ? stamp(g, st, up(props.stamp), {size: 62, color: tone(props.color) === C.rose ? C.blood : tone(props.color)}) : null;
  return {seek(t) {
    const x = leave(t, props.life, .3), q = span(t, 0, .3); g.attr('transform', `translate(${props.x} ${props.y - (1 - easeOut(q)) * 40 - easeIn(x) * 60}) rotate(${props.tilt})`).attr('opacity', flickerOn(t, 0, .2, 2) * (1 - x));
    rows.forEach((r, i) => r.node.text(typed(r.value, span(t, .5 + i * .55, .45)) + (t > .5 + i * .55 && t < 1 + i * .55 && blink(t, 5) ? '_' : '')));
    if (mark) { const at = .7 + n * .55, s = span(t, at, .12); mark.g.attr('transform', `translate(${w - mark.w / 2 - 20} ${h - 30}) rotate(-9) scale(${1 + (1 - easeOut(s)) * .6})`).attr('opacity', t < at ? 0 : .4 + .6 * s); }
  }};
}
