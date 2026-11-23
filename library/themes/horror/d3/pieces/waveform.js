import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// A recording played back: a waveform of thin bars with a playhead crossing it, a quiet stretch,
// and one burst of sound (`mark` 0..1 along the tape) that is ringed and labelled in rose.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'The recording', unit: 'Audio level · illustrative', length: '1:12', mark: .62, markLabel: 'A SECOND VOICE', bars: 84, seed: 4};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, n = props.bars, cy = 540, H = 250, bw = BOX.w / n, m = props.mark;
  const level = i => { const u = i / n, near = Math.exp(-(((u - m) / .035) ** 2)); return clamp(.05 + .1 * hash(i, props.seed) + (u < .3 ? .35 * hash(i, props.seed + 1) * Math.sin(u / .3 * Math.PI) : 0) + near * (.6 + .4 * hash(i, props.seed + 2))); };
  hair(g, `M${BOX.x0} ${cy}H${BOX.x1}`, C.bone, 1, .3); const bars = Array.from({length: n}, (_, i) => ({v: level(i), hot: Math.abs(i / n - m) < .05, node: g.append('rect').attr('x', BOX.x0 + i * bw + bw * .2).attr('width', bw * .6)}));
  const head = hair(g, `M0 ${cy - H - 20}V${cy + H + 20}`, C.bone, 3, .9), code = txt(g, BOX.x0, BOX.y1, '', {size: 44, font: F.vhs, weight: 400, spacing: .06}), total = txt(g, BOX.x1, BOX.y1, props.length, {size: 44, font: F.vhs, weight: 400, spacing: .06, anchor: 'end', color: C.fog});
  const mx = BOX.x0 + m * BOX.w, box = hair(g, roughBox(mx - 62, cy - H - 10, 124, H * 2 + 20, 3, 2), C.rose, 3, .95), label = txt(g, mx, cy - H - 30, up(props.markLabel), {size: 30, font: F.head, weight: 400, color: C.rose, spacing: .2, anchor: m > .6 ? 'end' : 'middle'}), [mi, se] = String(props.length).split(':').map(Number);
  return {seek(t) {
    c.head(t); const q = span(t, .8, 3.6), x = BOX.x0 + q * BOX.w, sec = q * (mi * 60 + se); head.attr('transform', `translate(${x} 0)`).attr('opacity', t > .8 ? .9 : 0); code.text(`${Math.floor(sec / 60)}:${pad(sec % 60)}`);
    bars.forEach((b, i) => { const played = i / n <= q, h = Math.max(3, b.v * H * (played ? 1 + (Math.abs(i / n - q) < .03 ? .25 * hash(step(t, 20), i) : 0) : .5)); b.node.attr('y', cy - h).attr('height', h * 2).attr('fill', b.hot && played ? C.rose : C.bone).attr('opacity', (played ? .95 : .25) * flickerOn(t, .4 + i * .004, .2, i)); });
    const on = flickerOn(t, .8 + 3.6 * m + .1, .3, 2); box.attr('opacity', on * .95); label.attr('opacity', on);
  }};
}
