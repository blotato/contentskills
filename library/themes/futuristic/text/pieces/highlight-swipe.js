import {textStage, look, up, flow, capH, glyphs, pose, plate, shade, span, easeOut, easeBack, leave, vel} from '../kit.js';

// Overlay: a short phrase in heavy caps on a dark see-through plate, with a filled bar that
// swipes in behind the words given in `mark`, flipping them to dark as it passes. Words rise in
// one by one; on the way out the bar retracts and the words drop. `y` is the centre of the block.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'This is the part that matters', mark: 'the part', y: 330, accent: 'cyan', width: 880, maxSize: 130};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent);
  const {size, lines, pitch} = flow(up(props.text), props.width, 400, props.maxSize, 40), cap = capH(size), block = lines.length * pitch - (pitch - cap), top = props.y - block / 2;
  const back = shade(root, .7, 26), edge = root.append('path').attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 4), bars = root.append('g');
  const words = lines.flatMap((line, i) => glyphs(root, line, W / 2, top + cap + i * pitch, size, {by: 'word', anchor: 'middle', color: ink.text}).map(u => ({...u, line: i})));
  const x0 = Math.min(...words.map(u => u.cx - u.w / 2)) - 44, x1 = Math.max(...words.map(u => u.cx + u.w / 2)) + 44, bw = x1 - x0, by = top - 40, bh = block + 80;
  const clean = s => s.replace(/[^A-Z0-9]/g, ''), all = words.map(u => u.str), want = up(props.mark).split(/\s+/).filter(Boolean), at = all.findIndex((_, i) => want.length && want.every((w, j) => clean(all[i + j] ?? '') === clean(w)));
  const marked = at < 0 ? [] : words.slice(at, at + want.length), runs = [...new Set(marked.map(u => u.line))].map(line => {
    const run = marked.filter(u => u.line === line), rx = run[0].cx - run[0].w / 2 - 18, rx1 = run.at(-1).cx + run.at(-1).w / 2 + 18;
    return {run, x: rx, w: rx1 - rx, y: top + line * pitch - 14, bar: plate(bars, {fill: ink.accent, cut: 14})};
  });
  const begin = .25 + words.length * .08 + .2;
  return {
    seek(t) {
      const x = leave(t, props.life), open = easeOut(span(t, 0, .35)) * (1 - x);
      back.set(x0 + bw / 2 * (1 - open), by, bw * open, bh); edge.attr('d', open > .02 ? `M${x0 + bw / 2 * (1 - open)} ${by + bh}h${bw * open}` : '');
      words.forEach((u, j) => { const q = span(t, .1 + j * .08, .42); pose(u, {y: (1 - easeBack(q)) * u.cap * .9 + x * u.cap * .6, sy: 1 + vel(q) * .3, o: span(t, .1 + j * .08, .1) * (1 - x)}); });
      runs.forEach((r, i) => {
        const s = easeOut(span(t, begin + i * .2, .4)) * (1 - span(x, 0, .6)), end = r.x + r.w * s;
        r.bar.set(r.x, r.y, r.w * s, cap + 28); r.run.forEach(u => u.text.attr('fill', end > u.cx ? ink.on : ink.text));
      });
    },
  };
}
