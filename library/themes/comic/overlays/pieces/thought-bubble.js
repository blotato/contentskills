import {comicStage, C, up, wrap, capH, measure, txt, puff, inked, scaleTo, span, spring, leave, mix} from '../../kit.js';

// A thought bubble: a scalloped cloud that puffs open with its lines of hand lettering, trailing
// three shrinking bubbles toward the thinker. (x, y) is the cloud's centre; `tail` is the point
// the bubbles lead to. The cloud's outline boils.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'Wait... is this the whole plan?', x: 520, y: 310, width: 640, size: 54, tail: {x: 760, y: 640}};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, o = {role: 'hand'}, size = props.size, lines = wrap(up(props.text), size, props.width - 150, o), cap = capH(size, o), pitch = size * 1.18;
  const w = Math.max(...lines.map(l => measure(l, size, o)), 160) + 170, h = cap + (lines.length - 1) * pitch + 150;
  const dx = props.tail.x - props.x, dy = props.tail.y - props.y, len = Math.hypot(dx, dy) || 1, edge = Math.min(.8, (h / 2 + 30) / Math.max(1, Math.abs(dy)));
  const dots = [0, 1, 2].map(i => { const k = mix(edge + .08, Math.min(1, edge + .5), i / 2), g = root.append('g').attr('transform', `translate(${props.x + dx * k} ${props.y + dy * k})`).append('g'); inked(g, `M${-34 + i * 10} 0a${34 - i * 10} ${(34 - i * 10) * .8} 0 1 0 ${68 - i * 20} 0a${34 - i * 10} ${(34 - i * 10) * .8} 0 1 0 ${-68 + i * 20} 0`, {fill: C.white, width: 6, drop: 6}); return g; });
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g'), cloud = puff(g, w / 2, h / 2, {lobes: 11, seed: 3, width: 7, drop: 10});
  const rows = lines.map((line, i) => txt(g, 0, -((lines.length - 1) * pitch) / 2 + cap / 2 + i * pitch, line, {size, role: 'hand', color: C.ink, anchor: 'middle'}));
  return {
    seek(t) {
      const x = leave(t, props.life);
      dots.forEach((d, i) => scaleTo(d, spring(span(t, (2 - i) * .1, .35)) * (1 - x) * (1 + .06 * Math.sin(t * 4 + i))));
      cloud.boil(t); scaleTo(g, spring(span(t, .3, .45)) * (1 - x) * (1 + .012 * Math.sin(t * 3)));
      rows.forEach((r, i) => r.attr('opacity', span(t, .55 + i * .2, .1)));
    },
  };
}
