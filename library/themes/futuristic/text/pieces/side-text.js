import {textStage, look, up, fit, measure, capH, glyphs, pose, strip, shade, clipLive, span, spring, easeOut, leave, vel} from '../kit.js';

// Overlay: vertical text running up one edge of the frame on a dark plate, with a thin filled
// strip of repeating readout text scrolling beside it. The plate shoots up the edge, the letters
// land one by one, and it all retracts before `life` ends. `side` is 'left' or 'right'.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'BEHIND THE SCENES', sub: 'PART 02 / UNCUT', side: 'left', accent: 'cyan', top: 300, bottom: 1560, edge: 36};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), room = props.bottom - props.top, left = props.side !== 'right', o = {role: 'mono'};
  const size = fit(up(props.text), room - 90, 96), cap = capH(size), bw = cap + 48, sw = 44, L = measure(up(props.text), size) + 88, pad = (room - L) / 2;
  // Local x runs along the edge (upward on the left, downward on the right); local y runs into the frame.
  const g = root.append('g').attr('transform', left ? `translate(${props.edge} ${props.bottom - pad}) rotate(-90)` : `translate(${W - props.edge} ${props.top + pad}) rotate(90)`);
  const slab = shade(g, .76, 20), edge = g.append('path').attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 4), letters = glyphs(g, up(props.text), 44, bw / 2 + cap / 2, size, {color: ink.head});
  const clip = clipLive(stage), thin = g.append('g').attr('transform', `translate(0 ${bw + 6})`).attr('clip-path', clip.url); clip.rect.attr('y', 0).attr('height', sw);
  thin.append('rect').attr('width', L).attr('height', sw).attr('fill', ink.accent);
  const ssize = sw * .5 / capH(1, o), run = strip(thin, stage, props.sub, sw / 2 + capH(ssize, o) / 2, ssize, {color: ink.on, role: 'mono', mirror: false});
  return {
    seek(t) {
      const x = leave(t, props.life), e = easeOut(span(t, 0, .45)) * (1 - x), e2 = easeOut(span(t, .25, .45)) * (1 - x);
      slab.set(0, 0, L * e, bw); edge.attr('d', e > .01 ? `M0 0H${L * e}` : ''); clip.rect.attr('width', L * e2); run.set(t * 90 + (1 - easeOut(span(t, .25, .8))) * 500);
      letters.forEach(u => { const p = span(t, .2 + u.i * .035, .45); pose(u, {x: (1 - easeOut(p)) * -160, y: (1 - spring(p)) * -u.cap * .6, sx: 1 + vel(p) * .4, o: span(t, .2 + u.i * .035, .08) * (u.cx < L * e ? 1 : 0)}); });
    },
  };
}
