import {stage, look, C, txt, tape, photo, sheet, hand, fade, glide, span, leave} from '../../kit.js';

// Two or three paper-bordered prints dropped loosely on top of each other in a corner, each held
// by a strip of tape. They float down one after another, turn a few degrees as they settle and
// keep swaying very slightly; the top print carries a handwritten caption on its border.
// (`x`, `y`) is the centre of the pile; `size` the width of a print.
export const meta = {duration: 5, live: true};
export const defaults = {x: 270, y: 330, size: 330, count: 3, caption: 'last summer', images: [], scenes: ['coast', 'grove', 'meadow'], accent: 'sun'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), w = props.size, h = w * 1.2, b = w * .055, n = Math.max(1, Math.min(3, props.count));
  const lay = [[-46, 34, -8], [50, -26, 6], [0, 8, -2.5]].slice(3 - n);
  const prints = lay.map(([dx, dy, rot], i) => {
    const outer = root.append('g').attr('filter', st.lift).append('g'), g = outer.append('g'), body = g.append('g');
    sheet(body, -w / 2, -h / 2, w, h, {radius: 3, fill: C.cream});
    const pic = photo(g, st, -w / 2 + b, -h / 2 + b, w - b * 2, h - b * 2 - w * .17, {image: props.images?.[i], scene: props.scenes[i % props.scenes.length], seed: i + 4, from: 'fade'});
    tape(g, (i % 2 ? 1 : -1) * w * .12, -h / 2, w * .34, w * .1, i % 2 ? 5 : -6, i === lay.length - 1 ? ink.accent : C.sage);
    return {outer, g, pic, dx, dy, rot, i};
  });
  const top = prints.at(-1), note = hand(top.g, st, 0, h / 2 - w * .055, props.caption, {size: w * .15, color: C.ink, anchor: 'middle', rot: 0});
  return {
    seek(t) {
      const out = leave(t, props.life, .5);
      prints.forEach(p => { const s = .1 + p.i * .28, q = span(t, s, 1.0), e = glide(q), sway = Math.sin(t * .6 + p.i * 2) * .5;
        p.outer.attr('transform', `translate(${props.x + p.dx} ${props.y + p.dy - (1 - e) * 90 + out * 60})`).attr('opacity', fade(t, s, .45) * (1 - out));
        p.g.attr('transform', `rotate(${p.rot * (.2 + .8 * e) + (1 - e) * (p.i % 2 ? 9 : -9) + sway})`); p.pic.set(1, t); });
      note.set(glide(span(t, 1.2, 1.0)));
    },
  };
}
