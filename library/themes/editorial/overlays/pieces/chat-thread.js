import {C, F, stage, card, text, label, rule, typed, wrap, span, ease, glide, leave} from '../../kit.js';

// A business's AI assistant answering customers: a paper card with a tracked label (whose assistant) over a rule, then
// a short thread. Customer messages slide in on the left in a soft bubble; the assistant's replies type on in the right,
// in the accent, each with a small tracked tag under it (SALES, SUPPORT…). Messages wrap to two lines at most.
// Props: label, messages [{from: 'them'|'bot', text, at (s), tag}], typeFor (s per reply), x, y (top), w, size, field.
export const meta = {duration: 4.5, live: true};
export const defaults = {label: 'Joe’s Plumbing · AI assistant', x: 70, y: 250, w: 940, size: 40, field: 'paper', typeFor: .55,
  messages: [{from: 'them', text: 'Any slots Saturday?', at: .3}, {from: 'bot', text: 'Yes: 10am or 2pm. Book one?', at: .8, tag: 'Sales'},
             {from: 'them', text: 'Where’s my invoice?', at: 1.9}, {from: 'bot', text: 'Sent to your email just now.', at: 2.4, tag: 'Support'}]};

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, st = stage(el, {mode: 'overlay'}), x = p.x, y = p.y, w = p.w, pd = 40, size = p.size;
  const lh = size * 1.18, bw = w * .72, padX = 26, padY = 12;
  const msgs = p.messages.map(m => ({...m, rows: wrap(m.text, size, bw - padX * 2, {font: F.sans}).slice(0, 2)}));
  const heights = msgs.map(m => m.rows.length * lh + padY * 2 + (m.tag ? 24 : 0));
  const h = 100 + heights.reduce((a, b) => a + b + 14, 0) + 10;
  const cd = card(st, st.root, {x, y, w, h, field: p.field, radius: 10}), f = cd.f;
  const lb = label(cd.body, x + pd, y + 56, p.label, {size: 28, color: f.sub});
  const rl = rule(cd.body, x + pd, y + 76, x + w - pd, y + 76, {color: f.fg, width: 1.5, opacity: .5});
  let cy = y + 100;
  const items = msgs.map((m, i) => {
    const bot = m.from === 'bot', bh = m.rows.length * lh + padY * 2, bx = bot ? x + w - pd - bw : x + pd, g = cd.body.append('g');
    g.append('rect').attr('x', bx).attr('y', cy).attr('width', bw).attr('height', bh).attr('rx', 26)
      .attr('fill', bot ? f.accent : f.fg).attr('fill-opacity', bot ? 1 : .08);
    const lines = m.rows.map((r, k) => text(g, bx + padX, cy + padY + size * .9 + k * lh, bot ? '' : r, {font: F.sans, size, weight: 500, color: bot ? f.bg : f.fg}));
    const tg = m.tag ? label(g, bx + bw - 6, cy + bh + 22, m.tag, {size: 22, anchor: 'end', color: f.accent}) : null;
    const item = {m, g, lines, tg, bot}; cy += heights[i] + 14; return item;
  });
  const life = p.life ?? meta.duration;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); rl.draw(glide(span(t, .1, .4)));
    for (const it of items) {
      const a = ease(span(t, it.m.at, .25));
      it.g.attr('opacity', a).attr('transform', `translate(${((1 - a) * (it.bot ? 30 : -30)).toFixed(1)} 0)`);
      if (it.bot) {
        const full = it.m.rows.join('\n'), s = typed(full, span(t, it.m.at + .1, p.typeFor)).split('\n');
        it.lines.forEach((ln, k) => ln.text(s[k] ?? ''));
      }
      it.tg?.attr('opacity', ease(span(t, it.m.at + .1 + p.typeFor, .25)));
    }
  }};
}
