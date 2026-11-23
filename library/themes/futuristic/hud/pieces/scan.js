import {C, FRAME, hudStage, line, span, easeInOut} from '../../hud.js';

// A scan line that sweeps down the frame once, trailing a soft band of light.
// Use it on a cut or when something "gets analysed".
export const meta = {duration: 1.4};
export const defaults = {color: 'cyan'};

export function mount(el, props = defaults) {
  const {root, defs, id} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, {width: W, height: H} = FRAME;
  const grad = defs.append('linearGradient').attr('id', id + '-trail').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
  grad.append('stop').attr('offset', 0).attr('stop-color', color).attr('stop-opacity', 0); grad.append('stop').attr('offset', 1).attr('stop-color', color).attr('stop-opacity', .35);
  const trail = root.append('rect').attr('width', W).attr('height', 260).attr('fill', `url(#${id}-trail)`), beam = line(root, `M0 0H${W}`, color, 5);
  const marks = line(root, Array.from({length: 12}, (_, i) => `M${40 + i * 90} -18v36`).join(''), C.white, 2);
  return {
    seek(t) {
      const y = -280 + easeInOut(span(t, 0, 1.2)) * (H + 560), on = t > 0 && t < 1.3 ? 1 : 0;
      trail.attr('y', y - 260).attr('opacity', on); beam.attr('transform', `translate(0 ${y})`).attr('opacity', on); marks.attr('transform', `translate(0 ${y})`).attr('opacity', on * .7);
    },
  };
}
