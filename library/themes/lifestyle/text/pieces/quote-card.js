import {stage, C, up, capH, flow, glyphs, pose, txt, sheet, tape, stroke, cornerLabels, draw, fade, glide, span, easeInOut, drift} from '../../kit.js';

// A quote on a slip of cream paper taped to the card: the slip slides up and settles, a large
// serif-italic quote mark fades in, the words arrive one after another, then a short rule draws
// and the attribution follows in caps with its role in serif italic.
export const meta = {duration: 5.5, live: true};
export const defaults = {
  quote: 'Rest is not a reward. It is part of the work.', by: 'Note to self', role: 'pinned above the desk',
  labels: ['Quoted', 'Words to keep'], accent: 'clay',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, W, H, ink} = st, m = 80, pad = 70, o = {role: 'soft'}, room = Math.min(H - 300, st.sq ? 760 : 1160);
  const {size, lines, pitch} = flow(props.quote, W - (m + pad) * 2, room - 470, 104, 44, o, 1.45), cap = capH(size, o), sh = 250 + lines.length * pitch + 36 + 112 + 80, sy = (H - sh) / 2 + 20, top = sy + 250, units = [];
  const card = root.append('g'), inner = card.append('g'); sheet(inner, m, sy, W - m * 2, sh, {fill: C.cream, radius: 4, lift: st.lift}); tape(inner, W / 2, sy, 190, 52, -3, ink.accent);
  const mark = txt(inner, m + pad - 8, sy + 220, '“', {size: 330, role: 'serif', color: ink.accent});
  lines.forEach((line, i) => glyphs(inner, line, m + pad, top + cap + i * pitch, size, {by: 'word', color: C.ink, ...o}).forEach(u => { u.n2 = units.length; units.push(u); }));
  const end = top + lines.length * pitch + 36, rule = stroke(inner, `M${m + pad} ${end}h110`, ink.accent, 7);
  const by = txt(inner, m + pad, end + 62, up(props.by), {size: 27, role: 'label'}), role = txt(inner, m + pad, end + 112, props.role, {size: 42, role: 'serif', color: C.soft});
  const corners = cornerLabels(st, props.labels, {top: Math.max(70, sy - 60)}), step = Math.min(.2, 2.4 / units.length);
  return {
    seek(t) {
      const e = glide(span(t, 0, 1.1));
      card.attr('transform', `translate(0 ${(1 - e) * 120})`).attr('opacity', easeInOut(span(t, 0, .5)));
      inner.attr('transform', `translate(${W / 2} ${H / 2}) rotate(${-1.2 + (1 - e) * -2}) scale(${drift(t, .025)}) translate(${-W / 2} ${-H / 2})`);
      mark.attr('opacity', fade(t, .4, .7));
      units.forEach(u => { const q = span(t, .7 + u.n2 * step, .7); pose(u, {y: (1 - glide(q)) * cap * .25, o: .0 + easeInOut(q)}); });
      const after = .9 + units.length * step; draw(rule, glide(span(t, after, .7))); by.attr('opacity', fade(t, after + .2, .6)); role.attr('opacity', fade(t, after + .4, .6)); corners.set(t, .6);
    },
  };
}
