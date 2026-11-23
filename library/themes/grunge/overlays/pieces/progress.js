import {C, stage, look, up, txt, sheet, brush, chip, clipLive, hold, span, slam, jit, jtf, pop, easeOut, presence, leave} from '../../kit.js';

// A meter painted on: a strip of black paper with a brush stroke in the accent dragged along it in
// held steps to the value, the percentage counting in condensed numerals, a typed label on a scrap.
export const meta = {duration: 3.5, live: true};
export const defaults = {label: 'BURNOUT RISK', from: 0, to: 100, seconds: .9, suffix: '%', x: 90, y: 330, width: 900, accent: 'red'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine} = st, ink = look(props.accent), w = props.width, bh = 92, g = root.append('g');
  sheet(g, {fill: C.soot, seed: 4, sides: 'rl', amp: 10, rim: C.white}).set(0, -bh / 2, w, bh);
  const clip = clipLive(st), fillW = w - 210; g.append('path').attr('d', brush(22, -bh * .28, fillW, bh * .56, {seed: 6, dry: 4})).attr('fill', ink.accent).attr('fill-rule', 'evenodd').attr('clip-path', clip.url);
  const value = txt(g, w - 24, 26, '', {size: 76, role: 'cond', color: C.bone, anchor: 'end'});
  const tag = fine.append('g'); const c = chip(tag.append('g'), up(props.label), {size: 34, role: 'type', fill: C.bone, seedv: 3, tape: true});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .25, props.seconds)), v = props.from + (props.to - props.from) * q, x = leave(t, props.life), k = slam(t, .03, {from: 1.5}), j = jit(s, 1, 2, .3);
    g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${-1 + j.r})`).attr('opacity', k.o * presence(t, props.life) * (x > .5 ? 0 : 1));
    clip.set(0, -bh, 22 + (fillW + 30) * Math.max(0, Math.min(1, v / 100)), bh * 2); value.text(Math.round(v) + props.suffix);
    tag.attr('transform', jtf(props.x + c.bw / 2 + 20, props.y - bh / 2 - 26, s, 5, {tilt: -3, scale: pop(t, .15) * (x > .5 ? 0 : 1)}));
  }};
}
