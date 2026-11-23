import {C, up, fit, burst, balloon, plate, zoomLinesPath, measure, capH, txt, scaleTo, span, spring, easeOut} from '../../kit.js';
import {card, shout, counted} from './_card.js';

// One number that matters: zoom lines rush in, a two-colour burst pops, and the number counts up
// inside it, landing with a bump. A slab underneath says what it counts and a balloon adds the aside.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'The number', unit: 'Illustrative · hours saved a week', value: 12, prefix: '', suffix: 'H', label: 'Back in your week', note: 'Every single week!', color: C.red, clear: false};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root, under, defs, id} = stage, cx = 500, cy = 560, final = `${props.prefix ?? ''}${props.value}${props.suffix ?? ''}`;
  defs.append('clipPath').attr('id', id + '-in').append('rect').attr('x', 34).attr('y', 34).attr('width', 932).attr('height', 932);
  const rays = under.append('g').attr('clip-path', `url(#${id}-in)`).append('path').attr('d', zoomLinesPath(cx, cy, 300, 900, {n: 54, seed: 4, thick: 1.3})).attr('fill', C.ink).attr('opacity', .5);
  const star = burst(root.append('g').attr('transform', `translate(${cx} ${cy})`), 330, {fill: C.yellow, inner: C.white, points: 15, squash: .8, seed: 7});
  const size = fit(final, 440, 250), holder = root.append('g').attr('transform', `translate(${cx} ${cy + capH(size) / 2})`).append('g'), number = shout(holder, -6, 0, '', {size, color: props.color ?? C.red});
  const text = up(props.label), o = {role: 'slab'}, ls = fit(text, 640, 58, o), lw = measure(text, ls, o) + 90, lh = capH(ls, o) + 50;
  const tag = root.append('g').attr('transform', `translate(${cx} 848)`).append('g'); plate(tag, {fill: C.blue, cut: 30}).box(-lw / 2, -lh / 2, lw, lh); txt(tag, -6, capH(ls, o) / 2, text, {size: ls, role: 'slab', color: C.white, anchor: 'middle'});
  const aside = props.note ? balloon(root, 770, 300, props.note, {size: 30, width: 330, tx: -150, ty: 130}) : null;
  return {seek(t) {
    stage.intro(t);
    rays.attr('transform', `translate(${cx} ${cy}) scale(${2.6 - 1.6 * easeOut(span(t, .25, .4)) + .012 * Math.sin(t * 9)}) translate(${-cx} ${-cy})`).attr('opacity', .5 * span(t, .25, .1));
    star.boil(t); scaleTo(star.g, spring(span(t, .4, .5)), -5 + Math.sin(t * 1.4) * 2);
    const q = span(t, .6, 1.1), land = span(t, 1.7, .4);
    number.say(`${props.prefix ?? ''}${counted(props.value, easeOut(q))}${props.suffix ?? ''}`); scaleTo(holder, q > 0 ? (.8 + .2 * easeOut(span(t, .6, .2))) * (1 + .22 * Math.sin(land * Math.PI) * (1 - land)) : 0, -3);
    scaleTo(tag, spring(span(t, 1.8, .45)), -2); if (aside) scaleTo(aside.g, spring(span(t, 2.2, .45)), Math.sin(t * 2) * 1.5);
  }};
}
