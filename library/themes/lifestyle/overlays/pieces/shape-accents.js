import {stage, look, C, blob, arch, loops, leafPath, stroke, draw, fade, glide, span, leave} from '../../kit.js';

// A few soft shapes that live in the corners while someone talks: a breathing blob top-left
// with an outlined arch behind it, a brushed loop scribble top-right, and a sprig of leaves and
// a second blob at the bottom. They grow in gently and keep breathing; nothing reaches the middle.
export const meta = {duration: 6, live: true};
export const defaults = {accent: 'leaf', top: true, bottom: true, opacity: .92};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), g = root.append('g'), parts = [];
  if (props.top) {
    const a = g.append('g').attr('transform', 'translate(110 150)'), b1 = a.append('path').attr('fill', ink.accent), ring = stroke(g, arch(150, 70, 190, 290), C.cream, 5).attr('filter', st.soft);
    const scr = stroke(g.append('g').attr('transform', 'translate(900 190) rotate(-8)'), loops(230, 120, 3), ink.alt, 14);
    parts.push(t => { b1.attr('d', blob(150, 3, t * .8)).attr('transform', `scale(${glide(span(t, 0, 1.2)) * (1 + .03 * Math.sin(t * .7))})`); draw(ring, glide(span(t, .3, 1.3))); draw(scr, glide(span(t, .6, 1.4))); });
  }
  if (props.bottom) {
    const b = g.append('g').attr('transform', 'translate(990 1790)'), b2 = b.append('path').attr('fill', ink.third), sprig = g.append('g').attr('transform', 'translate(70 1850)');
    const stem = stroke(sprig, 'M0 0C30 -90 40 -190 110 -290', C.cream, 5).attr('filter', st.soft);
    const leaves = [[14, -70, -150, 80], [34, -150, -20, 90], [56, -215, -135, 76], [84, -262, -25, 80], [108, -290, -80, 70]].map(([x, y, rot, r], i) => ({node: sprig.append('g').attr('transform', `translate(${x} ${y})`).append('path').attr('d', leafPath(r)).attr('fill', ink.accent), rot, i}));
    parts.push(t => { b2.attr('d', blob(170, 8, t * .7 + 2)).attr('transform', `scale(${glide(span(t, .2, 1.2)) * (1 + .03 * Math.sin(t * .6 + 1))})`); draw(stem, glide(span(t, .4, 1.2)));
      sprig.attr('transform', `translate(70 1850) rotate(${Math.sin(t * .8) * 1.6})`);
      leaves.forEach(l => l.node.attr('transform', `rotate(${l.rot + Math.sin(t * 1.1 + l.i) * 3}) scale(${glide(span(t, .7 + l.i * .14, .8))})`)); });
  }
  return {seek(t) { g.attr('opacity', props.opacity * fade(t, 0, .5) * (1 - leave(t, props.life, .7))); parts.forEach(f => f(t)); }};
}
