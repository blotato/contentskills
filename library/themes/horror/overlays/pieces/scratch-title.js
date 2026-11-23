import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// Distressed lettering: a word in chipped, worn capitals with rough gouges scratched across it one
// after another, and a handwritten note underneath. `y` is the centre line.
export const meta = {duration: 4.5, live: true};
export const defaults = {text: 'IT WAS HERE', note: 'the marks were on the inside', y: 340, color: 'rose', scratches: 4};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, y = props.y, word = up(props.text), size = fit(word, 900, 210), cap = capH(size), color = tone(props.color);
  const shade = pool(root, st, W / 2, y + 20, 680, cap + 190), l = letters(root, word, W / 2, y + cap / 2, size, {worn: st.wear, marks: false, halo: 0, seed: 12}), w = l.w;
  const marks = Array.from({length: props.scratches}, (_, i) => { const x = W / 2 - w * .42 + i * w * .84 / Math.max(1, props.scratches - 1) + (hash(i, 3) - .5) * 60; return hair(root, rough(x + 50, y - cap * .95, x - 40 + (hash(i, 4) - .5) * 50, y + cap * .95, i + 5, 5, 20), color, 7 + hash(i, 6) * 5, .95).attr('stroke-linecap', 'round').attr('mask', st.wear); });
  const note = props.note ? txt(root, W / 2, y + cap / 2 + 96, props.note, {size: 38, font: F.hand, weight: 400, spacing: .02, anchor: 'middle', halo: 7}) : null;
  return {seek(t) {
    const x = leave(t, props.life, .3), out = props.life ? props.life - .45 : null, [jx, jy] = jitter(t, 1.2, 4); shade.attr('opacity', span(t, 0, .3) * (1 - x));
    l.g.attr('transform', `translate(${jx} ${jy})`); l.show(t, {at: .1, spread: .7, out}); marks.forEach((m, i) => draw(m.attr('opacity', .95 * (1 - x)), span(t, 1.1 + i * .22, .12)));
    note?.attr('opacity', span(t, 2.1, .5) * (1 - x) * .9);
  }};
}
