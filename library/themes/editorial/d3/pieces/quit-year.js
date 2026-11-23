import {card, grow, fade, fig, box, text, tag, F, C} from './_card.js';

// A year of half-tries: one row per attempt across a 52-week year (month letters on top). Each attempt starts at its
// week, a thick accent bar grows for its few weeks, then stops dead with a struck ✕; the rest of every row stays an
// empty faint track. The empty space is the point: a year of switching leaves nothing running.
// Props: title, unit, tries [{label, start (week 0-51), weeks}], rowAt (s, first row), step (s between rows),
// growFor (s a bar takes to grow), quitAt (s after its row arrives that the ✕ lands), note, index, field, clear.
export const meta = {duration: 4.5};
export const defaults = {title: 'Six tries, *one* year', unit: 'Illustrative · one year', note: 'Illustrative', index: '06', field: 'paper', clear: false,
  rowAt: .3, step: .35, growFor: .3, quitAt: .45,
  tries: [0, 9, 18, 27, 36, 45].map((s, i) => ({label: `Try ${i + 1}`, start: s, weeks: 2}))};

const MONTHS = 'JFMAMJJASOND';

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, pg = card(el, p), {ink, body: g} = pg, tries = p.tries, n = tries.length;
  const lx = pg.x0, tx0 = pg.x0 + 150, tx1 = pg.x1, tw = tx1 - tx0, wk = tw / 52;
  const top = pg.y0 + 46, rowH = Math.min(96, (pg.y1 - top - 10) / n), barH = Math.min(46, rowH * .5);
  const months = [...MONTHS].map((m, i) => text(g, tx0 + (i + .5) * tw / 12, top - 8, m, {font: F.sans, size: 30, weight: 600, anchor: 'middle', color: ink.sub}).attr('opacity', 0));
  const rows = tries.map((d, i) => {
    const y = top + 18 + i * rowH, cy = y + rowH / 2;
    const name = fig(g, lx, cy + 12, d.label, {size: 32, color: ink.fg, weight: 500}).attr('opacity', 0);
    const track = box(g, tx0, cy - 3, 0, 6, ink.faint);
    const x = tx0 + d.start * wk, w = Math.max(30, (d.weeks ?? 2) * wk);
    const bar = box(g, x, cy - barH / 2, 0, barH, ink.accent);
    const xs = text(g, x + w + 22, cy + 16, '✕', {font: F.sans, size: 44, weight: 700, anchor: 'middle', color: ink.fg}).attr('opacity', 0);
    return {name, track, bar, xs, w};
  });
  return {seek(t) {
    pg.seek(t);
    months.forEach((m, i) => m.attr('opacity', fade(t, pg.T + i * .02, .25)));
    rows.forEach((r, i) => {
      const at = p.rowAt + i * p.step;
      r.name.attr('opacity', fade(t, at, .25));
      r.track.attr('width', tw * grow(t, at, .4));
      r.bar.attr('width', r.w * grow(t, at + .1, p.growFor));
      const q = fade(t, at + p.quitAt, .18);
      r.xs.attr('opacity', q).attr('transform', `translate(0 ${((1 - q) * -10).toFixed(1)})`);
    });
  }};
}
