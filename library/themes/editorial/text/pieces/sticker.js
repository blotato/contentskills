import {C, F, stage, g, text, fit, measure, up, span, glide, ease, leave} from '../../kit.js';
import {sc} from './_local.js';

// A printed seal: a round paper disc (solid: true = wine) with two hairline rings, the `ring` text set in tracked
// capitals around the circle and turning very slowly, and one word in serif italic at the centre. It settles into
// place with a small turn and fades away. Props: text, ring, x, y (centre), r, tilt, solid.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'New', ring: 'Fresh this week', x: 836, y: 424, r: 150, tilt: -8, solid: false};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), r = Math.max(110, props.r ?? 150), solid = !!props.solid, bg = solid ? C.wine : C.paper, fg = solid ? C.paper : C.ink, acc = solid ? C.blush : C.wine;
  const x = Math.min(1010 - r, Math.max(70 + r, props.x ?? 836)), y = Math.max(250 + r, props.y ?? 424), seal = g(st), k = r / 150;
  seal.append('circle').attr('r', r).attr('fill', bg).attr('filter', st.url('lift'));
  for (const [rr, sw, op] of [[r - 9, 2, 1], [r - 58 * k, 1.5, .55]]) seal.append('circle').attr('r', rr).attr('fill', 'none').attr('stroke', fg).attr('stroke-width', sw).attr('stroke-opacity', op);
  const fs = Math.max(28, 28 * k), R = r - 9 - (58 * k - 9) / 2 - fs * .36, circ = 2 * Math.PI * R, unit = `${up(props.ring ?? '')} · `, o = {font: F.sans, weight: 600}, uw = measure(unit, fs, o);
  const reps = Math.max(1, Math.round(circ / (uw + unit.length * fs * .16))), str = unit.repeat(reps), sp = (circ - uw * reps) / str.length, pid = st.uid('ring'), turn = seal.append('g');
  st.defs.append('path').attr('id', pid).attr('d', `M0 ${-R}A${R} ${R} 0 1 1 0 ${R}A${R} ${R} 0 1 1 0 ${-R}`);
  if (props.ring) turn.append('text').attr('fill', fg).style('font', `600 ${fs}px ${F.sans}`).style('letter-spacing', `${sp.toFixed(2)}px`).attr('xml:space', 'preserve').append('textPath').attr('href', `#${pid}`).text(str);
  const word = sc(props.text).replace(/\*/g, ''), inner = (r - 58 * k) * 2 - 44 * k, ws = fit(word, inner, r * .92, {font: F.italic});
  text(seal, 0, ws * .27, word, {font: F.italic, size: ws, color: acc, anchor: 'middle'});
  const life = props.life ?? meta.duration, tilt = props.tilt ?? -8;
  return {seek(t) {
    const a = glide(span(t, 0, .5)), q = ease(leave(t, life, .28)), s = .9 + .1 * a - .05 * q;
    seal.attr('transform', `translate(${x} ${y}) rotate(${(tilt - (1 - a) * 14).toFixed(2)}) scale(${s.toFixed(4)})`).attr('opacity', ease(span(t, 0, .3)) * (1 - q));
    turn.attr('transform', `rotate(${(t * 5 - (1 - a) * 30).toFixed(2)})`);
  }};
}
