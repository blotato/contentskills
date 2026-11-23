import {C, F, M, stage, fieldOf, tone, label, folio, rule, runs, clamp, span, glide, ease, easeIn, gridLines} from '../../kit.js';

// The theme at full volume: the words ARE the picture. A sequence of `steps`, each replacing the one before on its
// `at` (a hard cut of type, the way a headline is reset): one to three lines sized to fill the measure, in the serif,
// its italic, the Didone capitals or a heavy condensed grotesque (Archivo 900), on a flat field of one of the theme's
// grounds that can flip with every step (or no field: straight on the footage). Each step lands with its own move:
//   slam  the block arrives a third too large and soft and snaps to size in 4 frames
//   roll  each line rolls up from behind its own baseline (a masked rise), lines 2 frames apart
//   track the letters arrive spread wide and snap tight
//   letters  letter by letter, 1 frame apart
//   cut   it is simply there
// A line may carry `swipe: true` (a thick accent underline draws under it) and *marks* for the italic accent.
// Made for "behind": "person": the speaker stays in front, cut out over the fields. The last step is the composed
// frame you hand on. A running head (left / right) follows the field's ink.
// Props: steps [{at, field (wine|ink|paper|stone|blush|crimson|none), y (top), gap, enter, lines [{text, face
// (serif|italic|didone|sans), color, max (px), width (measure, px), swipe, caps}]}], left, right, headY, x, width.
export const meta = {duration: 2, live: true};
export const defaults = {left: 'The edit issue', right: 'No. 01', headY: 236, x: M, width: 936,
  steps: [{at: 0, field: 'wine', y: 270, enter: 'slam', lines: [{text: 'Nobody', face: 'serif', max: 420}]},
          {at: .4, field: 'paper', y: 270, enter: 'track', lines: [{text: 'EDITED', face: 'sans', max: 330}]},
          {at: .8, field: 'ink', y: 262, enter: 'roll', lines: [{text: 'Nobody edited', face: 'serif', max: 180}, {text: '*this one.*', face: 'serif', max: 180, swipe: true}]}]};

