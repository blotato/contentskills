import {C, stage, look, up, fit, capH, txt, sheet, chip, scribble, scrawl, cornerLabels, reveal, hash, hold, span, slam, jit, jtf, pop} from '../../kit.js';

// A list pasted up strip by strip: each item is a torn paper strip stamped down at its turn,
// numbered in the accent, then ticked off in marker when the next one lands.
export const meta = {duration: 5, live: true};
export const defaults = {
  title: 'THE PLAN', kicker: 'FOUR MOVES', items: ['FIND THE HOOK', 'WRITE IT SHORT', 'CUT THE FLUFF', 'POST IT TODAY'],
  labels: ['AGENDA', 'TODAY', 'IN THIS\nORDER'], step: .8, accent: 'red',
};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, ink = look(props.accent), m = 70, items = props.items.slice(0, 6).map(up), n = items.length;
  const tsize = Math.min(fit(up(props.title), W - m * 2, 190), H * .1 / capH(1)), tcap = capH(tsize), rh = Math.min(170, H * .56 / n), listH = rh * n, y0 = (H - listH - tcap - 90) / 2 + tcap + 60;
  const title = txt(root, m, y0 - 50, up(props.title), {size: tsize, role: 'head'}), kick = fine.append('g'); chip(kick.append('g'), up(props.kicker), {size: 30, role: 'type', fill: ink.accent, seedv: 2});
  const imax = rh * .42 / capH(1), nsize = Math.min(imax, fit(items, W - m * 2 - 330, 200) * 1.6);
  const rows = items.map((label, i) => {
    const g = root.append('g'), inner = g.append('g'), w = W - m * 2 - (hash(i, 5) * 60);
    sheet(inner, {fill: i % 2 ? C.paper : C.bone, seed: i + 3, sides: i % 2 ? 'r' : 'rl', amp: 9}).set(0, -rh * .4, w, rh * .8);
    const isize = Math.min(imax, fit(label, W - m * 2 - 330, 200)); txt(inner, 26, capH(nsize * 1.25, {role: 'cond'}) / 2, String(i + 1).padStart(2, '0'), {size: nsize * 1.25, role: 'cond', color: C.red});
    txt(inner, 150, capH(isize) / 2, label, {size: isize, role: 'head', color: C.soot});
    const tick = scrawl(g, sd => scribble.check(w - 80, 0, rh * .2, sd), {color: C.red, width: 10, seed: i + 1});
    return {g, inner, tick, tilt: (hash(i, 2) - .5) * 3};
  });
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]], {accent: ink.accent});
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    title.attr('opacity', h >= .1 ? 1 : 0); kick.attr('transform', jtf(W - m - 150, y0 - 50 - tcap - 30, s, 2, {tilt: 4, scale: pop(t, .3)}));
    rows.forEach((row, i) => {
      const at = .6 + i * props.step, k = slam(t, at), j = jit(s, i * 3.3, 1.5 + k.hit * 6, .3 + k.hit);
      row.g.attr('transform', `translate(${m + j.x} ${y0 + (i + .5) * rh + j.y}) rotate(${row.tilt + j.r})`).attr('opacity', k.o);
      row.inner.attr('transform', `translate(${(W - m * 2) / 2} 0) scale(${k.s}) translate(${-(W - m * 2) / 2} 0)`);
      row.tick.draw(span(h, at + Math.min(props.step, .8) * .7, .2), s);
    });
    reveal(corners, t, .2);
  }};
}
