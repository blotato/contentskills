import {C, F, stage, card, picture, label, folio, rule, line, pad, loadImages, span, ease, glide, leave} from '../../kit.js';

// A contact sheet: a paper card with a serif title, and a grid of small frames that are laid down one after another
// (pictures from `images`, or tints of the footage), each with a mono frame number; a counter runs with them.
// Props: title, note, count, cols, images, step, startAt, x, y (top), w, field, ratio (frame h/w), pick (frame ringed at pickAt),
// counter and numbers (false = print no figures at all, for when the count is not a fact), glyph ('play' = a small play mark on each frame).
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Every *reel*', note: 'Pulled in', count: 12, cols: 6, images: [], step: .09, startAt: .25, x: 70, y: 1040, w: 940, field: 'paper', ratio: 1.34, pick: null, pickAt: 1.6, counter: true, numbers: true, glyph: ''};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 1040, w = props.w ?? 940, pd = 36, n = props.count ?? 12, cols = props.cols ?? 6, rows = Math.ceil(n / cols), gap = 14;
  const fw = (w - pd * 2 - gap * (cols - 1)) / cols, fh = fw * (props.ratio ?? 1.34), top = 112, nh = props.numbers === false ? 14 : 44, h = top + rows * (fh + nh) + (props.numbers === false ? 22 : 14), imgs = await loadImages((props.images ?? []).slice(0, n), 240, Math.round(240 * (props.ratio ?? 1.34)));
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f;
  const ttl = line(st, cd.body, props.title, x + pd, y + 76, 64, {color: f.fg, accent: f.accent}), nt = label(cd.body, x + w - pd - (props.counter === false ? 0 : 230), y + 66, props.note, {size: 28, color: f.sub, anchor: 'end'});
  const ctr = folio(cd.body, x + w - pd, y + 68, '', {size: 34, anchor: 'end', color: f.accent}), rl = rule(cd.body, x + pd, y + 94, x + w - pd, y + 94, {color: f.fg});
  const cells = Array.from({length: n}, (_, i) => { const cx = x + pd + (i % cols) * (fw + gap), cy = y + top + Math.floor(i / cols) * (fh + nh);
    return {cx, cy, p: picture(st, cd.body, {x: cx, y: cy, w: fw, h: fh, image: imgs[i] ?? null, tint: ['wall', 'plaid', 'skin', 'shade', 'wine', 'hair'][(i * 5 + Math.floor(i / cols)) % 6]}), gl: props.glyph === 'play' ? cd.body.append('path').attr('d', `M${cx + fw / 2 - 11} ${cy + fh / 2 - 15}l26 15l-26 15z`).attr('fill', C.paper).attr('fill-opacity', .92) : null, no: props.numbers === false ? null : folio(cd.body, cx, cy + fh + 30, pad(i + 1), {size: 26, color: f.sub})}; });
  const pk = props.pick == null ? null : cells[props.pick], ring = pk ? cd.body.append('rect').attr('x', pk.cx - 5).attr('y', pk.cy - 5).attr('width', fw + 10).attr('height', fh + 10).attr('fill', 'none').attr('stroke', C.crimson).attr('stroke-width', 5) : null;
  const life = props.life ?? meta.duration, s0 = props.startAt ?? .25, step = props.step ?? .09;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); ttl.set(span(t, .08, .4)); rl.draw(glide(span(t, .1, .45)));
    let shown = 0;
    cells.forEach((c, i) => { const a = glide(span(t, s0 + i * step, .3)); if (a > .5) shown++; c.p.set({y: c.cy + (1 - a) * 22, opacity: ease(span(t, s0 + i * step, .16)), zoom: 1.18 - .18 * a}); c.no?.attr('opacity', a); c.gl?.attr('opacity', a).attr('transform', `translate(0 ${(1 - a) * 22})`); });
    ctr.select('tspan').text(props.counter === false ? '' : `${pad(shown)} / ${pad(n)}`); ring?.attr('opacity', ease(span(t, props.pickAt ?? 1.6, .25)));
  }};
}
