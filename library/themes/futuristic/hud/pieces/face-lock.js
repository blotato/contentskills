import {C, F, FRAME, hudStage, brackets, line, ring, text, plate, chamfer, draw, span, mix, presence, typed} from '../../hud.js';

// A targeting reticle locked onto the speaker's face, with a callout. Give it `track`
// to follow the face, or a fixed `box` (0..1 of the frame). In a footage project the player
// supplies the face position itself (`locate`), already adjusted for any zoom.
export const meta = {duration: 4, live: true, wantsFaces: true};
export const defaults = {label: 'SUBJECT LOCK', detail: 'ID 0417 · CONF 98.2%', box: {x: .3, y: .2, w: .4, h: .24}, track: null};

/** The face box at time t: nearest two samples of [[t, x, y, w, h], ...] blended. */
function boxAt(props, t) {
  const track = props.track;
  if (!track?.length) return props.box;
  let i = track.findIndex(s => s[0] > t); if (i < 0) i = track.length - 1;
  const a = track[Math.max(0, i - 1)], b = track[i], q = b[0] > a[0] ? Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))) : 0;
  return {x: mix(a[1], b[1], q), y: mix(a[2], b[2], q), w: mix(a[3], b[3], q), h: mix(a[4], b[4], q)};
}

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), g = root.append('g');
  const corners = line(g, '', C.cyan, 4), outer = ring(g, 0, 0, 10, C.cyan, 3, '70 26'), inner = ring(g, 0, 0, 10, C.magenta, 2, '8 12');
  const cross = line(g, '', C.cyan, 2), leader = line(root, '', C.cyan, 2);
  const tag = root.append('g'), back = plate(tag, chamfer(0, 0, 400, 96, 16)), edge = line(tag, chamfer(0, 0, 400, 96, 16), C.cyan, 2);
  const name = text(tag, 22, 42, '', {size: 30, font: F.display, weight: 700, color: C.cyan}), detail = text(tag, 22, 76, '', {size: 20, color: C.white});
  return {
    seek(t) {
      // `at` is the video time this overlay started, so the reticle follows the face in footage time.
      const b = props.locate ? props.locate(t + (props.at ?? 0)) : boxAt(props, t + (props.at ?? 0)), W = FRAME.width, H = FRAME.height, lockIn = span(t, 0, .45), grow = mix(1.5, 1, lockIn);
      // Sized from the face width, and capped so a close-up face does not fill the frame with rings.
      const w = Math.min(b.w * W * 1.1, W * .62) * grow, h = Math.min(b.h * H * 1.02, w * 1.3), cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, r = w * .62;
      root.attr('opacity', presence(t, props.life));
      corners.attr('d', brackets(cx - w / 2, cy - h / 2, w, h, 46));
      outer.attr('cx', cx).attr('cy', cy).attr('r', r).attr('transform', `rotate(${t * 40} ${cx} ${cy})`);
      inner.attr('cx', cx).attr('cy', cy).attr('r', r + 22).attr('transform', `rotate(${-t * 25} ${cx} ${cy})`).attr('opacity', lockIn);
      cross.attr('d', `M${cx - r - 40} ${cy}h28M${cx + r + 12} ${cy}h28M${cx} ${cy - r - 40}v28`);
      // The callout sits beside the face on whichever side has more room.
      const right = cx < W / 2, tx = right ? Math.min(W - 440, cx + r + 30) : Math.max(40, cx - r - 430), ty = Math.max(60, cy - r - 120);
      leader.attr('d', `M${cx + (right ? 1 : -1) * r * .72} ${cy - r * .72}L${right ? tx : tx + 400} ${ty + 96}`).attr('opacity', span(t, .4, .2));
      tag.attr('transform', `translate(${tx} ${ty})`).attr('opacity', span(t, .45, .15));
      draw(edge, span(t, .45, .4)); name.text(typed(props.label, span(t, .5, .4))); detail.text(typed(props.detail, span(t, .8, .5)));
    },
  };
}
