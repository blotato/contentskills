import {C, F, stage, sheet, tape, txt, fit, capH, torn, tone, fillOf, span, settle, hash} from '../../kit.js';
import {live, float} from './_overlay.js';

// A rectangular rubber stamp struck onto a paper slip taped to the picture: the slip slides in, the
// stamp lands large and faint and presses to exact, a little uneven. For a verdict or a status.
// (x, y) is the centre of the slip.
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'VERIFIED', line: 'CHECKED AGAINST THE RECORD', x: 800, y: 330, w: 440, tilt: -7, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), w = props.w, h = w * .56, ink = fillOf(tone(props.color)) === C.bone ? C.crimson : fillOf(tone(props.color));
  const slip = g.append('g'); sheet(slip, -w / 2, -h / 2, w, h, {fill: C.bone, seed: 5, rough: 6, wear: .3}); tape(slip, 130, 40, {seed: 2}).attr('transform', `translate(${-w * .22} ${-h / 2 + 2}) rotate(-6)`);
  const mark = slip.append('g'), bw = w * .8, bh = h * .62, o = {weight: 700, spacing: .06}, size = fit(String(props.word).toUpperCase(), bw - 50, bh * .6, o), cap = capH(size, o);
  mark.append('path').attr('d', torn(-bw / 2, -bh / 2, bw, bh, {seed: 8, rough: 2, step: 14})).attr('fill', 'none').attr('stroke', ink).attr('stroke-width', 8).attr('stroke-dasharray', `${bw * .9} 6 ${bw * .4} 4`);
  mark.append('path').attr('d', torn(-bw / 2 + 14, -bh / 2 + 14, bw - 28, bh - 28, {seed: 9, rough: 1.5, step: 14})).attr('fill', 'none').attr('stroke', ink).attr('stroke-width', 2.5);
  txt(mark, 0, cap / 2 - (props.line ? bh * .08 : 0), String(props.word).toUpperCase(), {size, anchor: 'middle', color: ink, ...o});
  if (props.line) { const ls = fit(props.line, bw - 60, 22, {font: F.type, weight: 400, spacing: .08}); txt(mark, 0, bh / 2 - 26, props.line, {size: ls, font: F.type, weight: 400, anchor: 'middle', color: ink, spacing: .08}); }
  return {seek(t) {
    const x = live(st, t, props), e = settle(span(t, 0, .8)), q = span(t, .7, .2);
    g.attr('transform', float(t, x, props.x, props.y, {dx: -3})); slip.attr('transform', `translate(0 ${22 * (1 - e)}) rotate(${props.tilt + .15 * t})`).attr('opacity', span(t, 0, .4));
    mark.attr('transform', `rotate(${-4 + (1 - settle(q)) * 3}) scale(${1.55 - .55 * settle(q)})`).attr('opacity', .9 * Math.min(1, q * 3));
  }};
}
