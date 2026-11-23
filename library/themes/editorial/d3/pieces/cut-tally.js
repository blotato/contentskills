import {C, F, stage, fieldOf, lines, label, folio, rule, text, picture, loadImages, count, span, glide, ease, smooth, clamp} from '../../kit.js';
import {spark} from '/library/ui/claude/ui.js';

// Who made the cuts: two columns with a face each. Left, a round portrait (`a.image`, or a line-drawn head and
// shoulders) and a Didone figure; right, the Claude spark (drawn by the repo's Claude UI kit, library/ui/claude)
// spinning while its figure counts up. Under them a strip of film is cut as the count runs: a blade travels along
// it and leaves one cut mark per count, and the strip parts at each mark. The larger side takes the accent.
// Props: title, unit, note, index, a {label, value, image}, b {label, value}, countAt, countFor, field, clear.
export const meta = {duration: 3, live: true};
export const defaults = {title: 'Cuts in *this* video', unit: 'Illustrative · jump cuts', note: 'Illustrative data', index: '02', field: 'ink', clear: false, a: {label: 'By me', value: 0, image: ''}, b: {label: 'By Claude', value: 12}, countAt: .35, countFor: .8};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'card', field: props.field, clear: props.clear}), f = fieldOf(props.field), root = st.root, X0 = 64, X1 = 936, a = props.a ?? {}, b = props.b ?? {};
  const [img] = await loadImages([a.image || null], 320, 320);
  label(root, X0, 92, props.unit, {size: 30, color: f.sub}); if (props.index) folio(root, X1, 92, props.index, {size: 30, anchor: 'end', color: f.sub});
  const top = rule(root, X0, 112, X1, 112, {color: f.fg, width: 3}), ttl = lines(st, root, [props.title], X0, 138, 84, {color: f.fg, accent: f.accent});
  const mid = rule(root, 500, 270, 500, 660, {color: f.fg, width: 2, opacity: .5});
  // left: the speaker
  const L = root.append('g'), cxL = 140, cy = 330, R = 70;
  if (img) { const cid = st.uid('av'); st.defs.append('clipPath').attr('id', cid).append('circle').attr('cx', cxL).attr('cy', cy).attr('r', R); L.append('image').attr('href', img).attr('x', cxL - R).attr('y', cy - R).attr('width', R * 2).attr('height', R * 2).attr('clip-path', `url(#${cid})`); }
  else { L.append('circle').attr('cx', cxL).attr('cy', cy - 20).attr('r', 30).attr('fill', 'none').attr('stroke', f.fg).attr('stroke-width', 5); L.append('path').attr('d', `M${cxL - 50} ${cy + 56}a50 46 0 0 1 100 0`).attr('fill', 'none').attr('stroke', f.fg).attr('stroke-width', 5).attr('stroke-linecap', 'round'); }
  L.append('circle').attr('cx', cxL).attr('cy', cy).attr('r', R).attr('fill', 'none').attr('stroke', f.fg).attr('stroke-width', 4);
  label(L, cxL + R + 28, cy + 12, a.label, {size: 34, color: f.fg});
  const figA = text(L, X0 - 6, 650, String(a.value ?? 0), {font: F.serif, weight: 500, size: 250, color: f.fg});
  // right: Claude
  const Rg = root.append('g'), cxR = 610, disc = Rg.append('circle').attr('cx', cxR).attr('cy', cy).attr('r', R).attr('fill', C.paper), sp = Rg.append('g');
  spark(sp.node(), 0, 0, 46, 0); Rg.append('circle').attr('cx', cxR).attr('cy', cy).attr('r', R).attr('fill', 'none').attr('stroke', f.accent).attr('stroke-width', 4);
  label(Rg, cxR + R + 28, cy + 12, b.label, {size: 34, color: f.accent});
  const figB = text(Rg, 524, 650, '0', {font: F.serif, weight: 500, size: 250, color: f.accent});
  // the film being cut
  const n = Math.max(1, Math.round(b.value ?? 12)), sy = 730, sh = 96, strip = root.append('g'), segs = [], marks = [];
  for (let i = 0; i <= n; i++) { const x = X0 + (X1 - X0) * i / (n + 1), w = (X1 - X0) / (n + 1), g = strip.append('g');
    g.append('rect').attr('x', x).attr('y', sy).attr('width', w).attr('height', sh).attr('fill', f.dark ? C.umber : C.stone);
    for (const k of [.25, .75]) for (const yy of [sy + 10, sy + sh - 22]) g.append('rect').attr('x', x + w * k - 7).attr('y', yy).attr('width', 14).attr('height', 12).attr('rx', 2).attr('fill', f.bg);
    segs.push(g); if (i) marks.push(strip.append('line').attr('x1', x).attr('x2', x).attr('y1', sy - 18).attr('y2', sy + sh + 18).attr('stroke', C.crimson).attr('stroke-width', 6)); }
  const blade = root.append('g'); blade.append('line').attr('y1', sy - 40).attr('y2', sy + sh + 40).attr('stroke', f.fg).attr('stroke-width', 3);
  blade.append('path').attr('d', `M-22 ${sy - 40}h44l-22 30z`).attr('fill', f.accent);
  const foot = props.note ? rule(root, X0, 880, X1, 880, {color: f.fg, width: 2, opacity: .45}) : null, note = props.note ? label(root, X0, 926, props.note, {size: 28, color: f.sub}) : null;
  const ca = props.countAt ?? .35, cf = props.countFor ?? .8;
  return {seek(t) {
    top.draw(glide(span(t, 0, .35))); ttl.seek(t, .05); mid.draw(glide(span(t, .15, .4)));
    const la = glide(span(t, .1, .4)), ra = glide(span(t, .2, .4));
    L.attr('opacity', ease(span(t, .1, .25))).attr('transform', `translate(${-(1 - la) * 60} 0)`); Rg.attr('opacity', ease(span(t, .2, .25))).attr('transform', `translate(${(1 - ra) * 60} 0)`);
    const q = clamp((t - ca) / cf), done = Math.floor(smooth(q) * n + 1e-6), spin = t < ca + cf ? t * 260 : (ca + cf) * 260 + (t - ca - cf) * 40;
    sp.attr('transform', `translate(${cxR} ${cy}) rotate(${spin.toFixed(1)})`); figB.text(String(done));
    strip.attr('opacity', ease(span(t, .2, .25))); const bx = X0 + (X1 - X0) * smooth(q) * n / (n + 1) + (X1 - X0) / (n + 1) * .02;
    blade.attr('transform', `translate(${bx.toFixed(1)} 0)`).attr('opacity', ease(span(t, ca - .1, .15)) * (1 - ease(span(t, ca + cf + .1, .25))));
    marks.forEach((m, i) => m.attr('opacity', i < done ? 1 : 0));
    segs.forEach((g, i) => { const cutL = i > 0 && i <= done ? glide(span(t, ca + cf * (i / n), .25)) : 0, cutR = i < n && i + 1 <= done ? glide(span(t, ca + cf * ((i + 1) / n), .25)) : 0; g.attr('transform', `translate(${((cutL - cutR) * 5).toFixed(1)} ${((i % 2 ? 1 : -1) * Math.max(cutL, cutR) * 7).toFixed(1)})`); });
    foot?.draw(glide(span(t, .3, .4))); note?.attr('opacity', ease(span(t, .5, .3)));
  }};
}
