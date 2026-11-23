import {C, F, stage, card, text, label, folio, rule, line, span, ease, glide, leave} from '../../kit.js';

// The palette, shown as printed colour chips: each chip wipes down in turn with its name in tracked capitals and its
// hex value in mono. The defaults are the theme's own colours, which were measured on the footage it was built for.
// Props: title, chips [{color, name}], x, y (top), w, field, step, hex (false hides the hex values).
export const meta = {duration: 3.5, live: true};
export const defaults = {title: 'Colours from the *footage*', chips: [{color: '#EDF0EB', name: 'Wall'}, {color: '#26101A', name: 'Shadow'}, {color: '#7A2137', name: 'Jacket'}, {color: '#A70A3E', name: 'Knit'}, {color: '#DFA78C', name: 'Skin'}], x: 70, y: 250, w: 940, field: 'paper', step: .1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 250, w = props.w ?? 940, pd = 40, chips = props.chips ?? [], n = chips.length, gap = 14, cw = (w - pd * 2 - gap * (n - 1)) / n, chh = 170, h = 112 + chh + 96;
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  const ttl = line(st, cd.body, props.title, x + pd, y + 76, 62, {color: f.fg, accent: f.accent}), rl = rule(cd.body, x + pd, y + 94, x + w - pd, y + 94, {color: f.fg});
  const cells = chips.map((c, i) => { const cx = x + pd + i * (cw + gap), cy = y + 112;
    return {r: cd.body.append('rect').attr('x', cx).attr('y', cy).attr('width', cw).attr('fill', c.color).attr('stroke', f.fg).attr('stroke-opacity', .25).attr('stroke-width', 1.5), nm: label(cd.body, cx, cy + chh + 40, c.name, {size: 26, color: f.fg, track: .12}), hx: folio(cd.body, cx, cy + chh + 74, props.hex === false ? '' : String(c.color).toUpperCase(), {size: 24, color: f.sub, track: 0})}; });
  const life = props.life ?? meta.duration, step = props.step ?? .1;
  return {seek(t) { cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); ttl.set(span(t, .08, .4)); rl.draw(glide(span(t, .1, .45)));
    cells.forEach((c, i) => { const a = glide(span(t, .25 + i * step, .4)); c.r.attr('height', chh * a); c.nm.attr('opacity', ease(span(t, .4 + i * step, .25))); c.hx.attr('opacity', ease(span(t, .46 + i * step, .25))); }); }};
}
