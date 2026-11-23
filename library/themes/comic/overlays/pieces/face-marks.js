import {comicStage, C, FRAME, look, up, capH, measure, fit, inked, balloonPath, txt, zoomLinesPath, boil, spark, span, spring, leave, boxAt} from '../../kit.js';

// Surprise marks round the speaker's head: a ring of short ink dashes that shivers just outside
// the face, a spark at the temple and a shouted label in a balloon whose tail points at the
// head. In a footage project it follows the face (`locate`); otherwise give a `track` or `box`.
export const meta = {duration: 4, live: true, wantsFaces: true};
export const defaults = {label: 'PLOT TWIST!', box: {x: .3, y: .36, w: .5, h: .42}, track: null, accent: 'yellow'};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, H = FRAME.height, ink = look(props.accent), label = up(props.label);
  const ring = root.append('g'), marks = ring.append('path').attr('fill', C.ink);
  // Dashes drawn on a unit circle of radius 1000 and scaled to the head; only the upper arc, so nothing covers the face or neck.
  const sets = [0, 1, 2].map(k => zoomLinesPath(0, 0, 1000, 1210, {n: 15, seed: k * 5 + 3, thick: 2.2, from: Math.PI * 1.08, sweep: Math.PI * .84}));
  const size = fit(label, 560, 78), cap = capH(size), bw = measure(label, size) + 110, bh = cap + 84, tag = root.append('g'), body = inked(tag, '', {fill: ink.accent, width: 7, drop: 10});
  const word = txt(tag, 0, cap / 2, label, {size, role: 'head', color: ink.accent === C.red ? C.yellow : C.red, anchor: 'middle', outline: size * .09, drop: size * .055});
  const star = spark(root, 0, 0, 40, C.white);
  return {
    seek(t) {
      const x = leave(t, props.life), at = t + (props.at ?? 0), b = props.locate ? props.locate(at) : boxAt(props, at), cx = (b.x + b.w / 2) * W, cy = (b.y + b.h / 2) * H, rx = Math.min(b.w * W * .76, W * .5), ry = b.h * H * .72, q = span(t, 0, .35), s = spring(q) * (1 - x);
      marks.attr('d', sets[boil(t, 3, 9)]);
      ring.attr('transform', `translate(${cx} ${cy}) scale(${rx / 1000 * (1.5 - .5 * s)} ${ry / 1000 * (1.5 - .5 * s)})`).attr('opacity', q > 0 && x < 1 ? 1 : 0);
      // The balloon sits above the head, pushed inside the frame; its tail drops to the top of the head.
      const tx = Math.max(bw / 2 + 50, Math.min(W - bw / 2 - 50, cx - 60)), ty = Math.max(bh / 2 + 70, cy - ry - bh / 2 - 150);
      body.set(balloonPath(bw, bh, (cx - tx) * .5, Math.min(bh / 2 + 130, cy - ry * .9 - ty), 60));
      tag.attr('transform', `translate(${tx} ${ty}) rotate(${-3 + Math.sin(t * 2.2) * 1.2}) scale(${Math.max(.0001, spring(span(t, .2, .42)) * (1 - x))})`);
      star.attr('transform', `translate(${cx + rx * .86 - (cx + rx * .86 > W - 60 ? rx * 1.72 : 0)} ${cy - ry * .78}) rotate(${t * 60}) scale(${Math.max(.0001, spring(span(t, .45, .4)) * (1 - x) * (1 + .2 * Math.sin(t * 6)))})`);
    },
  };
}
