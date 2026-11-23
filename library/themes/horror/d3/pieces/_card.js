// The diagram card every d3 piece in the horror theme starts from: a 1000x1000 stage on the dark
// backdrop (or see-through with a soft dark panel when `clear` is set), a small tracked unit line,
// the title in the theme's lettering, a hairline, and a foot note. Draw the diagram into `area`
// (x 80..920, y 230..890) and call head(t) from seek.
import {C, F, stage, up, span, flickerOn, txt, letters, hair, rough, draw, fit} from '../../kit.js';
export * from '../../kit.js';

export const BOX = {x0: 80, x1: 920, y0: 240, y1: 880, w: 840, h: 640};
export function card(el, props) {
  const st = stage(el, {mode: 'card', clear: props.clear, field: props.field}), {root, W, H} = st;
  if (props.clear) { root.append('rect').attr('x', 20).attr('y', 20).attr('width', W - 40).attr('height', H - 40).attr('fill', '#030405').attr('opacity', .74); root.append('rect').attr('x', 20).attr('y', 20).attr('width', W - 40).attr('height', H - 40).attr('fill', st.fill('grain')).attr('opacity', .4); hair(root, `M20 20H${W - 20}V${H - 20}H20Z`, C.bone, 1.5, .3); }
  const unit = txt(root, 80, 96, up(props.unit), {size: 27, color: C.fog, spacing: .3, weight: 600});
  const title = letters(root, up(props.title), 80, 168, Math.min(64, fit(up(props.title), 840, 64)), {anchor: 'start', seed: 4});
  const rule = hair(root, rough(80, 200, 920, 200, 2, 1, 70), C.bone, 2, .4), note = props.note === false ? null : txt(root, 920, 944, up(props.note ?? 'ILLUSTRATIVE'), {size: 20, color: C.fog, spacing: .32, anchor: 'end'});
  const area = root.append('g');
  return {st, root, area, head(t) { st.tick(t); unit.attr('opacity', flickerOn(t, .05, .3, 1) * .9); title.show(t, {at: .15, spread: .5}); draw(rule, span(t, .3, .6)); note?.attr('opacity', flickerOn(t, 1.2, .3, 2) * .7); }};
}
