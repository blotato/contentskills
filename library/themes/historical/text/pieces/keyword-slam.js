import {C, stage, tone, fillOf, inkOn, up, oneLine, fit, capH, glyphs, arrive, brush, torn, bar, span, settle, leave, presence} from '../../kit.js';

// One word across the picture: a dry brush stroke drags across the frame, a solid band settles
// under it and the letters arrive on it one after another, tall and close-set. A typed kicker sits
// on a dark strip above. `y` is the band's centre.
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'FORGOTTEN', kicker: 'A word for the record', y: 330, color: 'bone', band: 'crimson', tilt: -1.5};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, word = up(props.word), fill = tone(props.band ?? props.color), o = {weight: 700, spacing: .03};
  const size = fit(word, 900, 230, o), cap = capH(size, o), bh = cap + 84, g = root.append('g'), tilt = g.append('g'), bandG = tilt.append('g');
  const stroke = brush(bandG, -W / 2 - 40, -bh * .62, W + 80, bh * 1.24, {seed: 6, color: fill === 'crimson' ? C.blood : fillOf(fill), opacity: .9, bands: 9});
  const band = bandG.append('path').attr('d', torn(-W / 2 - 60, -bh / 2, W + 120, bh, {seed: 4, rough: 5, step: 22, sides: 'tb'})).attr('fill', fillOf(fill));
  const letters = glyphs(tilt, word, 0, cap / 2, size, {anchor: 'middle', color: inkOn(fill), ...o});
  const kick = props.kicker ? bar(g, oneLine(props.kicker), {size: 36, fill: 'glass', seed: 2, spacing: .1}) : null;
  return {seek(t) {
    const x = leave(t, props.life); root.attr('opacity', presence(t, props.life)); g.attr('transform', `translate(${W / 2} ${props.y + 34 * x})`);
    tilt.attr('transform', `rotate(${props.tilt}) scale(${1 + .012 * t})`); stroke.reveal(settle(span(t, 0, .6)));
    band.attr('opacity', span(t, .2, .4)).attr('transform', `scale(1 ${.6 + .4 * settle(span(t, .2, .6))})`);
    letters.forEach(u => arrive(u, span(t, .35 + u.i * .04, .7), 0, {from: 1.25, rise: 20}));
    kick?.g.attr('transform', `translate(${-W / 2 + 70 + 4 * t} ${-bh / 2 - kick.h / 2 - 18})`); kick?.reveal(span(t, .7, .8));
  }};
}
