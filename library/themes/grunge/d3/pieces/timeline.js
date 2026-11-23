import {C, span, hold, txt, scrawl, chip, jtf, pop, up, fit} from '../../kit.js';
import {card, hand} from './_card.js';

// A marker line down the wall with dates on torn tags and a typed note beside each; events are pasted on in order.
export const meta = {duration: 4.2};
export const defaults = {title: 'How it went', unit: 'Illustrative timeline', clear: false,
  events: [{date: 'JAN', title: 'First upload', note: '12 views. Two were mine.'}, {date: 'MAR', title: 'Found the format', note: 'One idea, one take.'}, {date: 'JUN', title: 'First sponsor', note: 'A real email, not spam.'}, {date: 'NOV', title: 'Full time', note: 'Quit the day job.'}]};

export function mount(el, props = defaults) {
  const {body, fine, ink, intro, top} = card(el, props), ev = props.events.slice(0, 5), n = ev.length, y0 = top + 50, y1 = 880, lx = 250, pitch = (y1 - y0) / Math.max(1, n - 1);
  const line = scrawl(body, s => hand(lx, y0 - 40, lx + 4, y1 + 40, s, 6), {color: C.bone, width: 7, seed: 3});
  const rows = ev.map((e, i) => {
    const y = n > 1 ? y0 + i * pitch : (y0 + y1) / 2, last = i === n - 1, dot = body.append('g'); dot.append('circle').attr('r', 17).attr('fill', last ? ink.accent : C.bone);
    const tag = body.append('g'); chip(tag.append('g'), up(e.date), {size: 46, role: 'cond', fill: last ? ink.accent : C.bone, sides: 'rl', seedv: i + 2});
    const g = fine.append('g'), ti = up(e.title); txt(g, 310, y + 4, ti, {size: Math.min(44, fit(ti, 600, 44)), role: 'head', color: last ? ink.accent : C.bone}); txt(g, 312, y + 42, up(e.note ?? ''), {size: 23, color: C.paper});
    return {y, dot, tag, g};
  });
  return {seek(t) {
    const s = intro(t), h = hold(t), step = Math.min(.6, 2.6 / n); line.draw(span(h, .35, .4 + n * step * .8), s);
    rows.forEach(({y, dot, tag, g}, i) => { const at = .6 + i * step; dot.attr('transform', `translate(${lx + 2} ${y - 10}) scale(${pop(t, at, .2)})`); tag.attr('transform', jtf(140, y - 10, s, i, {tilt: i % 2 ? 4 : -5, scale: pop(t, at + .06)})); g.attr('opacity', h >= at + .16 ? 1 : 0); });
  }};
}
