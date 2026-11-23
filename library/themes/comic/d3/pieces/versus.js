import {C, up, fit, burst, captionBox, scaleTo, span, spring, easeOut, vel} from '../../kit.js';
import {card, toned, shout, counted} from './_card.js';

// Two sides square up: a red panel whips in from the left and a blue one from the right, their
// numbers count up, and a VS burst pops on the seam. The bigger number gets the bigger lettering.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Short vs long', unit: 'Illustrative · average views, thousands', mark: 'VS', clear: false, colors: [C.red, C.blue],
  a: {label: 'Shorts', value: 84, suffix: 'K', note: 'Quick reach'}, b: {label: 'Long form', value: 31, suffix: 'K', note: 'Deeper watch'}};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, top = 262, bot = 925, win = props.a.value >= props.b.value ? 0 : 1;
  const sides = [props.a, props.b].map((d, i) => {
    const g = root.append('g'), cx = i ? 720 : 280, shape = i ? `M560 ${top + 6}L928 ${top}L932 ${bot}L470 ${bot - 6}Z` : `M70 ${top}L530 ${top + 4}L440 ${bot}L74 ${bot - 4}Z`;
    toned(stage, g, {fill: props.colors[i], area: [i ? 460 : 60, top - 10, 480, bot - top + 20], from: [i ? 1 : 0, 1], reach: .75, pitch: 26, dotOpacity: .22}).set(shape);
    const name = up(d.label), ns = fit(name, 330, 76); shout(g, cx + (i ? 20 : -20), top + 110, name, {size: ns, color: C.white});
    const note = captionBox(g, cx + (i ? 30 : -40), bot - 130, d.note, {size: 28, anchor: 'middle', fill: i === win ? C.yellow : C.white, tilt: i ? 2 : -2});
    return {d, i, g, note, value: shout(g, cx + (i ? 25 : -30), top + 370, '', {size: Math.min(i === win ? 190 : 140, fit(String(d.value) + (d.suffix ?? ''), 330, 190)), color: C.yellow})};
  });
  const vs = burst(root.append('g').attr('transform', `translate(500 ${(top + bot) / 2 + 20})`), 128, {fill: C.yellow, inner: C.white, points: 12, seed: 5}), mark = shout(vs.g, -4, 30, up(props.mark), {size: 86, color: C.red});
  return {seek(t) {
    stage.intro(t);
    sides.forEach(({d, i, g, note, value}) => {
      const q = span(t, .4 + i * .15, .5), e = easeOut(q), dir = i ? 1 : -1;
      g.attr('transform', `translate(${dir * 700 * (1 - e)} 0) skewX(${dir * vel(q) * 8})`).attr('opacity', q > 0 ? 1 : 0);
      const c = span(t, .9 + i * .15, .9); value.say(counted(d.value, easeOut(c)) + (d.suffix ?? ''));
      value.attr('transform', i === win && c >= 1 ? `translate(0 ${Math.sin(t * 4) * 4})` : null);
      scaleTo(note.g, spring(span(t, 1.7 + i * .2, .4)), 0);
    });
    vs.boil(t); scaleTo(vs.g, spring(span(t, 1.05, .5)), -8 + Math.sin(t * 2) * 3);
  }};
}
