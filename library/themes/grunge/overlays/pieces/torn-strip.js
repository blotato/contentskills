import {C, stage, look, up, fit, capH, measure, glyphs, typeOn, cursor, sheet, tapeStrip, hold, span, jit, easeOut, presence, leave} from '../../kit.js';

// A title strip: a length of bone paper torn along both long edges is dragged across the footage
// and the title is typed onto it in black behind a block cursor; a second line follows in the accent.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'AND THEN', sub: 'EVERYTHING CHANGED', y: 340, tilt: -2, accent: 'red', from: 'left'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, ink = look(props.accent), title = up(props.title), sub = up(props.sub ?? '');
  const size = fit(title, 900, 150), cap = capH(size), bh = cap + 84, ssize = sub ? fit(sub, 820, 64) : 0, scap = capH(ssize), g = root.append('g');
  sheet(g, {fill: C.bone, seed: 6, sides: 'tb', amp: 13, step: 15}).set(-80, -bh / 2, W + 160, bh);
  const letters = glyphs(g, title, W / 2, cap / 2, size, {anchor: 'middle', color: C.soot}), cur = cursor(g, C.soot);
  const low = root.append('g'), sw = measure(sub, ssize) + 90; if (sub) sheet(low, {fill: C.soot, seed: 8, sides: 'rl', amp: 9, rim: C.white}).set(-sw / 2, -scap / 2 - 26, sw, scap + 52);
  const subs = sub ? glyphs(low, sub, 0, scap / 2, ssize, {anchor: 'middle', color: ink.accent}) : [];
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .03, .25)), x = leave(t, props.life), j = jit(s, 1, 2, .25), dir = props.from === 'right' ? 1 : -1, o = presence(t, props.life);
    g.attr('transform', `translate(${dir * (1 - q + x * 1.2) * (W + 200) + j.x} ${props.y + j.y}) rotate(${props.tilt + j.r} ${W / 2} 0)`).attr('opacity', o);
    const tq = span(h, .3, .1 + letters.length * .05); typeOn(letters, tq, s, {seed: 2}); cur.set(letters, tq, t);
    const at = .5 + letters.length * .05; low.attr('transform', `translate(${W / 2 + 40 + j.y} ${props.y + bh / 2 + scap / 2 + 20 + j.x}) rotate(${props.tilt + 1.5})`).attr('opacity', h >= at && x < .5 ? o : 0);
    typeOn(subs, span(h, at, .1 + subs.length * .035), s, {seed: 7});
  }};
}
