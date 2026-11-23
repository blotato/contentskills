import {comicStage, C, look, up, fit, capH, measure, txt, specklePath, zoomLinesPath, scaleTo, span, spring, easeOut, leave, hash} from '../../kit.js';

// A rubber stamp slammed onto the shot: a double-ruled box with the verdict in heavy caps, all in
// one ink colour on paper, landing oversized with a flash of zoom lines and a spatter of ink
// specks, then sitting slightly crooked. `sub` is the smaller line underneath.
export const meta = {duration: 3, live: true};
export const defaults = {text: 'BUSTED', sub: 'MYTH NO. 1', x: 540, y: 360, accent: 'red', tilt: -9, width: 720};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), color = ink.accent === C.yellow ? C.red : ink.accent, text = up(props.text), o = {role: 'slab'};
  const size = fit(text, props.width - 110, 230, o), cap = capH(size, o), ssize = 46, w = Math.max(measure(text, size, o), props.sub ? measure(up(props.sub), ssize, o) : 0) + 110, h = cap + (props.sub ? ssize + 26 : 0) + 96;
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g');
  const rays = g.append('path').attr('d', zoomLinesPath(0, 0, w * .58, w * .85, {n: 36, seed: 6, thick: 1.5})).attr('fill', C.ink).attr('transform', `scale(1 ${Math.min(1, (h + 100) / w)})`);
  const spatter = g.append('path').attr('d', Array.from({length: 26}, (_, i) => { const a = hash(i, 3) * Math.PI * 2, d = w * (.5 + hash(i, 5) * .28), r = 3 + hash(i, 7) * 9; return `M${Math.cos(a) * d - r} ${Math.sin(a) * d * .6}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`; }).join('')).attr('fill', color);
  g.append('rect').attr('x', -w / 2 + 10).attr('y', -h / 2 + 10).attr('width', w).attr('height', h).attr('rx', 18).attr('fill', C.ink);
  g.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('rx', 18).attr('fill', C.paper).attr('stroke', color).attr('stroke-width', 14);
  g.append('rect').attr('x', -w / 2 + 22).attr('y', -h / 2 + 22).attr('width', w - 44).attr('height', h - 44).attr('rx', 8).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 5);
  txt(g, 0, -h / 2 + 48 + cap, text, {size, role: 'slab', color, anchor: 'middle'});
  if (props.sub) txt(g, 0, h / 2 - 48, up(props.sub), {size: ssize, role: 'slab', color, anchor: 'middle', spacing: .16});
  g.append('path').attr('d', specklePath(-w / 2, -h / 2, w, h, {n: 60, seed: 8})).attr('fill', C.paper);   // worn ink
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, .05, .4), s = q <= 0 ? 0 : 1 + 2.2 * (1 - spring(q));
      scaleTo(g, s * (1 - x), props.tilt + (1 - easeOut(q)) * 14);
      rays.attr('opacity', t > .2 && t < .5 ? 1 : 0); spatter.attr('opacity', t > .22 ? 1 : 0).attr('transform', `scale(${.8 + easeOut(span(t, .22, .3)) * .25})`);
    },
  };
}
