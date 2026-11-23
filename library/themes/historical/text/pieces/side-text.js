import {C, stage, tone, fillOf, inkOn, up, fit, capH, glyphs, arrive, torn, brush, bar, span, settle, leave, presence} from '../../kit.js';

// A spine label running up one edge of the picture, like the title on a ledger's spine: a torn
// charcoal strip with the text reading along the edge, a brush stroke of colour along its inner
// side and a small bar at its end. `top` and `bottom` set how far it runs.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'FROM THE ARCHIVE', sub: 'PART 02 / UNCUT', side: 'left', color: 'bone', band: 'char', top: 300, bottom: 1560, edge: 36};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, len = props.bottom - props.top, left = props.side !== 'right', text = up(props.text), band = tone(props.band ?? 'char'), o = {weight: 700, spacing: .08};
  const size = fit(text, len - 160, 78, o), cap = capH(size, o), bw = cap + 60;
  // Local x runs along the edge (upward on the left, downward on the right); local y runs into the frame.
  const g = root.append('g').attr('transform', left ? `translate(${props.edge} ${props.bottom}) rotate(-90)` : `translate(${W - props.edge} ${props.top}) rotate(90)`), inner = g.append('g');
  const strip = inner.append('path').attr('d', torn(0, 0, len, bw, {seed: 5, rough: 5, step: 22})).attr('fill', fillOf(band)).attr('opacity', band === 'char' ? .92 : 1);
  const stroke = brush(inner, 10, bw - 4, len * .7, 16, {seed: 2, color: band === 'crimson' ? C.bone : C.crimson});
  const letters = glyphs(inner, text, len / 2, bw / 2 + cap / 2, size, {anchor: 'middle', color: inkOn(band), ...o}), sub = props.sub ? bar(g, props.sub, {size: 30, fill: band === 'crimson' ? 'char' : 'crimson', seed: 3, spacing: .08}) : null;
  sub?.g.attr('transform', `translate(${len - sub.w - 26} ${bw + sub.h / 2 + 16})`);
  return {seek(t) {
    const x = leave(t, props.life), e = settle(span(t, 0, .8)); root.attr('opacity', presence(t, props.life));
    inner.attr('transform', `translate(${3 * t} ${-20 * (1 - e) - 20 * x})`); strip.attr('opacity', (band === 'char' ? .92 : 1) * span(t, 0, .4)); stroke.reveal(settle(span(t, .3, .8)));
    letters.forEach(u => arrive(u, span(t, .3 + u.i * .035, .6), 0, {from: 1.12, rise: 12})); sub?.reveal(span(t, .9, .8));
  }};
}
