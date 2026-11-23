import {C, F, line, ring, text, ticks, draw, span, easeInOut, flicker, scramble, typed} from '../../hud.js';
import {card} from './_card.js';

// A vertical timeline: a playhead runs down the rail and switches each milestone on as it
// passes — the date, a scrambled-in label and a typed detail line.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'First 90 days', unit: 'Illustrative · milestones', clear: false,
  items: [{when: 'Day 1', label: 'Pick one topic', detail: 'one viewer, one problem'}, {when: 'Week 2', label: 'Post every day', detail: 'short, rough, consistent'},
    {when: 'Week 6', label: 'Find the format', detail: 'repeat what gets watched'}, {when: 'Week 9', label: 'First offer', detail: 'a small product or service'}, {when: 'Day 90', label: 'Review and double down', detail: 'keep what works'}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), n = props.items.length, x = 280, y0 = 290, y1 = 880, step = (y1 - y0) / Math.max(1, n - 1), travel = [.5, 3.2];
  line(root, `M${x} ${y0 - 40}V${y1 + 40}`, C.grid, 4); const rule = ticks(root, x - 30, y0 - 40, y1 - y0 + 80, 40, C.dim, true), rail = line(root, `M${x} ${y0 - 40}V${y1 + 40}`, C.cyan, 4);
  const items = props.items.map((d, i) => {
    const y = y0 + i * step, g = root.append('g'), when = d.when.toUpperCase();
    text(g, x - 50, y + 11, when, {size: Math.min(32, 165 / (when.length * .8)), font: F.display, weight: 800, color: C.amber, anchor: 'end', spacing: '0'});
    const arm = line(g, `M${x + 16} ${y}H${x + 52}`, C.cyan, 3), burst = ring(g, x, y, 12, C.cyan, 2);
    g.append('rect').attr('x', x - 11).attr('y', y - 11).attr('width', 22).attr('height', 22).attr('fill', C.bg).attr('stroke', C.cyan).attr('stroke-width', 3).attr('transform', `rotate(45 ${x} ${y})`);
    const core = g.append('rect').attr('x', x - 5).attr('y', y - 5).attr('width', 10).attr('height', 10).attr('fill', C.cyan).attr('transform', `rotate(45 ${x} ${y})`);
    return {g, d, arm, burst, core, at: travel[0] + (i * step + 40) / (y1 - y0 + 80) * (travel[1] - travel[0]),
      label: text(g, x + 70, y + 6, '', {size: Math.min(42, 560 / (d.label.length * .5)), font: F.text, weight: 700, color: C.white, spacing: '.03em'}), detail: text(g, x + 70, y + 40, '', {size: 24, color: C.dim})};
  });
  const head = root.append('rect').attr('x', x - 9).attr('width', 18).attr('height', 18).attr('fill', C.white), pulse = root.append('rect').attr('x', x - 4).attr('width', 8).attr('height', 22).attr('fill', C.amber);
  return {seek(t) {
    draw(frame, span(t, 0, .5)); draw(rule, span(t, .1, .6));
    const q = span(t, travel[0], travel[1] - travel[0]), length = y1 - y0 + 80; rail.attr('stroke-dasharray', length).attr('stroke-dashoffset', length * (1 - q));
    head.attr('y', y0 - 40 + q * length - 9).attr('opacity', q > 0 && q < 1 ? 1 : 0);
    // After the rail is laid, packets keep travelling down it.
    const u = ((t - travel[1]) / 1.6) % 1; pulse.attr('y', y0 - 40 + u * length - 11).attr('opacity', t > travel[1] ? Math.sin(u * Math.PI) : 0);
    for (const it of items) {
      const since = t - it.at; it.g.attr('opacity', flicker(t, it.at));
      it.burst.attr('r', 12 + easeInOut(span(since, 0, .6)) * 34).attr('opacity', since > 0 ? 1 - span(since, 0, .6) : 0); draw(it.arm, span(since, .05, .25));
      it.core.attr('opacity', .55 + .45 * Math.sin(t * 4 + it.at * 3));
      it.label.text(scramble(it.d.label.toUpperCase(), span(since, .1, .45), t)); it.detail.text(typed(it.d.detail.toUpperCase(), span(since, .4, .5)));
    }
  }};
}
