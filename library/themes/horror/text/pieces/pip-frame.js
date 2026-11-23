import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// Frames an inset picture (an exhibit, a photo, a screen recording): an unsteady thin border with
// corner ticks, a typewritten label tab above and a caption below. `box` is in fractions of the
// frame; `fill` 0..1 darkens the inside when there is nothing behind it.
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .52, y: .075, w: .42, h: .2}, label: 'EXHIBIT A', caption: 'FOUND ON THE CAMERA', fill: 0, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, b = props.box, x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H, color = tone(props.color), g = root.append('g');
  g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', '#000').attr('opacity', props.fill);
  g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', st.fill('grain')).attr('opacity', .35);
  const edge = hair(g, roughBox(x, y, w, h, 4, 1.6), C.bone, 3, .85), ticks = hair(g, brackets(x - 14, y - 14, w + 28, h + 28, 34), color, 4, .95);
  const tw = measure(up(props.label), 30, {font: F.type, spacing: .12}) + 30, tab = g.append('g'); tab.append('rect').attr('x', x).attr('y', y - 62).attr('width', tw).attr('height', 44).attr('fill', '#000').attr('opacity', .75);
  const label = txt(tab, x + 16, y - 30, '', {size: 30, font: F.type, weight: 400, spacing: .12, color: C.bone}), caption = txt(g, x + w, y + h + 50, up(props.caption), {size: 28, weight: 600, anchor: 'end', spacing: .28, halo: 7});
  return {seek(t) {
    root.attr('opacity', props.life ? 1 - flickerOn(t, props.life - .22, .2, 3) : 1); const [jx, jy] = jitter(t, .8, 3); edge.attr('transform', `translate(${jx} ${jy})`); draw(edge, easeInOut(span(t, 0, .6)));
    ticks.attr('opacity', flickerOn(t, .4, .3, 1) * .95); tab.attr('opacity', flickerOn(t, .5, .25, 2)); label.text(typed(up(props.label), span(t, .6, .5))); caption.attr('opacity', flickerOn(t, 1.1, .3, 5) * .9);
  }};
}
