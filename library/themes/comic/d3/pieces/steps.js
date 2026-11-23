import {C, series, up, flow, capH, inkOn, inked, boxPath, txt, spark, halftonePath, clipShape, scaleTo, span, spring, hash} from '../../kit.js';
import {card, shout} from './_card.js';

// A how-to as a page of numbered panels: each panel pops on in reading order, slightly crooked,
// with its number in a white disc and the step lettered inside. The current panel wiggles.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Make one video', unit: 'Illustrative · four steps', clear: false, colors: series, step: .7,
  items: ['Pick one idea', 'Write the hook first', 'Film it in one take', 'Post before you fuss']};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, I = props.items, n = I.length, cols = n <= 3 ? 1 : 2, rows = Math.ceil(n / cols), x0 = 76, y0 = 262, gap = 26, w = (848 - gap * (cols - 1)) / cols, h = (660 - gap * (rows - 1)) / rows, colors = props.colors ?? series;
  const panels = I.map((text, i) => {
    const col = i % cols, row = Math.floor(i / cols), fill = colors[i % colors.length], on = inkOn(fill), g = root.append('g').attr('transform', `translate(${x0 + col * (w + gap) + w / 2} ${y0 + row * (h + gap) + h / 2})`).append('g');
    const d = boxPath(-w / 2, -h / 2, w, h, 6, i + 3), clip = clipShape(stage, d); inked(g, d, {fill, drop: 10});
    g.append('g').attr('clip-path', clip.url).append('path').attr('d', halftonePath(-w / 2, -h / 2, w, h, {pitch: 22, from: [1, 1], reach: .7})).attr('fill', C.ink).attr('opacity', .18);
    g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 7).attr('stroke-linejoin', 'round');
    const disc = g.append('g').attr('transform', `translate(${-w / 2 + 62} ${-h / 2 + 62})`); disc.append('circle').attr('r', 44).attr('cx', 5).attr('cy', 5).attr('fill', C.ink); disc.append('circle').attr('r', 44).attr('fill', C.white).attr('stroke', C.ink).attr('stroke-width', 6);
    shout(disc, -3, 21, String(i + 1), {size: 62, color: C.red});
    const wide = cols === 1, tw = wide ? w - 170 : w - 60, th = wide ? h - 50 : h - 150, f = flow(up(text), tw, th, wide ? 64 : 56, 26, {role: 'slab'}, 1.3), cap = capH(f.size, {role: 'slab'}), block = f.lines.length * f.pitch - (f.pitch - cap);
    txt(g, wide ? -w / 2 + 130 : -w / 2 + 34, (wide ? -block / 2 : -h / 2 + 122 + (th - block) / 2) + cap, f.lines.join('\n'), {size: f.size, role: 'slab', color: on, leading: f.pitch / f.size});
    return {g, tilt: (hash(i, 8) - .5) * 3};
  });
  const star = spark(root, 0, 0, 34, C.yellow), place = window.d3.select(star.node().parentNode);
  return {seek(t) {
    stage.intro(t);
    const now = Math.min(n - 1, Math.max(0, Math.floor((t - .5) / props.step)));
    panels.forEach(({g, tilt}, i) => scaleTo(g, spring(span(t, .5 + i * props.step, .45)), tilt + (i === now ? Math.sin(t * 5) * .8 : 0)));
    const col = now % cols, row = Math.floor(now / cols);
    place.attr('transform', `translate(${x0 + col * (w + gap) + w - 8} ${y0 + row * (h + gap) + 6})`);
    scaleTo(star, t > .7 ? spring(span(t, .5 + now * props.step + .2, .35)) * (1 + .2 * Math.sin(t * 7)) : 0, t * 70);
  }};
}
