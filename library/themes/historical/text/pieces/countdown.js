import {C, F, stage, up, oneLine, fit, capH, txt, typed, bar, cornerLabels, cardMove, span, settle, clamp} from '../../kit.js';

// A film-leader countdown: rings and cross-hairs on the dark field, a pale wedge sweeping round
// once per number, the count stepping down from `from` to 1 with a frame of flash on each change,
// then the `go` word on a bar. `fields[0]` is the backdrop.
export const meta = {duration: 4.5, live: true};
export const defaults = {from: 3, go: 'BEGIN', label: 'STARTING IN', note: 'REEL ONE', labels: ['STAND BY', 'PROJECTION', '', 'TAKE 01'], fields: ['night']};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.fields?.[0] ?? props.field}), {root, W, H, ink, k} = st, n = Math.max(1, Math.round(props.from)), step = 3.4 / (n + 1), cx = W / 2, cy = H * .48, R = Math.min(W * .37, H * .25);
  const g = root.append('g').attr('transform', `translate(${cx} ${cy})`), wedge = g.append('path').attr('fill', ink.text).attr('opacity', .16);
  g.append('path').attr('d', `M${-W} 0H${W}M0 ${-H}V${H}`).attr('stroke', ink.dim).attr('stroke-width', 2).attr('opacity', .5);
  [1, .82].forEach((s, i) => g.append('circle').attr('r', R * s).attr('fill', 'none').attr('stroke', ink.text).attr('stroke-width', i ? 3 : 6).attr('opacity', i ? .6 : .9));
  let d = ''; for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r0 = R * (i % 5 ? 1.05 : 1.04), r1 = R * (i % 5 ? 1.08 : 1.13); d += `M${Math.cos(a) * r0} ${Math.sin(a) * r0}L${Math.cos(a) * r1} ${Math.sin(a) * r1}`; } g.append('path').attr('d', d).attr('stroke', ink.dim).attr('stroke-width', 2.5);
  const o = {weight: 700, spacing: 0}, ns = R * 1.2, nums = Array.from({length: n}, (_, i) => txt(g, 0, capH(ns, o) / 2, String(n - i), {size: ns, weight: 700, anchor: 'middle', spacing: 0, color: ink.text}));
  const go = bar(g, props.go, {size: fit(up(oneLine(props.go)), R * 1.5, R * .5, {weight: 700}), fill: ink.bar, weight: 700}); go.g.attr('transform', `translate(${-go.w / 2} 0)`);
  const label = props.label ? bar(root, props.label, {size: 36 + 10 * k, fill: 'char'}) : null; label?.g.attr('transform', `translate(${cx - label.w / 2} ${cy - R * 1.13 - 70 - 20 * k})`);
  const note = props.note ? typed(root, cx, cy + R * 1.13 + 80 + 20 * k, up(oneLine(props.note)), {size: 30 + 8 * k, color: ink.sub, anchor: 'middle', spacing: .12}) : null;
  const flash = root.append('rect').attr('width', W).attr('height', H).attr('fill', '#fff'), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration, rot: 0}));
    const u = (t - .3) / step, beat = clamp(Math.floor(u), 0, n), p = t < .3 ? 0 : beat >= n ? 1 : u - beat, a = p * Math.PI * 2 - Math.PI / 2, rr = R;
    wedge.attr('d', p <= 0 || beat >= n ? '' : `M0 0L0 ${-rr}A${rr} ${rr} 0 ${p > .5 ? 1 : 0} 1 ${Math.cos(a) * rr} ${Math.sin(a) * rr}Z`);
    nums.forEach((node, i) => node.attr('opacity', t >= .3 && beat === i ? 1 : 0)); go.reveal(beat >= n ? span(t, .3 + n * step, .6) : 0);
    g.attr('opacity', settle(span(t, 0, .5))); flash.attr('opacity', t < .3 ? 0 : .2 * Math.exp(-14 * (u - Math.min(n, Math.floor(u))) * step));
    label?.reveal(span(t, .1, .7)); note?.set(span(t, .5, .8)); corners(t, .6);
  }};
}
