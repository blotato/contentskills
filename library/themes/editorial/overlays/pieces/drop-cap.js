import {C, F, stage, card, text, lines, label, rule, wrap, capH, span, ease, glide, leave} from '../../kit.js';

// The opening paragraph of an article: a Didone drop cap in the accent, three or four lines of serif text that rise
// beside and under it, a tracked kicker above a hairline. Props: kicker, text, x, y (top), w, size, field.
export const meta = {duration: 4.5, live: true};
export const defaults = {kicker: 'The story', text: 'One recording went in. A finished reel came out, and nobody opened an editor.', x: 90, y: 250, w: 900, size: 62, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 90, y = props.y ?? 250, w = props.w ?? 900, pd = 48, size = props.size ?? 62, str = String(props.text ?? ''), cap = str[0] ?? 'A', rest = str.slice(1), dc = size * 3.25, dw = dc * .78;
  const narrow = wrap(rest, size, w - pd * 2 - dw - 20), first = narrow.slice(0, 3), tail = wrap(narrow.slice(3).join(' '), size, w - pd * 2), pitch = size * 1.02, top = 104;
  const h = top + Math.max(3, first.length) * pitch + tail.length * pitch + 44, cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  label(cd.body, x + pd, y + 58, props.kicker, {size: 28, color: f.sub}); const rl = rule(cd.body, x + pd, y + 78, x + w - pd, y + 78, {color: f.fg});
  const big = text(cd.body, x + pd - 6, y + top + pitch * 2.62, cap, {font: F.serif, weight: 500, size: dc, color: f.accent});
  const a = lines(st, cd.body, first, x + pd + dw + 20, y + top, size, {color: f.fg, accent: f.accent}), b = lines(st, cd.body, tail, x + pd, y + top + 3 * pitch, size, {color: f.fg, accent: f.accent});
  const life = props.life ?? meta.duration;
  return {seek(t) { cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); rl.draw(glide(span(t, .1, .4))); big.attr('opacity', ease(span(t, .15, .35))).attr('transform', `translate(0 ${(1 - glide(span(t, .15, .45))) * 24})`); a.seek(t, .22, null, .08, .42); b.seek(t, .22 + first.length * .08, null, .08, .42); }};
}
