import {stage, look, C, up, fit, measure, capH, txt, sheet, stroke, tickPath, draw, fade, glide, swell, span, leave} from '../../kit.js';

// A routine or product checklist on a paper sheet. Boxes tick themselves off on cue: the box
// fills with the accent colour, the tick draws and the header keeps count. Use `times` (seconds
// after the overlay starts) to tick each row on the word that names it. (`x`, `y`) is the top-left.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'In the bag', items: ['Sunscreen', 'A good book', 'Water bottle', 'Something to share'], times: null, x: 70, y: 80, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y} = props, n = props.items.length, row = 76, o = {role: 'text'}, size = Math.min(40, fit(props.items, 720, 40, o));
  const w = Math.min(940, Math.max(520, Math.max(...props.items.map(s => measure(s, size, o))) + 190)), h = 122 + n * row + 16, card = root.append('g');
  sheet(card.append('g').attr('filter', st.lift), x, y, w, h, {radius: 6});
  const tsize = fit(props.title, w - 230, 46), title = txt(card, x + 40, y + 76, props.title, {size: tsize, role: 'head'}), tally = txt(card, x + w - 40, y + 74, '', {size: 24, role: 'wide', color: C.soft, anchor: 'end'});
  stroke(card, `M${x + 40} ${y + 106}H${x + w - 40}`, C.line, 3); const meter = stroke(card, `M${x + 40} ${y + 106}H${x + w - 40}`, ink.accent, 3);
  const at = i => props.times?.[i] ?? 1 + i * .8;
  const rows = props.items.map((item, i) => { const ry = y + 126 + i * row, g = card.append('g');
    g.append('rect').attr('x', x + 40).attr('y', ry + 10).attr('width', 46).attr('height', 46).attr('rx', 8).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 3);
    const box = g.append('rect').attr('x', x + 40).attr('y', ry + 10).attr('width', 46).attr('height', 46).attr('rx', 8).attr('fill', ink.accent).attr('stroke', ink.accent).attr('stroke-width', 3), tick = stroke(g, tickPath(x + 40, ry + 10, 46), ink.on, 6);
    const label = txt(g, x + 112, ry + 33 + capH(size, o) / 2, item, {size, role: 'text'}); return {g, box, tick, label, i}; });
  return {
    seek(t) {
      const out = leave(t, props.life, .55), e = swell(span(t, 0, .8));
      card.attr('transform', `translate(0 ${(1 - e) * 70 + out * 50})`).attr('opacity', fade(t, 0, .4) * (1 - out)); title.attr('opacity', fade(t, .3, .5));
      let done = 0, progress = 0;
      rows.forEach(r => { const since = t - at(r.i); if (since > 0) done++; progress += glide(span(since, 0, .6)) / n;
        r.g.attr('opacity', fade(t, .4 + r.i * .1, .5)); r.box.attr('opacity', fade(since, 0, .3)); draw(r.tick, glide(span(since, .1, .45))); r.label.attr('opacity', 1 - .45 * fade(since, .1, .5)); });
      tally.text(`${done} / ${n}`); draw(meter, progress);
    },
  };
}
