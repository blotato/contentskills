import {C, stage, look, up, txt, sheet, xerox, tapeStrip, chip, hold, slam, jit, jtf, pop, presence, leave} from '../../kit.js';

// A photocopied picture taped onto the footage like evidence on a wall: a print on a paper
// backing at an angle, two bits of tape, a caption scrap and a typed line. Pass `image` for a real picture.
export const meta = {duration: 4, live: true};
export const defaults = {x: 300, y: 380, w: 440, h: 360, tilt: -6, caption: 'EXHIBIT A', note: 'FOUND IN THE DRAFTS', image: null, accent: 'red', seed: 2};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine} = st, ink = look(props.accent), {w, h} = props, g = root.append('g'), inner = g.append('g');
  sheet(inner, {fill: C.bone, seed: props.seed, sides: 'b', amp: 8}).set(-w / 2 - 20, -h / 2 - 20, w + 40, h + 90);
  xerox(inner, st, w, h, {seed: props.seed, image: props.image});
  txt(inner, 0, h / 2 + 46, up(props.note), {size: 26, color: C.soot, anchor: 'middle'});
  tapeStrip(inner, 160, 46, {seed: 1}).attr('transform', `translate(${-w / 2 + 10} ${-h / 2 - 18}) rotate(-34)`); tapeStrip(inner, 160, 46, {seed: 4}).attr('transform', `translate(${w / 2 - 6} ${-h / 2 - 14}) rotate(30)`);
  const tag = fine.append('g'); if (props.caption) chip(tag.append('g'), up(props.caption), {size: 38, fill: ink.accent, seedv: 5});
  return {seek(t) {
    const s = st.tick(t), k = slam(t, .05, {from: 1.7}), x = leave(t, props.life), j = jit(s, 2, 1.5 + k.hit * 8, .3 + k.hit * 2), o = presence(t, props.life) * (x > .5 ? 0 : 1);
    g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${props.tilt + j.r}) scale(${k.s})`).attr('opacity', k.o * o);
    tag.attr('transform', jtf(props.x + w / 2 - 60, props.y + h / 2 - 30, s, 7, {tilt: props.tilt + 9, scale: pop(t, .4)})).attr('opacity', o);
  }};
}
