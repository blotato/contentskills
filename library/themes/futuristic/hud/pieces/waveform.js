import {C, F, hudStage, brackets, chamfer, plate, line, text, draw, span, easeOut, presence, noise, timecode, blink} from '../../hud.js';

// A voice-meter strip: mirrored bars that move like speech, a playhead scanning across and a
// running timecode. The levels are generated to look like a voice; they are not read from the
// audio. `y` is the top edge in frame pixels.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'VOICE INPUT', y: 1420, bars: 54, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, x = 90, w = 900, h = 190, n = props.bars, bw = w / n, mid = 118, g = root.append('g').attr('transform', `translate(${x} ${props.y})`);
  plate(g, chamfer(-26, -14, w + 52, h + 28, 22), .6); const frame = line(g, brackets(-26, -14, w + 52, h + 28, 44), color, 3);
  const title = text(g, 0, 28, props.label, {size: 26, color, spacing: '.22em'}), clock = text(g, w, 28, '', {size: 26, color: C.white, anchor: 'end'}), lamp = g.append('circle').attr('cx', w - 196).attr('cy', 19).attr('r', 8).attr('fill', C.red);
  const axis = line(g, `M0 ${mid}H${w}`, C.dim, 2), bars = Array.from({length: n}, (_, i) => g.append('rect').attr('x', i * bw + 2).attr('width', bw - 5).attr('fill', color));
  const head = line(g, `M0 ${mid - 66}V${mid + 66}`, C.amber, 3);
  // A slow syllable envelope times a faster ripple that travels along the strip.
  const level = (i, t) => Math.max(.04, (.3 + .7 * Math.pow(noise(t * 3.1, 11), 1.3)) * (.25 + .75 * noise(i * .32 - t * 6, 12)) * (.55 + .45 * Math.sin(i / (n - 1) * Math.PI)) * 1.5);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(frame, span(t, 0, .5)); draw(axis, span(t, .1, .4));
      const hx = ((t * .28) % 1) * w;
      bars.forEach((b, i) => { const on = easeOut(span(t, .2 + Math.abs(i - n / 2) / n * .6, .35)), v = Math.min(1, level(i, t)) * on * 62, near = Math.abs(i * bw - hx) < bw * 1.5;
        b.attr('y', mid - v).attr('height', v * 2).attr('fill', near ? C.white : v > 44 ? C.amber : color).attr('opacity', .9); });
      head.attr('transform', `translate(${hx} 0)`).attr('opacity', span(t, .5, .2));
      title.attr('opacity', span(t, .2, .1)); clock.text(timecode(t)); lamp.attr('opacity', blink(t) ? 1 : .2);
    },
  };
}
