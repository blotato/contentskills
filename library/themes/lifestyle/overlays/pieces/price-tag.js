import {stage, look, C, up, fit, measure, capH, txt, sheet, stroke, draw, fade, glide, span, leave} from '../../kit.js';

// A swing tag for a product: a paper tag with a punched hole and a looped string tilts into
// place, the product name in caps, the price in heavy type, an optional struck-through old
// price and a small note in serif italic. Sample values only. (`x`, `y`) is the top-left.
export const meta = {duration: 4.5, live: true};
export const defaults = {name: 'Linen tote', price: '$24', was: '$32', note: 'sample price', x: 600, y: 170, accent: 'clay'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {y} = props, o = {role: 'label'};
  const psize = fit(props.price, 250, 110), pw = measure(props.price, psize), ww = props.was ? measure(props.was, 40, {role: 'text'}) : 0, w = Math.max(300, Math.min(520, measure(up(props.name), 24, o) + 110), pw + (props.was ? ww + 40 : 0) + 84), h = 250, nsize = fit(up(props.name), w - 110, 24, o), x = Math.min(props.x, 1010 - w);
  const outer = root.append('g').attr('filter', st.lift).append('g').attr('transform', `translate(${x + 34} ${y + 34})`), g = outer.append('g'), body = g.append('g');
  body.append('path').attr('d', `M26 -34H${w - 34}V${h - 34}H-34V26Z`).attr('fill', C.paper); g.append('circle').attr('r', 13).attr('cx', 10).attr('cy', 10).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 3);
  const cord = stroke(g, 'M10 10C-30 -40 -90 -50 -120 -110', C.cream, 4);
  const name = txt(g, 40, 30, up(props.name), {size: nsize, role: 'label', color: C.soft}), price = txt(g, 6, 66 + capH(psize), props.price, {size: psize, role: 'head', color: C.ink});
  const was = props.was ? txt(g, pw + 34, 66 + capH(psize), props.was, {size: 40, role: 'text', color: C.dim}) : null;
  const cut = props.was ? stroke(g, `M${pw + 26} ${66 + capH(psize) - 12}l${ww + 16} -8`, ink.accent, 5) : null;
  const note = txt(g, 8, h - 62, props.note, {size: 36, role: 'serif', color: ink.accent});
  return {
    seek(t) {
      const out = leave(t, props.life, .5), q = span(t, 0, 1.1), e = glide(q), sway = Math.sin(t * .9) * .8 * e;
      outer.attr('opacity', fade(t, 0, .4) * (1 - out)); g.attr('transform', `translate(0 ${(1 - e) * -50 + out * 40}) rotate(${-14 * (1 - e) - 3 + sway})`);
      draw(cord, glide(span(t, .2, .8))); name.attr('opacity', fade(t, .4, .5)); price.attr('opacity', fade(t, .55, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .55, .8))) * 16})`);
      if (was) { was.attr('opacity', fade(t, .9, .5)); draw(cut, glide(span(t, 1.3, .5))); } note.attr('opacity', fade(t, 1.1, .6));
    },
  };
}
