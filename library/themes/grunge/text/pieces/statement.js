import {C, stage, look, up, flow, capH, glyphs, pose, txt, chip, scribble, scrawl, cornerLabels, reveal, hash, hold, span, jit, jtf, pop} from '../../kit.js';

// A sentence set in heavy caps, word by word in held steps. The words that matter are in the
// accent and get circled in marker; a taped field-note tag sits above and a typed line below.
export const meta = {duration: 5, live: true};
export const defaults = {
  statement: 'Good ideas get better the moment you ship them', emphasis: ['SHIP'], tag: 'FIELD NOTE 07',
  labels: ['OBSERVED', 'IN THE\nWILD', 'KEEP\nGOING'], foot: 'SHIP IT, THEN FIX IT', accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, ink = look(props.accent), m = 72, hot = (props.emphasis ?? []).map(up);
  const {size, lines, pitch} = flow(up(props.statement), W - m * 2, H * .44, 170, 54, {role: 'head'}, 1.24), cap = capH(size), block = pitch * (lines.length - 1) + cap, top = (H - block) / 2 + cap;
  const marks = root.append('g'), words = lines.flatMap((line, i) => glyphs(root, line, m, top + i * pitch, size, {by: 'word'}));
  const circles = [];
  words.forEach((u, k) => { u.hot = hot.includes(u.str.replace(/[^A-Z0-9]/g, '')); if (u.hot) { u.text.attr('fill', ink.accent); circles.push({k, mark: scrawl(marks, sd => scribble.circle(u.cx, u.y - cap / 2, u.w / 2 + size * .2, cap / 2 + size * .2, sd), {color: ink.mark, width: 9, seed: k + 2})}); } });
  const tag = fine.append('g'); chip(tag.append('g'), up(props.tag), {size: 32, role: 'type', fill: C.bone, seedv: 4, tape: true});
  const foot = txt(fine, m, top + block - cap + 110, up(props.foot), {size: 32, color: C.paper}), corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]], {accent: ink.accent});
  const at = k => .35 + k * .12, end = at(words.length);
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    words.forEach((u, k) => { const d = h - at(k), j = jit(s, k * 1.7, 1.5, .5); pose(u, {x: j.x, y: j.y, sx: d < 0 ? 1 : d < .1 ? 1.2 : 1, rot: j.r + (d >= 0 && d < .1 ? (hash(k, 4) - .5) * 10 : 0), o: d < 0 ? 0 : 1}); });
    circles.forEach(c => c.mark.draw(span(h, at(c.k) + .25, .4), s));
    tag.attr('transform', jtf(m + 190, top - cap - 90, s, 3, {tilt: -4, scale: pop(t, .12)}));
    foot.attr('opacity', h >= end + .2 ? 1 : 0); reveal(corners, t, .2);
  }};
}
