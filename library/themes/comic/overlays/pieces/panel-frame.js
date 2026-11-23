import {comicStage, C, FRAME, look, boxPath, halftonePath, clipShape, captionBox, badge, slabLabel, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// Turns the whole shot into a comic panel: a paper gutter round the frame with a wobbly ink box
// inside it, Ben-Day dots creeping in from two corners, the series title in a caption box top
// left, the issue number in a burst top right and a small plate bottom right. Leave it up for
// the whole clip. Everything stays at the edges, clear of the face.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'THE CREATOR FILES', issue: '1', tag: 'TO BE CONTINUED', accent: 'yellow', gutter: 26, dots: true};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, H = FRAME.height, ink = look(props.accent), m = props.gutter;
  const inner = boxPath(m, m, W - m * 2, H - m * 2, 6, 4), frame = root.append('g');
  if (props.dots) {
    const clip = clipShape(stage, inner);
    const tone = frame.append('g').attr('clip-path', clip.url);
    tone.append('path').attr('d', halftonePath(0, H - 520, W, 520, {pitch: 30, from: [1, 1], reach: .42})).attr('fill', ink.accent).attr('opacity', .85);
    tone.append('path').attr('d', halftonePath(0, 0, W, 520, {pitch: 30, from: [0, 0], reach: .42})).attr('fill', ink.accent === C.red ? C.yellow : C.red).attr('opacity', .8);
  }
  frame.append('path').attr('d', `M-40 -40H${W + 40}V${H + 40}H-40Z` + inner).attr('fill', C.gutter).attr('fill-rule', 'evenodd');
  frame.append('path').attr('d', inner).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 9).attr('stroke-linejoin', 'round');
  const title = captionBox(root, m + 22, m + 22, props.title, {size: 40, fill: ink.accent, tilt: -1.5}), issue = props.issue ? badge(root, W - m - 86, m + 92, 84, props.issue, {fill: ink.accent === C.red ? C.blue : C.red, seed: 3}) : null;
  const tag = props.tag ? slabLabel(root, W - m - 20, H - m - 96, props.tag, {size: 38, anchor: 'end', fill: C.white, tilt: -2, padY: 14}) : null;
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .45), s = 1 + (1 - easeOut(q)) * .16 + x * .2;
      frame.attr('transform', `translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2} ${-H / 2})`).attr('opacity', 1 - x);
      scaleTo(title.g, spring(span(t, .3, .42)) * (1 - x)); if (tag) scaleTo(tag.g, spring(span(t, .55, .42)) * (1 - x));
      if (issue) { issue.boil(t); scaleTo(issue.g, spring(span(t, .45, .42)) * (1 - x), 10 + Math.sin(t * 2) * 4); }
    },
  };
}
