import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A worn rubber stamp thumped onto the footage: a double ring, the word across the middle and a
// line of small text round the edge. `r` is the radius, `tilt` the angle.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'UNSOLVED', ring: 'CASE FILE · DO NOT REMOVE · CASE FILE · DO NOT REMOVE ·', x: 850, y: 340, r: 160, color: 'rose', tilt: -12};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, defs, id} = st, r = props.r, color = tone(props.color), g = root.append('g'), body = g.append('g').attr('mask', st.wear), word = up(props.text);
  g.insert('circle', ':first-child').attr('r', r * 1.25).attr('fill', st.fill('pool')).attr('opacity', .8);
  body.append('circle').attr('r', r).attr('fill', 'none').attr('stroke', color).attr('stroke-width', r * .06); body.append('circle').attr('r', r * .72).attr('fill', 'none').attr('stroke', color).attr('stroke-width', r * .02);
  const size = fit(word, r * 2.3, r * .62, {spacing: .1}), cap = capH(size), bw = measure(word, size, {spacing: .1}) + size * .5;
  body.append('rect').attr('x', -bw / 2).attr('y', -cap / 2 - size * .22).attr('width', bw).attr('height', cap + size * .44).attr('fill', '#0b0d10').attr('stroke', color).attr('stroke-width', r * .035);
  txt(body, size * .05, cap / 2, word, {size, font: F.head, weight: 400, anchor: 'middle', spacing: .1, color});
  if (props.ring) { defs.append('path').attr('id', id + '-ring').attr('d', `M0 ${r * .83}A${r * .83} ${r * .83} 0 1 1 .01 ${r * .83}`); body.append('text').style('font', `600 ${r * .14}px ${F.sub}`).style('letter-spacing', '.3em').attr('fill', color).append('textPath').attr('href', `#${id}-ring`).text(up(props.ring)); }
  return {seek(t) {
    const q = span(t, .1, .14), s = t < .1 ? 0 : 1 + (1 - easeOut(q)) * .5, k = t - .24, shake = k > 0 && k < .3 ? Math.sin(k * 80) * 6 * Math.exp(-k * 14) : 0;
    g.attr('transform', `translate(${props.x + shake} ${props.y}) rotate(${props.tilt}) scale(${Math.max(.0001, s)})`).attr('opacity', (t < .1 ? 0 : .35 + .65 * q) * (props.life ? 1 - flickerOn(t, props.life - .22, .2, 2) : 1));
  }};
}
