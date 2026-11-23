import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A few lines of a typewritten document over the footage; the words listed in `redact` are struck
// out by marker bars that swipe across them just after they are typed. `x`, `y`: top-left corner.
export const meta = {duration: 5, live: true};
export const defaults = {heading: 'STATEMENT 14-B', lines: ['The witness reported a', 'figure at the window', 'shortly after midnight.'], redact: ['figure', 'midnight'], x: 70, y: 150, size: 46, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, size = props.size, o = {font: F.mono, weight: 700, spacing: .02}, pitch = size * 1.6, g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`);
  const w = Math.max(...props.lines.map(l => measure(l, size, o))) + 80, h = props.lines.length * pitch + 110;
  g.append('rect').attr('x', -30).attr('y', -30).attr('width', w).attr('height', h).attr('fill', '#000').attr('opacity', .62); g.append('rect').attr('x', -30).attr('y', -30).attr('width', 6).attr('height', h).attr('fill', tone(props.color));
  const head = txt(g, 10, 22, up(props.heading), {size: 28, weight: 600, spacing: .3, color: C.fog});
  let count = 0; const total = props.lines.join(' ').length, rows = props.lines.map((line, i) => {
    const y = 96 + i * pitch, start = count; count += line.length + 1; const node = txt(g, 10, y, '', {size, font: F.mono, weight: 700, spacing: .02}).style('white-space', 'pre');
    const bars = (props.redact || []).flatMap(word => { const at = line.toLowerCase().indexOf(String(word).toLowerCase()); if (at < 0) return []; const x0 = 10 + measure(line.slice(0, at), size, o), bw = measure(line.slice(at, at + word.length), size, o); return [{at: start + at + word.length, x0, bw, node: g.append('path').attr('fill', '#040404').attr('stroke', C.steel).attr('stroke-width', 1), y}]; });
    return {line, node, start, bars};
  });
  return {seek(t) {
    root.attr('opacity', presence(t, props.life, 2)); const typedN = span(t, .3, Math.min(3, total * .04)) * total, per = Math.min(3, total * .04) / total; head.attr('opacity', .9);
    rows.forEach(r => { r.node.text(r.line.slice(0, clamp(Math.floor(typedN - r.start), 0, r.line.length))); r.bars.forEach((b, i) => { const q = easeOut(span(t, .3 + b.at * per + .15, .25)); b.node.attr('d', q > 0 ? roughBox(b.x0 - 6, b.y - size * .78, (b.bw + 6) * q, size * 1.02, b.at + i, 3) : ''); }); });
  }};
}
