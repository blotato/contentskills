import {C, F, stage, sheet, typed, txt, stamp, tape, greek, measure, fit, span, settle} from '../../kit.js';
import {live, INK} from './_overlay.js';

// A document from the file: a sheet of paper with a printed heading, lines that type themselves one
// after another, a signature written in pen and an archive stamp pressed on at the end. Use it for a
// letter, a telegram or a report. (x, y) is the centre of the sheet; set `hand: true` to write the
// lines in copperplate instead of typewriter.
export const meta = {duration: 6.5, live: true};
export const defaults = {
  heading: 'TELEGRAM', ref: 'COPY · ILLUSTRATIVE', lines: ['ARRIVED SAFELY STOP', 'WEATHER HOLDING STOP', 'SEND WORD WHEN YOU CAN'], sign: 'Yours, A.',
  stamp: 'RECEIVED', ring: 'ARCHIVE COPY', hand: false, x: 540, y: 350, w: 760, tilt: -1.6, step: 1.1,
};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), {w} = props, n = props.lines.length, font = props.hand ? F.script : F.type, pad = 54;
  const size = Math.min(props.hand ? 54 : 36, fit(props.lines, w - pad * 2, 60, {font, weight: 400, spacing: .02})), pitch = size * 1.55, h = 150 + n * pitch + (props.sign ? 96 : 30);
  const sh = sheet(g, -w / 2, -h / 2, w, h, {fill: C.bone, seed: 7, rough: 6, wear: .28}), p = sh.g.append('g').attr('clip-path', sh.clip), x0 = -w / 2 + pad, top = -h / 2;
  for (let i = 1; i < 3; i++) p.append('path').attr('d', `M${-w / 2} ${top + h * i / 3}h${w}`).attr('stroke', '#000').attr('stroke-width', 2).attr('opacity', .07);     // fold lines
  txt(p, x0, top + 70, props.heading, {size: 46, font: F.bold, weight: 700, color: INK, spacing: .12});
  txt(p, x0, h / 2 - 34, props.ref, {size: 20, font: F.type, color: INK, opacity: .7, spacing: .06});
  p.append('path').attr('d', `M${x0} ${top + 96}H${w / 2 - pad}M${x0} ${top + 103}H${w / 2 - pad}`).attr('stroke', INK).attr('stroke-width', 1.6).attr('opacity', .8);
  const lines = props.lines.map((l, i) => typed(p, x0, top + 150 + size * .4 + i * pitch, l, {size, font, color: INK, spacing: .02}));
  const sign = props.sign ? typed(p, w / 2 - pad - 20, h / 2 - 44, props.sign, {size: 64, font: F.script, color: '#1d2c4a', anchor: 'end', spacing: 0}) : null;
  tape(g, 150, 42, {seed: 4}).attr('transform', `translate(${-w * .3} ${top + 2}) rotate(-4)`);
  const st2 = props.stamp ? g.append('g').attr('transform', `translate(${w / 2 - 128} ${top + 108})`) : null, mark = st2 ? stamp(st2.append('g'), 84, {ring: props.ring, word: props.stamp}) : null;
  return {seek(t) {
    const x = live(st, t, props), e = settle(span(t, 0, 1)), end = .8 + n * props.step;
    g.attr('transform', `translate(${props.x + 3 * t} ${props.y + 40 * x + 26 * (1 - e)}) rotate(${props.tilt + .1 * t}) scale(${.97 + .03 * e + .004 * t})`);
    lines.forEach((l, i) => l.set(span(t, .8 + i * props.step, props.step * .85))); sign?.set(span(t, end, .8));
    if (mark) { const q = span(t, end + (sign ? .7 : 0), .22); mark.attr('transform', `rotate(-13) scale(${1.5 - .5 * settle(q)})`).attr('opacity', .88 * Math.min(1, q * 3)); }
  }};
}
