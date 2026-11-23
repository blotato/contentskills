import {C, F, stage, card, text, label, folio, rule, typed, measure, fit, span, ease, glide, leave} from '../../kit.js';

// One message, typed and sent: a paper card with a tracked label, a line of serif italic that types on with a caret,
// and a round wine send button that fills with a tick when the message goes; the label then reads `done`.
// Props: label, done, text, typeAt, typeFor, sendAt, x, y (top), w, size, field, folio.
export const meta = {duration: 3.4, live: true};
export const defaults = {label: 'To the editor', done: 'Sent', text: 'Turn this into a reel', typeAt: .3, typeFor: 1.0, sendAt: 1.6, x: 70, y: 1180, w: 940, size: 84, field: 'paper', folio: ''};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 1180, w = props.w ?? 940, pd = 44, o = {font: F.italic};
  const size = fit(props.text, w - pd * 2 - 130, props.size ?? 84, o), h = 110 + size * 1.15;
  const cd = card(st, st.root, {x, y, w, h, field: props.field, radius: 10}), f = cd.f;
  const lb = label(cd.body, x + pd, y + 56, props.label, {size: 28, color: f.sub}), fo = props.folio ? folio(cd.body, x + w - pd, y + 56, props.folio, {size: 28, anchor: 'end', color: f.sub}) : null;
  const rl = rule(cd.body, x + pd, y + 76, x + w - pd, y + 76, {color: f.fg, width: 1.5, opacity: .5});
  const by = y + 84 + size * .88, tx = text(cd.body, x + pd, by, '', {font: F.italic, size, color: f.fg}), caret = cd.body.append('rect').attr('y', by - size * .72).attr('width', 4).attr('height', size * .86).attr('fill', f.accent);
  const bx = x + w - pd - 50, bcy = by - size * .3, btn = cd.body.append('circle').attr('cx', bx).attr('cy', bcy).attr('r', 46).attr('fill', 'none').attr('stroke', f.accent).attr('stroke-width', 3);
  const fill = cd.body.append('circle').attr('cx', bx).attr('cy', bcy).attr('fill', f.accent);
  const arrow = cd.body.append('path').attr('d', `M${bx} ${bcy + 18}V${bcy - 18}M${bx - 15} ${bcy - 4}L${bx} ${bcy - 19}L${bx + 15} ${bcy - 4}`).attr('fill', 'none').attr('stroke-width', 4).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
  const tick = cd.body.append('path').attr('d', `M${bx - 17} ${bcy + 1}L${bx - 5} ${bcy + 13}L${bx + 18} ${bcy - 12}`).attr('fill', 'none').attr('stroke', f.bg).attr('stroke-width', 5).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round').attr('pathLength', 1).attr('stroke-dasharray', 1);
  const life = props.life ?? meta.duration, ta = props.typeAt ?? .3, tf = props.typeFor ?? 1, sa = props.sendAt ?? ta + tf + .3;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); rl.draw(glide(span(t, .1, .4)));
    const s = typed(props.text, span(t, ta, tf)), sent = glide(span(t, sa, .3)); tx.text(s);
    caret.attr('x', x + pd + measure(s, size, o) + 6).attr('opacity', t < sa && Math.floor(t * 2.5) % 2 === 0 || (t > ta && t < ta + tf) ? 1 : 0);
    fill.attr('r', 46 * sent); arrow.attr('stroke', f.accent).attr('opacity', 1 - sent).attr('transform', `translate(0 ${-sent * 26})`); tick.attr('stroke-dashoffset', 1 - glide(span(t, sa + .1, .3)));
    lb.select('tspan').text((t >= sa + .15 ? props.done ?? 'Sent' : props.label ?? '').toUpperCase()); lb.attr('fill', t >= sa + .15 ? f.accent : f.sub);
  }};
}
