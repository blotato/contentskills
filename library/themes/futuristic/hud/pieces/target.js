import {C, F, FRAME, hudStage, brackets, chamfer, plate, line, text, span, mix, presence, spring, typed, flicker, pad, blink} from '../../hud.js';

// Targeting brackets that fly in from the edges of the frame and snap onto `box` (0..1 of the
// frame) with an overshoot, then hold: breathing corners, a scan line inside, coordinates and a
// typed label. Point it at an object in the shot — for the face itself use hud/face-lock.
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .52, y: .58, w: .38, h: .17}, label: 'TARGET', detail: 'LOCK CONFIRMED', color: 'amber'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.amber, {width: W, height: H} = FRAME, b = props.box;
  const bx = b.x * W, by = b.y * H, bw = b.w * W, bh = b.h * H, cx = bx + bw / 2, cy = by + bh / 2;
  const guides = line(root, '', color, 2), corners = line(root, '', color, 5), inner = line(root, '', C.white, 2), scan = line(root, '', color, 2), nubs = line(root, '', color, 4);
  const coords = text(root, 0, 0, '', {size: 22, color: C.white}), above = by > 190, tw = Math.max(props.label.length * 30 + 60, props.detail.length * 16 + 60), ty = above ? by - 132 : by + bh + 34;
  const tag = root.append('g').attr('transform', `translate(${Math.min(bx, W - 50 - tw)} ${ty})`); plate(tag, chamfer(0, 0, tw, 98, 16), .7); line(tag, chamfer(0, 0, tw, 98, 16), color, 2);
  const lamp = tag.append('rect').attr('x', tw - 38).attr('y', 20).attr('width', 16).attr('height', 16).attr('fill', color);
  const name = text(tag, 22, 44, '', {size: 34, font: F.display, weight: 800, color}), detail = text(tag, 22, 80, '', {size: 22, color: C.white});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const q = spring(span(t, .05, .7)), breathe = t > .8 ? Math.sin(t * 3) * 5 : 0, x = mix(30, bx, q) - breathe, y = mix(30, by, q) - breathe, w = mix(W - 60, bw, q) + breathe * 2, h = mix(H - 60, bh, q) + breathe * 2;
      const locked = span(t, .7, .01), flash = t > .7 && t < 1.05 && blink(t, 9);
      corners.attr('d', brackets(x, y, w, h, Math.min(60, w / 4, h / 3))).attr('stroke', flash ? C.white : color);
      // Guide lines run edge to edge while it hunts, then pull back to short stubs at the box.
      const reach = 1 - span(t, .55, .35); guides.attr('d', `M${mix(x - 40, 0, reach)} ${cy}H${x - 12}M${x + w + 12} ${cy}H${mix(x + w + 40, W, reach)}M${cx} ${mix(y - 40, 0, reach)}V${y - 12}M${cx} ${y + h + 12}V${mix(y + h + 40, H, reach)}`).attr('opacity', .7);
      inner.attr('d', `M${cx - 16} ${cy}h32M${cx} ${cy - 16}v32`).attr('opacity', locked * .9);
      const sy = y + 12 + (.5 + .5 * Math.sin(t * 2.2)) * (h - 24); scan.attr('d', `M${x + 14} ${sy}H${x + w - 14}`).attr('opacity', locked * .55);
      const push = 6 * Math.abs(Math.sin(t * 4)); nubs.attr('d', `M${x - 26 + push} ${cy - 10}l10 10l-10 10M${x + w + 26 - push} ${cy - 10}l-10 10l10 10`).attr('opacity', locked);
      coords.attr('x', x + 4).attr('y', above ? y + h + 34 : y - 16).text(`X ${pad(x + w / 2, 4)}  Y ${pad(y + h / 2, 4)}  W ${pad(w, 4)}`).attr('opacity', flicker(t, .15));
      tag.attr('opacity', flicker(t, .72)); name.text(typed(props.label, span(t, .78, .3))); detail.text(typed(props.detail, span(t, 1, .4))); lamp.attr('opacity', blink(t, 2) ? 1 : .25);
    },
  };
}
