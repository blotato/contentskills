import {C, stage, tone, up, flow, capH, measure, glyphs, pose, sheet, brush, clipLive, hold, span, jit, easeOut, presence, leave} from '../../kit.js';

// A line of heavy caps on black torn strips, one strip per line; the marked words get a
// highlighter stroke dragged behind them and flip to black as it passes.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'This is the part that matters', mark: 'the part', y: 330, accent: 'lime', width: 880, maxSize: 130};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, color = tone(props.accent ?? 'lime'), marked = up(props.mark ?? '').split(/\s+/).filter(Boolean);
  const {size, lines, pitch} = flow(up(props.text), props.width, 420, props.maxSize, 44, {role: 'head'}, 1.5), cap = capH(size), block = pitch * (lines.length - 1) + cap, top = props.y - block / 2 + cap, g = root.append('g');
  const rows = lines.map((line, i) => {
    const lw = measure(line, size), row = g.append('g'), y = top + i * pitch;
    sheet(row, {fill: C.soot, seed: i + 2, sides: 'rl', amp: 9, rim: C.white}).set(W / 2 - lw / 2 - 34, y - cap - size * .22, lw + 68, cap + size * .44);
    const strokes = row.append('g'), words = glyphs(row, line, W / 2, y, size, {by: 'word', anchor: 'middle'});
    const hot = words.filter(u => marked.includes(u.str.replace(/[^A-Z0-9]/g, '')));
    const swipe = hot.length ? (() => { const x0 = hot[0].cx - hot[0].w / 2 - 14, x1 = hot.at(-1).cx + hot.at(-1).w / 2 + 14, clip = clipLive(st); strokes.append('path').attr('d', brush(x0, y - cap - size * .1, x1 - x0, cap + size * .2, {seed: i + 4})).attr('fill', color).attr('fill-rule', 'evenodd').attr('clip-path', clip.url); return {x0, x1, clip, y}; })() : null;
    return {row, words, hot, swipe, i};
  });
  return {seek(t) {
    const s = st.tick(t), h = hold(t), x = leave(t, props.life);
    g.attr('opacity', presence(t, props.life) * (x > .6 ? 0 : 1));
    rows.forEach(r => {
      const on = h >= .05 + r.i * .12, j = jit(s, r.i, 2, .3); r.row.attr('transform', `translate(${j.x} ${j.y}) rotate(${(r.i % 2 ? .8 : -1) + j.r} ${W / 2} ${props.y})`).attr('opacity', on ? 1 : 0);
      const q = easeOut(span(h, .7 + r.i * .25, .3)); if (r.swipe) r.swipe.clip.set(r.swipe.x0 - 40, r.swipe.y - cap - size * .5, (r.swipe.x1 - r.swipe.x0 + 80) * q, cap + size);
      r.words.forEach(u => u.text.attr('fill', r.hot.includes(u) && r.swipe && u.cx < r.swipe.x0 + (r.swipe.x1 - r.swipe.x0 + 40) * q ? C.soot : C.bone));
    });
  }};
}
