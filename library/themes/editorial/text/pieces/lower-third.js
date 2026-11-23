import {C, M, stage, card, line, label, folio, rule, fit, measure, span, glide, ease, leave} from '../../kit.js';
import {sc, labelW} from './_local.js';

// A name card: a paper card glides up, a wine rule draws down its left edge, the name rises in serif, a hairline draws
// and the role fades up in tracked capitals (a long role takes two lines). Props: name, role, x, y (top of the card), field (paper|ink|wine|stone|blush), folio.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'Alex Rivera', role: 'Makes things move', x: 70, y: 1262, field: 'paper', folio: ''};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = Math.max(70, props.x ?? 70), y = props.y ?? 1262, padL = 46, padR = 44, maxW = 1010 - x, name = sc(props.name), inner = maxW - padL - padR, fw = props.folio ? labelW(props.folio, 28) + 40 : 0;
  let role = String(props.role ?? ''); if (role && labelW(role, 28) + fw > inner) { const ws = role.split(/\s+/); let k = 1; while (k < ws.length - 1 && labelW(ws.slice(0, k + 1).join(' '), 28) <= inner - fw) k++; role = `${ws.slice(0, k).join(' ')}\n${ws.slice(k).join(' ')}`; }
  const two = role.includes('\n'), ns = fit(name, inner, 84), w = Math.min(maxW, Math.max(measure(name, ns), labelW(role, 28) + fw, 300) + padL + padR), h = role ? (two ? 218 : 178) : 124;
  const cd = card(st, st.root, {x, y, w, h, field: props.field ?? 'paper', radius: 4}), f = cd.f, bar = rule(cd.body, x + 5, y, x + 5, y + h, {color: f.accent, width: 10});
  const nm = line(st, cd.body, name, x + padL, y + 84, ns, {color: f.fg, accent: f.accent}), rl = role ? rule(cd.body, x + padL, y + 110, x + w - padR, y + 110, {color: f.fg, width: 1.5, opacity: .5}) : null;
  const rb = role ? label(cd.body, x + padL, y + 152, role, {size: 28, color: f.fg}) : null, fo = props.folio ? folio(cd.body, x + w - padR, y + 152, props.folio, {size: 28, color: f.sub, anchor: 'end'}) : null;
  const life = props.life ?? meta.duration, out = life - .3;
  return {seek(t) {
    const b = leave(t, life, .3);
    cd.set({a: span(t, 0, .45), b}); bar.draw(glide(span(t, .15, .45))); nm.set(span(t, .2, .5), 0);
    rl?.draw(glide(span(t, .4, .45))); rb?.attr('opacity', ease(span(t, .55, .3))); fo?.attr('opacity', ease(span(t, .65, .3)));
  }};
}
