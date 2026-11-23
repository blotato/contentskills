import {C, series, up, wrap, captionBox, clipLive, scaleTo, span, spring, easeInOut, mix} from '../../kit.js';
import {card, shout} from './_card.js';

// A story in order: a thick ink line runs across the panel, a disc pops at each moment, and
// caption boxes pop above and below it in turn with the date shouted over each one.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'How it grew', unit: 'Illustrative · milestones', clear: false, colors: series,
  events: [{when: '2021', label: 'First upload'}, {when: '2022', label: 'One thousand fans'}, {when: '2023', label: 'First sponsor'}, {when: '2024', label: 'Went full time'}]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, E = props.events, n = E.length, x0 = 130, x1 = 870, y = 610, colors = props.colors ?? series, X = i => mix(x0, x1, n > 1 ? i / (n - 1) : .5);
  const mask = clipLive(stage); mask.rect.attr('x', 0).attr('y', y - 40).attr('height', 90);
  const rail = root.append('g').attr('clip-path', mask.url); rail.append('path').attr('d', `M70 ${y + 8}L940 ${y + 2}`).attr('stroke', C.ink).attr('stroke-width', 14).attr('stroke-linecap', 'round');
  rail.append('path').attr('d', `M70 ${y + 8}L940 ${y + 2}`).attr('stroke', C.yellow).attr('stroke-width', 4).attr('stroke-dasharray', '18 16');
  const bw = Math.min(300, n > 2 ? (x1 - x0) / (n - 1) * 2 - 30 : 340);
  const marks = E.map((d, i) => {
    const x = X(i), above = i % 2 === 0, lines = wrap(up(d.label), 28, bw - 40, {role: 'hand'}).slice(0, 4), bh = 28 + lines.length * 34, by = above ? y - 132 - bh : y + 142;
    const stem = root.append('path').attr('d', above ? `M${x} ${y - 30}V${by + bh}` : `M${x} ${y + 40}V${by}`).attr('stroke', C.ink).attr('stroke-width', 5).attr('stroke-dasharray', '3 11').attr('stroke-linecap', 'round');
    const bx = Math.max(70 + 10, Math.min(930 - 10, x)), box = captionBox(root, bx, by, lines.join('\n'), {size: 28, anchor: i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle', fill: C.white, tilt: (i % 2 ? 1.5 : -1.5)});
    const date = shout(root.append('g').attr('transform', `translate(${i === 0 ? bx + box.w / 2 : i === n - 1 ? bx - box.w / 2 : bx} ${above ? y - 52 : y + 112})`).append('g'), 0, 0, up(d.when), {size: 58, color: i % 2 ? C.yellow : C.red});
    const node = root.append('g').attr('transform', `translate(${x} ${y + 5})`).append('g'); node.append('circle').attr('r', 24).attr('cx', 5).attr('cy', 5).attr('fill', C.ink); node.append('circle').attr('r', 24).attr('fill', colors[i % colors.length]).attr('stroke', C.ink).attr('stroke-width', 7);
    return {x, stem, box, date: window.d3.select(date.node().parentNode), node};
  });
  return {seek(t) {
    stage.intro(t);
    const run = easeInOut(span(t, .4, 2.6)); mask.rect.attr('width', 70 + 880 * run);
    marks.forEach(({x, stem, box, date, node}, i) => {
      const at = .4 + 2.6 * Math.max(0, (x - 110) / 880) * .8;
      scaleTo(node, spring(span(t, at, .4)) * (1 + .08 * Math.sin(t * 4 + i)), 0); stem.attr('opacity', span(t, at + .15, .15));
      scaleTo(box.g, spring(span(t, at + .2, .4)), 0); scaleTo(date, spring(span(t, at + .35, .4)), 0);
    });
  }};
}
