import {C, FRAME, stage, tone, up, mix, chip, scribble, hold, span, jtf, pop, presence, leave} from '../../kit.js';

// The speaker circled in marker, with an arrow and a label scrap pointing at them. Follows the
// face: give it `track`, or a fixed `box` (0..1 of the frame); in a footage project the player
// supplies the position itself (`locate`). The ring is redrawn round the face every boil step.
export const meta = {duration: 4, live: true, wantsFaces: true};
export const defaults = {label: 'THIS GUY', box: {x: .3, y: .3, w: .4, h: .24}, track: null, color: 'lime', arrow: true, side: 'left'};

function boxAt(props, t) {
  const track = props.track;
  if (!track?.length) return props.box;
  let i = track.findIndex(s => s[0] > t); if (i < 0) i = track.length - 1;
  const a = track[Math.max(0, i - 1)], b = track[i], q = b[0] > a[0] ? Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))) : 0;
  return {x: mix(a[1], b[1], q), y: mix(a[2], b[2], q), w: mix(a[3], b[3], q), h: mix(a[4], b[4], q)};
}

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, color = tone(props.color), W = FRAME.width, H = FRAME.height;
  const pen = c => root.append('path').attr('fill', 'none').attr('stroke', c).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
  const ringShade = pen(C.soot).attr('stroke-width', 20).attr('opacity', .5), ring = pen(color).attr('stroke-width', 12), arrowShade = pen(C.soot).attr('stroke-width', 18).attr('opacity', .5), arrow = pen(color).attr('stroke-width', 10);
  const tag = root.append('g'); const c = chip(tag.append('g'), up(props.label), {size: 54, fill: C.bone, seedv: 3, tape: true});
  let len = 0, lastD = '';
  return {seek(t) {
    const s = st.tick(t), h = hold(t), ft = Math.floor((t + (props.at ?? 0)) * 8) / 8, b = props.locate ? props.locate(ft) : boxAt(props, ft), x = leave(t, props.life), o = presence(t, props.life) * (x > .5 ? 0 : 1);
    const cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, rx = b.w * W * .68, ry = b.h * H * .66, d = scribble.circle(cx, cy, rx, ry, 3 + (s % 3) * 5.3);
    ring.attr('d', d); ringShade.attr('d', d); if (d !== lastD) { len = ring.node().getTotalLength(); lastD = d; }
    const q = span(h, .05, .4), dash = q >= 1 ? null : `${len * q} ${len}`; ring.attr('stroke-dasharray', dash).attr('opacity', q > 0 ? o : 0); ringShade.attr('stroke-dasharray', dash).attr('opacity', q > 0 ? o * .5 : 0);
    const left = props.side !== 'right', tx = left ? Math.max(c.bw / 2 + 40, cx - rx - 60) : Math.min(W - c.bw / 2 - 40, cx + rx + 60), ty = Math.max(150, cy - ry - 150);
    const ad = scribble.arrow(tx + (left ? 40 : -40), ty + c.bh / 2 + 16, cx + (left ? -rx * .8 : rx * .8), cy - ry * .86, 2 + (s % 3) * 3.1, left ? -.18 : .18), on = props.arrow && h >= .5;
    arrow.attr('d', ad).attr('opacity', on ? o : 0); arrowShade.attr('d', ad).attr('opacity', on ? o * .5 : 0);
    tag.attr('transform', jtf(tx, ty, s, 5, {tilt: left ? -5 : 5, scale: pop(t, .35)})).attr('opacity', o);
  }};
}
