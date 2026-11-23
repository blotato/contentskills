import {C, stage, span, ease, io, hash, light, grainURL, leave} from '../../kit.js';

// The theme's analog finish for a whole clip: footage sinks into near-black teal at the edges
// (vignette and a teal haze from the top and bottom), a faint grain steps 12 times a second, and two
// hairlines of light draw across the top and bottom of the safe zone. `strength` 0..1.
export const meta = {duration: 6, live: true};
export const defaults = {strength: .7, lines: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, defs, id, W, H} = st, k = props.strength ?? .7;
  const g = defs.append('radialGradient').attr('id', id + '-v').attr('r', '75%'); [[0, 0], [.55, .12], [.85, .6], [1, .9]].forEach(([o, a]) => g.append('stop').attr('offset', o).attr('stop-color', '#040506').attr('stop-opacity', a));
  const lg = defs.append('linearGradient').attr('id', id + '-h').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1); [[0, .75], [.16, 0], [.8, 0], [1, .8]].forEach(([o, a]) => lg.append('stop').attr('offset', o).attr('stop-color', '#0b1c1d').attr('stop-opacity', a));
  const vig = root.shade.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id}-v)`), tint = root.shade.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id}-h)`);
  defs.append('pattern').attr('id', id + '-g').attr('width', 256).attr('height', 256).attr('patternUnits', 'userSpaceOnUse').append('image').attr('href', grainURL()).attr('width', 256).attr('height', 256);
  const grain = root.text.append('rect').attr('x', -256).attr('y', -256).attr('width', W + 512).attr('height', H + 512).attr('fill', `url(#${id}-g)`);
  const lines = props.lines ? [250, 1440].map((y, i) => light(root, i ? [[W, y], [0, y]] : [[0, y], [W, y]], {width: 1.2, echo: true})) : [];
  return {seek(t) {
    const x = leave(t, props.life, .8), a = ease(span(t, 0, .8)) * (1 - x), s = Math.floor(t * 12);
    vig.attr('opacity', k * a); tint.attr('opacity', k * a); grain.attr('opacity', .6 * a).attr('transform', `translate(${Math.round(hash(s, 1) * 256)} ${Math.round(hash(s, 2) * 256)})`);
    lines.forEach((l, i) => l.range(ease(x), io(span(t, .3 + i * .3, 2.2))).opacity(.55));
  }};
}
