import {C, F, M, stage, g, text, line, label, fit, capH, fieldOf, span, glide, ease} from '../../kit.js';
import {page, sc, fade, gone, outOf} from './_local.js';

// A spread in two grounds: the upper page holds word A in upright serif, the lower page slides up in a second
// ground with word B in accent italic set to the right; a small printed seal on the seam carries "or" / "vs".
// Props: a, b, mark, aNote, bNote, labels (4), fields [upper, lower] (paper, stone, blush, ink, wine).
export const meta = {duration: 4.5, live: true};
export const defaults = {a: 'Fast', b: 'Perfect', mark: 'or', aNote: 'Ships today', bNote: 'Ships someday', labels: ['Round one', 'Pick a side', '', ''], fields: ['paper', 'wine'], field: null};

export function mount(el, props = defaults) {
  const fa = fieldOf(props.field ?? props.fields?.[0] ?? 'paper'); let fb = fieldOf(props.fields?.[1] ?? 'wine'); if (fb.name === fa.name) fb = fieldOf(fa.dark ? 'paper' : 'wine');
  const st = stage(el, {field: fa.name}), {W, H, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, out = outOf(props), mid = H / 2;
  const lower = st.root.append('rect').attr('x', 0).attr('width', W).attr('fill', fb.bg), pg = page(st, props.labels, {footColor: fb.fg});
  const a = sc(props.a).replace(/\*/g, ''), b = `*${sc(props.b).replace(/\*/g, '')}*`, size = Math.min(fit([a, b], w, sq ? 250 : 330), (mid - pg.top - 230 * u) / .8), cap = capH(size), ya = mid - 150 * u, yb = mid + 150 * u + cap;
  const la = line(st, st.root, a, M, ya, size), an = props.aNote ? label(st.root, M, ya - cap - 46, props.aNote, {size: 28, color: fa.accent}) : null;
  const lb = line(st, st.root, b, W - M, yb, size, {anchor: 'end', color: fb.fg, accent: fb.accent}), bn = props.bNote ? label(st.root, W - M, yb + size * .25 + 50, props.bNote, {size: 28, color: fb.fg, anchor: 'end'}) : null;
  const r = 64 * u, seal = g(st), mk = sc(props.mark ?? '', false);
  seal.append('circle').attr('r', r).attr('fill', C.paper).attr('stroke', C.ink).attr('stroke-width', 1.5); seal.append('circle').attr('r', r - 9).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-opacity', .35).attr('stroke-width', 1.5);
  const ms = Math.min(r * .95, fit(mk, r * 1.3, 200, {font: F.italic})); text(seal, 0, ms * .26, mk, {font: F.italic, size: ms, color: C.wine, anchor: 'middle'});
  return {seek(t) {
    const q = gone(t, out), p = glide(span(t, .45, .55)), y = H - (H - mid) * p, s = glide(span(t, .95, .45));
    lower.attr('y', y).attr('height', H - y).attr('opacity', 1 - q); pg.seek(t, 0, out);
    an?.attr('opacity', fade(t, .2, out)); la.set(span(t, .25, .5), span(t, out ?? 1e9, .25));
    lb.set(span(t, .8, .5), span(t, out ?? 1e9, .25)); bn?.attr('opacity', fade(t, 1.2, out));
    seal.attr('transform', `translate(${W / 2} ${mid + (1 - s) * 24})`).attr('opacity', ease(span(t, .95, .3)) * (1 - q));
  }};
}
