import {C, F, stage, text, label, rule, span, ease, glide, leave} from '../../kit.js';

// Your own app, on a phone: a flat ink phone (rounded body, speaker slot) rises in; on its paper screen the app's name
// sets in serif under a status line, list rows slide in one after another (a title and a mono figure each), and a
// wide accent button lands at the bottom and gets pressed. Flat and printed, like the rest of the theme: no glass.
// Props: name, kicker, rows [{label, value}], button, x (phone centre), y (top), h (phone height), rowAt, step, pressAt, field.
export const meta = {duration: 4.5, live: true};
export const defaults = {name: 'Your *app*', kicker: 'v1.0 · live', button: 'Book now', x: 540, y: 250, h: 1120, rowAt: .45, step: .22, pressAt: 1.9,
  rows: [{label: 'Bookings today', value: '12'}, {label: 'New customers', value: '5'}, {label: 'Revenue', value: '$840'}]};

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, st = stage(el, {mode: 'overlay'}), root = st.root;
  const H = p.h, W = Math.round(H * .49), x0 = p.x - W / 2, y0 = p.y, bez = 22, sx = x0 + bez, sy = y0 + bez, sw = W - bez * 2, sh = H - bez * 2;
  const g = root.append('g'), ink = C.ink, paper = C.paper, acc = C.wine;
  g.append('rect').attr('x', x0).attr('y', y0).attr('width', W).attr('height', H).attr('rx', 70).attr('fill', ink);
  g.append('rect').attr('x', sx).attr('y', sy).attr('width', sw).attr('height', sh).attr('rx', 52).attr('fill', paper);
  g.append('rect').attr('x', p.x - 60).attr('y', sy + 22).attr('width', 120).attr('height', 30).attr('rx', 15).attr('fill', ink);
  const pad = 40, cx0 = sx + pad, cx1 = sx + sw - pad;
  const kick = label(g, cx0, sy + 120, p.kicker, {size: 24, color: C.umber ?? ink});
  const top = rule(g, cx0, sy + 140, cx1, sy + 140, {color: ink, width: 2});
  const [a, b] = String(p.name).split('*');
  const title = text(g, cx0, sy + 240, '', {font: F.head, size: 92, color: ink});
  title.append('tspan').text(a); if (b !== undefined) title.append('tspan').attr('font-family', F.italic).attr('fill', acc).text(b);
  const rowH = 118, ry0 = sy + 300;
  const rows = p.rows.map((r, i) => {
    const rg = g.append('g'), y = ry0 + i * rowH;
    text(rg, cx0, y + 62, r.label, {font: F.head, size: 46, color: ink});
    text(rg, cx1, y + 62, r.value, {font: F.sans, size: 40, weight: 600, anchor: 'end', color: acc});
    rule(rg, cx0, y + rowH - 10, cx1, y + rowH - 10, {color: ink, width: 1.5, opacity: .35}).draw(1);
    return rg;
  });
  const bh = 120, by = sy + sh - bh - 70, btn = g.append('g');
  const bRect = btn.append('rect').attr('x', cx0).attr('y', by).attr('width', cx1 - cx0).attr('height', bh).attr('rx', 60).attr('fill', acc);
  text(btn, p.x, by + bh / 2 + 16, p.button, {font: F.sans, size: 44, weight: 600, anchor: 'middle', color: paper});
  const life = p.life ?? meta.duration;
  return {seek(t) {
    const inn = glide(span(t, 0, .5)), out = ease(span(t, life - .3, .3));
    g.attr('opacity', (Math.min(1, inn * 1.4) * (1 - out)).toFixed(3)).attr('transform', `translate(0 ${((1 - inn) * 120 + out * 60).toFixed(1)})`);
    kick.attr('opacity', ease(span(t, .3, .3))); top.draw(glide(span(t, .25, .45)));
    title.attr('opacity', ease(span(t, .35, .3)));
    rows.forEach((r, i) => { const q = ease(span(t, p.rowAt + i * p.step, .3)); r.attr('opacity', q).attr('transform', `translate(${((1 - q) * 40).toFixed(1)} 0)`); });
    const bq = glide(span(t, p.rowAt + p.rows.length * p.step, .35)), press = span(t, p.pressAt, .12) - span(t, p.pressAt + .12, .2);
    btn.attr('opacity', bq).attr('transform', `translate(${p.x} ${by + bh / 2}) scale(${(1 - press * .06).toFixed(3)}) translate(${-p.x} ${-(by + bh / 2)})`);
    bRect.attr('fill-opacity', 1 - press * .25);
  }};
}
