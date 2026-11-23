import {card, sourced, grow, fade, fmt, num, fig, tag, box, rule, folio, loadImages, smooth, easeIn, span, mix, clamp, C, TINTS} from './_card.js';

// Watching the edit happen, as a video editor's sketch: ONE film strip of the raw take across the page, made of real
// frames of the recording (`images`, evenly spaced over the take) between two rows of sprocket holes, over a mono
// timecode ruler. The pauses (everything between the kept takes, plus head and tail) are hatched in crimson. A blade
// runs left to right; each pause it passes drops out of the strip and a cut mark is left on the take that follows,
// while the big Didone figure counts down by the seconds removed and the cut counter counts up. Then the kept takes
// glide together and close up into the edited reel, to the same scale, so it ends as much shorter as the edit really
// is (the ruler still reads its length), the figure turns to the accent and its label changes from `a` to `b`.
// With `use: 'project'` this is the video's real edit decision list (props.project.edl: before, after, cuts,
// segments [{in, out, at, length}]); otherwise `before` and `segments` [{in, out}] are drawn and the kicker says
// they are illustrative. With no `images` the frames are tints of the footage.
// Props: title, unit, use ('project' | ''), images (server paths, frames evenly spaced over the raw take; every
// second one is shown when there are more than 8), a, b (labels of the figure before / after), cutsLabel, removed
// (the words under the seconds removed, false to hide), suffix, decimals, bladeAt, bladeFor (when the blade starts
// and how long it takes to cross), closeAt, closeFor (when the takes close up, and for how long), before, segments
// (fallback), note, index, field, clear.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'One take, *cut* down', unit: 'Illustrative · one take, seconds', note: 'Illustrative data', index: '16', field: 'paper', clear: false, use: '', images: [], a: 'Raw take', b: 'Edited reel', cutsLabel: 'Cuts', removed: 'of pauses cut', suffix: ' s', decimals: 1,
  bladeAt: .3, bladeFor: .8, closeAt: 1.15, closeFor: .5,
  before: 60, segments: [{in: 2, out: 9}, {in: 13, out: 21}, {in: 24, out: 30}, {in: 37, out: 44}, {in: 52, out: 56}]};

