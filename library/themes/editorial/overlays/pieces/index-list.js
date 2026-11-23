import {C, F, stage, card, line, label, folio, rule, fit, pad, span, ease, glide, leave} from '../../kit.js';

// A contents page: a tracked title, then numbered entries (mono 01, 02 ...) in serif that rise one per `step`, with
// hairlines between; the entry at `active` (or the newest) carries the accent. Props: title, items, step, startAt,
// x, y (top), w, size, field, active.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'In this issue', items: ['The raw take', 'The cut', 'The *finished* reel'], step: .45, startAt: .2, x: 110, y: 250, w: 860, size: 84, field: 'paper', active: null};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 110, y = props.y ?? 250, w = props.w ?? 860, pd = 44, items = [].concat(props.items ?? []);
  const size = fit(items, w - pd * 2 - 110, props.size ?? 84), pitch = size * 1.3, top = 100, h = top + items.length * pitch + 16;
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  label(cd.body, x + pd, y + 58, props.title, {size: 28, color: f.sub});
  const tr = rule(cd.body, x + pd, y + 78, x + w - pd, y + 78, {color: f.fg});
  const rows = items.map((it, i) => { const by = y + top + size * .9 + i * pitch;
    return {n: folio(cd.body, x + pd, by - size * .08, pad(i + 1), {size: 32, color: f.accent}), ln: line(st, cd.body, it, x + pd + 110, by, size, {color: f.fg, accent: f.accent}),
      r: i < items.length - 1 ? rule(cd.body, x + pd, by + size * .3, x + w - pd, by + size * .3, {color: f.fg, width: 1.5, opacity: .35}) : null, at: (props.startAt ?? .2) + i * (props.step ?? .45)}; });
  const life = props.life ?? meta.duration;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); tr.draw(glide(span(t, .08, .4)));
    const newest = props.active ?? rows.reduce((k, r, i) => t >= r.at ? i : k, -1);
    rows.forEach((r, i) => { r.ln.set(span(t, r.at, .4)); r.n.attr('opacity', ease(span(t, r.at, .25))); r.r?.draw(glide(span(t, r.at + .1, .35))); r.ln.g.attr('opacity', t < r.at ? 0 : i === newest ? 1 : .55); });
  }};
}
