import {C, stage, look, up, fit, capH, measure, txt, sheet, chip, tapeStrip, hold, span, jit, jtf, pop, easeOut, presence, leave} from '../../kit.js';

// A name plate: the name in black on a bone strip torn off at the right, shoved in from the left
// edge in held steps and taped down; the role follows on a small scrap in the accent.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'ALEX RIVERA', role: 'MAKES THINGS MOVE', y: 1540, accent: 'red'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine} = st, ink = look(props.accent), name = up(props.name);
  const size = fit(name, 760, 96), cap = capH(size), w = measure(name, size) + 130, bh = cap + 72, g = root.append('g');
  sheet(g, {fill: C.bone, seed: 4, sides: 'r', amp: 14}).set(-80, -bh / 2, w + 80, bh);
  txt(g, 50, cap / 2, name, {size, role: 'head', color: C.soot});
  const tape = tapeStrip(g, 150, 46, {seed: 2}).attr('transform', `translate(${w - 30} ${-bh / 2 + 4}) rotate(24)`);
  const role = fine.append('g'); chip(role.append('g'), up(props.role), {size: Math.min(40, fit(up(props.role), 700, 40, {role: 'type'})), role: 'type', fill: ink.accent, seedv: 6});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .05, .3)), x = leave(t, props.life), j = jit(s, 1, 2, .3), o = presence(t, props.life);
    g.attr('transform', `translate(${-(1 - q) * (w + 100) - x * (w + 200) + j.x} ${props.y + j.y}) rotate(${-1.5 + j.r})`).attr('opacity', o);
    tape.attr('opacity', h >= .4 ? 1 : 0);
    role.attr('transform', jtf(70 + role.node().getBBox().width / 2 + 20, props.y + bh / 2 + 34, s, 4, {tilt: 1.5, scale: pop(t, .45) * (x > 0 ? 0 : 1)})).attr('opacity', o);
  }};
}