const TINT = ['wall', 'plaid', 'skin', 'shade', 'wine', 'hair', 'wall', 'ink'];
const clock = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export async function mount(el, props = defaults) {
  const edl = props.use === 'project' ? props.project?.edl : null, real = Boolean(edl?.segments?.length);
  const pg = card(el, sourced(props, defaults, real, {unit: 'This recording · seconds', note: 'From this video’s edit list'})), {ink, body: g, st} = pg, d3 = window.d3, p = {decimals: props.decimals ?? 1, suffix: props.suffix ?? ''};
  let at = 0; const segs = (real ? edl.segments : props.segments ?? []).map(s => { const o = {in: s.in, out: s.out, len: s.out - s.in, at: s.at ?? at}; at = o.at + o.len; return o; }).filter(s => s.len > 0);
  const before = (real ? edl.before : props.before) || Math.max(...segs.map(s => s.out)), after = (real ? edl.after : null) ?? at, n = segs.length, cuts = (real ? edl.cuts : null) ?? Math.max(0, n - 1);
  const pauses = []; segs.forEach((s, i) => { const from = i ? segs[i - 1].out : 0; if (s.in - from > .001) pauses.push({from, to: s.in}); }); if (n && before - segs[n - 1].out > .001) pauses.push({from: segs[n - 1].out, to: before});
  const hot = ink.dark ? ink.accent : C.crimson, k = pg.w / before, x = v => pg.x0 + v * k;
  // the page: figure and counter, the strip, the ruler
  const sy = pg.y0 + 232, hole = 20, H = Math.min(236, pg.y1 - sy - 2 * hole - 96), band = H + hole * 2, ry = sy + band + 16;
  const urls = (props.images ?? []).filter(Boolean), cells = urls.length ? Math.min(8, urls.length) : 8, cw = pg.w / cells;
  const shots = await loadImages(Array.from({length: cells}, (_, c) => urls[Math.min(urls.length - 1, Math.round((c + .5) / cells * urls.length - .5))] ?? null), Math.round(cw * 2.5), Math.round(H * 2.5));
  const big = num(g, pg.x0 - 4, pg.y0 + 132, '', {size: 164, color: ink.fg}), la = tag(g, pg.x0, pg.y0 + 186, props.a, 420, {color: ink.fg, opacity: 0}), lb = tag(g, pg.x0, pg.y0 + 186, props.b, 420, {color: ink.accent, opacity: 0});
  const nCuts = num(g, pg.x1 + 3, pg.y0 + 132, '0', {size: 112, anchor: 'end', color: ink.fg}), lc = tag(g, pg.x1, pg.y0 + 186, props.cutsLabel ?? 'Cuts', 300, {anchor: 'end', color: ink.sub, opacity: 0});
  // the strip, drawn once and shown through a window per take and per pause
  const sid = st.uid('film'), film = st.defs.append('g').attr('id', sid), filmC = ink.dark ? C.umber : C.ink;
  box(film, pg.x0, sy, pg.w, band, filmC);
  for (let hx = pg.x0 + 8; hx < pg.x1 - 12; hx += 27) for (const hy of [sy + 5, sy + band - 15]) film.append('rect').attr('x', hx).attr('y', hy).attr('width', 13).attr('height', 10).attr('rx', 2.5).attr('fill', ink.bg);
  shots.forEach((src, c) => {
    const fx = pg.x0 + c * cw + 1.5, fw = cw - 3;
    if (src) film.append('image').attr('href', src).attr('x', fx).attr('y', sy + hole).attr('width', fw).attr('height', H).attr('preserveAspectRatio', 'xMidYMid slice');
    else { const gid = st.uid('tint'), T = TINTS[TINT[c % TINT.length]], gr = st.defs.append('linearGradient').attr('id', gid).attr('x1', 0).attr('y1', 0).attr('x2', 1).attr('y2', 1); gr.append('stop').attr('offset', 0).attr('stop-color', T[0]); gr.append('stop').attr('offset', 1).attr('stop-color', T[1]); box(film, fx, sy + hole, fw, H, `url(#${gid})`); }
  });
  const hid = st.uid('hatch'), pat = st.defs.append('pattern').attr('id', hid).attr('width', 13).attr('height', 13).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)'); pat.append('rect').attr('width', 4.5).attr('height', 13).attr('fill', hot);
  const slot = box(g, pg.x0, sy, 0, band, ink.faint, .55);
  const rid = st.uid('reveal'), reveal = st.defs.append('clipPath').attr('id', rid).append('rect').attr('x', pg.x0 - 8).attr('y', sy - 60).attr('height', band + 160).attr('width', 0), strip = g.append('g').attr('clip-path', `url(#${rid})`);
  const piece = (from, to, gap = 0) => { const outer = strip.append('g'), cid = st.uid('win'), w = Math.max(1.5, (to - from) * k - gap); st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', x(from)).attr('y', sy).attr('width', w).attr('height', band); const inner = outer.append('g').attr('clip-path', `url(#${cid})`); inner.append('use').attr('href', `#${sid}`); return {outer, inner, w}; };
  const gone = pauses.map(q => { const pc = piece(q.from, q.to); box(pc.inner, x(q.from), sy, pc.w, band, hot, .24); box(pc.inner, x(q.from), sy, pc.w, band, `url(#${hid})`, .85); return {...q, ...pc, len: q.to - q.from}; });
  const kept = segs.map((s, i) => { const pc = piece(s.in, s.out, 1.5), mark = i ? box(pc.outer, x(s.in) - 2.5, sy - 12, 4, band + 24, hot, 0) : null; return {...s, ...pc, mark}; });
  // the ruler: a hairline, a tick every few seconds, timecodes in mono
  const step = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600].find(v => before / v <= 5) ?? 600, minor = step / 3 >= 5 ? step / 3 : step / 2, base = rule(g, pg.x0, ry, pg.x1, ry, {width: 2, color: ink.fg}), ticks = g.append('g').attr('opacity', 0);
  for (let v = 0; v <= before + .001; v += minor) { const major = Math.abs(v / step - Math.round(v / step)) < .001; box(ticks, x(v) - (v ? 1.5 : 0), ry, 3, major ? 16 : 9, ink.fg); if (major) folio(ticks, x(v), ry + 50, clock(v), {size: 30, color: ink.sub, anchor: !v ? 'start' : x(v) > pg.x1 - 46 ? 'end' : 'middle', track: .02}); }
  const reel = box(g, pg.x0, ry - 4, 0, 8, ink.accent);
  // the blade: a thin line with a playhead at the top
  const blade = g.append('g').attr('opacity', 0); box(blade, -2, sy - 8, 4, band + 24, hot); blade.append('path').attr('d', `M -14 ${sy - 34} H 14 V ${sy - 20} L 0 ${sy - 4} L -14 ${sy - 20} Z`).attr('fill', hot);
  // what is left over once the takes close up
  const free = pg.x1 - x(after), mid = x(after) + free / 2, lost = props.removed !== false && free > 300 ? [fig(g, mid, sy + band / 2 - 4, `−${fmt(before - after, p)}`, {size: 44, anchor: 'middle', color: ink.fg, opacity: 0}), tag(g, mid, sy + band / 2 + 42, props.removed ?? 'of pauses cut', free - 40, {anchor: 'middle', color: ink.sub, track: .12, opacity: 0})] : [];
  const bladeAt = props.bladeAt ?? .3, bladeFor = props.bladeFor ?? .8, closeAt = props.closeAt ?? 1.15, closeFor = props.closeFor ?? .5, when = v => bladeAt + bladeFor * v / before, total = d3.sum(gone, q => q.len) || 1;
  return {seek(t) {
    pg.seek(t); const arrive = grow(t, pg.T - .06, .32);
    reveal.attr('width', (pg.w + 16) * arrive); base.draw(grow(t, pg.T - .04, .4)); ticks.attr('opacity', fade(t, pg.T + .04, .25));
    const bq = span(t, bladeAt, bladeFor); blade.attr('transform', `translate(${mix(pg.x0, pg.x1, bq).toFixed(1)} 0)`).attr('opacity', fade(t, bladeAt - .1, .12) * (1 - fade(t, bladeAt + bladeFor + .02, .16)));
    let removed = 0, made = 0;
    gone.forEach(q => { const d = span(t, when(q.from), .28); removed += q.len * smooth(span(t, when(q.from), .26)); q.outer.attr('transform', `translate(0 ${(easeIn(d) * 54).toFixed(1)})`).attr('opacity', 1 - easeIn(d)); });
    slot.attr('width', pg.w * arrive).attr('opacity', .55 * fade(t, bladeAt, .3));
    kept.forEach((s, i) => { const d = smooth(span(t, closeAt + .12 * i / Math.max(1, n), closeFor - .12)); s.outer.attr('transform', `translate(${((x(s.at) - x(s.in)) * d).toFixed(1)} 0)`); if (s.mark) { const m = fade(t, when(s.in), .1); s.mark.attr('opacity', m); if (t >= when(s.in)) made++; } });
    const c = smooth(span(t, closeAt, closeFor * .7)), col = d3.interpolateRgb(ink.fg, ink.accent)(c);
    big.text(fmt(mix(before, after, clamp(removed / total)), p)).attr('fill', col).attr('opacity', fade(t, pg.T - .06, .2)); la.attr('opacity', fade(t, pg.T, .25) * (1 - c)); lb.attr('opacity', c);
    nCuts.text(Math.round(cuts * (n > 1 ? made / (n - 1) : 0))).attr('opacity', fade(t, pg.T, .2)); lc.attr('opacity', fade(t, pg.T + .06, .25));
    reel.attr('width', after * k * grow(t, closeAt + .05, closeFor));
    lost.forEach((l, i) => l.attr('opacity', fade(t, closeAt + closeFor * .5 + i * .06, .25)));
  }};
}
