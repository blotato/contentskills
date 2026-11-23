import {card, C, up, fit, capH, txt, tag, sheet, stroke, tickPath, draw, fade, glide, span} from '../../kit.js';

// Three options side by side as paper slips that rise in a stagger: a name, a heavy price, what
// you get, ticked off. The recommended one is inked dark, sits a little higher and wears a tag.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'What a good coffee costs', unit: 'Illustrative prices', clear: false, accent: 'leaf', pick: 1, pickLabel: 'Best value',
  options: [{name: 'Café', price: '$5.50', per: 'a cup', points: ['No washing up', 'A reason to walk']}, {name: 'At home', price: '$0.90', per: 'a cup', points: ['Fresh beans', 'Your own mug', 'Two minutes']}, {name: 'Pods', price: '$1.40', per: 'a cup', points: ['Fast', 'Lots of waste']}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, n = props.options.length, gap = 24, w = (840 - gap * (n - 1)) / n, top = 300, h = 580;
  const cols = props.options.map((o, i) => { const pick = i === props.pick, x = 80 + i * (w + gap), y = top + (pick ? -18 : 14), g = root.append('g').append('g'), fg = pick ? C.cream : C.ink, psize = fit(o.price, w - 56, 84);
    sheet(g, x, y, w, h, {fill: pick ? C.ink : C.deep, radius: 8, lift: pick ? st.lift : null});
    txt(g, x + 28, y + 62, up(o.name), {size: fit(up(o.name), w - 56, 24, {role: 'wide'}), role: 'wide', color: pick ? ink.accent : C.soft});
    txt(g, x + 28, y + 108 + capH(psize), o.price, {size: psize, role: 'head', color: fg}); txt(g, x + 28, y + 108 + capH(psize) + 44, o.per ?? '', {size: 34, role: 'serif', color: pick ? C.cream : C.soft});
    stroke(g, `M${x + 28} ${y + 250}H${x + w - 28}`, pick ? C.soft : C.line, 2);
    const ticks = (o.points ?? []).map((p, k) => { const py = y + 306 + k * 70, size = fit(p, w - 100, 27, {role: 'text'}); txt(g, x + 72, py, p, {size, role: 'text', color: fg}); return stroke(g, tickPath(x + 26, py - 28, 34), ink.accent, 5); });
    const chip = pick && props.pickLabel ? tag(root, x + w / 2, y - 4, props.pickLabel, {fill: ink.accent, size: 21, anchor: 'middle'}) : null;
    return {g, ticks, chip, pick}; });
  return {seek(t) {
    st.header(t);
    cols.forEach((c, i) => { const s = .3 + i * .2, e = glide(span(t, s, 1));
      c.g.attr('transform', `translate(0 ${(1 - e) * 70 + (c.pick ? Math.sin(t * .9) * 3 : 0)})`).attr('opacity', fade(t, s, .45));
      c.ticks.forEach((tk, k) => draw(tk, glide(span(t, s + .8 + k * .22, .5))));
      c.chip?.g.attr('opacity', fade(t, s + 1, .5)).attr('transform', `translate(0 ${(1 - glide(span(t, s + 1, .7))) * 14 + Math.sin(t * .9) * 3})`); });
  }};
}
