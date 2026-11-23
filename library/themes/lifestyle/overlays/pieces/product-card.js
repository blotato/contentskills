import {stage, look, C, up, fit, capH, txt, sheet, photo, tag, starPath, fade, glide, swell, span, leave} from '../../kit.js';

// A small product card: a paper sheet with a picture on the left, and beside it a caps category,
// the product name in heavy type, a row of stars and a price pill. Sample values only.
// (`x`, `y`) is the top-left; `image` replaces the stand-in picture.
export const meta = {duration: 5, live: true};
export const defaults = {category: 'Everyday carry', name: 'Canvas day bag', price: '$48', stars: 4, note: 'sample listing', image: '', scene: 'grove', x: 70, y: 120, w: 940, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y, w} = props, h = 300, b = 16, pw = 250, tx = x + pw + b + 36, tw = w - pw - b - 72;
  const card = root.append('g'); sheet(card.append('g').attr('filter', st.lift), x, y, w, h, {radius: 6});
  const pic = photo(card, st, x + b, y + b, pw, h - b * 2, {image: props.image, scene: props.scene, seed: 11, from: 'right'});
  const cat = txt(card, tx, y + 58, up(props.category), {size: 21, role: 'label', color: C.soft}), nsize = fit(props.name, tw, 58), name = txt(card, tx, y + 84 + capH(nsize), props.name, {size: nsize, role: 'head'});
  const stars = Array.from({length: 5}, (_, i) => card.append('g').attr('transform', `translate(${tx + 20 + i * 46} ${y + 176})`).append('path').attr('d', starPath(18)).attr('fill', i < props.stars ? C.sun : 'none').attr('stroke', C.ink).attr('stroke-width', 2.5).attr('stroke-linejoin', 'round'));
  const price = tag(card, tx, y + 244, props.price, {fill: ink.accent, size: 30, role: 'head', caps: false}), note = txt(card, x + w - 36, y + 254, props.note, {size: 30, role: 'serif', color: C.dim, anchor: 'end'});
  return {
    seek(t) {
      const out = leave(t, props.life, .55), e = swell(span(t, 0, .8));
      card.attr('transform', `translate(0 ${(1 - e) * 80 + out * 50})`).attr('opacity', fade(t, 0, .4) * (1 - out)); pic.set(glide(span(t, .35, .9)), t);
      cat.attr('opacity', fade(t, .5, .5)); name.attr('opacity', fade(t, .6, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .6, .8))) * 14})`);
      stars.forEach((s, i) => s.attr('transform', `scale(${glide(span(t, .9 + i * .09, .6))})`));
      price.g.attr('opacity', fade(t, 1.2, .5)).attr('transform', `translate(${(1 - glide(span(t, 1.2, .7))) * -16} 0)`); note.attr('opacity', fade(t, 1.4, .6));
    },
  };
}
