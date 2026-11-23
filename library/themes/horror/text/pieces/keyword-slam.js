import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// One word over the footage: it switches on letter by letter in a pool of shadow, a small tracked
// line above it, and leaves as vertical streaks. `y` is its centre line. (`band`, `tilt` are ignored.)
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'LISTEN', kicker: 'Did you hear that', y: 330, color: 'rose', band: '', tilt: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, word = up(props.word), y = props.y, size = fit(word, 900, 230), cap = capH(size);
  const shade = pool(root, st, W / 2, y, 640, cap * 1.5 + 90), l = letters(root, word, W / 2, y + cap / 2, size, {accent: tone(props.color), halo: 10, seed: 4});
  const kick = props.kicker ? txt(root, W / 2, y - cap / 2 - 44, up(oneLine(props.kicker)), {size: 40, anchor: 'middle', color: C.bone, spacing: .34, weight: 600, halo: 8}) : null;
  return {seek(t) {
    const out = props.life ? props.life - .45 : null; shade.attr('opacity', span(t, 0, .25) * (1 - leave(t, props.life, .3)));
    l.show(t, {at: .15, spread: .5, out}); kick?.attr('opacity', flickerOn(t, 0, .3, 2) * (out != null && t > out ? 0 : .9));
  }};
}
