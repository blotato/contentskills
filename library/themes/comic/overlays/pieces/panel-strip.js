import {comicStage, C, FRAME, tone, panel, burst, txt, fit, capH, sparkPath, zoomLinesPath, up, span, spring, easeOut, leave, vel} from '../../kit.js';

// A strip of small comic panels along the top (or bottom) of the shot, as on a comic page: each
// whips in from the side with a skew, a flat colour with dots, zoom lines and one shouted word.
// `panels` are [{word, color}]; `y` is the strip's top edge and `height` its height.
export const meta = {duration: 4, live: true};
export const defaults = {panels: [{word: 'ONE!', color: 'red'}, {word: 'TWO!', color: 'blue'}, {word: 'GO!', color: 'yellow'}], y: 60, height: 330, gap: 22};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, n = props.panels.length, m = 40, pw = (W - m * 2 - props.gap * (n - 1)) / n, h = props.height;
  const cells = props.panels.map((p, i) => {
    const g = root.append('g'), x = m + i * (pw + props.gap), fill = tone(p.color), mover = g.append('g'), dark = fill === C.yellow || fill === C.white || fill === C.paper;
    mover.append('rect').attr('x', x - 11).attr('y', props.y - 11).attr('width', pw + 22).attr('height', h + 22).attr('fill', C.gutter).attr('stroke', C.ink).attr('stroke-width', 4);
    const pn = panel(mover, stage, x, props.y, pw, h, {fill, dots: dark ? C.orange : C.ink, seed: i + 2, pitch: 22, width: 7, wobble: 4, drop: 0});
    pn.inside.append('path').attr('d', zoomLinesPath(x + pw / 2, props.y + h / 2, pw * .3, pw * 1.4, {n: 26, seed: i + 5, thick: 2})).attr('fill', C.white).attr('opacity', .6);
    const word = up(p.word), inner = mover.append('g').attr('transform', `translate(${x + pw / 2} ${props.y + h / 2})`).append('g'), size = Math.min(fit(word, pw - 60, h * .62 / capH(1))), star = burst(inner, Math.min(pw, h) * .46, {fill: dark ? C.red : C.yellow, points: 11, seed: i + 7, width: 5, drop: 6});
    txt(inner, 0, capH(size) / 2, word, {size, role: 'head', color: C.white, anchor: 'middle', outline: size * .09, drop: size * .06});
    return {mover, inner, star, dir: i % 2 ? 1 : -1, at: i * .14};
  });
  return {
    seek(t) {
      const x = leave(t, props.life);
      cells.forEach((c, i) => {
        const q = span(t, c.at, .45), e = spring(q);
        c.mover.attr('transform', `translate(${c.dir * (1 - e) * W * 1.2 + c.dir * x * W * 1.3} 0) skewX(${c.dir * vel(q) * -18})`);
        c.star.boil(t + i); c.inner.attr('transform', `rotate(${-6 + Math.sin(t * 2 + i) * 2}) scale(${Math.max(.0001, spring(span(t, c.at + .3, .42)))})`);
      });
    },
  };
}
