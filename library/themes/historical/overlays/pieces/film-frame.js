import {C, F, stage, film, torn, weave, hash, tick, span, settle} from '../../kit.js';
import {live, strip} from './_overlay.js';

// Old-film dressing for the whole clip: a heavy vignette, moving grain, dust, hairline scratches,
// projector flicker, a soft-edged gate that weaves, and typed archive references in the corners.
// Run it for the full length of the footage, under everything else.
export const meta = {duration: 6, live: true};
export const defaults = {topLeft: 'REEL 04', topRight: 'ARCHIVE COPY', bottomLeft: '', bottomRight: 'NO. 0417', wear: 1, vignette: .8, leak: .22, gate: 26, inset: 54};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W, H} = st, m = props.inset, g = root.append('g');
  const fx = film(st, {amount: props.wear, vignette: props.vignette, leak: props.leak});
  const gt = props.gate, gate = gt ? st.front.append('path').attr('fill', '#000').attr('fill-rule', 'evenodd').attr('opacity', .92)
    .attr('d', `M-40 -40H${W + 40}V${H + 40}H-40Z` + torn(gt, gt, W - gt * 2, H - gt * 2, {seed: 9, rough: 5, step: 30})) : null;
  const refs = [props.topLeft, props.topRight, props.bottomLeft, props.bottomRight].map((s, i) => { if (!s) return null; const right = i % 2 === 1, bottom = i > 1, b = strip(g, String(s).toUpperCase(), {size: 26, seed: i + 2, anchor: right ? 'end' : 'start', spacing: .1});
    b.g.attr('transform', `translate(${right ? W - m : m} ${bottom ? H - m - b.h / 2 : m + b.h / 2})`); return b; });
  return {seek(t) {
    live(st, t, props); fx(t); const [wx, wy] = weave(t, 2);
    gate?.attr('transform', `translate(${wx} ${wy})`); refs.forEach((b, i) => b?.set(span(t, .5 + i * .25, 1.1)));
  }};
}
