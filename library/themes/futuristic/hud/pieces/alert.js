import {C, F, hudStage, chamfer, plate, line, text, span, presence, spring, typed, blink} from '../../hud.js';

// A warning banner that snaps open from a line, with hazard stripes crawling along its top and
// bottom, a flashing triangle and a message that types in. `y` is the top edge in frame pixels;
// `color` is 'red' or 'amber'.
export const meta = {duration: 3.5, live: true};
export const defaults = {label: 'WARNING', text: 'DO NOT SKIP THIS STEP', y: 170, color: 'red'};

export function mount(el, props = defaults) {
  const {root, defs, id} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.red, x = 60, w = 960, h = 220, mid = props.y + h / 2, g = root.append('g');
  const pattern = defs.append('pattern').attr('id', id + '-hazard').attr('width', 44).attr('height', 44).attr('patternUnits', 'userSpaceOnUse'); pattern.append('rect').attr('width', 22).attr('height', 44).attr('fill', color);
  plate(g, chamfer(x, props.y, w, h, 28), .74); const tint = g.append('path').attr('d', chamfer(x, props.y, w, h, 28)).attr('fill', color); line(g, chamfer(x, props.y, w, h, 28), color, 3);
  for (const sy of [props.y + 12, props.y + h - 32]) g.append('rect').attr('x', x + 30).attr('y', sy).attr('width', w - 60).attr('height', 20).attr('fill', `url(#${id}-hazard)`);
  const sign = g.append('g').attr('transform', `translate(${x + 110} ${mid})`); line(sign, 'M0 -48L52 42H-52Z', color, 5).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
  text(sign, 0, 28, '!', {size: 62, font: F.display, weight: 900, color: C.white, anchor: 'middle', spacing: '0'});
  const tag = text(g, x + 200, mid - 26, '', {size: 30, color, spacing: '.34em'}), size = Math.min(60, 720 / (props.text.length * .8));
  const message = text(g, x + 200, mid + 14 + size * .62, '', {size, font: F.display, weight: 800, color: C.white, spacing: '.02em'});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const open = Math.max(.02, spring(span(t, .05, .55))); g.attr('transform', `translate(0 ${mid}) scale(1 ${open}) translate(0 ${-mid})`);
      pattern.attr('patternTransform', `translate(${t * 70} 0) skewX(-35)`); tint.attr('opacity', .1 + .16 * Math.abs(Math.sin(t * 5)));
      sign.attr('opacity', span(t, .3, .1) * (blink(t, 2.5) ? 1 : .35)); tag.text(typed(props.label, span(t, .35, .3))); message.text(typed(props.text, span(t, .5, .6)));
    },
  };
}