const FACES = {serif: [F.head, 400, .74, 0], italic: [F.italic, 400, .74, 0], didone: [F.serif, 600, .78, .02], sans: ['Archivo', 900, .76, -.01]};
const GROUNDS = {crimson: {bg: C.crimson, fg: C.paper, accent: C.blush}, none: {bg: null, fg: C.ink, accent: C.wine}};
export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), X = props.x ?? M, W = props.width ?? 936, steps = (props.steps ?? []).slice().sort((a, b) => a.at - b.at), hy = props.headY ?? 236;
  const groups = steps.map((s, k) => {
    const f = GROUNDS[s.field] ?? fieldOf(s.field), g = st.root.append('g').attr('opacity', 0);
    if (f.bg) g.append('rect').attr('width', 1080).attr('height', 1920).attr('fill', f.bg);
    if (f.bg && props.grid) gridLines(g, {color: f.fg, ...(props.grid === true ? {} : props.grid)});      // grid squares on the field
    const head = g.append('g'); head.append('line').attr('x1', X).attr('x2', X + W).attr('y1', hy).attr('y2', hy).attr('stroke', f.fg).attr('stroke-width', 3);
    if (props.left) label(head, X, hy - 22, props.left, {size: 28, color: f.fg}); if (props.right) folio(head, X + W, hy - 22, String(props.right).toUpperCase(), {size: 28, color: f.fg, anchor: 'end'});
    if (!f.bg) head.attr('filter', st.url('halo'));
    const block = g.append('g'); if (!f.bg) block.attr('filter', st.url('halo'));
    let y = s.y ?? hy + 34; const rows = [];
    (s.lines ?? []).forEach((ln, i) => {
      const [font, weight, capK, track] = FACES[ln.face] ?? FACES.serif, str = ln.caps ? String(ln.text).toUpperCase() : String(ln.text), col = ln.color ? tone(ln.color) : f.fg;
      // set the line at 100 px, measure it in the page, then scale the type to the measure
      const probe = block.append('text').style('font', `${weight} 100px ${font}`).style('letter-spacing', `${track}em`).style('white-space', 'pre'); if (ln.face === 'sans') probe.style('font-variation-settings', '"wdth" 78');
      for (const r of runs(str)) probe.append('tspan').text(r.text).style('font-family', r.italic ? F.italic : null).style('font-weight', r.italic ? 400 : null).attr('fill', r.italic ? f.accent : col);
      const w100 = probe.node().getComputedTextLength() || 100, size = Math.min(ln.max ?? 400, 100 * (ln.width ?? W) / w100), w = w100 * size / 100, cap = size * capK, base = y + cap;
      probe.remove();
      const cid = st.uid('tk'), clip = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', 0).attr('y', base - size * 1.02).attr('width', 1080).attr('height', size * 1.3);
      const outer = block.append('g'), inner = outer.append('g'), tx = inner.append('text').attr('x', 540).attr('y', base).attr('text-anchor', 'middle').style('font', `${weight} ${size}px ${font}`).style('white-space', 'pre'); if (ln.face === 'sans') tx.style('font-variation-settings', '"wdth" 78');
      const parts = runs(str).map(r => tx.append('tspan').text(r.text).style('font-family', r.italic ? F.italic : null).style('font-weight', r.italic ? 400 : null).attr('fill', r.italic ? f.accent : col));
      const sw = ln.swipe ? block.append('rect').attr('x', 540 - w / 2).attr('y', base + size * .1).attr('height', Math.max(8, size * .055)).attr('fill', f.accent) : null;
      rows.push({outer, inner, tx, cid, size, w, base, track, sw, i, str}); y = base + size * (s.gap ?? .2);
    });
    return {s, g, block, rows, end: steps[k + 1]?.at ?? Infinity, cy: rows.length ? (rows[0].base - rows[0].size * .7 + rows.at(-1).base) / 2 : 400};
  });
  return {seek(t) {
    for (const G of groups) {
      const on = t >= G.s.at && t < G.end, u = t - G.s.at, enter = G.s.enter ?? 'slam';
      G.g.attr('opacity', on ? 1 : 0); if (!on) continue;
      const q = glide(span(u, 0, .14));
      G.block.attr('transform', enter === 'slam' ? `translate(540 ${G.cy}) scale(${(1.34 - .34 * q).toFixed(3)}) translate(-540 ${-G.cy})` : null).style('filter', enter === 'slam' && q < .98 ? `blur(${((1 - q) * 14).toFixed(1)}px)` : null).attr('opacity', enter === 'slam' ? ease(span(u, 0, .06)) : 1);
      for (const r of G.rows) {
        const a = glide(span(u, r.i * .066, .2));
        r.outer.attr('clip-path', enter === 'roll' ? `url(#${r.cid})` : null); r.inner.attr('transform', enter === 'roll' ? `translate(0 ${((1 - a) * r.size * 1.25).toFixed(1)})` : null);
        if (enter === 'track') { const k = glide(span(u, r.i * .05, .17)); r.tx.style('letter-spacing', `${(r.track + (1 - k) * .34).toFixed(3)}em`).attr('opacity', ease(span(u, r.i * .05, .07))); }
        if (enter === 'letters') { const n = Math.max(1, r.str.replace(/\*/g, '').length), shown = clamp((u - r.i * .1) / (n * .033)); r.outer.attr('clip-path', null); r.tx.attr('opacity', 1); r.inner.attr('opacity', shown > 0 ? 1 : 0); r.tx.attr('textLength', null); r.inner.style('clip-path', `inset(-20% ${((1 - glide(shown)) * 100).toFixed(1)}% -20% 0)`); }
        r.sw?.attr('width', r.w * glide(span(u, .12 + r.i * .066, .22)));
      }
    }
  }};
}
