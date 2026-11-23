import {C, stage, look, up, fit, capH, measure, txt, sheet, chip, scribble, scrawl, hash, hold, span, slam, jit, jtf, pop, presence, leave} from '../../kit.js';

// A list built on the footage as the speaker names things: a title scrap, then one torn strip per
// item stamped down at its time (`times`, seconds after the list appears), each ticked in marker.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'THE DEFAULT PLAN', items: ['POST EVERY DAY', 'GROW', 'HOPE TO GET PAID'], times: [.4, 1.2, 2], x: 60, y: 215, width: 640, row: 104, accent: 'red', tick: true};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine} = st, ink = look(props.accent), items = props.items.map(up), rh = props.row, size = Math.min(rh * .4 / capH(1), fit(items, props.width - 190, 120));
  const head = fine.append('g'); if (props.title) chip(head.append('g'), up(props.title), {size: 36, role: 'type', fill: ink.accent, seedv: 2, tape: true}); const hw = props.title ? measure(up(props.title), 36, {role: 'type'}) / 2 + 24 : 0;
  const rows = items.map((label, i) => {
    const g = root.append('g'), inner = g.append('g'), w = Math.min(props.width, measure(label, size) + 210);
    sheet(inner, {fill: i % 2 ? C.paper : C.bone, seed: i + 5, sides: 'r', amp: 10}).set(-20, -rh * .4, w, rh * .8);
    txt(inner, 14, capH(size * 1.2, {role: 'cond'}) / 2, String(i + 1), {size: size * 1.2, role: 'cond', color: C.red}); txt(inner, 74, capH(size) / 2, label, {size, role: 'head', color: C.soot});
    const tick = scrawl(g, sd => scribble.check(w - 78, 0, rh * .18, sd), {color: C.red, width: 9, seed: i + 1});
    return {g, inner, tick, tilt: (hash(i, 6) - .5) * 3.2};
  });
  return {seek(t) {
    const s = st.tick(t), h = hold(t), x = leave(t, props.life), o = presence(t, props.life) * (x > .5 ? 0 : 1);
    head.attr('transform', jtf(props.x + hw, props.y, s, 1, {tilt: -3, scale: pop(t, .05)})).attr('opacity', o);
    rows.forEach((row, i) => {
      const at = props.times?.[i] ?? .4 + i * .7, k = slam(t, at), j = jit(s, i * 2.7, 1.5 + k.hit * 7, .3 + k.hit * 1.5);
      row.g.attr('transform', `translate(${props.x + 20 + j.x} ${props.y + 96 + i * rh + j.y}) rotate(${row.tilt + j.r})`).attr('opacity', k.o * o);
      row.inner.attr('transform', `translate(200 0) scale(${k.s}) translate(-200 0)`); row.tick.draw(props.tick ? span(h, at + .35, .2) : 0, s);
    });
  }};
}
