import {card, sourced, grow, fade, fmt, num, fig, tag, box, rule} from './_card.js';

// Every pause that was cut from a recording, in the order it happened: one thick bar per pause, as tall as the pause
// was long. The headline is the total removed, in the Didone and counting up, with the number of pauses beside it;
// the longest few (`top`) take the accent and their figures. With `use: 'project'` the pauses are the real ones in
// this video's edit decision list (props.project.edl.pauses [{from, to}]); otherwise `pauses` (seconds each) is drawn
// and the kicker should say it is illustrative.
// Props: title, unit, use ('project' | ''), pauses [...], top, caption, countLabel, suffix, decimals, ends [left, right],
// note, index, field, clear.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'The *dead air*, cut', unit: 'Illustrative · seconds per pause', note: 'Illustrative data', index: '11', field: 'paper', clear: false, use: '', top: 3, caption: 'seconds removed', countLabel: 'pauses cut', suffix: ' s', decimals: 1, ends: ['Start of the take', 'End'],
  pauses: [2.1, 3.4, 1.2, .6, 4.8, 2.2, .9, 3.1, 1.7, 6.2]};

export function mount(el, props = defaults) {
  const edl = props.use === 'project' ? props.project?.edl : null, real = Boolean(edl?.pauses?.length);
  const pg = card(el, sourced(props, defaults, real, {unit: 'This take · seconds per pause', note: 'From this video’s edit list'})), {ink, body: g} = pg, d3 = window.d3;
  const data = (real ? edl.pauses.map(p => p.to - p.from) : props.pauses).map((v, i) => ({v, i})), n = data.length, total = d3.sum(data, d => d.v), p = {decimals: props.decimals ?? 1, suffix: ''};
  const base = pg.y1 - 52, top = pg.y0 + 296, x = d3.scaleBand().domain(d3.range(n)).range([pg.x0, pg.x1]).paddingInner(n > 14 ? .22 : .28), y = d3.scaleLinear().domain([0, d3.max(data, d => d.v) || 1]).range([0, base - top]);
  const hot = new Set([...data].sort((a, b) => b.v - a.v).slice(0, props.top ?? 3).map(d => d.i));
  const big = num(g, pg.x0 - 4, pg.y0 + 128, '', {size: 164, color: ink.accent}), cap = tag(g, pg.x0, pg.y0 + 178, props.caption, 520, {color: ink.fg});
  const cnt = num(g, pg.x1, pg.y0 + 128, '', {size: 120, anchor: 'end', color: ink.fg}), cl = tag(g, pg.x1, pg.y0 + 178, props.countLabel, 330, {anchor: 'end', color: ink.fg});
  const bars = data.map(d => ({d, hot: hot.has(d.i), bar: box(g, x(d.i), base, x.bandwidth(), 0, hot.has(d.i) ? ink.accent : ink.rest),
    value: hot.has(d.i) ? fig(g, x(d.i) + x.bandwidth() / 2, 0, fmt(d.v, p), {size: 34, anchor: 'middle', color: ink.accent, weight: 500}) : null}));
  const floor = rule(g, pg.x0, base, pg.x1, base, {width: 3, color: ink.fg});
  const ends = (props.ends ?? []).map((s, i) => tag(g, i ? pg.x1 : pg.x0, base + 46, s, 420, {anchor: i ? 'end' : 'start', color: ink.sub}));
  return {seek(t) {
    pg.seek(t); floor.draw(grow(t, pg.T, .4)); const q = grow(t, pg.T, .6);
    big.text(fmt(total * q, p) + (props.suffix ?? '')).attr('opacity', fade(t, pg.T, .2)); cnt.text(Math.round(n * q)).attr('opacity', fade(t, pg.T + .1, .2));
    cap.attr('opacity', fade(t, pg.T + .15, .3)); cl.attr('opacity', fade(t, pg.T + .2, .3)); ends.forEach(e => e.attr('opacity', fade(t, pg.T + .3, .3)));
    bars.forEach((b, i) => {
      const at = pg.T + .08 + .3 * i / n, h = y(b.d.v) * grow(t, at, .45);
      b.bar.attr('y', base - h).attr('height', h); b.value?.attr('y', base - h - 14).attr('opacity', fade(t, at + .25, .25));
    });
  }};
}
