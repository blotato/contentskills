import {C, stage, tone, measure, txt, scribble, scrawl, hold, span, presence, leave} from '../../kit.js';

// A marker mark drawn straight onto the footage and left boiling: 'circle', 'underline', 'arrow',
// 'cross', 'burst', 'zigzag' or 'box' in the box (x, y, w, h), with an optional handwritten note.
// An arrow runs from (x, y) to (x + w, y + h).
export const meta = {duration: 3.5, live: true};
export const defaults = {kind: 'circle', x: 620, y: 240, w: 360, h: 200, color: 'lime', width: 11, note: 'this one', noteX: 300, noteY: 300, noteSize: 64, seed: 2};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, color = tone(props.color), {x, y, w, h} = props, cx = x + w / 2, cy = y + h / 2;
  const make = {
    circle: s => scribble.circle(cx, cy, w / 2, h / 2, s), underline: s => scribble.underline(x, x + w, cy, s, Math.max(5, h * .12)), arrow: s => scribble.arrow(x, y, x + w, y + h, s),
    cross: s => scribble.cross(cx, cy, Math.min(w, h) / 2, s), burst: s => scribble.burst(cx, cy, w / 2, s), zigzag: s => scribble.zigzag(x, x + w, cy, s, h / 2), box: s => scribble.box(x, y, w, h, s),
  }[props.kind] ?? (s => scribble.circle(cx, cy, w / 2, h / 2, s));
  const shadow = scrawl(root, make, {color: C.soot, width: props.width + 8, seed: props.seed, opacity: .55}), mark = scrawl(root, make, {color, width: props.width, seed: props.seed});
  const note = props.note ? txt(root, props.noteX, props.noteY, props.note, {size: props.noteSize, role: 'hand', color, anchor: 'middle', shade: true}) : null;
  return {seek(t) {
    const s = st.tick(t), hh = hold(t), q = span(hh, .05, .4), x = leave(t, props.life), o = presence(t, props.life) * (x > .5 ? 0 : 1);
    shadow.draw(q, s).g.attr('opacity', o * .55); mark.draw(q, s).g.attr('opacity', o);
    note?.attr('opacity', hh >= .45 ? o : 0).attr('transform', `rotate(${-4 + (s % 3 - 1) * .7} ${props.noteX} ${props.noteY})`);
  }};
}
