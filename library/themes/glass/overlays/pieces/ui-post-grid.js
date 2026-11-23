import {stage, txt, leave, fade, glide, span, series, C} from '../../kit.js';
import {inks, plate, small, check, spring} from './_ui.js';

// A grid of tiles filling in one after another on a frosted card: a content calendar, a members wall, a
// set of options. Each tile is a soft colour block with a small label; `lit` keeps some tiles in the accent
// and, from `dimAt`, fades every other tile back (a "pick one" moment). `ticks` puts a check on each tile as it lands.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'This month', sub: 'Posts for Rosa’s Café', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  cols: 4, startAt: .2, step: .12, lit: [], dimAt: null, ticks: true, footer: '', x: 90, y: 260, w: 900, tileH: 0, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const p = {...defaults, ...props}, st = stage(el, {mode: 'overlay', accent: p.accent}), ink = inks(p.theme), {x, y, w, cols} = p;
  const n = p.labels.length, rows = Math.ceil(n / cols), gap = 16, pad = 34, tw = (w - pad * 2 - gap * (cols - 1)) / cols, th = p.tileH || tw * .78;
  const headH = p.title ? 118 : 30, h = headH + rows * (th + gap) - gap + pad + (p.footer ? 70 : 0), g = st.root.append('g');
  plate(g, st, x, y, w, h, p.theme);
  if (p.title) { txt(g, x + pad, y + 62, p.title, {size: 40, color: ink.head, role: 'bold'}); small(g, x + pad, y + 98, p.sub, ink); }
  const tiles = p.labels.map((lab, i) => {
    const c = i % cols, r = Math.floor(i / cols), tx = x + pad + c * (tw + gap), ty = y + headH + r * (th + gap), lit = p.lit.includes(i);
    const tile = g.append('g'), inner = tile.append('g');
    const col = lit ? st.ink.accent : series[1 + (i % 3)];
    inner.append('rect').attr('x', tx).attr('y', ty).attr('width', tw).attr('height', th).attr('rx', 20).attr('fill', col).attr('fill-opacity', lit ? 1 : .32);
    txt(inner, tx + tw / 2, ty + th / 2 + Math.min(34, tw / 5) * .36, lab, {size: Math.min(34, tw / 5), color: lit ? C.white : ink.head, role: 'bold', anchor: 'middle'});
    const tick = p.ticks ? check(inner, tx + tw - 46, ty + 10, 36, lit ? C.white : st.ink.accent, 4) : null;
    return {tile, inner, cx: tx + tw / 2, cy: ty + th / 2, at: p.startAt + i * p.step, lit, tick};
  });
  if (p.footer) txt(g, x + w / 2, y + h - 34, p.footer, {size: 40, color: ink.head, role: 'bold', anchor: 'middle'});
  return {
    seek(t) {
      g.attr('opacity', fade(t, 0, .2) * (1 - leave(t, p.life, .22)));
      g.attr('transform', `translate(0 ${(1 - glide(span(t, 0, .4))) * 60})`);
      const dim = p.dimAt == null ? 0 : glide(span(t, p.dimAt, .35));
      tiles.forEach(({tile, inner, cx, cy, at, lit, tick}) => {
        const s = .6 + .4 * spring(span(t, at, .32));
        inner.attr('transform', `translate(${cx} ${cy}) scale(${t < at ? .6 : s}) translate(${-cx} ${-cy})`);
        tile.attr('opacity', fade(t, at, .1) * (lit ? 1 : 1 - .82 * dim));
        if (tick) tick.attr('opacity', fade(t, at + .18, .1));
      });
    },
  };
}
