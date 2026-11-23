import {stage, capH, fit, glyphs, pose, word, wordFit, label, ring, draw, cornerLabels, fade, glide, span, easeInOut} from '../../kit.js';

// A quiet countdown: thin tall numerals come up out of blur one after another inside a hairline
// ring that draws once per beat, then the `go` word is typed on in heavy caps.
export const meta = {duration: 4, live: true};
export const defaults = {from: 3, go: 'Begin', label: 'Starting in', note: 'hold still', labels: ['Stand by', 'Take 01'], field: 'noir', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, steps = props.from + 1, step = meta.duration / steps, cy = H * .5, r = Math.min(W * .3, H * .2), o = {role: 'num'};
  ring(root, W / 2, cy, r, ink.head, 1.5).attr('opacity', .25);
  const arc = root.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 3).attr('transform', `rotate(-90 ${W / 2} ${cy})`);
  const size = r * 1.05 / capH(1, o), cap = capH(size, o), nums = Array.from({length: props.from}, (_, i) => glyphs(root, String(props.from - i), W / 2, cy + cap / 2, size, {by: 'all', anchor: 'middle', role: 'num', color: ink.head})[0]);
  const gsize = wordFit(props.go, r * 1.5, 120), go = word(root, props.go, W / 2, cy + capH(gsize) / 2, gsize, {color: ink.head});
  const top = label(root, W / 2, cy - r - 60, props.label, {size: 22, color: ink.head, anchor: 'middle'}), note = label(root, W / 2, cy + r + 80, props.note, {size: 20, color: ink.dim, anchor: 'middle'}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t); const k = Math.min(steps - 1, Math.floor(t / step)), local = t - k * step;
      nums.forEach((u, i) => { const tt = t - i * step, q = span(tt, 0, .35), out = span(tt, step - .22, .22); pose(u, {sx: 1.08 - .08 * glide(q), o: easeInOut(q) * (1 - easeInOut(out)), blur: (1 - glide(q)) * 22 + out * 12}); });
      draw(arc, k < props.from ? easeInOut(span(local, 0, step * .9)) : 1); arc.attr('opacity', k < props.from ? 1 - span(local, step * .9, step * .1) : fade(t, props.from * step, .3));
      go.set(t, props.from * step + .05); top.attr('opacity', fade(t, 0, .4) * .85 * (1 - fade(t, props.from * step - .2, .2))); note.attr('opacity', fade(t, .3, .4)); corners.set(t, .3);
    },
  };
}
