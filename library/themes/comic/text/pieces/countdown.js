import {comicStage, C, look, up, fit, capH, txt, tags, captionBox, burst, inPanel, zoomLinesPath, scaleTo, span, spring, easeOut, easeIn} from '../../kit.js';

// A countdown where every beat is an impact: zoom lines rush in, a burst in the next colour pops
// and the number slams down in it, then is knocked away by the next one. The last beat is the
// `go` word. `accents` cycle through the bursts; the first is also the panel colour.
export const meta = {duration: 4};
export const defaults = {from: 3, go: 'GO', label: 'STARTING IN', note: 'GET READY', labels: ['STAND BY', 'ON AIR\nSOON', 'TAKE 01'], accents: ['yellow', 'red', 'blue']};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accents[0]}), {root, W, H, k} = stage, steps = props.from + 1, step = meta.duration / steps, cy = H * .5, r = Math.min(W * .47, H * .26);
  const wall = inPanel(stage), rays = wall.g.append('path').attr('d', zoomLinesPath(W / 2, cy, r * 1.05, 1700, {n: 60, seed: 4, thick: 1.6})).attr('fill', C.white).attr('opacity', .6); wall.ink();
  const beats = Array.from({length: steps}, (_, i) => {
    const last = i === steps - 1, str = last ? up(props.go) : String(props.from - i), L = look(props.accents[(i + 1) % props.accents.length]), g = root.append('g').attr('transform', `translate(${W / 2} ${cy})`).append('g');
    const star = burst(g, r, {fill: L.accent, inner: last ? C.yellow : C.white, points: last ? 18 : 13, seed: i + 2}), size = Math.min(fit(str, r * 1.25, r * 1.05 / capH(1))), cap = capH(size);
    txt(g, 0, cap / 2, str, {size, role: 'head', color: last ? C.red : L.accent === C.yellow ? C.red : C.yellow, anchor: 'middle', outline: size * .08, drop: size * .055});
    return {g, star, at: i * step, last};
  });
  const label = captionBox(root, W / 2, cy - r - 150 * (k * .5 + .5), props.label, {size: 46, anchor: 'middle', tilt: -3}), note = captionBox(root, W / 2, cy + r + 80 * (k * .5 + .5), props.note, {size: 38, anchor: 'middle', fill: C.white, tilt: 2}), head = tags(root, props.labels, 58);
  return {
    seek(t) {
      const i = Math.min(steps - 1, Math.floor(t / step)), local = t - i * step;
      rays.attr('transform', `translate(${W / 2} ${cy}) scale(${2.6 - 1.6 * easeOut(span(local, 0, .25)) + .012 * Math.sin(t * 9)}) translate(${-W / 2} ${-cy})`);
      beats.forEach((b, j) => {
        const q = span(t, b.at, .4), out = b.last ? 0 : easeIn(span(t, b.at + step - .12, .12)), s = j === i || (j === i - 1 && out < 1) ? spring(q) * (1 + out * .6) : 0;
        b.star.boil(t + j); scaleTo(b.g, s * (1 + .03 * Math.sin(t * 8)), (j % 2 ? 6 : -6) + (1 - easeOut(q)) * (j % 2 ? -30 : 30)); b.g.attr('opacity', s > 0 ? 1 - out : 0);
      });
      scaleTo(label.g, spring(span(t, .05, .4)) * (i === steps - 1 ? 1 - easeIn(span(local, 0, .15)) : 1)); scaleTo(note.g, spring(span(t, .2, .4)));
      head.forEach((b, n) => scaleTo(b.g, spring(span(t, .1 + n * .07, .4))));
    },
  };
}
