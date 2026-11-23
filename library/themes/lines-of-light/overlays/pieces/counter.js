import {C, stage, up, span, ease, io, comma, light, flash, fire, title, mono, fit, capH, pool, leave} from '../../kit.js';

// A number that counts up over the footage. A red dot fires a line under where the figure will
// sit; it opens both ways, the digits count up while they land (orange, red, white) and a blue
// flash marks the final value. A tracked kicker above, a label below. `y` is the figure's centre.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 100, prefix: '', suffix: '%', kicker: 'ON TIME', label: 'POSTS PUBLISHED', y: 400, seconds: 1.4, decimals: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, y = props.y ?? 400, num = Number(props.value), isNum = Number.isFinite(num), dec = props.decimals ?? 0;
  const fmt = v => `${props.prefix ?? ''}${isNum ? (dec ? v.toFixed(dec) : comma(v)) : props.value}${props.suffix ?? ''}`, o = {track: .1};
  const size = Math.min(170, fit(fmt(isNum ? num : 0), 760, 170, o)), cap = capH(size), uy = y + cap / 2 + 40;
  const shade = pool(root, W / 2, y + 30, 560, cap / 2 + 220, 0);
  const shot = fire(root, [[150, uy], [W / 2, uy]], {dur: .5, hold: 99, r: 11}), under = light(root, [[W / 2, uy], [W - 150, uy]], {width: 2.6});
  const fig = title(root, fmt(isNum ? num : 0), W / 2, y + cap / 2, size, {...o, halo: 6});
  const kick = props.kicker ? title(root, up(props.kicker), W / 2, y - cap / 2 - 40, 26, {land: false, color: C.core, track: .45, halo: 5}) : null;
  const label = props.label ? mono(root, W / 2, uy + 64, up(props.label), {size: 30, anchor: 'middle', track: .14, opacity: 0, halo: 5, weight: 500}) : null;
  const blue = flash(root, W / 2, y, {color: 'blue', r: 320}), secs = props.seconds ?? 1.4;
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, .5))); under.range(tail, io(span(t, .45, .8)));
    const q = io(span(t, .4, secs)), v = isNum ? num * q : 0, s = fmt(dec ? v : Math.round(v)); fig.node.text(s); fig.glow.text(s); fig.show(ease(span(t, .4, secs + .3)), 1 - x);
    kick?.show(ease(span(t, .3, .6)), .9 * (1 - x)); const end = .4 + secs; blue.set(t > end ? .5 * (1 - ease((t - end) / 1)) * (1 - x) : 0);
    label?.attr('opacity', .9 * ease(span(t, end - .2, .6)) * (1 - x));
  }};
}
