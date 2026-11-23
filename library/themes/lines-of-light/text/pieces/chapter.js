import {C, stage, up, oneLine, span, ease, io, light, ring, flash, fire, title, mono, fit, capH, cornerLabels, origin} from '../../kit.js';

// A chapter marker on a track of light. The red dot fires into the track, which draws across past
// a row of stops; each stop's ring opens as the light reaches it, and the current chapter's stop
// flashes blue. Then the chapter number lands large, with the kicker above and the title below.
export const meta = {duration: 5, live: true};
export const defaults = {number: '02', kicker: 'CHAPTER', title: 'THE BUILD', note: 'WHERE THE IDEA\nBECOMES A THING', labels: ['', 'KEEP WATCHING', '', 'PT. 02'], stops: 5, field: 'teal'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .5]}), {root, W, H, k} = st, m = 120, number = String(props.number ?? ''), n = Math.max(2, props.stops ?? 5);
  const cur = Math.min(n - 1, Math.max(0, (parseInt(number, 10) || 2) - 1)), ty = H * (st.sq ? .2 : .26), xs = Array.from({length: n}, (_, i) => m + (W - m * 2) * i / (n - 1)), [ox, oy] = origin(st);
  const shot = fire(root, [[ox, oy], [ox, ty], [m - 50, ty]], {dur: 1, hold: 1.2}), track = light(root, [[m - 50, ty], [W - m + 50, ty]], {width: 2.2});
  const stops = xs.map((x, i) => ({x, q: (x - m + 50) / (W - m * 2 + 100), ring: ring(root, x, ty, i === cur ? 22 : 12, {from: 180, width: i === cur ? 2.8 : 1.8, echo: i === cur})}));
  const blue = flash(root, xs[cur], ty, {color: 'blue', r: 160});
  const nsize = Math.min(fit(number, W * .6, 300, {track: .1}), H * .17), ncap = capH(nsize), ny = ty + 120 + 60 * k + ncap + 40;
  const kick = title(root, up(props.kicker), W / 2, ny - ncap - 56, 26 + 6 * k, {land: false, color: C.dim, track: .5}), num = title(root, number, W / 2, ny, nsize, {track: .1});
  const tl = up(oneLine(props.title)), tsize = Math.min(64, fit(tl, W - m * 2 + 40, 64, {track: .3})), name = title(root, tl, W / 2, ny + 80 + 30 * k + capH(tsize), tsize, {track: .3});
  const under = [light(root, [[W / 2, ny + 50 + 10 * k], [W / 2 - 90, ny + 50 + 10 * k]], {width: 2.2}), light(root, [[W / 2, ny + 50 + 10 * k], [W / 2 + 90, ny + 50 + 10 * k]], {width: 2.2})];
  const note = props.note ? mono(root, W / 2, ny + 160 + 60 * k + capH(tsize), up(props.note), {size: 22 + 6 * k, anchor: 'middle', track: .14, opacity: 0, leading: 1.7}) : null;
  const corners = cornerLabels(st, props.labels), T = shot.arrive, D = 1.8, hit = T + D * stops[cur].q;
  return {seek(t) {
    st.tick(t); shot.seek(t); const q = io(span(t, T, D)); track.draw(q);
    stops.forEach((s, i) => s.ring.draw(ease(span(t, T + D * s.q - .05, .6))).opacity(i === cur ? 1 : i < cur ? .9 : .5));
    blue.set(t > hit ? .65 * (1 - ease((t - hit) / 1.2)) : 0);
    kick.show(ease(span(t, hit, .8)), .9); num.show(ease(span(t, hit + .1, 1.2))); under.forEach(l => l.draw(io(span(t, hit + .6, .9))));
    name.show(ease(span(t, hit + .8, 1.1))); note?.attr('opacity', .85 * ease(span(t, hit + 1.4, .8))); corners(t, T);
  }};
}
