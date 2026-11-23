import {comicStage, C, look, captionBox, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// A fat inked arrow that swoops from a caption box to a point in the shot, drawing itself along
// its curve before the head pops on and wags. `from` is where the box sits (its centre) and `to`
// what the arrow points at, both in frame pixels. `bend` curves it (negative bends the other way).
export const meta = {duration: 3.5, live: true};
export const defaults = {label: 'LOOK AT THIS', from: {x: 300, y: 250}, to: {x: 820, y: 520}, accent: 'red', bend: .35, size: 44};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), a = props.from, b = props.to, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const mx = (a.x + b.x) / 2 - dy * props.bend, my = (a.y + b.y) / 2 + dx * props.bend, end = Math.atan2(b.y - my, b.x - mx), tipBack = {x: b.x - Math.cos(end) * 64, y: b.y - Math.sin(end) * 64};
  const d = `M${a.x} ${a.y}Q${mx} ${my} ${tipBack.x} ${tipBack.y}`, g = root.append('g');
  const shadow = g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 40).attr('stroke-linecap', 'round').attr('transform', 'translate(9 9)');
  const outline = g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 40).attr('stroke-linecap', 'round'), body = g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 24).attr('stroke-linecap', 'round');
  const total = body.node().getTotalLength(), head = root.append('g').attr('transform', `translate(${b.x} ${b.y}) rotate(${end * 180 / Math.PI})`).append('g'), tri = 'M0 0L-92 -52L-74 0L-92 52Z';
  head.append('path').attr('d', tri).attr('fill', C.ink).attr('stroke', C.ink).attr('stroke-width', 8).attr('stroke-linejoin', 'round').attr('transform', 'translate(6 10)');
  head.append('path').attr('d', tri).attr('fill', ink.accent).attr('stroke', C.ink).attr('stroke-width', 8).attr('stroke-linejoin', 'round');
  const box = captionBox(root, a.x, a.y - 46, props.label, {size: props.size, anchor: 'middle', fill: ink.accent === C.yellow ? C.white : C.yellow, tilt: -3, drop: 9, width: 6});
  return {
    seek(t) {
      const x = leave(t, props.life), q = easeOut(span(t, .3, .45)) * (1 - x);
      [shadow, outline, body].forEach(p => p.attr('stroke-dasharray', `${total} ${total}`).attr('stroke-dashoffset', total * (1 - q)).attr('opacity', q > .01 ? 1 : 0));
      scaleTo(box.g, spring(span(t, 0, .42)) * (1 - x));
      const h = span(t, .68, .4); scaleTo(head, spring(h) * (1 - x), Math.sin(t * 6) * 5 * (h >= 1 ? 1 : 0)); head.attr('transform', head.attr('transform') + ` translate(${Math.max(0, Math.sin(t * 6)) * 10} 0)`);
    },
  };
}
