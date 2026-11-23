import {stage, txt, dot, fit, wrap, measure, leave, fade, glide, span, C} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// A chat thread on a frosted card: a header (name, status line, avatar dot), then bubbles arriving at their
// cues. Mine sit right in the accent, theirs left on a pale field; theirs are preceded by three typing dots
// for `typing` seconds. Works as a DM, a website chat widget or an AI assistant answering.
// messages: [{from: 'me' | 'them', text, at}] (seconds after the overlay starts). (x, y) top-left, w width.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Direct message', sub: 'Active now', initial: 'A', messages: [
  {from: 'me', text: 'Hi! I help cafés post every day with AI. Want a free week?', at: .3},
  {from: 'them', text: 'Yes please. How much after that?', at: 1.4}], typing: .5, size: 40, x: 90, y: 260, w: 900, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, st = stage(el, {mode: 'overlay', accent: p.accent}), ink = inks(p.theme), {x, w} = p;
  const size = p.size, lead = size * 1.3, padX = 30, padY = 22, maxW = w * .74, gap = 18, headH = 120;
  const g = st.root.append('g');
  // measure every bubble once so the card height is known at mount
  const bubbles = p.messages.map(m => {
    const lines = wrap(m.text, size, maxW - padX * 2, {role: 'text'});
    const bw = Math.min(maxW, Math.max(...lines.map(l => measure(l, size, {role: 'text'}))) + padX * 2 + 4), bh = lines.length * lead + padY * 2 - (lead - size);
    return {...m, lines, bw, bh};
  });
  const bodyH = bubbles.reduce((n, b) => n + b.bh + gap, 0) + 30, h = headH + bodyH;
  plate(g, st, x, p.y, w, h, p.theme);
  const av = g.append('g'); av.append('circle').attr('cx', x + 70).attr('cy', p.y + 60).attr('r', 34).attr('fill', st.ink.accent);
  txt(av, x + 70, p.y + 73, p.initial, {size: 36, color: C.white, role: 'bold', anchor: 'middle'});
  txt(g, x + 124, p.y + 56, p.title, {size: 36, color: ink.head, role: 'bold'});
  dot(g, x + 132, p.y + 84, 6, C.sun); small(g, x + 146, p.y + 92, p.sub, ink);
  g.append('path').attr('d', `M${x + 30} ${p.y + headH}H${x + w - 30}`).attr('stroke', ink.line).attr('stroke-opacity', ink.faint).attr('stroke-width', 2);
  let top = p.y + headH + 24;
  const items = bubbles.map(b => {
    const mine = b.from === 'me', bx = mine ? x + w - 30 - b.bw : x + 30, item = g.append('g');
    item.append('rect').attr('x', bx).attr('y', top).attr('width', b.bw).attr('height', b.bh).attr('rx', Math.min(34, b.bh / 2))
      .attr('fill', mine ? st.ink.accent : (p.theme === 'bone' ? '#E6ECF6' : '#26314A'));
    b.lines.forEach((l, i) => txt(item, bx + padX, top + padY + size * .82 + i * lead, l, {size, color: mine ? C.white : ink.head, role: 'text'}));
    let typing = null;
    if (!mine && p.typing > 0) {
      typing = g.append('g');
      typing.append('rect').attr('x', bx).attr('y', top).attr('width', 130).attr('height', 70).attr('rx', 35).attr('fill', p.theme === 'bone' ? '#E6ECF6' : '#26314A');
      typing.dots = [0, 1, 2].map(k => dot(typing, bx + 38 + k * 27, top + 35, 8, ink.dim));
    }
    const out = {item, typing, b, y: top}; top += b.bh + gap; return out;
  });
  return {
    seek(t) {
      g.attr('opacity', fade(t, 0, .2) * (1 - leave(t, p.life, .22)));
      g.attr('transform', `translate(0 ${(1 - glide(span(t, 0, .4))) * 60})`);
      items.forEach(({item, typing, b, y}) => {
        const q = glide(span(t, b.at, .3));
        item.attr('opacity', fade(t, b.at, .12)).attr('transform', `translate(0 ${(1 - q) * 30})`);
        if (typing) {
          const on = t >= b.at - p.typing && t < b.at;
          typing.attr('opacity', on ? 1 : 0);
          typing.dots.forEach((d, k) => d.attr('opacity', .35 + .65 * Math.max(0, Math.sin((t * 7 - k * .9)))));
        }
      });
    },
  };
}
