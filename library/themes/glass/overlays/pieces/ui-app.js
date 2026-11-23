import {stage, txt, leave, fade, glide, span, series, C, fit} from '../../kit.js';
import {inks, plate, small, spring} from './_ui.js';

// A piece of software on a frosted card: a browser window ('window') or a phone ('phone'). The brand in its
// header swaps at each cue of `brands` (white-label: the same app, a new logo and colour), the screen shows
// a title and rows of content, and an optional `badge` slides in on top at its cue (an invoice, a store badge).
// brands: [{name, at, color}] (color: a kit accent name or #hex). rows: short strings.
export const meta = {duration: 4, live: true};
export const defaults = {kind: 'window', brands: [{name: 'Acme Co.', at: 0, color: 'poppy'}], title: 'Booking dashboard', rows: ['New requests', 'This week', 'Paid invoices'],
  values: ['12', '38', '9'], badge: null, x: 140, y: 260, w: 800, h: 0, theme: 'bone', accent: 'poppy'};

const tint = (st, c) => ({poppy: C.poppy, cobalt: C.cobalt, sun: C.sun}[c] ?? c ?? st.ink.accent);

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, st = stage(el, {mode: 'overlay', accent: p.accent}), ink = inks(p.theme), phone = p.kind === 'phone';
  const w = phone ? Math.min(p.w, 520) : p.w, x = phone ? p.x + (p.w - w) / 2 : p.x, y = p.y;
  const rowH = 104, headH = phone ? 150 : 130, h = p.h || headH + 120 + p.rows.length * rowH + 40 + (p.badge ? 90 : 0), g = st.root.append('g');
  plate(g, st, x, y, w, h, p.theme, {r: phone ? 64 : 36});
  if (phone) g.append('rect').attr('x', x + w / 2 - 70).attr('y', y + 22).attr('width', 140).attr('height', 34).attr('rx', 17).attr('fill', C.ink);
  else [0, 1, 2].forEach(k => g.append('circle').attr('cx', x + 40 + k * 30).attr('cy', y + 36).attr('r', 9).attr('fill', ink.line).attr('fill-opacity', .2));
  // brand bars, one per brand, cross-fading
  const by = y + (phone ? 72 : 62), brands = p.brands.map(b => {
    const bg = g.append('g'), col = tint(st, b.color);
    bg.append('rect').attr('x', x + 30).attr('y', by).attr('width', 60).attr('height', 60).attr('rx', 16).attr('fill', col);
    txt(bg, x + 60, by + 42, b.name[0], {size: 34, color: C.white, role: 'bold', anchor: 'middle'});
    txt(bg, x + 108, by + 44, b.name, {size: 40, color: ink.head, role: 'bold'});
    const bar = bg.append('rect').attr('x', x + 30).attr('y', by + 84).attr('width', w - 60).attr('height', 6).attr('rx', 3).attr('fill', col);
    return {bg, at: b.at};
  });
  const top = y + headH + 20;
  txt(g, x + 34, top + 50, p.title, {size: Math.min(46, fit(p.title, w - 68, 46, {role: 'bold'})), color: ink.head, role: 'bold'});
  const rows = p.rows.map((r, i) => {
    const rg = g.append('g'), ry = top + 90 + i * rowH;
    rg.append('rect').attr('x', x + 30).attr('y', ry).attr('width', w - 60).attr('height', rowH - 18).attr('rx', 22).attr('fill', p.theme === 'bone' ? '#E6ECF6' : '#26314A');
    txt(rg, x + 60, ry + 54, r, {size: 34, color: ink.head, role: 'text'});
    if (p.values[i] != null) txt(rg, x + w - 60, ry + 56, p.values[i], {size: 40, color: series[0], role: 'bold', anchor: 'end'});
    return {rg, at: .25 + i * .14};
  });
  let badge = null;
  if (p.badge) {
    badge = g.append('g'); const bw = Math.min(w + 80, 640), bx = x + w / 2 - bw / 2 + 60, bY = y + h - 110;
    plate(badge, st, bx, bY, bw, 150, 'ink');
    txt(badge, bx + 40, bY + 64, p.badge.title, {size: 40, color: C.white, role: 'bold'});
    small(badge, bx + 40, bY + 108, p.badge.sub ?? '', inks('ink'));
    if (p.badge.value) txt(badge, bx + bw - 40, bY + 90, p.badge.value, {size: 54, color: C.sun, role: 'bold', anchor: 'end'});
    badge.at = p.badge.at ?? 1.2; badge.cx = bx + bw / 2; badge.cy = bY + 75;
  }
  return {
    seek(t) {
      g.attr('opacity', fade(t, 0, .2) * (1 - leave(t, p.life, .22)));
      g.attr('transform', `translate(0 ${(1 - glide(span(t, 0, .4))) * 60})`);
      brands.forEach((b, i) => {
        const next = brands[i + 1], on = fade(t, b.at, .18) * (next ? 1 - fade(t, next.at, .18) : 1);
        b.bg.attr('opacity', i === 0 ? (next ? 1 - fade(t, next.at, .18) : 1) : on);
      });
      rows.forEach(({rg, at}) => rg.attr('opacity', fade(t, at, .2)).attr('transform', `translate(0 ${(1 - glide(span(t, at, .3))) * 20})`));
      if (badge) {
        const s = spring(span(t, badge.at, .35));
        badge.attr('opacity', fade(t, badge.at, .12)).attr('transform', `translate(${badge.cx} ${badge.cy}) scale(${t < badge.at ? .7 : .7 + .3 * s}) translate(${-badge.cx} ${-badge.cy})`);
      }
    },
  };
}
