import {C, stage, group, up, span, ease, io, clamp, light, openBox, flash, fire, title, fit, capH, band, leave} from '../../kit.js';

// The lines-of-light timeline beat. The red dot top-left fires a line to the timeline;
// its frame opens from where the line touches it, ruler ticks and lanes draw, clips open left to
// right, and a red playhead runs it, lighting each clip blue as it passes. At `at` seconds (the cue
// word) two red strikes cross it out, everything collapses to the centre line and shrinks into a
// blue flash, and the `text` (NO TIMELINE) lands alone: orange, red, white. `cue` sets that moment in seconds into the
// overlay (`at` still works when the pipeline has not filled it in with the overlay start).
export const meta = {duration: 5.5, live: true};
export const defaults = {label: 'TIMELINE', text: 'NO TIMELINE', at: 3.4, y: 330, height: 330, from: [110, 280]};

// busy: a crowded, frightening edit instead of the tidy three lanes: `lanes` tracks (default 7) packed with short clips
// (seeded by `seed`), every fourth one flagged red, the ruler twice as fine. For "look how complicated editing is".
function busySpec(nl, seed) {
  let s = seed * 9301 + 49297; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280, out = [];
  for (let r = 0; r < nl; r++) { let a = rnd() * .04; while (a < .95) { const b = Math.min(.98, a + .04 + rnd() * .13); out.push([r, a, b]); a = b + .008 + rnd() * .025; } }
  return out;
}

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W} = st, cut = props.cue ?? props.at ?? 3.4, x0 = 113, x1 = W - 113, y0 = props.y ?? 330, y1 = y0 + (props.height ?? 330), ym = (y0 + y1) / 2, cx = W / 2;
  const shade = band(root, y0 - 160, y1 + 130, 0), g = group(root), [fx, fy] = props.from ?? [110, 280];
  const shot = fire(root, [[fx, fy], [fx, ym], [x0, ym]], {dur: .45, hold: .5, retract: .4, keep: false, r: 13});
  const frame = openBox(g, x0, y0, x1 - x0, y1 - y0, {from: 'left', width: 3});
  const nl = props.busy ? (props.lanes ?? 7) : 3, rul = y0 + (y1 - y0) * .16, lanes = (props.busy ? Array.from({length: nl - 1}, (_, i) => (i + 1) / nl) : [.36, .68]).map(f => rul + (y1 - rul) * f), rows = [rul, ...lanes, y1], n = props.busy ? 44 : 22;
  const ticks = Array.from({length: n + 1}, (_, i) => { const x = x0 + (x1 - x0) * i / n, h = (y1 - y0) * (i % 5 ? .05 : .1); const l = light(g, [[x, y0], [x, y0 + h]], {width: 1.6, echo: false}); l.opacity(.6); return {l, q: i / n}; });
  const rules = [rul, ...lanes].map((yy, i) => { const l = light(g, [[x0, yy], [x1, yy]], {width: 1.4, echo: i === 0}); l.opacity(i ? .4 : .55); return l; });
  const pad = (y1 - y0) * (props.busy ? .012 : .035), spec = props.busy ? busySpec(nl, props.seed ?? 7) : [[0, .04, .3], [0, .33, .62], [0, .66, .95], [1, .1, .45], [1, .52, .85], [2, .04, .22], [2, .28, .58], [2, .64, .9]];
  const step = Math.min(.05, .9 / spec.length);
  const clips = spec.map(([r, a, b], j) => { const cx0 = x0 + (x1 - x0) * a, cx1 = x0 + (x1 - x0) * b, cy0 = rows[r] + pad, cy1 = rows[r + 1] - pad;
    const bad = props.busy && j % 4 === 1, lit = g.top.append('rect').attr('x', cx0).attr('y', cy0).attr('width', cx1 - cx0).attr('height', cy1 - cy0).attr('fill', bad ? C.red : C.blue).attr('opacity', 0);
    return {j, cx0, cx1, lit, bad, box: openBox(g, cx0, cy0, cx1 - cx0, cy1 - cy0, {from: 'left', width: 2, echo: false})}; });
  const head = g.text.append('g'), hy0 = y0 - (y1 - y0) * .08, hy1 = y1 + (y1 - y0) * .04;
  head.append('line').attr('y1', hy0).attr('y2', hy1).attr('stroke', C.red).attr('stroke-width', 3.4); head.append('circle').attr('cy', hy0).attr('r', 10).attr('fill', C.red);
  const strikes = [[[x0, y1], [x1, y0]], [[x0, y0], [x1, y1]]].map(([a, b]) => light(g, [a, b], {width: 6, color: 'red', echo: false}));
  const label = title(g, up(props.label), cx, y0 - 50, 30, {land: false, color: C.core, track: .45, halo: 5});
  const tsize = Math.min(64, fit(up(props.text), W - 160, 64, {track: .3})), big = title(root, up(props.text), cx, ym + capH(tsize) / 2, tsize, {track: .3, halo: 6});
  const blue = flash(root, cx, ym, {color: 'blue', r: 170});
  return {seek(t) {
    const x = leave(t, props.life, .5), k = ease(span(t, 0, .3)) * (1 - x), col = io(span(t, cut + .25, .3)), shrink = io(span(t, cut + .5, .25)), fade = 1 - clamp((t - cut - .72) / .15);
    shade.attr('opacity', k); shot.seek(t);
    g.attr('transform', `translate(${cx} ${ym}) scale(${Math.max(.001, 1 - shrink)} ${Math.max(.001, 1 - col)}) translate(${-cx} ${-ym})`).attr('opacity', fade * (1 - x));
    frame.draw(io(span(t, .35, .6))); const tq = ease(span(t, .7, .5)); ticks.forEach(tk => tk.l.draw(tq >= tk.q ? 1 : 0)); rules.forEach(r => r.draw(tq));
    const ph = t > 1.15 ? x0 + (x1 - x0) * io(span(t, 1.15, Math.max(.3, cut - 1.2))) : null;
    clips.forEach(c => { const q = ease(span(t, .85 + c.j * step, .35)); c.box.draw(q); c.lit.attr('opacity', (c.bad && t < cut ? .3 * q : 0) + (ph != null && t < cut && c.cx0 <= ph && ph <= c.cx1 + 30 ? .16 : 0)); });
    head.attr('transform', `translate(${ph ?? 0} 0)`).attr('opacity', ph == null ? 0 : 1 - clamp((t - cut) / .35));
    strikes.forEach((s, i) => s.draw(ease(span(t, cut + i * .1, .16))));
    label.show(ease(span(t, .6, .25)) * (1 - col), 1); blue.set(clamp((t - cut - .68) / .08) * (1 - clamp((t - cut - .76) / .3)) * (1 - x));
    big.show(ease(span(t, cut + .3, .8)), 1 - x);
  }};
}
