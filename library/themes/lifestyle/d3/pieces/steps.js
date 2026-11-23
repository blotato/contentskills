import {card, C, up, fit, txt, stroke, pill, tickPath, clipLive, draw, fade, glide, span} from '../../kit.js';
import {arrive} from './_local.js';

// A checklist with a progress bar: steps arrive one by one, the first `done` of them tick
// themselves off (use `times` to tick on the word), the bar fills and the big count keeps up.
export const meta = {duration: 5.5, live: true};
export const defaults = {title: 'Reset the room in ten', unit: 'Illustrative checklist', clear: false, accent: 'leaf', done: 4, times: null,
  items: ['Open the window', 'Make the bed', 'Clear one surface', 'Laundry in the basket', 'Water the plants']};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, d3 = window.d3, n = props.items.length, top = 430, pitch = Math.min(100, 480 / n), box = Math.min(54, pitch * .6), at = i => props.times?.[i] ?? 1.3 + i * .55;
  const count = root.append('text').attr('x', 80).attr('y', 330).attr('fill', C.ink).style('font', '900 86px "Inter Tight"').style('letter-spacing', '-.035em'), of = txt(root.append('g'), 0, 330, `of ${n} done`, {size: 46, role: 'serif', color: C.soft});
  root.append('path').attr('d', pill(520, 290, 400, 26)).attr('fill', C.deep); const clip = clipLive(st); root.append('path').attr('d', pill(520, 290, 400, 26)).attr('fill', ink.accent).attr('clip-path', clip.url);
  const rows = props.items.map((label, i) => { const y = top + i * pitch, g = root.append('g'), on = i < props.done;
    g.append('rect').attr('x', 80).attr('y', y - box / 2).attr('width', box).attr('height', box).attr('rx', 8).attr('fill', 'none').attr('stroke', C.line).attr('stroke-width', 3);
    const fill = g.append('rect').attr('x', 80).attr('y', y - box / 2).attr('width', box).attr('height', box).attr('rx', 8).attr('fill', ink.accent), tick = stroke(g, tickPath(80, y - box / 2, box), C.cream, 6);
    const size = fit(label, 700, Math.min(40, pitch * .42), {role: 'soft'}), text = txt(g, 80 + box + 28, y + size * .34, label, {size, role: 'soft'});
    return {g, on, fill, tick, text, i}; });
  return {seek(t) {
    st.header(t); let done = 0, progress = 0;
    rows.forEach(r => { arrive(r.g, t, .3 + r.i * .12, 14); const since = r.on ? t - at(r.i) : -1, e = glide(span(since, 0, .6));
      if (since > 0) done++; progress += e / n; r.fill.attr('opacity', e); draw(r.tick, glide(span(since, .1, .5))); r.text.attr('fill', since > 0 ? C.dim : C.ink); });
    count.text(done).attr('opacity', fade(t, .25, .5)); d3.select(of.node().parentNode).attr('transform', `translate(${80 + 20 + count.node().getComputedTextLength()} 0)`); of.attr('opacity', fade(t, .35, .5));
    clip.set(520, 290, 400 * progress, 26);
  }};
}
