import {C, F, hudStage, chamfer, plate, line, ring, text, draw, span, presence, spring, typed, flicker, clamp} from '../../hud.js';

// A notification toast: it shoots in from the side and settles with a bounce, the icon pings,
// the message types in and a timer bar runs down along the bottom. `y` is the top edge in frame
// pixels; `side` is 'left' or 'right'; `hold` is how many seconds the timer bar takes.
export const meta = {duration: 3.6, live: true};
export const defaults = {title: 'NEW COMMENT', body: 'Sample notification text', icon: '+', y: 170, side: 'right', hold: 3, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, w = Math.min(900, Math.max(560, Math.max(props.title.length * 30, props.body.length * 17) + 200)), h = 160, right = props.side !== 'left', rest = right ? 1080 - 54 - w : 54;
  const g = root.append('g'); plate(g, chamfer(0, 0, w, h, 22), .76); const edge = line(g, chamfer(0, 0, w, h, 22), color, 3);
  const icon = g.append('g').attr('transform', 'translate(84 76)'); icon.append('path').attr('d', chamfer(-44, -44, 88, 88, 14)).attr('fill', color);
  text(icon, 0, 24, props.icon, {size: 66, font: F.display, weight: 900, color: C.bg, anchor: 'middle', spacing: '0'}); const ping = ring(icon, 0, 0, 44, color, 3);
  const title = text(g, 156, 66, '', {size: 38, font: F.display, weight: 800, color: C.white, spacing: '.02em'}), body = text(g, 156, 112, '', {size: 30, font: F.text, weight: 700, color, spacing: '.04em'});
  const stamp = text(g, w - 26, 40, 'NOW', {size: 22, color: C.dim, anchor: 'end', spacing: '.2em'}), timer = line(g, `M22 ${h - 12}H${w - 40}`, C.amber, 5), length = w - 62;
  const shine = g.append('rect').attr('y', 4).attr('width', 40).attr('height', h - 8).attr('fill', C.white);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const q = spring(span(t, 0, .6)); g.attr('transform', `translate(${rest + (right ? 1 : -1) * (1 - q) * (w + 80)} ${props.y})`); draw(edge, span(t, .1, .4));
      const u = ((t - .5) / 1.4) % 1; ping.attr('r', 44 + u * 34).attr('opacity', t > .5 ? 1 - u : 0);
      title.text(typed(props.title, span(t, .4, .35))); body.text(typed(props.body.toUpperCase(), span(t, .65, .5))); stamp.attr('opacity', flicker(t, .5));
      timer.attr('stroke-dasharray', length).attr('stroke-dashoffset', length * clamp((t - .6) / props.hold)).attr('opacity', span(t, .5, .1));
      const s = span(t, .55, .5); shine.attr('x', 10 + s * (w - 80)).attr('opacity', s > 0 && s < 1 ? .28 * Math.sin(s * Math.PI) : 0);
    },
  };
}
