import {C, F, FRAME, hudStage, brackets, line, text, ticks, draw, span, presence, typed, timecode} from '../../hud.js';

// Full-frame camera HUD: corner brackets, a title readout, REC timecode and side rulers.
// The base layer for footage — it says "this is being analysed" without covering the speaker.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'NEURAL TRACK', sub: 'CREATOR FEED / LIVE', readouts: ['ISO 640', 'FOCUS 12.40 M', 'F/2.8']};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), {width: W, height: H} = FRAME, m = 54;
  const frame = line(root, brackets(m, m, W - m * 2, H - m * 2, 90), C.cyan, 4);
  const title = text(root, m + 30, m + 70, '', {size: 40, font: F.display, weight: 700, color: C.cyan});
  const sub = text(root, m + 30, m + 110, '', {size: 22, color: C.dim});
  const rule = line(root, `M${m + 30} ${m + 128}H${m + 430}`, C.dim, 2);
  const dot = root.append('circle').attr('cx', W - m - 250).attr('cy', m + 58).attr('r', 9).attr('fill', C.red);
  text(root, W - m - 228, m + 67, 'REC', {size: 26, color: C.white});
  const clock = text(root, W - m - 30, m + 67, '', {size: 26, color: C.white, anchor: 'end'});
  const left = ticks(root, m + 4, H / 2 - 260, 520, 40, C.cyan, true), right = ticks(root.append('g').attr('transform', `translate(${W} 0) scale(-1 1)`), m + 4, H / 2 - 260, 520, 40, C.cyan, true);
  const feet = props.readouts.map((r, i) => text(root, m + 30 + i * 250, H - m - 34, r, {size: 22, color: C.dim}));
  const marker = line(root, 'M0 0l14 9l-14 9z', C.amber, 3).attr('fill', C.amber);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      draw(frame, span(t, 0, .5)); draw(rule, span(t, .3, .4)); draw(left, span(t, .4, .5)); draw(right, span(t, .4, .5));
      title.text(typed(props.label, span(t, .2, .5))); sub.text(typed(props.sub, span(t, .5, .6)));
      dot.attr('opacity', Math.floor(t * 2) % 2 ? .2 : 1); clock.text(timecode(t));
      feet.forEach((f, i) => f.attr('opacity', span(t, .7 + i * .12, .15)));
      marker.attr('transform', `translate(${m + 28} ${H / 2 - 9 + Math.sin(t * 1.3) * 180})`).attr('opacity', span(t, .8, .2));
    },
  };
}
