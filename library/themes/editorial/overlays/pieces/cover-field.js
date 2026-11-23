import {C, M, stage, fieldOf, runs, measure, fit, text, label, folio, rule, F, span, glide, ease, leave} from '../../kit.js';

// A cover: a flat field of one of the theme's grounds fills the frame and a headline assembles on it FAST. A rule
// snaps across, each line slides in from the opposite side to the one before and clears from a blur, and *marked*
// words are italic in the accent. Made to be used with "behind": "person": the speaker is then cut out in front of
// the field, the headline above the head. Without it, it is a full-frame cover card.
// Props: field (wine|ink|paper|stone|blush), lines, left, right (running head), y (top of the head rule), size (max),
// step (s between lines), at ([s per line], overrides step), slide (px), outAt (the field wipes off upwards from then; null = stays).
export const meta = {duration: 2.4, live: true};
export const defaults = {field: 'wine', lines: ['Nobody', '*edited* this'], left: 'The edit issue', right: 'No. 01', y: 236, size: 190, step: .22, at: null, slide: 340, outAt: null};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), f = fieldOf(props.field), y = props.y ?? 236, arr = [].concat(props.lines), x0 = M, x1 = 1080 - M;
  const cid = st.uid('field'), cr = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', 0).attr('y', 0).attr('width', 1080), all = st.root.append('g').attr('clip-path', `url(#${cid})`);
  all.append('rect').attr('width', 1080).attr('height', 1920).attr('fill', f.bg);
  const head = rule(all, x0, y, x1, y, {color: f.fg, width: 3}), la = props.left ? label(all, x0, y - 22, props.left, {size: 28, color: f.fg}) : null, ra = props.right ? folio(all, x1, y - 22, String(props.right).toUpperCase(), {size: 28, color: f.fg, anchor: 'end'}) : null;
  const size = fit(arr, x1 - x0, props.size ?? 190), pitch = size * .98;
  const rows = arr.map((s, i) => { const g = all.append('g'), w = measure(s, size); let cx = 540 - w / 2;
    for (const r of runs(s)) { text(g, cx, y + 40 + size * .78 + i * pitch, r.text, {font: r.italic ? F.italic : F.head, size, color: r.italic ? f.accent : f.fg}).style('white-space', 'pre'); cx += measure(r.italic ? `*${r.text}*` : r.text, size); }
    return {g, at: props.at?.[i] ?? .04 + i * (props.step ?? .22), dir: i % 2 ? 1 : -1}; });
  const foot = rule(all, x0, y + 64 + arr.length * pitch, x1, y + 64 + arr.length * pitch, {color: f.fg, width: 2}), life = props.life ?? meta.duration, slide = props.slide ?? 340;
  return {seek(t) {
    head.draw(glide(span(t, 0, .22))); la?.attr('opacity', ease(span(t, .06, .2))); ra?.attr('opacity', ease(span(t, .1, .2)));
    for (const r of rows) { const a = glide(span(t, r.at, .3)); r.g.attr('transform', `translate(${(r.dir * (1 - a) * slide).toFixed(1)} 0)`).attr('opacity', ease(span(t, r.at, .12)).toFixed(3)).style('filter', a < .97 ? `blur(${((1 - a) * 18).toFixed(1)}px)` : null); }
    foot.draw(glide(span(t, rows.at(-1).at + .1, .3)));
    cr.attr('height', 1920 * (1 - (props.outAt == null ? 0 : glide(span(t, props.outAt, .24)))));
  }};
}
