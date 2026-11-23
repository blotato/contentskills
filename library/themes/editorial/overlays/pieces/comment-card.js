import {C, F, stage, card, text, label, folio, rule, typed, measure, span, ease, glide, leave} from '../../kit.js';

// A comment being left: a paper card with a tracked label, the word typed in large serif capitals with a caret, then
// posted (a small wine "Posted" and a tick); optionally a reply line rises underneath.
// Props: label, text, name, typeAt, typeFor, postAt, reply {name, text, at}, x, y (top), w, size, field.
export const meta = {duration: 3.2, live: true};
export const defaults = {label: 'Comments', text: 'EDIT', name: 'You', typeAt: .25, typeFor: .45, postAt: .95, reply: null, x: 90, y: 1130, w: 900, size: 150, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 90, y = props.y ?? 1130, w = props.w ?? 900, pd = 44, size = props.size ?? 150, o = {font: F.serif, weight: 500, track: .04}, rep = props.reply;
  const h = 104 + size * .98 + (rep ? 110 : 0), cd = card(st, st.root, {x, y, w, h, field: props.field, radius: 10}), f = cd.f;
  label(cd.body, x + pd, y + 56, props.label, {size: 28, color: f.sub}); const who = label(cd.body, x + w - pd, y + 56, props.name, {size: 28, color: f.sub, anchor: 'end'});
  const rl = rule(cd.body, x + pd, y + 76, x + w - pd, y + 76, {color: f.fg, width: 1.5, opacity: .5}), by = y + 86 + size * .78;
  const tx = text(cd.body, x + pd, by, '', {font: F.serif, weight: 500, size, track: .04, color: f.fg}), caret = cd.body.append('rect').attr('y', by - size * .74).attr('width', 5).attr('height', size * .78).attr('fill', f.accent);
  const posted = label(cd.body, x + w - pd, by - size * .26, 'Posted', {size: 30, anchor: 'end', color: f.accent, weight: 700});
  const ry = y + 104 + size * .98, rr = rep ? rule(cd.body, x + pd, ry - 8, x + w - pd, ry - 8, {color: f.fg, width: 1.5, opacity: .35}) : null;
  const rn = rep ? label(cd.body, x + pd, ry + 56, rep.name, {size: 28, color: f.accent}) : null, rt = rep ? text(cd.body, x + pd + measure((rep.name ?? '').toUpperCase(), 28, {font: F.sans, weight: 600, track: .2}) + 28, ry + 60, rep.text, {font: F.italic, size: 52, color: f.fg}) : null;
  const life = props.life ?? meta.duration, ta = props.typeAt ?? .25, tf = props.typeFor ?? .45, pa = props.postAt ?? ta + tf + .25;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); rl.draw(glide(span(t, .1, .4)));
    const s = typed(props.text, span(t, ta, tf)); tx.text(s).attr('fill', t >= pa ? f.accent : f.fg);
    caret.attr('x', x + pd + measure(s, size, o) + 8).attr('opacity', t < pa && (Math.floor(t * 2.5) % 2 === 0 || (t > ta && t < ta + tf)) ? 1 : 0);
    posted.attr('opacity', ease(span(t, pa, .25)));
    if (rep) { const a = ease(span(t, rep.at ?? pa + .5, .35)); rr.draw(a); rn.attr('opacity', a); rt.attr('opacity', a).attr('transform', `translate(0 ${(1 - a) * 16})`); }
  }};
}
