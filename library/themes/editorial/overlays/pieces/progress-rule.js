import {C, F, stage, card, label, folio, rule, line, mix, span, ease, glide, smooth, leave} from '../../kit.js';

// A job in progress, drawn as a rule: a serif label, a thick wine rule that fills along a hairline past named stage
// ticks and STOPS at `holdAt` (0..1) — no percentage is printed. The stage it stops on turns to the accent.
// Props: label, stages [{label, at (0..1)}], startAt, seconds, holdAt, x, y (top), w, field, note.
export const meta = {duration: 3, live: true};
export const defaults = {label: 'Before it *renders*', stages: [{label: 'Cut', at: .2}, {label: 'Graphics', at: .45}, {label: 'Storyboard', at: .7}, {label: 'Render', at: 1}], startAt: .15, seconds: .9, holdAt: .7, x: 90, y: 250, w: 900, field: 'paper', note: ''};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 90, y = props.y ?? 250, w = props.w ?? 900, pd = 44, h = 300, x0 = x + pd, x1 = x + w - pd, ry = y + 170;
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  const ttl = line(st, cd.body, props.label, x0, y + 96, 76, {color: f.fg, accent: f.accent}), nt = props.note ? label(cd.body, x1, y + 84, props.note, {size: 28, anchor: 'end', color: f.sub}) : null;
  const base = rule(cd.body, x0, ry, x1, ry, {color: f.fg, width: 2, opacity: .5}), bar = rule(cd.body, x0, ry, x1, ry, {color: f.accent, width: 14});
  const ticks = (props.stages ?? []).map((s, i, all) => { const tx = mix(x0, x1, s.at), end = i === all.length - 1, first = s.at < .12;
    return {s, ln: cd.body.append('line').attr('x1', tx).attr('x2', tx).attr('y1', ry - 16).attr('y2', ry + 16).attr('stroke', f.fg).attr('stroke-width', 2), lb: label(cd.body, tx, ry + 64, s.label, {size: 26, track: .12, anchor: end ? 'end' : first ? 'start' : 'middle', color: f.sub})}; });
  const life = props.life ?? meta.duration, hold = props.holdAt ?? .7;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); ttl.set(span(t, .06, .4)); base.draw(glide(span(t, .1, .45)));
    const p = smooth(span(t, props.startAt ?? .15, props.seconds ?? .9)) * hold; bar.draw(p);
    for (const k of ticks) { const on = p >= k.s.at - .005, stop = Math.abs(k.s.at - hold) < .01 && p >= hold - .005; k.lb.attr('fill', stop ? f.accent : on ? f.fg : f.sub).attr('opacity', ease(span(t, .2, .3)) * (on ? 1 : .6)); k.ln.attr('opacity', ease(span(t, .2, .3))); }
  }};
}
