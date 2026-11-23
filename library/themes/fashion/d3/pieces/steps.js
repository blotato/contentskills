import {card, txt, label, dot, fit, wrap, up, fade, glide, span, pad2} from '../../kit.js';
import {cues, pace, hold, arrive, latest} from './_local.js';

// Three or four numbered stages standing on one hairline that draws across; names and notes hang
// under it as small print. The accent dot marks the stage that arrived last (or `active`).
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'From sketch to rail', unit: 'Illustrative · process', clear: false, field: 'bone', accent: 'poppy', active: null, speed: 1, times: null,
  steps: [{label: 'Sketch', note: 'Line and proportion'}, {label: 'Cut', note: 'One length of cloth'}, {label: 'Fit', note: 'On the body, twice'}, {label: 'Finish', note: 'Press and hang'}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, steps = props.steps, n = steps.length, k = pace(props), at = cues(props, n, .3, .14);
  const x0 = 90, w = 820, slot = w / n, y = 560, size = Math.min(150, slot * .62);
  const line = g.append('rect').attr('x', x0).attr('y', y - .75).attr('height', 1.5).attr('fill', ink.line).attr('opacity', .5);
  const cols = steps.map((s, i) => {
    const x = x0 + slot * i, col = g.append('g'), lines = wrap(s.note ?? '', 19, slot - 34, {role: 'text'}).slice(0, 4);
    txt(col, x - size * .02, y - 34, s.number ?? pad2(i + 1), {size, role: 'num', color: ink.head});
    label(col, x, y + 58, s.label, {size: Math.min(20, fit(up(s.label), slot - 34, 20, {role: 'label'})), color: ink.head});
    txt(col, x, y + 100, lines.join('\n'), {size: 19, role: 'text', color: ink.dim, leading: 1.5});
    return {col, base: dot(g, x + 4, y, 4, ink.line), hot: dot(g, x + 4, y, 8, ink.accent)};
  });
  return {seek(t) {
    hold(st, t);
    const reach = Math.max(glide(span(t, .15 * k, 1.1 * k)) * (props.times ? 0 : 1), ...at.map((a, i) => glide(span(t, a, .8 * k)) * (i + 1) / n));
    line.attr('width', w * reach);
    cols.forEach(({col, base, hot}, i) => { arrive(col, t, at[i], k); base.attr('opacity', fade(t, at[i], .3 * k));
      hot.attr('opacity', props.active == null ? latest(at, t, i, k) : i === props.active ? fade(t, at[i], .35 * k) : 0); });
  }};
}
