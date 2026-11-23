import {stage, look, C, FRAME, up, txt, stroke, loops, draw, fade, glide, span, leave} from '../../kit.js';

// Overlay: four small captions tucked into the corners of the frame in cream caps, each with a
// thin rule that draws towards the middle, plus a small brushed loop beside the first. They
// fade up one after another and leave the whole middle free. `inset` is the margin in px.
export const meta = {duration: 5, live: true};
export const defaults = {
  topLeft: 'Ep. 12\nA slower week', topRight: 'Unscripted\nOne take', bottomLeft: 'Keep\nwatching', bottomRight: 'Pt. 01\nof 03',
  mark: '', accent: 'leaf', inset: 56,
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent, true), {width: W, height: H} = FRAME, m = props.inset, size = 27, body = root.append('g').attr('filter', st.soft);
  const corners = [[props.topLeft, 0, 0], [props.topRight, 1, 0], [props.bottomLeft, 0, 1], [props.bottomRight, 1, 1]].map(([label, right, low], i) => {
    const rows = up(label ?? '').split('\n'), x = right ? W - m : m, y = low ? H - m - (rows.length - 1) * size * 1.35 : m + size, g = body.append('g');
    rows.forEach((row, j) => txt(g, x, y + j * size * 1.35, row, {size, role: j ? 'label' : 'wide', color: j ? C.cream : C.cream, anchor: right ? 'end' : 'start', spacing: j ? .16 : .12}));
    const ry = low ? y - size - 22 : y + (rows.length - 1) * size * 1.35 + 26;
    return {g, rule: stroke(g, `M${x} ${ry}h${right ? -130 : 130}`, i === 0 ? ink.accent : C.cream, 4), low};
  });
  const mark = stroke(body.append('g').attr('transform', `translate(${m + 250} ${m + 20})`), loops(90, 54), ink.accent, 7);
  return {
    seek(t) {
      const x = leave(t, props.life);
      corners.forEach((c, i) => { const q = span(t, .15 + i * .18, .9); c.g.attr('opacity', fade(t, .15 + i * .18, .6) * (1 - x)).attr('transform', `translate(0 ${(1 - glide(q)) * (c.low ? 18 : -18)})`); draw(c.rule, glide(span(t, .5 + i * .18, .9))); });
      draw(mark, glide(span(t, 1.1, 1.1)) * (1 - x));
    },
  };
}
