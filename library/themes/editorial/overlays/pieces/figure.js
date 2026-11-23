import {C, F, stage, card, text, label, rule, count, measure, fit, span, ease, glide, leave} from '../../kit.js';

// A big Didone numeral that counts up, on a small paper card: a tracked label above a hairline, the figure, a note
// in italic beneath. Props: value, prefix, suffix, decimals, label, note, x (centre), y (top), w, size, field, from.
export const meta = {duration: 3, live: true};
export const defaults = {value: 12, prefix: '', suffix: '', decimals: 0, label: 'Figure', note: 'illustrative', x: 540, y: 250, w: 420, size: 230, field: 'paper', startAt: .15, seconds: .5};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), w = props.w ?? 420, x = (props.x ?? 540) - w / 2, y = props.y ?? 250, o = {font: F.serif, weight: 500};
  const full = `${props.prefix ?? ''}${Number(props.value).toFixed(props.decimals ?? 0)}${props.suffix ?? ''}`, size = fit(full, w - 80, props.size ?? 230, o), h = 96 + size * .86 + (props.note ? 78 : 30);
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  const lb = label(cd.body, x + 40, y + 54, props.label, {size: 28, color: f.fg}), rl = rule(cd.body, x + 40, y + 74, x + w - 40, y + 74, {color: f.fg});
  const fig = text(cd.body, x + w / 2, y + 96 + size * .74, full, {font: F.serif, weight: 500, size, anchor: 'middle', color: f.accent});
  const note = props.note ? text(cd.body, x + w / 2, y + h - 34, props.note, {font: F.italic, size: 40, anchor: 'middle', color: f.sub}) : null;
  const life = props.life ?? meta.duration, s0 = props.startAt ?? .15, len = props.seconds ?? .5;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); rl.draw(glide(span(t, .1, .4)));
    fig.text(`${props.prefix ?? ''}${count(Number(props.value).toFixed(props.decimals ?? 0), glide(span(t, s0, len)))}${props.suffix ?? ''}`);
    note?.attr('opacity', ease(span(t, s0 + len * .6, .3)));
  }};
}
