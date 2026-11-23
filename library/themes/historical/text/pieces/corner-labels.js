import {C, F, stage, tone, bar, txt, torn, brush, capH, span, settle, leave, presence} from '../../kit.js';

// Small references in the four corners of the picture, like the markings on an archive print: the
// first line of each on a bar, further lines typed on dark strips beneath, short brush strokes
// behind two of them and a catalogue letter on a paper tab. Leave a label empty to drop it.
export const meta = {duration: 4, live: true};
export const defaults = {
  topLeft: 'REEL 12\nFROM THE ARCHIVE', topRight: 'UNEDITED\nONE TAKE', bottomLeft: 'KEEP\nWATCHING', bottomRight: 'PT. 01\nOF 03',
  mark: 'R', color: 'crimson', inset: 48,
};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W, H} = st, m = props.inset, fill = tone(props.color), fills = [fill, 'char', 'char', fill === 'bone' ? 'crimson' : 'bone'];
  const strokes = [brush(root, m - 30, m + 18, 260, 40, {seed: 3, color: C.blood, opacity: .8}), brush(root, W - m - 230, H - m - 58, 260, 40, {seed: 6, color: C.blood, opacity: .8, from: 'right'})];
  const corners = [props.topLeft, props.topRight, props.bottomLeft, props.bottomRight].map((text, i) => { const right = i % 2 === 1, bottom = i > 1, lines = String(text ?? '').split('\n').filter(Boolean);
    const bs = lines.map((line, j) => bar(root, line, j ? {size: 26, fill: 'glass', font: F.type, weight: 400, spacing: .1, seed: i + j, from: right ? 'right' : 'left'} : {size: 38, fill: fills[i], weight: 700, spacing: .06, seed: i, from: right ? 'right' : 'left'}));
    let y = 0; const hs = bs.map(b => { const at = y + b.h / 2; y += b.h - 2; return at; }), total = y;
    bs.forEach((b, j) => b.g.attr('transform', `translate(${right ? W - m - b.w - (j ? 14 : 0) : m + (j ? 14 : 0)} ${(bottom ? H - m - total : m) + hs[j]})`)); return bs; });
  const tab = root.append('g'); if (props.mark) { tab.append('path').attr('d', torn(-40, -46, 80, 92, {seed: 4, rough: 3, step: 12})).attr('fill', C.bone); tab.append('path').attr('d', 'M-26 28h52').attr('stroke', C.crimson).attr('stroke-width', 4);
    txt(tab, 0, 14, String(props.mark), {size: 56, font: F.serif, weight: 400, anchor: 'middle', color: '#15181d', spacing: 0}); }
  return {seek(t) {
    const x = leave(t, props.life); root.attr('opacity', presence(t, props.life)); strokes.forEach((s, i) => s.reveal(settle(span(t, i * .3, .7))));
    corners.forEach((bs, i) => bs.forEach((b, j) => b.reveal(span(t, .2 + i * .15 + j * .2, .8))));
    tab.attr('transform', `translate(${W - m - 52} ${m + 210 + 16 * (1 - settle(span(t, .9, .7))) + 20 * x}) rotate(3)`).attr('opacity', props.mark ? span(t, .9, .4) : 0);
  }};
}
