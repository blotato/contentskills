import {C, FRAME, hudStage, line, text, span, presence, easeOut, hash, clamp} from '../../hud.js';

// A full-frame grid backdrop that builds itself: lines shoot out from the centre, a wave of lit
// cells radiates from `origin`, crosses mark the intersections, then stray cells keep blinking.
// Nothing is drawn inside `keep` (0..1 of the frame) — set it to the face area so the speaker
// stays clear, or to null for the whole frame.
export const meta = {duration: 4.5, live: true};
export const defaults = {cell: 120, keep: {x: .2, y: .15, w: .6, h: .36}, origin: {x: .5, y: .95}, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root, defs, id} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, {width: W, height: H} = FRAME, s = props.cell, cols = Math.ceil(W / s), rows = Math.ceil(H / s), k = props.keep;
  const mask = defs.append('mask').attr('id', id + '-keep').attr('maskUnits', 'userSpaceOnUse').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H); mask.append('rect').attr('width', W).attr('height', H).attr('fill', '#fff');
  if (k) mask.append('rect').attr('x', k.x * W).attr('y', k.y * H).attr('width', k.w * W).attr('height', k.h * H).attr('rx', 40).attr('fill', '#000');
  const g = root.append('g').attr('mask', `url(#${id}-keep)`), ox = props.origin.x * W, oy = props.origin.y * H, reach = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
  const vertical = Array.from({length: cols + 1}, (_, i) => ({i, at: .05 + Math.abs(i - cols / 2) * .05, node: line(g, '', color, 1.5).attr('opacity', .45)}));
  const horizontal = Array.from({length: rows + 1}, (_, j) => ({j, at: .15 + Math.abs(j - rows / 2) * .04, node: line(g, '', color, 1.5).attr('opacity', .45)}));
  const cells = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) cells.push({n: j * cols + i, d: Math.hypot((i + .5) * s - ox, (j + .5) * s - oy) / reach, node: g.append('rect').attr('x', i * s + 5).attr('y', j * s + 5).attr('width', s - 10).attr('height', s - 10).attr('fill', color).attr('opacity', 0)});
  let d = ''; for (let j = 1; j < rows; j++) for (let i = 1; i < cols; i++) d += `M${i * s - 9} ${j * s}h18M${i * s} ${j * s - 9}v18`;
  const crosses = line(g, d, C.white, 2), tags = Array.from({length: rows}, (_, j) => text(g, 12, j * s + 30, `R${String(j + 1).padStart(2, '0')}`, {size: 20, color: C.dim, spacing: '.1em'}));
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      for (const v of vertical) { const q = easeOut(span(t, v.at, .7)) * H / 2; v.node.attr('d', `M${v.i * s} ${H / 2 - q}V${H / 2 + q}`); }
      for (const h of horizontal) { const q = easeOut(span(t, h.at, .7)) * W / 2; h.node.attr('d', `M${W / 2 - q} ${h.j * s}H${W / 2 + q}`); }
      // Two wavefronts: the first reveal, then a repeating slower ripple; plus seeded stray blinks.
      const first = (t - .5) / 1.1, again = ((t - 2) / 2.4) % 1;
      for (const c of cells) { const wave = Math.max(0, 1 - Math.abs(first - c.d) * 7) * .38 + (t > 2 ? Math.max(0, 1 - Math.abs(again * 1.3 - c.d) * 9) * .22 : 0), stray = t > 1 && hash(c.n, Math.floor(t * 4)) > .965 ? .3 : 0;
        c.node.attr('opacity', clamp(wave + stray + (hash(c.n, 1) > .9 ? .07 * span(t, 1.2, .3) : 0))); }
      crosses.attr('opacity', span(t, .7, .4) * .7); tags.forEach((tag, j) => tag.attr('opacity', span(t, .8 + j * .04, .1)));
    },
  };
}
