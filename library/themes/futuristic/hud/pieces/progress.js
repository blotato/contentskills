import {C, F, hudStage, chamfer, plate, line, text, draw, span, easeInOut, presence} from '../../hud.js';

// A segmented loading bar with a percentage — "processing", "uploading", "analysing".
// `y` is its top edge in frame pixels; `seconds` is how long the fill takes.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'ANALYSING FOOTAGE', to: 100, seconds: 2.6, y: 1300};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), w = 860, n = 34, g = root.append('g').attr('transform', `translate(110 ${props.y})`);
  plate(g, chamfer(-24, -24, w + 48, 170, 20), .68); const edge = line(g, chamfer(-24, -24, w + 48, 170, 20), C.cyan, 2);
  text(g, 0, 22, props.label, {size: 26, color: C.cyan, spacing: '.22em'});
  const percent = text(g, w, 26, '', {size: 44, font: F.display, weight: 800, color: C.white, anchor: 'end', spacing: '0'});
  const cells = Array.from({length: n}, (_, i) => g.append('rect').attr('x', i * (w / n)).attr('y', 56).attr('width', w / n - 6).attr('height', 44).attr('fill', C.cyan));
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(edge, span(t, 0, .4));
      const q = easeInOut(span(t, .3, props.seconds)) * props.to / 100;
      percent.text(Math.round(q * 100) + '%');
      cells.forEach((cell, i) => cell.attr('opacity', i / n < q ? 1 : .14).attr('fill', i / n > .88 && i / n < q ? C.amber : C.cyan));
    },
  };
}
