import {comicStage, C, up, wrap, capH, measure, glyphs, letterOn, inked, balloonPath, span, spring, leave} from '../../kit.js';

// A speech balloon that pops open and letters its words on as they are spoken. (x, y) is the
// balloon's centre; `tail` is the point (frame pixels) its tail reaches toward, normally just
// above the speaker's head. `times` (seconds per word) syncs the lettering to the voice.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'Nobody tells you this part!', x: 540, y: 300, width: 760, size: 62, tail: {x: 600, y: 600}, fill: 'white', times: null, shout: false};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, role = props.shout ? 'head' : 'hand', o = {role}, size = props.size, pad = 46;
  const lines = wrap(up(props.text), size, props.width - pad * 2, o), cap = capH(size, o), pitch = size * 1.18, w = Math.max(...lines.map(l => measure(l, size, o)), 120) + pad * 2.4, h = cap + (lines.length - 1) * pitch + pad * 2;
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g'), tx = props.tail.x - props.x, ty = props.tail.y - props.y, reach = Math.min(1, (h / 2 + 150) / Math.abs(ty || 1));
  inked(g, balloonPath(w, h, tx * reach, ty * reach, 64), {fill: C[props.fill] ?? props.fill, width: 7, drop: 10});
  const units = lines.flatMap((line, i) => glyphs(g, line, 0, -h / 2 + pad + cap + i * pitch, size, {by: 'word', anchor: 'middle', role, flat: true, color: C.ink}));
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .42);
      g.attr('transform', `rotate(${-1.5 + Math.sin(t * 1.8) * .8}) scale(${Math.max(.0001, spring(q) * (1 - x))})`).attr('opacity', q > 0 && x < 1 ? 1 : 0);
      units.forEach((u, i) => letterOn(u, span(t, props.times?.[i] ?? .22 + i * .14, .22)));
    },
  };
}
