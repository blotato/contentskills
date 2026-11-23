import {C, hold, txt, hash, up} from '../../kit.js';
import {card} from './_card.js';

// Counted the way you count on a wall: marker strokes in fives, the fifth struck through in red.
export const meta = {duration: 4};
export const defaults = {title: 'Posts per week', unit: 'Illustrative · one mark per post', clear: false,
  items: [{label: 'Week one', value: 3}, {label: 'Week two', value: 7}, {label: 'Week three', value: 12}, {label: 'Week four', value: 19}]};

export function mount(el, props = defaults) {
  const {body, fine, ink, intro, top} = card(el, props), items = props.items.slice(0, 5), n = items.length, pitch = Math.min(160, (920 - top) / n), mh = pitch * .46, total = items.reduce((a, d) => a + Math.min(25, d.value), 0), step = Math.min(.09, 2.6 / Math.max(1, total));
  let k = 0;
  const rows = items.map((d, r) => {
    const y = top + 50 + r * pitch, count = Math.min(25, d.value); txt(fine, 84, y - 12, up(d.label), {size: 23, color: C.paper});
    const marks = Array.from({length: count}, (_, i) => { const grp = Math.floor(i / 5), pos = i % 5, gx = 90 + grp * 140, w = (a, b) => (hash(i * 3 + a, r + b) - .5) * 9;
      const d5 = pos === 4 ? `M${gx - 14 + w(1, 1)} ${y + mh * .78 + w(2, 1)}L${gx + 98 + w(3, 1)} ${y + mh * .2 + w(4, 1)}` : `M${gx + pos * 24 + w(1, 2)} ${y + 6 + w(2, 2)}L${gx + pos * 24 + w(3, 2)} ${y + mh + w(4, 2)}`;
      return {at: .5 + (k++) * step, node: body.append('path').attr('d', d5).attr('stroke', pos === 4 ? ink.accent : C.bone).attr('stroke-width', pos === 4 ? 9 : 8).attr('stroke-linecap', 'round').attr('fill', 'none')}; });
    return {d, marks, value: txt(fine, 916, y + mh, '', {size: 70, role: 'cond', anchor: 'end', color: r === n - 1 ? ink.accent : C.bone})};
  });
  return {seek(t) {
    intro(t); const h = hold(t);
    rows.forEach(({marks, value}) => { let shown = 0; marks.forEach(m => { const on = h >= m.at; m.node.attr('opacity', on ? 1 : 0); if (on) shown++; }); value.text(shown).attr('opacity', shown ? 1 : 0); });
  }};
}
