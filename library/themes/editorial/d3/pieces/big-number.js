import {card, grow, fade, count, num, tag, rule, lines, wrap, fit, measure, F} from './_card.js';

// One figure, set huge in the Didone and counting up, over a rule; under it a serif line that says what it is
// (one *italic accent* word) and a small tracked caption.
// Props: unit (kicker), value (number or string with digits, e.g. "2,400" or "4.5"), prefix, suffix, line, caption,
// note, index, field, clear. (No `title`: the figure is the headline.)
export const meta = {duration: 4};
export const defaults = {unit: 'Illustrative · the number', value: '2,400', prefix: '', suffix: '', line: 'hours saved, *every* month', caption: 'Across the whole team', note: 'Illustrative data', index: '03', field: 'paper', clear: false};

export function mount(el, props = defaults) {
  const pg = card(el, {...props, title: ''}), {ink, body: g, st} = pg, full = `${props.prefix ?? ''}${props.value}${props.suffix ?? ''}`;
  const size = Math.min(400, fit(full, pg.w - 10, 400, {font: F.serif, weight: 500})), base = 190 + Math.max(size * .74, 200) + (400 - size) * .18;
  const big = num(g, pg.x0 - size * .03, base, '', {size, color: ink.accent}), under = rule(g, pg.x0, base + 54, pg.x1, base + 54, {width: 3, color: ink.fg});
  const ls = Math.min(92, fit(props.line ?? '', pg.w, 92)) < 62 ? 76 : Math.min(92, fit(props.line ?? '', pg.w, 92)), arr = wrap(props.line ?? '', ls, pg.w).slice(0, 2);
  const say = lines(st, g, arr, pg.x0, base + 84, ls, {color: ink.fg, accent: ink.accent}), cap = props.caption ? tag(g, pg.x0, Math.min(pg.y1 - 6, say.bottom + 62), props.caption, pg.w, {color: ink.sub}) : null;
  return {seek(t) {
    pg.seek(t); const q = grow(t, .1, .6);
    big.text(`${props.prefix ?? ''}${count(props.value, q)}${props.suffix ?? ''}`).attr('opacity', fade(t, .08, .2));
    under.draw(grow(t, .2, .45)); say.seek(t, .32, null, .08, .45); cap?.attr('opacity', fade(t, .6, .3));
  }};
}
