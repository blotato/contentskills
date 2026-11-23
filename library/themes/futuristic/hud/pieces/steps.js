import {C, F, hudStage, chamfer, plate, line, text, draw, span, presence, flicker, easeInOut, spring, scramble, pad} from '../../hud.js';

// A step indicator: "02 / 05" with the step's name, over a segmented track. The number rolls
// from the previous step, the track fills up to the current segment and that segment keeps
// pulsing. One overlay per step: set `step` and `label`. `y` is the top edge in frame pixels.
export const meta = {duration: 3.5, live: true};
export const defaults = {step: 2, total: 5, kicker: 'STEP', label: 'WRITE THE HOOK', y: 150};

export function mount(el, props = defaults) {
  const {root, defs, id} = hudStage(el, {overlay: true}), x = 70, w = 940, h = 250, {step, total} = props, g = root.append('g').attr('transform', `translate(${x} ${props.y})`);
  plate(g, chamfer(0, 0, w, h, 28), .7); const edge = line(g, chamfer(0, 0, w, h, 28), C.cyan, 3);
  defs.append('clipPath').attr('id', id + '-num').append('rect').attr('x', 20).attr('y', 30).attr('width', 220).attr('height', 124);
  const reel = g.append('g').attr('clip-path', `url(#${id}-num)`), digit = v => text(reel, 36, 0, pad(v), {size: 124, font: F.display, weight: 900, color: C.cyan, spacing: '0'}), prev = digit(Math.max(0, step - 1)), now = digit(step);
  const of = text(g, 246, 140, `/${pad(total)}`, {size: 48, font: F.display, weight: 700, color: C.dim, spacing: '0'}), divider = line(g, 'M400 40V150', C.dim, 2);
  const kicker = text(g, 430, 72, `${props.kicker} ${pad(step)} OF ${pad(total)}`, {size: 26, color: C.amber, spacing: '.22em'});
  const name = text(g, 430, 136, '', {size: Math.min(58, 470 / (props.label.length * .55)), font: F.text, weight: 700, color: C.white, spacing: '.03em'});
  const gap = 14, sw = (w - 68 - gap * (total - 1)) / total, segs = Array.from({length: total}, (_, i) => { const sx = 34 + i * (sw + gap);
    line(g, chamfer(sx, 186, sw, 30, 8), i < step ? C.cyan : C.dim, 2); return {i, sx, fill: g.append('path').attr('d', chamfer(sx, 186, sw, 30, 8)).attr('fill', i === step - 1 ? C.amber : C.cyan), clip: null}; });
  const grow = defs.append('clipPath').attr('id', id + '-grow').append('rect').attr('y', 180).attr('height', 44).attr('x', 34 + (step - 1) * (sw + gap)); segs[step - 1]?.fill.attr('clip-path', `url(#${id}-grow)`);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(edge, span(t, 0, .5)); draw(divider, span(t, .2, .3));
      const roll = spring(span(t, .35, .7)); prev.attr('y', 140 - roll * 130); now.attr('y', 270 - roll * 130);
      of.attr('opacity', flicker(t, .3)); kicker.attr('opacity', flicker(t, .35)); name.text(scramble(props.label, span(t, .5, .5), t));
      for (const s of segs) s.fill.attr('opacity', s.i < step - 1 ? flicker(t, .3 + s.i * .1) : s.i === step - 1 ? .7 + .3 * Math.sin(t * 5) : 0);
      grow.attr('width', sw * easeInOut(span(t, .6, .8)));
    },
  };
}
