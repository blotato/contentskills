import {C, stage, look, up, fit, capH, measure, txt, sheet, chip, scribble, scrawl, comma, hold, span, slam, jit, jtf, pop, easeOut, presence, leave} from '../../kit.js';

// A number on a torn black scrap: it rattles up to its value in held steps, lands with a hit,
// gets underlined in marker, and its label is slapped on beneath on a scrap in the accent.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 5, prefix: '', suffix: '', label: 'WAYS TO MAKE MONEY', x: 540, y: 380, seconds: .7, accent: 'red'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine} = st, ink = look(props.accent), o = {role: 'cond'}, final = `${props.prefix}${comma(props.value)}${props.suffix}`;
  const size = fit(final, 620, 300, o), cap = capH(size, o), w = measure(final, size, o), bw = w + 130, bh = cap + 90, g = root.append('g'), inner = g.append('g');
  sheet(inner, {fill: C.soot, seed: 5, amp: 12, rim: C.white}).set(-bw / 2, -bh / 2, bw, bh);
  const num = txt(inner, 0, cap / 2, final, {size, role: 'cond', color: ink.accent, anchor: 'middle'});
  const line = scrawl(inner, sd => scribble.underline(-w / 2, w / 2, cap / 2 + 22, sd, 5), {color: C.bone, width: 7, seed: 2});
  const tag = fine.append('g'); if (props.label) chip(tag.append('g'), up(props.label), {size: Math.min(44, fit(up(props.label), 800, 44)), fill: ink.accent, seedv: 4});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .1, props.seconds)), k = slam(t, .02, {from: 1.6}), land = slam(t, .1 + props.seconds, {from: 1.18, len: .08}), x = leave(t, props.life), j = jit(s, 1, 2 + land.hit * 8, .4 + land.hit * 2);
    num.text(`${props.prefix}${comma(props.value * q)}${props.suffix}`);
    g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${-2 + j.r}) scale(${k.s * (q >= 1 ? land.s : 1)})`).attr('opacity', k.o * presence(t, props.life) * (x > .5 ? 0 : 1));
    line.draw(span(h, .25 + props.seconds, .25), s);
    tag.attr('transform', jtf(props.x + 20, props.y + bh / 2 + 36, s, 6, {tilt: 2, scale: pop(t, .3 + props.seconds) * (x > .5 ? 0 : 1)}));
  }};
}
