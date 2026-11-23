import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// Four small tracked labels in the corners of the footage, each beside a short tick, switching on
// one after another. `mark` is a single accent letter by the top-left label; `inset` the margin.
export const meta = {duration: 4, live: true};
export const defaults = {
  topLeft: 'EP. 12\nTHE LAST HOUSE', topRight: 'UNEDITED\nONE TAKE', bottomLeft: 'KEEP\nWATCHING', bottomRight: 'PT. 01\nOF 03',
  mark: '', color: 'rose', inset: 48,
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, m = props.inset + 16, color = tone(props.color);
  const items = [props.topLeft, props.topRight, props.bottomLeft, props.bottomRight].map((str, i) => {
    if (!str) return null; const right = i % 2, bottom = i > 1, lines = up(str).split('\n'), x = right ? W - m : m, y = bottom ? H - m - (lines.length - 1) * 46 : m + 34, g = root.append('g');
    g.append('ellipse').attr('cx', x + (right ? -150 : 150)).attr('cy', y + (lines.length - 1) * 23 - 12).attr('rx', 330).attr('ry', 120).attr('fill', st.fill('pool')).attr('opacity', .7);
    g.append('rect').attr('x', right ? x + 10 : x - 16).attr('y', y - 30).attr('width', 6).attr('height', 34 + (lines.length - 1) * 46).attr('fill', i === 0 ? color : C.bone);
    txt(g, x, y, lines[0], {size: 40, font: F.head, weight: 400, anchor: right ? 'end' : 'start', spacing: .16, halo: 7, leading: 1.15}); if (lines[1]) txt(g, x, y + 46, lines.slice(1).join(' '), {size: 30, weight: 600, anchor: right ? 'end' : 'start', spacing: .28, halo: 6, color: C.bone, opacity: .85});
    return g;
  });
  return {seek(t) { items.forEach((g, i) => g?.attr('opacity', flickerOn(t, i * .22, .3, i) * (props.life ? 1 - flickerOn(t, props.life - .25 - i * .04, .2, i + 4) : 1))); }};
}
