import {stage, txt, dot, fit, leave, fade, glide, span} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// A stack of notifications: each card drops in at its cue and pushes the earlier ones down, with one
// accent dot on the newest. items: [{title, text, at}] (seconds after the overlay starts). (x, y) is
// the top-left of the newest card, `w` the width.
export const meta = {duration: 4, live: true};
export const defaults = {items: [{title: 'Message', text: 'Your edit is ready', at: .2}, {title: 'Reminder', text: 'Review the storyboard', at: 1.1}], x: 110, y: 150, w: 860, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, h = 150, gap = 18, g = st.root.append('g');
  const cards = props.items.map(item => {
    const card = g.append('g'); plate(card, st, 0, 0, w, h, props.theme); small(card, 78, 56, item.title, ink);
    txt(card, 44, 112, item.text, {size: Math.min(44, fit(item.text, w - 88, 44, {role: 'bold'})), color: ink.head, role: 'bold'});
    return {card, item, mark: dot(card, 52, 47, 9, st.ink.accent)};
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .22); g.attr('opacity', 1 - out);
      cards.forEach(({card, item, mark}, i) => {
        const q = glide(span(t, item.at, .36)), pushed = cards.slice(i + 1).reduce((n, c) => n + glide(span(t, c.item.at, .36)), 0), newest = !cards.slice(i + 1).some(c => t >= c.item.at);
        card.attr('transform', `translate(${x} ${y - (1 - q) * 120 + pushed * (h + gap)}) scale(${1 - .03 * Math.min(2, pushed)})`).attr('opacity', fade(t, item.at, .14) * (1 - .25 * Math.min(2, pushed)));
        mark.attr('opacity', newest ? 1 : .25);
      });
    },
  };
}
