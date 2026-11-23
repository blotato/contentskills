import {C, F, hudStage, chamfer, plate, line, text, ticks, draw, span, presence, typed} from '../../hud.js';

// A title plate: small kicker line over a large heading, inside a notched frame.
// `y` is the top of the plate in frame pixels.
export const meta = {duration: 3, live: true};
export const defaults = {kicker: 'SYSTEM BRIEFING', title: 'FIVE WAYS TO EARN', y: 150};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), x = 90, w = 900, h = 210, g = root.append('g').attr('transform', `translate(${x} ${props.y})`);
  plate(g, chamfer(0, 0, w, h, 30), .7); const edge = line(g, chamfer(0, 0, w, h, 30), C.cyan, 3);
  const accent = line(g, `M0 ${h + 14}H260`, C.magenta, 6), rule = ticks(g, w - 330, h + 6, 300, 20, C.dim);
  const kicker = text(g, 40, 62, '', {size: 26, color: C.amber, spacing: '.25em'});
  // Long headings shrink to stay on one line inside the plate.
  const size = Math.min(72, (w - 80) / (props.title.length * .78));
  const title = text(g, 40, 150, '', {size, font: F.display, weight: 800, color: C.white, spacing: '.02em'});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      draw(edge, span(t, 0, .5)); draw(accent, span(t, .3, .3)); draw(rule, span(t, .4, .4));
      kicker.text(typed(props.kicker, span(t, .15, .4))); title.text(typed(props.title, span(t, .35, .55)));
    },
  };
}
