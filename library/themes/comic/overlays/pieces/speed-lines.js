import {comicStage, C, FRAME, tone, zoomLinesPath, boil, span, easeOut, leave} from '../../kit.js';

// Zoom lines: ink wedges packed round the edges of the frame, all pointing at the speaker, redrawn
// a few times a second so they shiver. They rush in from outside and leave an oval round the
// face untouched. The focus follows the face in a footage project; `inner` is how far (in frame
// pixels) the tips stay from it.
export const meta = {duration: 3, live: true, wantsFaces: true};
export const defaults = {box: {x: .3, y: .36, w: .5, h: .42}, inner: 560, color: 'ink', density: 70, track: null};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, H = FRAME.height, g = root.append('g');
  // Drawn round the origin in a squashed space (an oval, taller than wide, like a face) and moved to the focus.
  const sets = [0, 1, 2].map(k => zoomLinesPath(0, 0, props.inner, 2600, {n: props.density, seed: k * 11 + 2, thick: 1.25}));
  const lines = g.append('path').attr('fill', tone(props.color));
  return {
    seek(t) {
      const x = leave(t, props.life), at = t + (props.at ?? 0), b = props.locate ? props.locate(at) : props.box, cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, q = span(t, 0, .3);
      lines.attr('d', sets[boil(t, 3, 10)]);
      g.attr('transform', `translate(${cx} ${cy}) scale(${.82 * (1.9 - .9 * easeOut(q) + x * 1.2)} ${1.22 * (1.9 - .9 * easeOut(q) + x * 1.2)})`).attr('opacity', q > 0 ? 1 : 0);
    },
  };
}
