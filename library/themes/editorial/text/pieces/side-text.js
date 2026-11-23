import {M, stage, card, line, label, rule, fit, measure, span, glide, ease, leave} from '../../kit.js';
import {sc, labelW} from './_local.js';

// A magazine spine down the edge of the frame: a narrow paper strip glides in and the title rises along it in serif,
// then a hairline and a small tracked sub line (dropped when the title needs the whole spine). Props: text, sub, side (left|right), top, bottom, edge (distance from
// the frame edge, at least 70), field.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'Behind the scenes', sub: 'Part 02 / uncut', side: 'left', top: 300, bottom: 1240, edge: 70, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), right = props.side === 'right', edge = Math.max(70, props.edge ?? 70), top = Math.max(250, props.top ?? 300), bottom = Math.max(top + 300, props.bottom ?? 1240), sw = 104, pad = 36;
  const x = right ? 1080 - edge - sw : edge, len = bottom - top - 2 * pad, str = sc(props.text), subW = props.sub ? labelW(props.sub, 28) : 0, tail = subW + 36 + 70 + 36;
  const hasSub = !!props.sub && fit(str, Math.max(120, len - tail), 66) >= 46, size = fit(str, hasSub ? len - tail : len, 66), tw = measure(str, size), cd = card(st, st.root, {x, y: top, w: sw, h: bottom - top, field: props.field ?? 'paper', radius: 4}), f = cd.f;
  // local axes: x runs along the spine (upward on the left edge, downward on the right), y across it
  const sp = cd.body.append('g').attr('transform', right ? `translate(${x + sw / 2} ${top + pad}) rotate(90)` : `translate(${x + sw / 2} ${bottom - pad}) rotate(-90)`);
  const tx = line(st, sp, str, 0, size * .3, size, {color: f.fg, accent: f.accent}), rl = hasSub ? rule(sp, tw + 36, 0, tw + 106, 0, {color: f.accent, width: 3}) : null;
  const sub = hasSub ? label(sp, tw + 142, 10, props.sub, {size: 28, color: f.fg}) : null, life = props.life ?? meta.duration;
  return {seek(t) {
    cd.set({a: span(t, 0, .45), b: leave(t, life, .3)}); tx.set(span(t, .2, .5), 0); rl?.draw(glide(span(t, .5, .4))); sub?.attr('opacity', ease(span(t, .65, .3)));
  }};
}
