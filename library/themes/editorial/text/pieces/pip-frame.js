import {C, F, stage, g, text, label, folio, fit, fieldOf, pad, span, glide, ease, leave} from '../../kit.js';
import {sc} from './_local.js';

// A picture mount around a region of the footage: a paper mat with a window (fill: 0 = see-through, 1 = a stone
// card) glides in; its top margin carries a tracked label and a figure number, its bottom margin an italic caption and
// a running mono timecode; a hairline draws around the window. `box` is {x, y, w, h} as shares of the frame and is
// the OUTSIDE of the mount. Props: box, label, caption, figure, fill, field.
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .5, y: .14, w: .435, h: .19}, label: 'Exhibit A', caption: 'Screen recording', figure: 'Fig. 1', fill: 0, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), f = fieldOf(props.field ?? 'paper'), b = props.box ?? defaults.box, x = b.x * 1080, y = b.y * 1920, w = b.w * 1080, h = b.h * 1920;
  const mt = props.label || props.figure ? 58 : 16, mb = props.caption ? 66 : 16, ms = 16, wx = x + ms, wy = y + mt, ww = w - 2 * ms, wh = h - mt - mb, body = g(st);
  // the mat: a card with its soft shadow, clipped so that neither covers the window
  const cid = st.uid('mat'); st.defs.append('clipPath').attr('id', cid).append('path').attr('clip-rule', 'evenodd').attr('d', `M${x - 120} ${y - 120}h${w + 240}v${h + 240}h${-w - 240}zM${wx} ${wy}v${wh}h${ww}v${-wh}z`);
  body.append('g').attr('clip-path', `url(#${cid})`).append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 3).attr('fill', f.bg).attr('filter', st.url('lift'));
  if (props.fill) body.append('rect').attr('x', wx).attr('y', wy).attr('width', ww).attr('height', wh).attr('fill', C.stone).attr('fill-opacity', props.fill);
  const per = 2 * (ww + wh), edge = body.append('rect').attr('x', wx).attr('y', wy).attr('width', ww).attr('height', wh).attr('fill', 'none').attr('stroke', f.fg).attr('stroke-width', 2).attr('stroke-dasharray', `${per} ${per}`);
  const lab = props.label ? label(body, wx, y + 39, props.label, {size: 28, color: f.fg}) : null, fig = props.figure ? folio(body, wx + ww, y + 39, props.figure, {size: 28, color: f.accent, anchor: 'end'}) : null;
  const cs = props.caption ? fit(sc(props.caption), ww - 130, 40, {font: F.italic}) : 0, cap = props.caption ? text(body, wx, y + h - 22, sc(props.caption), {font: F.italic, size: cs, color: f.fg}) : null;
  const tc = props.caption ? folio(body, wx + ww, y + h - 23, '', {size: 28, color: f.sub, anchor: 'end'}) : null, life = props.life ?? meta.duration;
  return {seek(t) {
    const a = glide(span(t, 0, .45)), q = ease(leave(t, life, .28));
    body.attr('transform', `translate(0 ${((1 - a) * 40 + q * 24).toFixed(1)})`).attr('opacity', ease(span(t, 0, .28)) * (1 - q));
    edge.attr('stroke-dashoffset', (per * (1 - glide(span(t, .2, .7)))).toFixed(1));
    lab?.attr('opacity', ease(span(t, .3, .3))); fig?.attr('opacity', ease(span(t, .4, .3))); cap?.attr('opacity', ease(span(t, .5, .3)));
    tc?.attr('opacity', ease(span(t, .6, .3))).select('tspan').text(`00:${pad(t)}`);
  }};
}
