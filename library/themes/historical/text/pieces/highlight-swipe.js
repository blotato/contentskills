import {C, stage, tone, fillOf, inkOn, up, flow, capH, glyphs, arrive, torn, uid, span, settle, leave, presence} from '../../kit.js';

// A sentence set on dark strips, one per line; then a bar of colour wipes in behind the words you
// name in `mark` and they turn to the bar's ink. `y` is the centre of the block.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'This is the part that matters', mark: 'the part', y: 330, color: 'crimson', width: 920, maxSize: 130};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, fill = tone(props.color), o = {weight: 700, spacing: .03};
  const {size, lines} = flow(up(props.text), props.width - 80, 400, props.maxSize, 44, o, 1.2), cap = capH(size, o), pitch = cap + 56, top = props.y - (lines.length * pitch) / 2, g = root.append('g'), strips = g.append('g'), bars = g.append('g');
  const words = lines.flatMap((line, i) => { const us = glyphs(g, line, W / 2, top + i * pitch + pitch / 2 + cap / 2, size, {by: 'word', anchor: 'middle', ...o}), x0 = us[0].cx - us[0].w / 2 - 34, x1 = us.at(-1).cx + us.at(-1).w / 2 + 34;
    strips.append('path').attr('d', torn(x0, top + i * pitch + 3, x1 - x0, pitch - 2, {seed: i + 2, rough: 4, step: 14, sides: 'rl'})).attr('fill', C.glass).attr('class', 's' + i); return us.map(u => ({...u, line: i})); });
  words.forEach((u, k) => u.k = k);
  const want = up(props.mark ?? '').split(/\s+/).filter(Boolean).map(w => w.replace(/[^A-Z0-9']/g, '')), seq = words.map(u => u.str.replace(/[^A-Z0-9']/g, '')); let start = -1;
  for (let i = 0; want.length && i + want.length <= seq.length && start < 0; i++) if (want.every((wd, j) => seq[i + j] === wd)) start = i;
  const marked = start < 0 ? [] : words.slice(start, start + want.length), byLine = [...new Set(marked.map(u => u.line))].map(line => { const us = marked.filter(u => u.line === line), x0 = us[0].cx - us[0].w / 2 - 20, x1 = us.at(-1).cx + us.at(-1).w / 2 + 20, id = uid('hs'), y0 = top + line * pitch + 9;
    const clip = bars.append('clipPath').attr('id', id).append('rect').attr('x', x0 - 8).attr('y', y0 - 10).attr('height', pitch + 20).attr('width', 0);
    bars.append('path').attr('d', torn(x0, y0, x1 - x0, pitch - 14, {seed: line + 7, rough: 3.5, step: 10, sides: 'rl'})).attr('fill', fillOf(fill)).attr('clip-path', `url(#${id})`); return {clip, w: x1 - x0 + 16}; });
  return {seek(t) {
    const x = leave(t, props.life); root.attr('opacity', presence(t, props.life)); g.attr('transform', `translate(${4 * t} ${34 * x})`);
    lines.forEach((_, i) => strips.select('.s' + i).attr('opacity', span(t, i * .12, .4)));
    const at = .7 + words.length * .07; words.forEach(u => { arrive(u, span(t, .15 + u.k * .07, .6), 0, {from: 1.08, rise: 16}); });
    byLine.forEach(({clip, w}, i) => clip.attr('width', w * settle(span(t, at + i * .25, .6))));
    marked.forEach((u, i) => u.node.select('text').attr('fill', span(t, at + .15 + i * .08, .2) > .5 ? inkOn(fill) : C.bone));
  }};
}
