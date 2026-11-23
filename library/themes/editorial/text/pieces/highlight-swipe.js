import {C, M, stage, g, lines, measure, capH, span, glide, ease, leave} from '../../kit.js';
import {sc, fitWrap, ground} from './_local.js';

// A sentence in serif over footage, rising line by line; then a soft tint and a wine underline draw under the words
// of `mark`, left to right, like a pen on a proof. Props: text, mark, x (centre), y (top), width, maxSize,
// align (center|left), ground (paper|ink|none), color.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'This is the part that matters', mark: 'the part', x: 540, y: 290, width: 880, maxSize: 110, align: 'center', ground: 'paper', color: 'ink'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 540, y = props.y ?? 290, w = Math.min(props.width ?? 880, 2 * Math.min(x - 70, 1010 - x)), left = props.align === 'left';
  const clean = s => String(s).toLowerCase().replace(/[^a-z0-9']/g, ''), raw = sc(props.text).replace(/\*/g, ''), words = raw.split(/\s+/).filter(Boolean), mk = String(props.mark ?? '').split(/\s+/).map(clean).filter(Boolean);
  let ms = -1; for (let i = 0; mk.length && i + mk.length <= words.length && ms < 0; i++) if (mk.every((m, j) => clean(words[i + j]) === m)) ms = i;
  const {size, lines: ls} = fitWrap(raw, w, props.maxSize ?? 110, 3), cap = capH(size), bh = ls.length * size * 1.02;
  const gr = ground(st, st.root, {y, h: bh, mode: props.ground ?? 'paper', color: props.color}), marks = g(st), ax = left ? x - w / 2 : x;
  const hd = lines(st, st.root, ls, ax, y, size, {anchor: left ? 'start' : 'middle', color: gr.fg, shadow: gr.shadow}), swipes = []; let n = 0;
  ls.forEach((ln, li) => { const ws = ln.split(' '), a = n, b = n + ws.length, s = Math.max(a, ms), e = Math.min(b, ms + mk.length); n = b; if (ms < 0 || s >= e) return;
    const row = hd.rows[li], x0 = row.x0 + measure(ws.slice(0, s - a).join(' ') + (s > a ? ' ' : ''), size) - size * .06, x1 = row.x0 + measure(ws.slice(0, e - a).join(' '), size) + size * .06, by = y + hd.cap + li * hd.pitch;
    swipes.push({x0, w: x1 - x0, tint: marks.append('rect').attr('x', x0).attr('y', by - cap - size * .1).attr('height', cap + size * .3).attr('fill', gr.acc).attr('fill-opacity', gr.dark ? .26 : .14),
      line: marks.append('rect').attr('x', x0).attr('y', by + size * .16).attr('height', Math.max(5, size * .05)).attr('fill', gr.acc)}); });
  const life = props.life ?? meta.duration, out = life - .32, at = .55 + ls.length * .09;
  return {seek(t) {
    const q = leave(t, life, .32), o = 1 - ease(span(t, out, .25));
    gr.node?.attr('opacity', ease(span(t, 0, .3)) * (1 - ease(q))); hd.seek(t, .1, out);
    swipes.forEach((s, i) => { const a = glide(span(t, at + i * .35, .5)), a2 = glide(span(t, at + i * .35 + .08, .5)); s.line.attr('width', s.w * a).attr('opacity', o); s.tint.attr('width', s.w * a2).attr('opacity', o); });
  }};
}
