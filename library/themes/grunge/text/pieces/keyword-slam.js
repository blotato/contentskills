import {C, stage, look, up, fit, capH, measure, glyphs, pose, sheet, chip, hash, slam, jit, jtf, pop, presence, leave} from '../../kit.js';

// One word stamped onto the footage on a torn strip: black strip with the word in the accent, or
// (solid) a strip in the accent with black type. A taped typewriter tag sits on its corner.
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'UNSTOPPABLE', kicker: 'WORD OF THE DAY', y: 330, accent: 'red', solid: false, tilt: -3};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine, W} = st, ink = look(props.accent), word = up(props.word);
  const size = fit(word, 880, 230), cap = capH(size), w = measure(word, size), bw = w + 110, bh = cap + 96, g = root.append('g'), inner = g.append('g');
  sheet(inner, {fill: props.solid ? ink.accent : C.soot, seed: 3, sides: 'rl', amp: 12, rim: C.white}).set(-bw / 2, -bh / 2, bw, bh);
  const letters = glyphs(inner, word, 0, cap / 2, size, {anchor: 'middle', color: props.solid ? ink.on : ink.accent});
  const tag = fine.append('g'); if (props.kicker) chip(tag.append('g'), up(props.kicker), {size: 30, role: 'type', fill: C.bone, seedv: 5, tape: true});
  return {seek(t) {
    const s = st.tick(t), k = slam(t, .05), x = leave(t, props.life), j = jit(s, 1, 2 + k.hit * 9, .4 + k.hit * 2);
    g.attr('transform', `translate(${W / 2 + j.x} ${props.y + j.y + x * 40}) rotate(${props.tilt + j.r}) scale(${k.s})`).attr('opacity', k.o * presence(t, props.life) * (x > .5 ? 0 : 1));
    letters.forEach((u, i) => { const jj = jit(s, i + 20, 1.2, .5); pose(u, {x: jj.x, y: jj.y, rot: jj.r}); });
    tag.attr('transform', jtf(W / 2 - bw / 2 + 170, props.y - bh / 2 - 22, s, 7, {tilt: props.tilt - 4, scale: pop(t, .4)})).attr('opacity', x > .5 ? 0 : 1);
  }};
}
