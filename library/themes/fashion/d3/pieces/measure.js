import {card, txt, label, stroke, cross, draw, fit, up, fade, glide, span} from '../../kit.js';
import {pace, hold, fmt} from './_local.js';

// A measured panel, drawn like a pattern piece: a hairline rectangle in the true proportion,
// a dimension line under it and one beside it (the accent hairline), figures in thin tall numerals.
// times: [outline, width, height].
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'The long line', unit: 'Illustrative · centimetres', clear: false, field: 'bone', accent: 'poppy', width: 48, height: 112, decimals: 0, prefix: '', suffix: '',
  labels: {width: 'Width', height: 'Length'}, speed: 1, times: null};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, k = pace(props), t0 = props.times?.[0] ?? .25 * k, t1 = props.times?.[1] ?? t0 + .35 * k, t2 = props.times?.[2] ?? t1 + .2 * k;
  const s = Math.min(430 / props.width, 440 / props.height), w = props.width * s, h = props.height * s, cx = 380, cy = 500, x = cx - w / 2, y = cy - h / 2;
  const box = stroke(g, `M${x} ${y}H${x + w}V${y + h}H${x}Z`, ink.line, 2), fold = stroke(g, `M${cx} ${y}V${y + h}`, ink.line, 1.5).attr('stroke-dasharray', '3 9'), mark = cross(g, cx, cy, 11, ink.line, 1.5);
  const wy = y + h + 44, hx = x + w + 44, dim = (d, color) => stroke(g, d, color, 1.5);
  const wl = dim(`M${cx} ${wy}H${x}M${cx} ${wy}H${x + w}`, ink.line), wt = dim(`M${x} ${wy - 9}V${wy + 9}M${x + w} ${wy - 9}V${wy + 9}`, ink.line);
  const hl = dim(`M${hx} ${cy}V${y}M${hx} ${cy}V${y + h}`, ink.accent).attr('stroke-width', 2), ht = dim(`M${hx - 9} ${y}H${hx + 9}M${hx - 9} ${y + h}H${hx + 9}`, ink.accent).attr('stroke-width', 2);
  const ws = fit(fmt(props.width, props), 260, 64, {role: 'num'}), wv = txt(g, cx, wy + 26 + ws * .78, '', {size: ws, role: 'num', color: ink.head, anchor: 'middle'}), wn = label(g, cx, wy + 26 + ws * .78 + 34, props.labels?.width ?? '', {size: 15, color: ink.dim, anchor: 'middle'});
  const room = 910 - hx - 36, hs = fit(fmt(props.height, props), room, 130, {role: 'num'}), hv = txt(g, hx + 34, cy + hs * .38, '', {size: hs, role: 'num', color: ink.head}), hn = label(g, hx + 36, cy + hs * .38 + 40, props.labels?.height ?? '', {size: Math.min(15, fit(up(props.labels?.height || ' '), room, 15, {role: 'label'})), color: ink.dim});
  return {seek(t) {
    hold(st, t);
    draw(box, glide(span(t, t0, 1.1 * k))); fold.attr('opacity', fade(t, t0 + .3 * k, .5 * k) * .5); mark.attr('opacity', fade(t, t0 + .3 * k, .5 * k));
    const a = glide(span(t, t1, .9 * k)), b = glide(span(t, t2, .9 * k));
    wl.attr('transform', `translate(${cx * (1 - a)} 0) scale(${a} 1)`).attr('opacity', a > 0 ? 1 : 0); wt.attr('opacity', fade(t, t1 + .2 * k, .3 * k));
    hl.attr('transform', `translate(0 ${cy * (1 - b)}) scale(1 ${b})`).attr('opacity', b > 0 ? 1 : 0); ht.attr('opacity', fade(t, t2 + .2 * k, .3 * k));
    wv.text(fmt(props.width * a, props)).attr('opacity', fade(t, t1, .4 * k)); wn.attr('opacity', fade(t, t1 + .15 * k, .4 * k));
    hv.text(fmt(props.height * b, props)).attr('opacity', fade(t, t2, .4 * k)); hn.attr('opacity', fade(t, t2 + .15 * k, .4 * k));
  }};
}
