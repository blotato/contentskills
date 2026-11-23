import {comicStage, C, FRAME, tone, halftonePath, span, easeOut, leave} from '../../kit.js';

// A wash of Ben-Day dots creeping in from the top and bottom of the frame (or whichever `sides`
// you name: top, bottom, left, right), biggest at the edge and shrinking to nothing before they
// reach the middle. Use it to tint a beat: red for danger, blue for calm, yellow for a win.
export const meta = {duration: 3, live: true};
export const defaults = {color: 'red', sides: ['top', 'bottom'], depth: 400, pitch: 34, opacity: .9};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, H = FRAME.height, d = props.depth, fill = tone(props.color);
  const boxes = {top: [0, 0, W, d, [.5, 0], 'y'], bottom: [0, H - d, W, d, [.5, 1], 'y'], left: [0, 0, d, H, [0, .5], 'x'], right: [W - d, 0, d, H, [1, .5], 'x']};
  // Three sizes of the same screen stand in for the dots growing, so nothing is rebuilt per frame.
  const bands = props.sides.filter(s => boxes[s]).map(side => { const [x, y, w, h, from, axis] = boxes[side]; return [.45, .72, 1].map(k => root.append('path').attr('fill', fill).attr('d', halftonePath(x, y, w, h, {pitch: props.pitch, from, axis, reach: k, max: .5}))); });
  return {
    seek(t) {
      const x = leave(t, props.life), q = easeOut(span(t, 0, .5)) * (1 - x), live = .5 + .5 * Math.sin(t * 2.4);
      bands.forEach(steps => steps.forEach((node, i) => { const lo = i / 3, hi = (i + 1) / 3; node.attr('opacity', q > lo && (q <= hi || i === 2) ? props.opacity * (i === 2 ? .9 + .1 * live : 1) : 0); }));
    },
  };
}
