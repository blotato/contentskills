import {F, M, stage, g, line, label, folio, rule, fit, capH, pad, span, glide, ease} from '../../kit.js';
import {page, sc, fade, gone, outOf} from './_local.js';

// Page numbers turning: each count is a huge Didone numeral that rises from behind a hairline and leaves upward as
// the next one arrives; a row of mono folios keeps the place; on the last beat the `go` word rises in accent italic.
// Props: from, go, label, note, labels (4), field. The beats divide the piece's time evenly.
export const meta = {duration: 4};
export const defaults = {from: 3, go: 'Begin', label: 'Starting in', note: 'Hold still', labels: ['Stand by', 'Take 01', '', ''], field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {W, sq} = st, u = sq ? .8 : 1, w = W - 2 * M, pg = page(st, props.labels), n = Math.max(1, Math.min(9, Math.round(props.from ?? 3))), life = props.life ?? meta.duration, beat = life / (n + 1), out = outOf(props);
  const no = {font: F.serif, weight: 400}, S = Math.min(sq ? 520 : 720, (pg.h - 110 * u - 250) / .72), cap = capH(S, no), lh = props.label ? 76 : 0, bh = lh + cap + 36 + 76 + (props.note ? 60 : 0), top = pg.mid - bh / 2, base = top + lh + cap, ry = base + 36;
  const lab = props.label ? label(st.root, W / 2, top + 28, props.label, {size: 28, color: st.fg, anchor: 'middle'}) : null;
  const cid = st.uid('turn'); st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', 0).attr('y', top + lh - S * .2).attr('width', W).attr('height', ry - (top + lh - S * .2));
  const win = g(st).attr('clip-path', `url(#${cid})`), nums = Array.from({length: n}, (_, i) => line(st, win, String(n - i), W / 2, base, S, {...no, anchor: 'middle'}));
  const gw = `*${sc(props.go ?? '').replace(/\*/g, '')}*`, gs = fit(gw, w * .92, S * .6), go = line(st, win, gw, W / 2, base - cap * .26, gs, {anchor: 'middle'});
  const rl = rule(st.root, M, ry, W - M, ry, {color: st.fg, width: 2}), sp = 96, ticks = Array.from({length: n}, (_, i) => folio(st.root, W / 2 + (i - (n - 1) / 2) * sp, ry + 56, pad(n - i), {size: 30, color: st.fg, anchor: 'middle'}));
  const note = props.note ? label(st.root, W / 2, ry + 56 + 62, props.note, {size: 26, color: st.sub, weight: 500, anchor: 'middle'}) : null;
  return {seek(t) {
    const q = gone(t, out); pg.seek(t, 0, out); lab?.attr('opacity', fade(t, .1, out)); rl.range(q, glide(span(t, 0, .45))); note?.attr('opacity', fade(t, .3, out));
    nums.forEach((d, i) => d.set(span(t, i * beat + (i ? 0 : .12), .42), span(t, (i + 1) * beat - .2, .26)));
    go.set(span(t, n * beat, .45), span(t, out ?? 1e9, .25));
    ticks.forEach((k, i) => k.attr('opacity', (ease(span(t, .2 + i * .06, .3)) * (.28 + .72 * ease(span(t, i * beat, .25)) * (1 - ease(span(t, (i + 1) * beat - .15, .25)))) * (1 - q)).toFixed(3)));
  }};
}
