import {C, F, hudStage, chamfer, plate, line, text, draw, span, presence, typed} from '../../hud.js';

// A small callout label with a leader line pointing at something in the shot.
// `at` is where the label sits, `to` is the point it points at (frame pixels).
export const meta = {duration: 3, live: true};
export const defaults = {text: 'ZOOM 130%', at: {x: 640, y: 760}, to: {x: 520, y: 900}, color: 'amber'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.amber, w = props.text.length * 21 + 56, {at, to} = props;
  const leader = line(root, `M${to.x} ${to.y}L${at.x} ${at.y + 56}`, color, 2), pin = root.append('circle').attr('cx', to.x).attr('cy', to.y).attr('r', 7).attr('fill', color);
  const g = root.append('g').attr('transform', `translate(${at.x} ${at.y})`);
  plate(g, chamfer(0, 0, w, 56, 12), .7); const edge = line(g, chamfer(0, 0, w, 56, 12), color, 2);
  const label = text(g, 26, 38, '', {size: 30, color, font: F.mono});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      pin.attr('r', 7 + 5 * Math.abs(Math.sin(t * 3))); draw(leader, span(t, .05, .25)); draw(edge, span(t, .2, .3));
      g.attr('opacity', span(t, .2, .1)); label.text(typed(props.text, span(t, .3, .35)));
    },
  };
}
