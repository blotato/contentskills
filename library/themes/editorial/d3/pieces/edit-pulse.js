import {card, sourced, grow, fade, fmt, num, fig, tag, dot, rule} from './_card.js';

// The pulse of an edit: authored changes in each second of the clip as one thick line over a filled area drawn left
// to right, the busiest second marked in the accent, the average per second as the headline in the Didone, and a row
// of counts underneath. With `use: 'project'` everything is counted from this very storyboard (props.project: pace,
// changes, duration, graphics, effects, transitions, zooms, layouts, sounds, edl.cuts; see projectStats in
// pipeline/timeline.js), so it is always true of the video it is in. Otherwise `values` (per second) and `counts`
// [{label, value}] are drawn and the kicker should say they are illustrative.
// Props: title, unit, use ('project' | ''), values, counts, show (which project counts, up to 4: cuts, graphics,
// effects, transitions, sounds, layouts, zooms), caption, decimals, note, index, field, clear.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'The *pulse* of this edit', unit: 'Illustrative · changes per second', note: 'Illustrative data', index: '13', field: 'paper', clear: false, use: '', caption: 'changes a second', decimals: 1, show: ['cuts', 'graphics', 'transitions', 'sounds'],
  values: [3, 1, 2, 2, 3, 2, 1, 3, 2, 2, 3, 4, 2, 2, 3, 2, 1, 2, 3, 2], counts: [{label: 'Cuts', value: 12}, {label: 'Graphics', value: 30}, {label: 'Transitions', value: 10}, {label: 'Sounds', value: 60}]};

const NAMES = {cuts: ['Cuts', p => p.edl?.cuts], graphics: ['Graphics', p => p.graphics], effects: ['Effects', p => p.effects], transitions: ['Transitions', p => p.transitions], sounds: ['Sounds', p => p.sounds], layouts: ['Layouts', p => p.layouts], zooms: ['Zooms', p => p.zooms]};

export function mount(el, props = defaults) {
  const P = props.use === 'project' && props.project?.pace?.length ? props.project : null;
  const pg = card(el, sourced(props, defaults, Boolean(P), {unit: 'This video · changes per second', note: 'Counted from this video’s storyboard'})), {ink, body: g, st} = pg, d3 = window.d3;
  const v = P ? P.pace : props.values, n = v.length, avg = P && P.changes != null && P.duration ? P.changes / P.duration : d3.mean(v), peak = d3.maxIndex(v);
  const counts = (P ? (props.show ?? []).map(k => NAMES[k] && {label: NAMES[k][0], value: NAMES[k][1](P)}).filter(c => c && c.value != null) : props.counts ?? []).slice(0, 4);
  const base = pg.y1 - (counts.length ? 150 : 40), top = pg.y0 + 200, xa = pg.x0, xb = pg.x1 - 22, x = d3.scaleLinear().domain([0, Math.max(1, n - 1)]).range([xa, xb]), y = d3.scaleLinear().domain([0, Math.max(1, d3.max(v))]).range([base, top]);
  const big = num(g, pg.x0 - 3, pg.y0 + 128, '', {size: 164, color: ink.accent}), cap = tag(g, pg.x1, pg.y0 + 62, props.caption, 440, {anchor: 'end', color: ink.fg});
  const sub = fig(g, pg.x1, pg.y0 + 112, `${n} s · peak ${v[peak]}`, {anchor: 'end', color: ink.sub, size: 34});
  const cid = st.uid('draw'), clip = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', 0).attr('y', 0).attr('height', 1000), plot = g.append('g').attr('clip-path', `url(#${cid})`);
  plot.append('path').attr('d', d3.area().x((d, i) => x(i)).y0(base).y1(d => y(d)).curve(d3.curveMonotoneX)(v)).attr('fill', ink.faint);
  plot.append('path').attr('d', d3.line().x((d, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX)(v)).attr('fill', 'none').attr('stroke', ink.fg).attr('stroke-width', 7).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
  const mean = rule(g, pg.x0, y(avg), pg.x1, y(avg), {width: 4, color: ink.accent}), floor = rule(g, pg.x0, base, pg.x1, base, {width: 3, color: ink.fg}), mark = dot(g, x(peak), y(v[peak]), 0, ink.accent);
  const col = pg.w / Math.max(1, counts.length), cells = counts.map((c, i) => ({c, f: num(g, pg.x0 + i * col, base + 92, '', {size: 78, color: ink.fg}), l: tag(g, pg.x0 + i * col, base + 138, c.label, col - 36, {color: ink.sub, track: .1})}));
  return {seek(t) {
    pg.seek(t); const q = grow(t, pg.T + .04, .6);
    floor.draw(grow(t, pg.T, .4)); clip.attr('width', xa + (xb - xa) * q + 5); mean.draw(grow(t, pg.T + .3, .45)); mark.attr('r', 17 * grow(t, pg.T + .1 + .55 * peak / n, .25));
    big.text(fmt(avg * q, {decimals: props.decimals ?? 1})).attr('opacity', fade(t, pg.T, .2)); cap.attr('opacity', fade(t, pg.T + .15, .3)); sub.attr('opacity', fade(t, pg.T + .25, .3));
    cells.forEach((c, i) => { const at = pg.T + .3 + i * .07; c.f.text(Math.round(c.c.value * grow(t, at, .4))).attr('opacity', fade(t, at, .2)); c.l.attr('opacity', fade(t, at + .05, .25)); });
  }};
}
