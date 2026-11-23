import {C, F, hudStage, brackets, chamfer, plate, line, text, ticks, draw, span, easeOut, presence} from '../../hud.js';

// A big number that counts up, with a label — for the stat the speaker just said.
// `y` is the vertical centre in frame pixels (keep it clear of the face).
export const meta = {duration: 3, live: true};
export const defaults = {value: 88, suffix: '%', label: 'OF CREATORS', y: 380, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), cx = 540, y = props.y, color = C[props.color] ?? C.cyan;
  plate(root, chamfer(cx - 400, y - 150, 800, 320, 34), .55);     // keeps the number readable over bright footage
  const number = text(root, cx, y + 60, '', {size: 220, font: F.display, weight: 900, color, anchor: 'middle', spacing: '0'});
  const label = text(root, cx, y + 130, props.label, {size: 34, color: C.white, anchor: 'middle', spacing: '.3em'});
  const frame = line(root, brackets(cx - 400, y - 150, 800, 320, 50), color, 3), rule = ticks(root, cx - 300, y + 150, 600, 30, C.dim);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const q = easeOut(span(t, .1, 1.1));
      number.text((Number.isInteger(props.value) ? Math.round(props.value * q) : (props.value * q).toFixed(1)) + (props.suffix ?? ''));
      label.attr('opacity', span(t, .5, .2)); draw(frame, span(t, 0, .5)); draw(rule, span(t, .3, .5));
    },
  };
}
