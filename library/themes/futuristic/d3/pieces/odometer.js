import {C, F, chamfer, line, text, ticks, draw, span, easeOut, flicker, typed, comma, blink} from '../../hud.js';
import {card} from './_card.js';

// One big number on rolling digit wheels. The wheels spin down and lock in from left to right,
// each with a small bounce, then a highlight keeps sweeping across the row.
export const meta = {duration: 4.2, live: true};
export const defaults = {title: 'Total views', unit: 'Illustrative · all platforms', value: 1284500, prefix: '', suffix: '', label: 'Views and counting', note: 'Sample figure', clear: false};

export function mount(el, props = defaults) {
  const {root, frame, defs, id} = card(el, props), chars = [...(props.prefix ?? '') + comma(props.value) + (props.suffix ?? '')], isDigit = c => c >= '0' && c <= '9';
  const units = chars.reduce((s, c) => s + (isDigit(c) ? 1 : .45), 0), cw = Math.min(150, 790 / units), ch = cw * 1.75, size = cw * 1.06, cy = 560, x0 = 500 - units * cw / 2;
  defs.append('clipPath').attr('id', id + '-win').append('rect').attr('x', 0).attr('y', cy - ch / 2 + 3).attr('width', 1000).attr('height', ch - 6);
  let x = x0, k = 0; const wheels = [], count = chars.filter(isDigit).length;
  const still = root.append('g'), rolling = root.append('g').attr('clip-path', `url(#${id}-win)`);
  for (const c of chars) {
    if (!isDigit(c)) { text(still, x + cw * .225, cy + size * .36, c, {size, font: F.display, weight: 900, color: C.amber, anchor: 'middle', spacing: '0'}); x += cw * .45; continue; }
    still.append('path').attr('d', chamfer(x + 4, cy - ch / 2, cw - 8, ch, 12)).attr('fill', C.panel);
    const edge = line(still, chamfer(x + 4, cy - ch / 2, cw - 8, ch, 12), C.teal, 2), make = () => text(rolling, x + cw / 2, 0, '', {size, font: F.display, weight: 900, color: C.white, anchor: 'middle', spacing: '0'});
    wheels.push({digit: +c, a: make(), b: make(), edge, x, k, stop: 1.3 + k * (1.5 / Math.max(1, count - 1)), turns: 2 + k}); x += cw; k++;
  }
  const bay = line(root, chamfer(x0 - 24, cy - ch / 2 - 84, units * cw + 48, ch + 250, 30), C.teal, 2);
  const hair = line(root, `M${x0} ${cy}H${x0 + units * cw}`, C.bg, 3), shine = root.append('rect').attr('y', cy - ch / 2).attr('width', 26).attr('height', ch).attr('fill', C.cyan).attr('opacity', 0);
  const rule = ticks(root, x0 + 4, cy + ch / 2 + 22, units * cw - 8, 50, C.dim), label = text(root, 500, cy + ch / 2 + 110, '', {size: 34, color: C.cyan, anchor: 'middle', spacing: '.3em'});
  const dot = root.append('circle').attr('cx', x0 + 14).attr('cy', cy - ch / 2 - 34).attr('r', 8).attr('fill', C.red), tag = text(root, x0 + 34, cy - ch / 2 - 25, 'COUNT / LIVE', {size: 22, color: C.dim, spacing: '.2em'});
  const note = text(root, x0 + units * cw - 4, cy - ch / 2 - 25, String(props.note ?? '').toUpperCase(), {size: 22, color: C.amber, anchor: 'end', spacing: '.2em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); draw(rule, span(t, .3, .6)); draw(bay, span(t, .1, .8));
    for (const w of wheels) {
      const q = span(t, .25, w.stop - .25), since = t - w.stop, bounce = since > 0 ? -.16 * Math.exp(-7 * since) * Math.sin(20 * since) : 0;
      const p = w.digit + w.turns * 10 * (1 - easeOut(q)) + bounce + 100, n = Math.floor(p), f = p - n, base = cy + size * .36;
      w.a.text(n % 10).attr('y', base + f * ch); w.b.text((n + 1) % 10).attr('y', base - (1 - f) * ch);
      w.a.attr('opacity', flicker(t, .15 + w.k * .05)); w.b.attr('opacity', flicker(t, .15 + w.k * .05));
      w.edge.attr('stroke', since > 0 ? C.cyan : C.teal).attr('stroke-width', since > 0 && since < .25 ? 5 : 2);
    }
    const last = wheels.at(-1)?.stop ?? 1, u = ((t - last - .2) / 1.8) % 1; shine.attr('x', x0 + u * units * cw - 13).attr('opacity', t > last + .2 ? .22 * Math.sin(u * Math.PI) : 0);
    label.text(typed(String(props.label ?? '').toUpperCase(), span(t, last, .6))); hair.attr('opacity', .7);
    dot.attr('opacity', blink(t) ? 1 : .25); tag.attr('opacity', flicker(t, .2)); note.attr('opacity', flicker(t, .5));
  }};
}
