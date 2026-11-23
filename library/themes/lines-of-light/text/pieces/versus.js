import {C, stage, up, span, ease, io, light, ring, flash, pulse, fire, title, mono, fit, capH, cornerLabels, origin} from '../../kit.js';

// Two sides split by a diagonal line of light. The red dot fires into the diagonal's left end and it
// draws across; where it passes the middle a ring opens round the mark (VS). The first side lands
// above; a red pulse runs the diagonal and the second side lands below in a blue flash.
export const meta = {duration: 5.5, live: true};
export const defaults = {a: 'FAST', b: 'PERFECT', mark: 'VS', aNote: 'SHIPS TODAY', bNote: 'SHIPS SOMEDAY', labels: ['', 'PICK A SIDE', '', 'NO TIES'], field: 'teal'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .5]}), {root, W, H, k} = st, m = 80, cy = H * .5, slant = 90 * k + 40, r = 64 + 30 * k, o = {track: .24};
  const A = up(props.a), B = up(props.b), size = Math.min(fit([A, B], W - m * 2, 150, o), H * .11), cap = capH(size), [ox, oy] = origin(st);
  const p0 = [m * .5, cy + slant], p1 = [W - m * .5, cy - slant], shot = fire(root, [[ox, oy], [ox, p0[1]], p0], {dur: 1.1, hold: 1.4});
  const diag = light(root, [p0, p1], {width: 2.8}), circle = ring(root, W / 2, cy, r, {from: 180 + Math.atan2(slant, W / 2) * 57.3, width: 2.6});
  const run = pulse(root, diag), blue = flash(root, W / 2, cy + H * .26, {color: 'blue', r: 280});
  const msize = fit(up(props.mark), r * 1.1, r * .55, {track: .1}), mark = title(root, up(props.mark), W / 2, cy + capH(msize) / 2, msize, {track: .1});
  const ya = cy - H * .22, yb = cy + H * .26, ta = title(root, A, W / 2, ya, size, o), tb = title(root, B, W / 2, yb, size, o);
  const na = props.aNote ? mono(root, W / 2, ya + 60 + 10 * k, up(props.aNote), {size: 22 + 6 * k, anchor: 'middle', track: .18, opacity: 0}) : null;
  const nb = props.bNote ? mono(root, W / 2, yb + 60 + 10 * k, up(props.bNote), {size: 22 + 6 * k, anchor: 'middle', track: .18, opacity: 0}) : null;
  const corners = cornerLabels(st, props.labels), T = shot.arrive, P = T + 1.9, hit = P + 1.1;
  return {seek(t) {
    st.tick(t); shot.seek(t);
    const q = io(span(t, T, 1.6)); diag.range(0, q); circle.draw(io(span(t, T + .6, 1.1))); mark.show(ease(span(t, T + 1, 1)));
    ta.show(ease(span(t, T + .5, 1.1))); na?.attr('opacity', .85 * ease(span(t, T + 1.2, .8)));
    run(span(t, P, 1.1)); blue.set(t > hit ? .55 * (1 - ease((t - hit) / 1.2)) : 0);
    tb.show(ease(span(t, hit - .1, 1.1))); nb?.attr('opacity', .85 * ease(span(t, hit + .5, .8))); corners(t, T);
  }};
}
