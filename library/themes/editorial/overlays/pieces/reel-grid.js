import {C, F, stage, card, picture, label, line, rule, loadImages, span, ease, glide, smooth, leave} from '../../kit.js';

// A profile's grid of reels, the way a phone shows it: three columns of 9:16 tiles, each with a small reel mark in
// its corner, under a row of tab glyphs. The tiles land one after another, fast, and the grid then scrolls up to
// show more of them. In the theme's own paper, hairlines and type; no app's logo or name. No view counts are printed
// (pass `counts`, one string per tile, only when they are real). Props: title, note, images, count (tiles), startAt,
// step, scrollAt, scrollFor, rows (visible rows), x, y (top), w, field, counts.
export const meta = {duration: 3, live: true};
export const defaults = {title: 'Every *reel*', note: 'Posted', images: [], count: 12, startAt: .2, step: .05, scrollAt: .9, scrollFor: 1.6, rows: 1.5, x: 70, y: 470, w: 940, field: 'paper', counts: null};

const reelMark = (g, x, y, s, col) => { g.append('rect').attr('x', x).attr('y', y).attr('width', s).attr('height', s).attr('rx', s * .24).attr('fill', 'none').attr('stroke', col).attr('stroke-width', 3.5); g.append('path').attr('d', `M${x + s * .4} ${y + s * .3}l${s * .3} ${s * .2}l${-s * .3} ${s * .2}z`).attr('fill', col); };
export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 470, w = props.w ?? 940, pd = 28, n = props.count ?? 12, cols = 3, gap = 8;
  const tw = (w - pd * 2 - gap * (cols - 1)) / cols, th = tw * 16 / 9 * .82, top = 178, vis = (props.rows ?? 1.5) * (th + gap), h = top + vis + pd, imgs = await loadImages(Array.from({length: n}, (_, i) => props.images?.[i % Math.max(1, props.images.length)] ?? null), 320, Math.round(320 * 16 / 9 * .82));
  const cd = card(st, st.root, {x, y, w, h, field: props.field, radius: 22}), f = cd.f, tints = ['wall', 'plaid', 'skin', 'shade', 'wine', 'hair'];
  const ttl = line(st, cd.body, props.title, x + pd + 6, y + 78, 64, {color: f.fg, accent: f.accent}), nt = label(cd.body, x + w - pd - 6, y + 68, props.note, {size: 28, color: f.sub, anchor: 'end'});
  // tab glyphs: grid, reels (active), tagged
  const ty = y + 134, tabs = cd.body.append('g'), tx = i => x + pd + (w - pd * 2) * (i + .5) / 3;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) tabs.append('rect').attr('x', tx(0) - 19 + c * 14).attr('y', ty - 19 + r * 14).attr('width', 10).attr('height', 10).attr('fill', f.sub);
  reelMark(tabs, tx(1) - 20, ty - 20, 40, f.fg); tabs.append('circle').attr('cx', tx(2)).attr('cy', ty - 6).attr('r', 9).attr('fill', 'none').attr('stroke', f.sub).attr('stroke-width', 3.5); tabs.append('path').attr('d', `M${tx(2) - 17} ${ty + 20}a17 15 0 0 1 34 0`).attr('fill', 'none').attr('stroke', f.sub).attr('stroke-width', 3.5);
  const base = rule(cd.body, x + pd, y + top - 12, x + w - pd, y + top - 12, {color: f.fg, width: 1.5, opacity: .35}), act = rule(cd.body, tx(1) - (w - pd * 2) / 6, y + top - 12, tx(1) + (w - pd * 2) / 6, y + top - 12, {color: f.fg, width: 4});
  const cid = st.uid('grid'); st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', x + pd).attr('y', y + top).attr('width', w - pd * 2).attr('height', vis);
  const scroll = cd.body.append('g').attr('clip-path', `url(#${cid})`).append('g'), rowsN = Math.ceil(n / cols);
  const cells = Array.from({length: n}, (_, i) => { const cx = x + pd + (i % cols) * (tw + gap), cy = y + top + Math.floor(i / cols) * (th + gap), g = scroll.append('g');
    const p = picture(st, g, {x: cx, y: cy, w: tw, h: th, image: imgs[i], tint: tints[(i * 5 + Math.floor(i / cols)) % 6], border: false});
    const mk = g.append('g'); reelMark(mk, cx + tw - 50, cy + 16, 34, C.paper);
    if (props.counts?.[i]) { mk.append('path').attr('d', `M${cx + 18} ${cy + th - 42}l20 12l-20 12z`).attr('fill', C.paper); mk.append('text').attr('x', cx + 46).attr('y', cy + th - 20).attr('fill', C.paper).style('font', `600 28px ${F.sans}`).text(props.counts[i]); }
    return {p, mk, cx, cy}; });
  const life = props.life ?? meta.duration, s0 = props.startAt ?? .2, step = props.step ?? .05, maxScroll = Math.max(0, rowsN * (th + gap) - gap - vis);
  return {seek(t) {
    cd.set({a: span(t, 0, .36), b: leave(t, life, .26)}); ttl.set(span(t, .06, .36)); base.draw(glide(span(t, .1, .4))); act.draw(glide(span(t, .2, .3)));
    cells.forEach((c, i) => { const a = glide(span(t, s0 + i * step, .26)); c.p.set({y: c.cy + (1 - a) * 40, opacity: ease(span(t, s0 + i * step, .12)), zoom: 1.2 - .2 * a}); c.mk.attr('opacity', a).attr('transform', `translate(0 ${(1 - a) * 40})`); });
    scroll.attr('transform', `translate(0 ${(-maxScroll * smooth(span(t, props.scrollAt ?? .9, props.scrollFor ?? 1.6))).toFixed(1)})`);
  }};
}
