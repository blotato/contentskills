import {stage, up, ransom, ransomPose, slam, hash, presence, leave} from '../../kit.js';

// A word as a ransom note: every letter cut from a different page (its own scrap, typeface, ink
// and tilt), stuck down one at a time and left jittering.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'NO RULES', x: 540, y: 380, size: 150, gap: .1, seed: 4, step: .07};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, text = up(props.text), g = root.append('g');
  let units = ransom(g, text, 0, 0, props.size, {seed: props.seed, gap: props.gap});
  const width = units.length ? units.at(-1).cx + units.at(-1).w / 2 - (units[0].cx - units[0].w / 2) : 1, fitk = Math.min(1, 980 / width);
  return {seek(t) {
    const s = st.tick(t), x = leave(t, props.life);
    g.attr('transform', `translate(${props.x} ${props.y}) scale(${fitk})`).attr('opacity', presence(t, props.life));
    units.forEach((u, i) => { const k = slam(t, .05 + i * props.step, {from: 1.9}); ransomPose(u, k.o > 0 ? k.s : 0, s + i, x > 0 && hash(i, 9) < x * 1.3 ? 0 : 1); });
  }};
}
