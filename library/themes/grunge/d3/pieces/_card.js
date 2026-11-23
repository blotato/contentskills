// Shared chrome for the grunge diagrams, so every card matches: the title typed on in heavy caps
// with a marker underline, a typewritten unit line, and (with clear: true, for floating over
// footage) a torn soot backing sheet. Content area: x 76..924, y `top`..920.
import {C, stage, look, up, fit, capH, txt, glyphs, typeOn, scribble, scrawl, sheet, cracks, span, hold, hash} from '../../kit.js';

export function card(el, props, {seed = 1, titleMax = 84} = {}) {
  const st = stage(el, {clear: props.clear, seed}), {root, fine, W} = st, ink = look(props.accent), m = 76;
  if (props.clear) {
    sheet(st.under, {fill: C.soot, seed: seed + 40, amp: 11, shadow: .5}).set(30, 30, 940, 940);
    cracks(st.under, 900, 900, {seed: seed + 6, n: 4, x: 50, y: 50, opacity: .22});
  }
  const title = up(props.title ?? ''), size = fit(title || 'X', W - m * 2, titleMax), cap = capH(size), ty = 92 + cap;
  const units = glyphs(root, title, m, ty, size, {color: ink.text}), tw = units.length ? units[0].total : 0;
  const line = scrawl(root, s => scribble.underline(m, m + Math.max(120, tw * .62), ty + 22, s, 4), {color: ink.accent, width: 7, seed});
  const unit = txt(fine, m, ty + 76, up(props.unit ?? ''), {size: 24, color: C.paper});
  const body = root.append('g'), labels = fine.append('g');
  return {st, body, fine: labels, ink, m, top: ty + 110,
    /** Call first in seek(t): boils the stage, plays the title. Returns the boil step. */
    intro(t) { const s = st.tick(t), h = hold(t); typeOn(units, span(h, .04, .12 + units.length * .028), s, {seed}); line.draw(span(h, .32, .3), s); unit.attr('opacity', h >= .42 ? 1 : 0); return s; }};
}
/** A straight-ish hand-drawn line a→b as a path string, wobbling with the seed. */
export const hand = (ax, ay, bx, by, seed = 1, amp = 4) => `M${ax + (hash(1, seed) - .5) * amp} ${ay + (hash(2, seed) - .5) * amp}Q${(ax + bx) / 2 + (hash(3, seed) - .5) * amp * 3} ${(ay + by) / 2 + (hash(4, seed) - .5) * amp * 3} ${bx + (hash(5, seed) - .5) * amp} ${by + (hash(6, seed) - .5) * amp}`;
/** A polyline through points with a per-seed wobble. */
export const wobbly = (pts, seed = 1, amp = 4) => pts.map((p, i) => `${i ? 'L' : 'M'}${(p[0] + (hash(i, seed) - .5) * amp * 2).toFixed(1)} ${(p[1] + (hash(i, seed + 7) - .5) * amp * 2).toFixed(1)}`).join('');
