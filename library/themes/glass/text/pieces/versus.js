import {stage, capH, backdrop, clipLive, word, wordFit, label, ring, cornerLabels, fade, swell, span} from '../../kit.js';

// Two options as the theme's vertical panels: the frame is cut into two tall panels, each its own
// out-of-focus field, sliding in from opposite ends with a thin dark gutter between; a condensed
// word settles in each (at `times`, seconds) and a small ring in the middle holds the `mark`.
export const meta = {duration: 4.5, live: true};
export const defaults = {a: 'LOUD', b: 'QUIET', mark: 'or', aNote: 'says it first', bNote: 'says it once', labels: ['Pick one', 'No wrong answer'], fields: ['dusk', 'sky'], times: [.45, .7], open: .7, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: 'noir', accent: props.accent}), {root, W, H} = st, gut = 10, pw = (W - gut) / 2, cy = H / 2;
  const panels = [0, 1].map(i => {
    const x = i * (pw + gut), clip = clipLive(st), g = root.append('g').attr('clip-path', clip.url), inner = g.append('g'), wash = backdrop(inner, st, x, 0, pw, H, props.fields?.[i] ?? 'stone', {seed: i * 3});
    const str = i ? props.b : props.a, size = Math.min(wordFit(str, pw - 110, 260, 'tall'), H * .14 / capH(1, {role: 'tall'})), cap = capH(size, {role: 'tall'});
    const w = word(inner, str, x + pw / 2, cy + cap / 2, size, {face: 'tall', seed: i + 2}), note = label(inner, x + pw / 2, cy + cap / 2 + 70, i ? props.bNote : props.aNote, {size: 19, anchor: 'middle'});
    return {x, clip, inner, wash, w, note, i};
  });
  const mid = root.append('g'); mid.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', 44).attr('fill', '#0A0F1C'); ring(mid, W / 2, cy, 44, '#fff', 1.5); label(mid, W / 2, cy + 7, props.mark, {size: 19, anchor: 'middle'});
  const corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      st.tick(t);
      panels.forEach(p => { const e = swell(span(t, p.i * .08, props.open ?? .7)), off = (1 - e) * H * (p.i ? 1 : -1); p.clip.set(p.x, off, W / 2 - 5, H); p.inner.attr('transform', `translate(0 ${off * .6})`); p.wash.set(t); p.w.set(t, props.times?.[p.i] ?? .45 + p.i * .25); p.note.attr('opacity', fade(t, (props.times?.[p.i] ?? .45 + p.i * .25) + .45, .5) * .82); });
      mid.attr('opacity', fade(t, .7, .4)); corners.set(t, .5);
    },
  };
}
