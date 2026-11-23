import {comicStage, C, FRAME, tone, burstPath, zoomLinesPath, halftonePath, boil, span, easeOut, easeIn} from '../../kit.js';

// An impact frame for a cut or a punchline: for a few frames the shot is covered by a flat colour
// with black zoom lines and dots, and the speaker shows only through a jagged burst-shaped hole;
// the hole then blows open until the cover is gone. The hole follows the face in a footage
// project. `hold` is how long the cover stays closed.
export const meta = {duration: 1.2, wantsFaces: true};
export const defaults = {color: 'yellow', box: {x: .3, y: .36, w: .5, h: .42}, hold: .28, track: null};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, H = FRAME.height, fill = tone(props.color), full = `M-200 -200H${W + 200}V${H + 200}H-200Z`;
  const holes = [0, 1, 2].map(k => burstPath(1000, {points: 18, depth: .78, seed: k * 9 + 2}));
  const flash = root.append('rect').attr('x', -200).attr('y', -200).attr('width', W + 400).attr('height', H + 400).attr('fill', C.white);
  const cover = root.append('g'), sheet = cover.append('path').attr('fill', fill).attr('fill-rule', 'evenodd'), tint = cover.append('path').attr('fill', fill === C.yellow ? C.orange : C.ink).attr('opacity', .5).attr('d', halftonePath(0, 0, W, H, {pitch: 40, from: [.5, .5], reach: -1, flat: .22}));
  const rayClip = cover.append('g'), rays = rayClip.append('path').attr('fill', C.ink), rim = cover.append('path').attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 12).attr('stroke-linejoin', 'round');
  const mask = stage.defs.append('clipPath').attr('id', stage.id + '-out').append('path').attr('clip-rule', 'evenodd'); tint.attr('clip-path', `url(#${stage.id}-out)`); rayClip.attr('clip-path', `url(#${stage.id}-out)`);
  const lineSets = [0, 1, 2].map(k => zoomLinesPath(0, 0, 900, 4200, {n: 64, seed: k * 7 + 1, thick: 1.4}));
  return {
    seek(t) {
      const at = t + (props.at ?? 0), b = props.locate ? props.locate(at) : props.box, cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, k = boil(t, 3, 12);
      const open = easeIn(span(t, props.hold, meta.duration - props.hold - .1)), r = (Math.max(b.w * W, b.h * H * .8) * .78) * (1.25 - .25 * easeOut(span(t, .04, .16))) * (1 + open * 5.5), m = `matrix(${r / 1000} 0 0 ${r / 1000 * 1.12} ${cx} ${cy})`;
      // The hole is the burst path transformed by hand into frame space so one path can hold both outlines.
      const hole = holes[k].replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, px, py) => `${(px * r / 1000 + cx).toFixed(1)} ${(py * r / 1000 * 1.12 + cy).toFixed(1)}`);
      flash.attr('opacity', t < .05 ? 1 : 0); cover.attr('opacity', t >= .04 && open < 1 ? 1 : 0);
      sheet.attr('d', full + hole); mask.attr('d', full + hole); rim.attr('d', hole);
      rays.attr('d', lineSets[k]).attr('transform', `translate(${cx} ${cy}) scale(${r / 1000})`);
    },
  };
}
