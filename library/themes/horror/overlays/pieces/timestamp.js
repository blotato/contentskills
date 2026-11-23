import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// A date, time and place stamp typed out line by line at the lower left, the way a documentary
// sets a scene. `x`, `y` are the left edge and the baseline of the first line.
export const meta = {duration: 4.5, live: true};
export const defaults = {date: 'OCTOBER 31', time: '3:14 AM', place: 'SOMEWHERE OFF THE OLD ROAD', x: 80, y: 1500, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, x = props.x, y = props.y, lines = [[up(props.date), 64, C.bone], [up(props.time), 64, tone(props.color)], [up(props.place), 36, C.bone]].filter(l => l[0]);
  const shade = pool(root, st, x + 380, y + 60, 700, 240), bar = root.append('rect').attr('x', x - 30).attr('y', y - 56).attr('width', 6).attr('fill', tone(props.color));
  let yy = y; const rows = lines.map(([str, size, color], i) => { const node = txt(root, x, yy, '', {size, font: F.type, weight: 400, spacing: .08, color, halo: 8}); yy += (lines[i + 1]?.[1] ?? 0) * 1.35 + 8; return {str, node}; }), h = yy - y + 40;
  return {seek(t) {
    const v = presence(t, props.life, 3); shade.attr('opacity', span(t, 0, .3) * (props.life ? 1 - span(t, props.life - .3, .3) : 1)); bar.attr('height', h * easeOut(span(t, 0, .4))).attr('opacity', v);
    let at = .2; rows.forEach((r, i) => { const len = Math.min(.9, r.str.length * .05), q = span(t, at, len), active = t >= at && (t < at + len + .25 || i === rows.length - 1); r.node.text(typed(r.str, q) + (active && blink(t, 3) ? '▌' : '')).attr('opacity', v); at += len + .25; });
  }};
}
