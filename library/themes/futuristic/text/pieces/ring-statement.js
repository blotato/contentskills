import {textStage, up, flow, capH, glyphs, pose, txt, readouts, halo, mark, appear, span, spring, easeOut, easeBack, vel} from '../kit.js';

// A statement over drifting targeting rings. The rings swell in and keep sliding, each leaving a
// smear of fading copies; the words rise into place one at a time. Words listed in `emphasis`
// take the accent colour.
export const meta = {duration: 5, live: true};
export const defaults = {
  statement: 'Good ideas get better the moment you ship them', emphasis: ['SHIP'], tag: 'FIELD NOTE 07',
  labels: ['OBSERVED', 'IN THE\nWILD', 'KEEP\nGOING'], foot: 'SHIP IT, THEN FIX IT', accent: 'cyan',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 68, emphasis = (props.emphasis ?? []).map(up);
  const rings = [[.78, .2, 300, 1], [.2, .52, 380, -1], [.74, .82, 260, 1]].map(([x, y, r, dir], i) => ({b: halo(root, stage, {color: i === 1 ? ink.accent : ink.alt, ghosts: 5}), x: x * W, y: y * H, r: r * (.55 + .45 * k), dir, i}));
  const dots = [0, 1, 2].map(i => mark(root, 0, 0, 16 + i * 5, ink.third));
  const {size, lines, pitch} = flow(up(props.statement), W - m * 2, H * .5, H * .13, 40), cap = capH(size), top = H * .5 - (lines.length * pitch - (pitch - cap)) / 2;
  const words = lines.flatMap((line, i) => glyphs(root, line, m, top + cap + i * pitch, size, {by: 'word', color: ink.text}));
  words.forEach(u => { if (emphasis.includes(u.str.replace(/[^A-Z0-9]/g, ''))) u.text.attr('fill', ink.head); });
  const labels = readouts(root, props.labels, 112), star = mark(root, m + 26, top - 64, 28, ink.accent);
  const tag = txt(root, m + 72, top - 52, up(props.tag), {size: 34, color: ink.accent}), foot = txt(root, W - m, H - 70, up(props.foot), {size: 24, color: ink.accent, anchor: 'end', role: 'mono'});
  return {
    seek(t) {
      rings.forEach(({b, x, y, r, dir, i}) => {
        const q = span(t, i * .18, .9), phase = t * .55 + i * 2.1, sway = 90 * (.6 + .4 * k), vx = Math.cos(phase) * sway * dir;
        b.set(x + Math.sin(phase) * sway * dir + dir * (1 - easeOut(q)) * W * .7, y + Math.cos(phase * .7) * 30, r * spring(q), vx * 1.3 + dir * vel(q) * 300, 0, q > 0 ? .8 : 0, t * 20 * dir);
      });
      dots.forEach((d, i) => { const a = t * (.5 + i * .13) + i * 2.4; d.attr('transform', `translate(${W * (.5 + .4 * Math.cos(a))} ${H * (i % 2 ? .88 : .13) + Math.sin(a * 1.7) * H * .02}) rotate(${t * 60}) scale(${spring(span(t, .6 + i * .15, .5))})`); });
      words.forEach((u, j) => { const q = span(t, .35 + j * .09, .5); pose(u, {y: (1 - easeBack(q)) * u.cap * .9, sy: 1 + vel(q) * .25, o: span(t, .35 + j * .09, .12)}); });
      labels.forEach((node, i) => node.attr('opacity', appear(t, .4 + i * .06)));
      star.attr('transform', `rotate(${t * 60}) scale(${spring(span(t, .3, .5))})`); tag.attr('opacity', appear(t, .45)); foot.attr('opacity', appear(t, 1.4));
    },
  };
}
