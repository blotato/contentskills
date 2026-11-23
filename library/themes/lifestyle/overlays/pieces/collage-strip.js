import {stage, look, C, FRAME, up, txt, tag, photo, sheet, fade, glide, swell, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// A strip of three square-cornered pictures butted together with thin paper gutters, like a
// contact sheet laid along the top (or bottom) of the frame. The paper slides in from the side,
// each picture wipes open in turn and keeps pushing in slowly; a pill tag names the set.
// `y` is the top edge, `height` the strip height. `images` (URLs) replace the stand-in scenes.
export const meta = {duration: 5, live: true};
export const defaults = {y: 96, height: 360, margin: 44, gap: 12, label: 'This week', caption: 'Three small things', images: [], scenes: ['meadow', 'coast', 'dusk'], weights: [1, 1.35, 1], accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), W = FRAME.width, m = props.margin, gap = props.gap, y = props.y, h = props.height;
  const slide = root.append('g'), lifted = slide.append('g').attr('filter', st.lift); sheet(lifted, m, y, W - m * 2, h, {radius: 4});
  const total = props.weights.reduce((a, b) => a + b, 0), inner = W - m * 2 - gap * (props.weights.length + 1); let x = m + gap;
  const pics = props.weights.map((wt, i) => { const w = inner * wt / total, p = photo(slide, st, x, y + gap, w, h - gap * 2, {image: props.images?.[i], scene: props.scenes[i % props.scenes.length], seed: i + 1, from: i % 2 ? 'down' : 'up'}); x += w + gap; return p; });
  const chip = tag(root, m + gap + 18, y + h - gap - 44, props.label, {fill: C.paper, color: C.ink, size: 22, dot: ink.accent});
  const cap = txt(soften(root, st), W - m, y + h + 46, up(props.caption), {size: 22, role: 'label', color: C.cream, anchor: 'end'});
  return {
    seek(t) {
      const out = leave(t, props.life, .6), e = swell(span(t, 0, .9));
      slide.attr('transform', `translate(${(1 - e) * -W - out * W} 0)`);
      pics.forEach((p, i) => p.set(glide(span(t, .45 + i * .18, .9)), t));
      chip.g.attr('opacity', fade(t, 1.2, .5) * (1 - out)).attr('transform', `translate(${(1 - glide(span(t, 1.2, .7))) * -18} 0)`);
      cap.attr('opacity', fade(t, 1.35, .6) * (1 - out));
    },
  };
}
