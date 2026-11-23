import {comicStage, C, look, up, fit, capH, txt, burst, slabLabel, zoomLinesPath, spark, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// A big number that counts up inside a burst, with its label on a slab underneath: for the stat
// the speaker just said. `y` is the vertical centre in frame pixels (keep it clear of the face).
export const meta = {duration: 3, live: true};
export const defaults = {value: 88, suffix: '%', label: 'OF CREATORS', y: 360, accent: 'red'};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), cx = W / 2, y = props.y, r = 290, squash = .68;
  const final = (Number.isInteger(props.value) ? props.value : props.value.toFixed(1)) + (props.suffix ?? ''), size = Math.min(fit(final, r * 1.25, 400), r * squash * 1.15 / capH(1)), cap = capH(size);
  const g = root.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
  const rays = g.append('path').attr('d', zoomLinesPath(0, 0, r * 1.02, r * 1.45, {n: 36, seed: 4, thick: 1.5})).attr('fill', C.ink).attr('transform', `scale(1 ${squash})`);
  const star = burst(g, r, {fill: ink.accent, inner: ink.accent === C.yellow ? C.white : C.yellow, points: 15, depth: .74, squash, seed: 3, drop: 12});
  const number = txt(g, 0, cap / 2 - 6, final, {size, role: 'head', color: ink.accent === C.yellow ? C.red : C.red, anchor: 'middle', outline: size * .085, drop: size * .06});
  const label = slabLabel(root, cx, y + r * squash + 4, props.label, {size: fit(up(props.label), 760, 62, {role: 'slab'}), anchor: 'middle', fill: C.ink, color: C.yellow, tilt: -2, drop: 0});
  const star2 = spark(root, cx + r * .88, y - r * squash * .85, 36, C.white);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .42), c = easeOut(span(t, .15, 1));
      star.boil(t); scaleTo(g, spring(q) * (1 - x) * (1 + .02 * Math.sin(t * 5)), -4 + (1 - easeOut(q)) * -25);
      rays.attr('opacity', t > .08 && t < .42 ? 1 : 0);
      number.say((Number.isInteger(props.value) ? Math.round(props.value * c) : (props.value * c).toFixed(1)) + (props.suffix ?? ''));
      scaleTo(label.g, spring(span(t, .4, .42)) * (1 - x)); scaleTo(star2, spring(span(t, .6, .4)) * (1 - x) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
