import {C, F, stage, card, text, label, rule, count, fit, span, ease, glide, leave} from '../../kit.js';

// A row of two to four figures, set like the "by the numbers" strip of a feature: Didone numerals that count up over
// hairlines, a tracked label under each. With "use": "project" an item may name a `key` of the project's own counts
// (graphics, effects, transitions, zooms, layouts, sounds, changes, cuts, pauses, before, after) so the figures are
// true by construction. Props: title, items [{value | key, label, suffix, decimals}], x, y (top), w, field, use.
export const meta = {duration: 3.5, live: true};
export const defaults = {title: 'By the numbers', items: [{value: 12, label: 'Cuts'}, {value: 3, label: 'Rooms'}, {value: 1, label: 'Message'}], x: 70, y: 250, w: 940, field: 'paper', note: 'illustrative'};

const lookup = (p, key) => p ? ({cuts: p.edl?.cuts, pauses: p.edl?.pauses?.length, before: p.edl?.before, after: p.edl?.after, segments: p.edl?.segments?.length}[key] ?? p[key]) : null;
export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 250, w = props.w ?? 940, pd = 44, proj = props.use === 'project' ? props.project : null;
  const items = (props.items ?? []).map(it => ({...it, value: it.key ? lookup(proj, it.key) ?? it.value ?? 0 : it.value})), n = items.length, cw = (w - pd * 2) / n, h = 330 + (props.note ? 40 : 0);
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  label(cd.body, x + pd, y + 58, props.title, {size: 28, color: f.sub}); const rl = rule(cd.body, x + pd, y + 78, x + w - pd, y + 78, {color: f.fg});
  const cols = items.map((it, i) => { const cx = x + pd + i * cw, full = `${Number(it.value).toFixed(it.decimals ?? 0)}${it.suffix ?? ''}`, size = fit(full, cw - 36, 150, {font: F.serif, weight: 500});
    if (i) cd.body.append('line').attr('x1', cx).attr('x2', cx).attr('y1', y + 104).attr('y2', y + 300).attr('stroke', f.fg).attr('stroke-opacity', .3).attr('stroke-width', 1.5);
    return {it, fig: text(cd.body, cx + (i ? 24 : 0), y + 226, full, {font: F.serif, weight: 500, size, color: i === 0 ? f.accent : f.fg}), lb: label(cd.body, cx + (i ? 24 : 0), y + 284, it.label, {size: 28, color: f.sub, track: .14})}; });
  if (props.note) text(cd.body, x + w - pd, y + h - 26, props.note, {font: F.italic, size: 34, color: f.sub, anchor: 'end'});
  const life = props.life ?? meta.duration;
  return {seek(t) { cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); rl.draw(glide(span(t, .1, .4)));
    cols.forEach((c, i) => { const q = glide(span(t, .2 + i * .12, .5)); c.fig.text(`${count(Number(c.it.value).toFixed(c.it.decimals ?? 0), q)}${c.it.suffix ?? ''}`).attr('opacity', ease(span(t, .2 + i * .12, .2))); c.lb.attr('opacity', ease(span(t, .3 + i * .12, .3))); }); }};
}
