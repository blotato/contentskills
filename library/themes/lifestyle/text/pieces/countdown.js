import {stage, look, C, up, fit, capH, glyphs, pose, txt, stroke, cornerLabels, draw, fade, glide, span, easeInOut, easeIn} from '../../kit.js';

// A gentle countdown: each number rises into the middle, rests while a thin ring draws once
// around it, then drifts up and fades as the next arrives. The last beat is the `go` word on a
// disc of the accent colour. The card lasts `meta.duration`, split evenly between the beats.
export const meta = {duration: 4.8, live: true};
export const defaults = {from: 3, go: 'Begin', label: 'Starting in', note: 'breathe in', labels: ['Stand by', 'Take 01'], accents: ['leaf', 'sun', 'clay']};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accents?.[0]}), {root, W, H} = st, steps = props.from + 1, step = meta.duration / steps, cy = H * .5, r = Math.min(W * .36, H * .22), flat = s => up(s).replace(/\n/g, ' ');
  const disc = root.append('circle').attr('cx', W / 2).attr('cy', cy).attr('fill', look(props.accents?.[0]).accent);
  const beats = Array.from({length: steps}, (_, i) => {
    const last = i === steps - 1, str = last ? String(props.go) : String(props.from - i), ink = look(props.accents?.[i % (props.accents?.length || 1)]), size = Math.min(fit(str, last ? r * 1.6 : r * 1.3, 620), r * 1.25 / capH(1)), g = root.append('g');
    const ring = last ? null : stroke(g, `M${W / 2} ${cy - r}A${r} ${r} 0 1 1 ${W / 2 - .01} ${cy - r}`, ink.accent, 9), unit = glyphs(g, str, W / 2, cy + capH(size) / 2, size, {by: 'all', anchor: 'middle', color: last ? look(props.accents?.[0]).on : C.ink})[0];
    return {g, ring, unit, last};
  });
  const label = txt(root, W / 2, cy - r - 80, flat(props.label), {size: 36, role: 'wide', anchor: 'middle', color: C.soft}), note = txt(root, W / 2, cy + r + 120, String(props.note).replace(/\n/g, ' ').toLowerCase(), {size: 60, role: 'serif', anchor: 'middle', color: C.soft});
  const corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      beats.forEach((b, i) => {
        const local = t - i * step, q = span(local, 0, .6), out = b.last ? 0 : easeIn(span(local, step - .3, .3));
        pose(b.unit, {y: (1 - glide(q)) * b.unit.cap * .5 - out * b.unit.cap * .4, o: easeInOut(span(q, 0, .6)) * (1 - out)});
        if (b.ring) { draw(b.ring, easeInOut(span(local, .1, step - .3))); b.ring.attr('opacity', local > 0 ? 1 - out : 0); }
      });
      const done = t - (steps - 1) * step; disc.attr('r', r * glide(span(done, 0, .8)));
      label.attr('opacity', fade(t, .1, .5) * (1 - easeInOut(span(done, -.2, .3)))); note.attr('opacity', fade(t, .4, .6)); corners.set(t, .5);
    },
  };
}
