import {C, stage, up, span, ease, io, light, flash, pulse, title, flow, measure, capH, pool, leave} from '../../kit.js';

// A sentence over the footage in tracked capitals. A line of light draws under the marked words and
// a red pulse runs along it; each marked word lands (orange, red, white) as the pulse passes, and a
// blue flash marks the end. `y` is the block's centre; `width` the widest line.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'This is the part that matters', mark: 'the part', y: 330, width: 880, maxSize: 84};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, o = {track: .2};
  const {size, lines, pitch} = flow(up(props.text), props.width ?? 880, 380, props.maxSize ?? 84, 30, o, 2.1), cap = capH(size);
  const top = (props.y ?? 330) - (lines.length * pitch - (pitch - cap)) / 2, clean = s => s.replace(/[^A-Z0-9']/g, '');
  const words = [];
  lines.forEach((line, li) => { let at = 0; const lw = measure(line, size, o), x0 = W / 2 - lw / 2, y = top + cap + li * pitch;
    for (const w of line.split(' ')) { const idx = line.indexOf(w, at); at = idx + w.length; const left = x0 + (idx ? measure(line.slice(0, idx), size, o) + o.track * size : 0), ww = measure(w, size, o); words.push({w, li, left, ww, y, cx: left + ww / 2}); } });
  const want = up(props.mark).split(/\s+/).map(clean).filter(Boolean), all = words.map(u => clean(u.w));
  const start = all.findIndex((_, i) => want.length && want.every((w, j) => all[i + j] === w)), marked = start < 0 ? [] : words.slice(start, start + want.length);
  const shade = pool(root, W / 2, props.y ?? 330, (props.width ?? 880) * .72, lines.length * pitch / 2 + 150, 1);
  words.forEach(u => { u.hot = marked.includes(u); if (u.hot) u.ghost = title(root, u.w, u.cx, u.y, size, {...o, land: false, color: C.dim, halo: 6}); u.node = title(root, u.w, u.cx, u.y, size, {...o, land: u.hot, color: C.core, halo: 6}); });
  // One underline per line the marked words sit on; the pulse runs them in order.
  const runs = [...new Set(marked.map(u => u.li))].map(li => { const r = marked.filter(u => u.li === li), x0 = r[0].left - 10, x1 = r.at(-1).left + r.at(-1).ww + 10, y = r[0].y + 20; const l = light(root, [[x0, y], [x1, y]], {width: 3}); return {l, x0, x1, r, run: pulse(root, l)}; });
  const blue = flash(root, marked.at(-1)?.cx ?? W / 2, marked.at(-1)?.y ?? 0, {color: 'blue', r: 200}), begin = .3 + words.length * .06 + .2, each = .9;
  return {seek(t) {
    const x = leave(t, props.life, .5); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    words.forEach((u, i) => (u.hot ? u.ghost : u.node).show(1, ease(span(t, .1 + i * .06, .5)) * (1 - x) * (u.hot ? .6 : 1)));
    runs.forEach((r, i) => { const s = begin + i * each, q = span(t, s, each); r.l.range(ease(x), io(q)); r.run(x > 0 ? 0 : q);
      r.r.forEach(u => { const p = (u.cx - r.x0) / (r.x1 - r.x0); const a = ease(span(t, s + p * each - .1, .8)); u.node.show(a, 1 - x); if (a > 0) u.ghost.show(1, 0); }); });
    const end = begin + runs.length * each; blue.set(t > end ? .5 * (1 - ease((t - end) / 1)) * (1 - x) : 0);
  }};
}
