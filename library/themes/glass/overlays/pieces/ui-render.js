import {C, stage, txt, draw, leave, fade, glide, span, swell, mix} from '../../kit.js';
import {inks, plate, small, check} from './_ui.js';

// A render bar with its stages: the percentage counts in thin tall numerals, one hairline fills behind
// an accent dot, and each stage is ticked off as the bar passes it. stages: [{label, at}] — `at` is 0..1
// along the bar (default: spread evenly). The bar runs from `startAt` for `seconds`; `holdAt` (0..1) makes
// it wait there until `resumeAt` — for "before it renders…". `showValue: false` leaves the percentage out (a bar that
// is only a picture of progress should not look like a measurement).
export const meta = {duration: 4, live: true};
export const defaults = {label: 'Working', done: 'Done', stages: ['Cuts', 'Captions', 'Graphics', 'Sound'], startAt: .15, seconds: 1.4, showValue: true, holdAt: null, resumeAt: null, x: 90, y: 1200, w: 900, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, n = props.stages.length, cols = Math.min(n, 2), rowsN = Math.ceil(n / cols), h = 236 + rowsN * 74 + 20, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme);
  const a = small(card, x + 44, y + 64, props.label, ink), b = small(card, x + 44, y + 64, props.done, ink, {color: st.ink.accent});
  const num = txt(card, x + w - 44, y + 136, '', {size: 112, role: 'num', color: ink.head, anchor: 'end'}).style('font-variant-numeric', 'tabular-nums');
  const bx = x + 44, bw = w - 88, by = y + 186;
  card.append('rect').attr('x', bx).attr('y', by - 1).attr('width', bw).attr('height', 2).attr('fill', ink.line).attr('opacity', .3);
  const bar = card.append('rect').attr('rx', 3).attr('x', bx).attr('y', by - 3).attr('height', 6).attr('fill', ink.head), spot = card.append('circle').attr('cy', by).attr('r', 11).attr('fill', st.ink.accent);
  const stages = props.stages.map((s, i) => {
    const item = typeof s === 'string' ? {label: s} : s, at = item.at ?? (i + 1) / n - .04, cx = bx + (i % cols) * (bw / cols), cy = by + 82 + Math.floor(i / cols) * 74;
    return {at, text: txt(card, cx + 56, cy + 14, item.label, {size: 40, color: ink.head, role: 'bold'}), tick: check(card, cx, cy - 22, 40, st.ink.accent, 4.5), box: card.append('rect').attr('x', cx + 2).attr('y', cy - 20).attr('width', 36).attr('height', 36).attr('fill', 'none').attr('stroke', ink.line).attr('stroke-width', 2)};
  });
  const progress = t => {
    const hold = props.holdAt, run = swell(span(t, props.startAt, props.seconds));
    if (hold == null) return run;
    const first = Math.min(hold, glide(span(t, props.startAt, props.seconds * hold)) * hold);
    return props.resumeAt != null && t >= props.resumeAt ? mix(hold, 1, swell(span(t, props.resumeAt, props.seconds * (1 - hold)))) : first;
  };
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26)), q = progress(t), end = q >= .999 ? 1 : 0;
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      bar.attr('width', bw * q); spot.attr('cx', bx + bw * q); num.text(props.showValue ? Math.round(q * 100) + '%' : '').attr('fill', end ? st.ink.accent : ink.head);
      a.attr('opacity', 1 - end); b.attr('opacity', end);
      stages.forEach(s => { const on = q >= s.at; if (on && s.since == null) s.since = 0; s.text.attr('opacity', on ? 1 : .38); s.box.attr('opacity', on ? 0 : .4); draw(s.tick, on ? glide((q - s.at) / .06) : 0); });
    },
  };
}
