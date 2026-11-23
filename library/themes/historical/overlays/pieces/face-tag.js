import {C, stage, plate, tone, span, settle, mix} from '../../kit.js';
import {live} from './_overlay.js';

// Marks the speaker like a figure picked out in an old group photograph: four photo-corner marks
// round the face and a caption stack (name and a line about them) hung above it on a thin leader.
// In a footage project it follows the face by itself (`locate`); otherwise give `track` or a fixed
// `box` (0..1 of the frame).
export const meta = {duration: 4, live: true, wantsFaces: true};
export const defaults = {label: 'THE WITNESS', detail: 'Speaking from memory', date: '', box: {x: .3, y: .36, w: .4, h: .26}, track: null, color: 'crimson'};

function boxAt(props, t) {
  const track = props.track; if (!track?.length) return props.box;
  let i = track.findIndex(s => s[0] > t); if (i < 0) i = track.length - 1;
  const a = track[Math.max(0, i - 1)], b = track[i], q = b[0] > a[0] ? Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))) : 0;
  return {x: mix(a[1], b[1], q), y: mix(a[2], b[2], q), w: mix(a[3], b[3], q), h: mix(a[4], b[4], q)};
}

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W, H} = st, shadow = root.append('path').attr('fill', 'none').attr('stroke', '#000').attr('stroke-width', 9).attr('opacity', .45), corners = root.append('path').attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 5);
  const leader = root.append('path').attr('stroke', C.crimson).attr('stroke-width', 4).attr('stroke-dasharray', '10 8'), tag = root.append('g'), p = plate(tag, {date: props.date, name: props.label, sub: props.detail, fill: tone(props.color), scale: .95});
  return {seek(t) {
    const x = live(st, t, props), at = t + (props.at ?? 0), b = props.locate ? props.locate(at) : boxAt(props, at), e = settle(span(t, 0, .8)), grow = 1.18 - .18 * e;
    const w = Math.min(b.w * W * 1.12, W * .8) * grow, h = Math.min(b.h * H * 1.1, w * 1.45), cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, x0 = cx - w / 2, y0 = cy - h / 2, c = 54;
    const d = `M${x0} ${y0 + c}V${y0}H${x0 + c}M${x0 + w - c} ${y0}H${x0 + w}V${y0 + c}M${x0 + w} ${y0 + h - c}V${y0 + h}H${x0 + w - c}M${x0 + c} ${y0 + h}H${x0}V${y0 + h - c}`;
    corners.attr('d', d).attr('opacity', span(t, 0, .4)); shadow.attr('d', d).attr('transform', 'translate(3 4)').attr('opacity', .45 * span(t, 0, .4));
    // The caption hangs above the face when there is room, otherwise below it.
    const above = y0 - p.h - 70 > 60, tx = Math.max(40, Math.min(W - p.w - 40, x0 - 10)), ty = above ? y0 - p.h - 60 : Math.min(H - p.h - 60, y0 + h + 60);
    leader.attr('d', `M${x0 + 2} ${above ? y0 - 4 : y0 + h + 4}V${above ? ty + p.h + 6 : ty - 6}`).attr('opacity', span(t, .5, .4));
    tag.attr('transform', `translate(${tx + 3 * t} ${ty + 24 * x})`); p.reveal(t, .45);
  }};
}
