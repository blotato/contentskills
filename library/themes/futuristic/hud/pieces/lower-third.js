import {C, F, hudStage, chamfer, plate, line, text, draw, span, presence, typed} from '../../hud.js';

// A name plate for introducing the speaker. `y` is its top edge in frame pixels.
export const meta = {duration: 3, live: true};
// name and role default to the user's settings (settings/user.json: me.name, me.role), shown in capitals.
export const defaults = {name: '{me.name}', role: '{me.role}', y: 1250};

export function mount(el, props = defaults) {
  props = {...props, name: String(props.name).toUpperCase(), role: String(props.role).toUpperCase()};
  const {root} = hudStage(el, {overlay: true}), w = Math.max(props.name.length * 40, props.role.length * 19) + 110, g = root.append('g').attr('transform', `translate(70 ${props.y})`);
  plate(g, chamfer(0, 0, w, 150, 24), .72); const edge = line(g, chamfer(0, 0, w, 150, 24), C.cyan, 3), bar = line(g, 'M26 28V122', C.magenta, 8);
  const name = text(g, 56, 74, '', {size: 52, font: F.display, weight: 800, color: C.white, spacing: '.02em'}), role = text(g, 56, 118, '', {size: 26, color: C.cyan, spacing: '.2em'});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      draw(edge, span(t, 0, .45)); draw(bar, span(t, .2, .25)); name.text(typed(props.name, span(t, .25, .45))); role.text(typed(props.role, span(t, .55, .45)));
    },
  };
}
