import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A sentence over the footage; the words in `mark` turn to the accent colour and a rough line is
// scratched under them. `y` is the centre of the block.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'Nobody had lived there for years', mark: 'for years', y: 330, color: 'rose', width: 920, maxSize: 130};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, color = tone(props.color), o = {spacing: .1};
  const {size, lines, pitch} = flow(up(props.text), props.width, 420, props.maxSize, 44, o, 1.6), cap = capH(size), body = (pool(root, st, W / 2, props.y, props.width * .68, lines.length * pitch * .8 + 110), block(root, lines, W / 2, props.y, size, {words: [props.mark], marks: false, accent: color, halo: 9, spacing: .1, seed: 3}, 1.6));
  const shade = root.select('ellipse'), scratches = body.lines.map(row => { const hot = row.units.filter(u => u.accent); if (!hot.length) return null; const a = hot[0], b = hot.at(-1); return hair(root, rough(a.cx - a.w / 2 - 6, a.y + 20, b.cx + b.w / 2 + 6, a.y + 16, 5, 3, 22), color, 6, .95).attr('stroke-linecap', 'round'); });
  return {seek(t) {
    const x = leave(t, props.life, .3); shade.attr('opacity', span(t, 0, .25) * (1 - x)); body.show(t, {at: .1, spread: .6, gap: .15, out: props.life ? props.life - .42 : null});
    scratches.forEach((s, i) => s && draw(s.attr('opacity', .95 * (1 - x)), span(t, 1 + i * .25, .3)));
  }};
}
