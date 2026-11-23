import {C, stage, label, folio, span, ease, glide, leave} from '../../kit.js';

// A thin printed frame inside the picture, like the keyline of a magazine cover: four hairlines that draw from the
// corners, and small tracked labels in up to four corners. Runs for a whole section.
// Props: inset, top, bottom, color (paper|ink), labels [tl, tr, bl, br], width.
export const meta = {duration: 5, live: true};
export const defaults = {inset: 44, top: 250, bottom: 1440, color: 'paper', labels: ['Issue 01', '', '', 'Edited'], width: 2};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), col = props.color === 'ink' ? C.ink : C.paper, m = props.inset ?? 44, y0 = props.top ?? 250, y1 = props.bottom ?? 1440, x0 = m, x1 = 1080 - m;
  const grp = st.root.append('g').attr('filter', st.url(props.color === 'ink' ? 'halo' : 'shade'));
  const per = 2 * (x1 - x0) + 2 * (y1 - y0), box = grp.append('rect').attr('x', x0).attr('y', y0).attr('width', x1 - x0).attr('height', y1 - y0).attr('fill', 'none').attr('stroke', col).attr('stroke-width', props.width ?? 2).attr('stroke-dasharray', per);
  const L = props.labels ?? [], nodes = L.slice(0, 4).map((s, i) => s ? label(grp, i % 2 ? x1 - 22 : x0 + 22, i > 1 ? y1 - 24 : y0 + 46, s, {size: 26, anchor: i % 2 ? 'end' : 'start', color: col}) : null);
  const life = props.life ?? meta.duration;
  return {seek(t) { const q = leave(t, life, .3); box.attr('stroke-dashoffset', per * (1 - glide(span(t, 0, .7)))).attr('opacity', 1 - ease(q)); nodes.forEach((n, i) => n?.attr('opacity', ease(span(t, .35 + i * .08, .3)) * (1 - q))); }};
}
