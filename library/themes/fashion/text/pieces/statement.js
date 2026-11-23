import {stage, capH, flow, up, flat, phrase, label, rule, measure, cornerLabels, about, fade, glide, span, drift} from '../../kit.js';

// One sentence in the middle of the field, its words fading up out of blur one after another.
// The words in `emphasis` get the accent hairline drawn under them. Small print above and below.
export const meta = {duration: 5, live: true};
export const defaults = {
  statement: 'Wear what makes you walk a little slower', emphasis: ['slower'], tag: 'Note 07',
  labels: [], foot: 'Style is a pace', field: 'sky', accent: 'poppy',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, o = {role: 'bold'}, key = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  const {size, lines, pitch} = flow(up(flat(props.statement)), W * .74, H * .34, 78, 34, o, 1.75), cap = capH(size, o), block = lines.length * pitch - (pitch - cap), top = H / 2 - block / 2;
  const g = root.append('g'), body = phrase(g, lines, W / 2, top, size, pitch, {color: ink.head}), marks = (props.emphasis ?? []).flatMap(e => e.split(/\s+/).map(key));
  const lines2 = body.units.filter(u => marks.includes(key(u.str))).map(u => ({u, r: rule(g, u.cx - u.w / 2, u.y + cap * .38, u.w, ink.accent, 4)}));
  const tag = label(g, W / 2, top - 64, props.tag, {size: 21, color: ink.head, anchor: 'middle'}), foot = label(g, W / 2, top + block + 96, props.foot, {size: 21, color: ink.head, anchor: 'middle'}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); body.set(t, .15); const done = .15 + body.time;
      lines2.forEach(({r}, i) => r.set(glide(span(t, done - .1 + i * .12, .5))));
      tag.attr('opacity', fade(t, 0, .4) * .82); foot.attr('opacity', fade(t, done, .5) * .82); corners.set(t, .3); about(g, W / 2, H / 2, drift(t));
    },
  };
}
