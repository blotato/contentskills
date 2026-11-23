import {comicStage, C, look, up, flow, capH, measure, glyphs, letterOn, plate, spark, scaleTo, span, spring, easeOut, leave, vel} from '../../kit.js';

// Overlay: a sentence in inked caps with a marker slab swiped behind the words that matter.
// The words letter on one after another, then the slab whips across the `mark` phrase, which
// turns to the dark ink and bumps. `y` is the vertical centre, `width` the wrap width.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'This is the part that matters', mark: 'the part', y: 330, accent: 'yellow', width: 880, maxSize: 130};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), o = {role: 'head'};
  const {size, lines, pitch} = flow(up(props.text), props.width, 420, props.maxSize, 40, o, 1.5), cap = capH(size), block = lines.length * pitch - (pitch - cap), top = props.y - block / 2, want = up(props.mark).split(/\s+/).filter(Boolean);
  const swipes = root.append('g'), rows = lines.map((line, i) => glyphs(root, line, W / 2, top + cap + i * pitch, size, {by: 'word', anchor: 'middle', color: C.white, seed: i + 1}));
  // Find the marked phrase as a run of consecutive words; it may straddle a line break.
  const flat = rows.flatMap((row, r) => row.map(u => ({u, r}))), bare = s => s.replace(/[^A-Z0-9']/g, '');
  let start = -1; for (let i = 0; i + want.length <= flat.length && start < 0; i++) if (want.length && want.every((w, k) => bare(flat[i + k].u.str) === bare(w))) start = i;
  const marked = start < 0 ? [] : flat.slice(start, start + want.length), at = .35 + flat.length * .09;
  const bars = [...new Set(marked.map(m => m.r))].map((r, n) => {
    const us = marked.filter(m => m.r === r).map(m => m.u), x0 = us[0].cx - us[0].w / 2 - 22, x1 = us.at(-1).cx + us.at(-1).w / 2 + 26;
    return {slab: plate(swipes, {fill: ink.accent, cut: 26, drop: 9}), x0, w: x1 - x0, y: us[0].y - cap - 20, at: at + n * .22};
  });
  marked.forEach(m => m.u.marked = true);
  const star = bars.length ? spark(root, bars.at(-1).x0 + bars.at(-1).w + 14, bars.at(-1).y, 30, C.white) : null;
  return {
    seek(t) {
      const x = leave(t, props.life);
      flat.forEach(({u}, i) => { const q = span(t, .08 + i * .09, .3), hit = u.marked ? span(t, at, .35) : 0; letterOn(u, q, x); if (u.marked) { u.text.attr('fill', hit > .4 ? ink.on === C.ink ? C.white : C.yellow : C.white); if (hit > 0 && hit < 1 && x === 0) u.g.attr('transform', u.g.attr('transform') + ` scale(${1 + Math.sin(hit * Math.PI) * .14})`); } });
      bars.forEach(b => { const q = span(t, b.at, .32), e = easeOut(q) * (1 - x); b.slab.box(b.x0, b.y, b.w * e, cap + 40); b.slab.g.attr('transform', `skewX(${-vel(q) * 16})`); });
      if (star) scaleTo(star, spring(span(t, at + .3, .4)) * (1 - x) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
