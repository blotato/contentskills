import {C, F, stage, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, comma, timecode, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, ekg, brackets, clipBox, clipPath, linear, radial} from '../../kit.js';

// An evidence marker: a small numbered tag with a typed label, and an unsteady line from it to the
// thing it marks (`to`), ending in a ring. `x`, `y` place the tag's top-left corner.
export const meta = {duration: 4, live: true};
export const defaults = {number: '3', label: 'EVIDENCE', note: 'FOUND BY THE DOOR', x: 90, y: 1580, to: {x: 430, y: 1440}, color: 'rose'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, color = tone(props.color), g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`), nw = measure(up(props.note), 34, {font: F.type, spacing: .04}), w = Math.max(420, nw + 190);
  const to = props.to, line = to ? hair(root, rough(props.x + 60, props.y, to.x, to.y, 3, 4, 40), C.bone, 3, .9) : null, ring = to ? root.append('circle').attr('cx', to.x).attr('cy', to.y).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 5) : null;
  pool(g, st, w / 2, 70, w * .75, 170); const card = g.append('g').attr('mask', st.wear);
  card.append('path').attr('d', roughBox(0, 0, 120, 140, 3, 1.5)).attr('fill', C.bone); txt(card, 60, 108, String(props.number), {size: 120, font: F.head, weight: 400, spacing: 0, anchor: 'middle', color: C.ink});
  const label = txt(g, 150, 50, up(props.label), {size: 44, font: F.head, weight: 400, spacing: .22, color, halo: 7}), note = txt(g, 150, 104, '', {size: 34, font: F.type, weight: 400, spacing: .04, halo: 7});
  return {seek(t) {
    root.attr('opacity', props.life ? 1 - flickerOn(t, props.life - .22, .2, 4) : 1); card.attr('opacity', flickerOn(t, 0, .25, 1)); label.attr('opacity', flickerOn(t, .2, .25, 2)); note.text(typed(up(props.note), span(t, .45, .6)));
    if (line) { draw(line, easeInOut(span(t, .5, .5))); ring.attr('r', 26 + 8 * Math.sin(t * 5)).attr('opacity', flickerOn(t, 1, .25, 5)); }
  }};
}
