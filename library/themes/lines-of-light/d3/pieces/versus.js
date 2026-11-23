import {card, C, up, span, ease, io, light, ring, flash, mono, title, fit, arcPts, along, dot, strike} from './_card.js';

// Two dials side by side: the left (the cause, the before) fills in red, a red pulse runs across to
// the right one, which opens on its arrival and fills in white light, landing with a blue flash.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'Before and after', unit: 'Share of viewers who stayed', clear: false, max: 100,
  left: {label: 'Before', value: 23, suffix: '%'}, right: {label: 'After', value: 61, suffix: '%'}};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, cy = 560, R = 150, max = props.max || Math.max(props.left?.value ?? 1, props.right?.value ?? 1);
  const side = (d, cx, red, at) => {
    const share = Math.max(.01, Math.min(1, (d?.value ?? 0) / max)), pts = arcPts(cx, cy, R, -90, -90 + 360 * share);
    const track = ring(root, cx, cy, R, {from: red ? 0 : 180, width: 1.2, color: C.mute, echo: false, halo: false, opacity: .6});
    const arc = light(root, pts, red ? {width: 3.2, color: 'red', echo: false} : {width: 3.2}), str = (d?.prefix ?? '') + (d?.value ?? '') + (d?.suffix ?? '');
    const num = title(root, str, cx, cy + 20, Math.min(58, fit(str, R * 1.4, 58, {track: .08})), {track: .08});
    const lab = mono(root, cx, cy + R + 62, up(d?.label ?? ''), {size: 22, anchor: 'middle', color: C.dim, track: .26, opacity: 0, halo: c.clear ? 4 : 0});
    return {pts, track, arc, num, lab, at, end: pts.at(-1)};
  };
  const L = side(props.left, 270, true, T + .1), Rt = side(props.right, 730, false, T + 2.1);
  const bridge = light(root, [[270 + R + 16, cy], [730 - R - 16, cy]], {width: 2, color: 'red', echo: false}), chev = light(root, [[730 - R - 34, cy - 14], [730 - R - 18, cy], [730 - R - 34, cy + 14]], {width: 2});
  const head = dot(root, 0, 0, {color: 'red', r: 8}), tip = dot(root, 0, 0, {color: 'red', r: 7}), blue = flash(root, Rt.end[0], Rt.end[1], {color: 'blue', r: 170}), BR = [T + 1.4, .8];
  return {seek(t) {
    c.seek(t);
    for (const s of [L, Rt]) { s.track.draw(ease(span(t, s.at - .3, 1))); const q = io(span(t, s.at, 1.6)); s.arc.draw(q); s.num.show(ease(span(t, s.at + .4, 1.3))); s.lab.attr('opacity', .9 * ease(span(t, s.at + .3, .6))); s.q = q; }
    const lq = L.q; if (lq > 0 && lq < 1) { const [x, y] = along(L.pts, lq); tip.at(x, y).set(1); } else tip.set(0);
    const b = ease(span(t, BR[0], BR[1])); bridge.range(b > .999 ? ease(span(t, BR[0] + BR[1] + .2, .8)) * .999 : 0, b); chev.draw(ease(span(t, BR[0] + BR[1] - .1, .4)));
    const rq = Rt.q; if (rq > 0 && rq < 1) { const [x, y] = along(Rt.pts, rq); head.at(x, y).set(1); } else head.set(0);
    const u = t - Rt.at - 1.6; blue.set(u > 0 ? .3 + .6 * Math.exp(-u * 1.5) : 0, 1 + .3 * ease(u));
  }};
}
