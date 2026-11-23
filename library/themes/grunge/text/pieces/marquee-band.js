import {C, stage, look, capH, sheet, strip, hold, jit, presence, leave} from '../../kit.js';

// A torn strip in the accent scrolling heavy caps across the footage in held steps, with a
// thin black strip of typewriter text running the other way just above it.
export const meta = {duration: 5, live: true};
export const defaults = {text: 'NEW EPISODE', sub: 'OUT NOW', y: 1760, height: 130, accent: 'red', tilt: 0, speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W} = st, ink = look(props.accent), h = props.height, h2 = h * .44, g = root.append('g');
  const thin = g.append('g'); sheet(thin, {fill: C.soot, seed: 5, sides: 'tb', amp: 5, rim: C.white, shadow: 0}).set(-80, -h / 2 - h2 - 4, W + 160, h2 + 10);
  const s2 = h2 * .5 / capH(1, {role: 'type'}), sub = strip(thin, st, props.sub, -h / 2 - h2 / 2 + capH(s2, {role: 'type'}) / 2, s2, {role: 'type', sep: '/'});
  const band = g.append('g'); sheet(band, {fill: ink.accent, seed: 2, sides: 'tb', amp: 10, rim: null}).set(-80, -h / 2, W + 160, h);
  const size = h * .5 / capH(1), run = strip(band, st, props.text, capH(size) / 2, size, {color: ink.on});
  return {seek(t) {
    const s = st.tick(t), hh = hold(t), x = leave(t, props.life), j = jit(s, 1, 2, .2);
    g.attr('transform', `translate(${W / 2 + j.x} ${props.y + j.y + x * (h + 200)}) rotate(${props.tilt + j.r}) translate(${-W / 2} 0)`).attr('opacity', presence(t, props.life));
    run.set(hh * 210 * props.speed); sub.set(-hh * 120 * props.speed + 60);
  }};
}
