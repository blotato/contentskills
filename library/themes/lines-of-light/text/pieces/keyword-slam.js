import {C, stage, up, span, ease, io, light, flash, fire, title, fit, capH, pool, leave} from '../../kit.js';

// One word over the footage. A red dot at the left fires a line across above the word; a second
// line opens below it from the centre, and the word lands between them (orange, red, white) in a
// blue flash. Leaving, the lines retract and the word dims. `y` is the word's centre.
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'UNSTOPPABLE', kicker: 'WORD OF THE DAY', y: 330, tilt: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, word = up(props.word), y = props.y ?? 330, o = {track: .22};
  const size = fit(word, 880, 150, o), cap = capH(size), m = 90, ya = y - cap / 2 - 44, yb = y + cap / 2 + 44;
  root.attr('transform', `rotate(${props.tilt ?? 0} ${W / 2} ${y})`);
  const shade = pool(root, W / 2, y, 620, cap + 170, 1);
  const shot = fire(root, [[m, ya], [W - m, ya]], {dur: .55, hold: 99, r: 11});
  const below = [light(root, [[W / 2, yb], [m, yb]], {width: 2.6}), light(root, [[W / 2, yb], [W - m, yb]], {width: 2.6})];
  const text = title(root, word, W / 2, y + cap / 2, size, {...o, halo: 6});
  const kick = props.kicker ? title(root, up(props.kicker), W / 2, ya - 30, 24, {land: false, color: C.core, track: .45, halo: 5}) : null;
  const blue = flash(root, W / 2, y, {color: 'blue', r: 360});
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, .55)));
    below.forEach(l => l.range(tail, io(span(t, .35, .8))));
    text.show(ease(span(t, .45, .9)), 1 - x); kick?.show(ease(span(t, .7, .6)), .85 * (1 - x));
    blue.set(t > 1.2 ? .45 * (1 - ease((t - 1.2) / 1)) * (1 - x) : 0);
    root.attr('opacity', 1 - x * x);
  }};
}
