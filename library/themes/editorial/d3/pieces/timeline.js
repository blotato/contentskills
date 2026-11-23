import {card, grow, fade, fig, dot, box, text, wrap, F} from './_card.js';

// Moments along one thick line that draws left to right: a filled dot each, the date in mono above, what happened
// in the serif below (wrapped), and the moment that matters (the last by default) in the accent.
// Props: title, unit, items [{when, label}] (3-5), highlight (index), note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'From idea to *posted*', unit: 'Illustrative · one working day', note: 'Illustrative data', index: '05', field: 'paper', clear: false, highlight: null,
  items: [{when: '09:00', label: 'Record one take'}, {when: '09:20', label: 'Cut the pauses'}, {when: '10:05', label: 'Add the graphics'}, {when: '11:30', label: 'Post the reel'}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, items = props.items, n = items.length, hi = props.highlight ?? n - 1;
  const col = pg.w / n, y = (pg.y0 + pg.y1) / 2 - 70, size = n > 4 ? 48 : 62, xs = items.map((_, i) => pg.x0 + 20 + i * col);
  const track = box(g, pg.x0, y - 5, 0, 10, ink.fg);
  const stops = items.map((d, i) => {
    const hot = i === hi, c = hot ? ink.accent : ink.fg, grp = g.append('g');
    fig(grp, xs[i] - 20, y - 62, d.when, {size: n > 4 ? 38 : 46, color: c, weight: 500});
    wrap(d.label, size, col - 26).slice(0, 4).forEach((ln, k) => text(grp, xs[i] - 20, y + 110 + k * size * 1.04, ln, {font: hot ? F.italic : F.head, size, color: c}));
    return {grp, mark: dot(g, xs[i], y, 0, c), hot};
  });
  return {seek(t) {
    pg.seek(t); const q = grow(t, pg.T, .6); track.attr('width', pg.w * q);
    stops.forEach((s, i) => {
      const at = pg.T + .08 + .5 * i / n, a = fade(t, at, .3);
      s.mark.attr('r', (s.hot ? 26 : 20) * grow(t, at, .3)); s.grp.attr('opacity', a).attr('transform', `translate(0 ${((1 - a) * 14).toFixed(1)})`);
    });
  }};
}
