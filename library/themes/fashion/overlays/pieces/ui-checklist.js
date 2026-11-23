import {stage, txt, draw, fit, leave, fade, glide, span} from '../../kit.js';
import {inks, plate, small, check, pointer} from './_ui.js';

// A checklist being ticked: the pointer glides down the boxes and ticks each at its cue. With
// `strike: true` the accent hairline is drawn through the item instead (things that are NOT needed).
// items: [{label, at}] — seconds after the overlay starts.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Before it ships', items: [{label: 'Cut the pauses', at: .5}, {label: 'Set the captions', at: 1.1}, {label: 'Check the storyboard', at: 1.7}], strike: false, hand: true, x: 110, y: 1160, w: 860, size: 46, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, size = Math.min(props.size, fit(props.items.map(i => i.label), w - 190, props.size, {role: 'bold'})), rh = size * 2.2, top = props.title ? 100 : 34, h = top + props.items.length * rh + 26, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); if (props.title) small(card, x + 44, y + 62, props.title, ink);
  const rows = props.items.map((item, i) => {
    const cy = y + top + rh * (i + .5), b = size * .95, text = txt(card, x + 44 + b + 30, cy + size * .36, item.label, {size, color: ink.head, role: 'bold'});
    card.append('rect').attr('x', x + 44).attr('y', cy - b / 2).attr('width', b).attr('height', b).attr('fill', 'none').attr('stroke', ink.line).attr('stroke-width', 2.5).attr('opacity', .7);
    const cut = card.append('rect').attr('x', x + 44 + b + 22).attr('y', cy - 3).attr('height', 6).attr('fill', st.ink.accent), tw = text.node().getComputedTextLength() + 16;
    return {item, cy, b, text, cut, tw, tick: check(card, x + 44 + b * .04, cy - b * .5, b * .96, st.ink.accent, 5.5)};
  });
  const hand = props.hand ? pointer(g, st, {accent: st.ink.accent}) : null, first = rows[0], last = rows.at(-1);
  const keys = [{t: first.item.at - .5, x: x + w * .7, y: y + h + 150}, ...rows.map(r => ({t: r.item.at - .03, x: x + 44 + r.b / 2 + 6, y: r.cy + 10, move: .34})), {t: last.item.at + .45, x: x + 44 + last.b / 2 + 6, y: last.cy + 10}, {t: last.item.at + 1, x: x + 230, y: last.cy + 210, move: .5}];
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26));
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      rows.forEach(r => { const q = glide(span(t, r.item.at, .24)); draw(r.tick, props.strike ? 0 : q); r.cut.attr('width', props.strike ? r.tw * q : 0); r.text.attr('opacity', props.strike ? 1 - .5 * q : .55 + .45 * q); });
      hand?.set(t, keys, rows.map(r => r.item.at), 1 - fade(t, last.item.at + .6, .3));
    },
  };
}
