import {C, stage, picture, loadImages, span, glide, ease, easeIn} from '../../kit.js';

// A wall of pictures that bursts open: the frame starts tiled edge to edge with `images` (cols x rows, hairline paper
// gaps) and the tiles are pulled away one after another, alternately up and down and a touch smaller, in a seeded
// order, `step` s apart, showing what is underneath. For the first half second of a video: the wall is the first
// frame, the footage is what it opens onto. Props: images, cols, rows, startAt, step, out (s per tile), gap, order.
export const meta = {duration: 1.2, live: true};
export const defaults = {images: [], cols: 3, rows: 3, startAt: .06, step: .03, out: .2, gap: 6, order: null};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), cols = props.cols ?? 3, rows = props.rows ?? 3, n = cols * rows, gap = props.gap ?? 6, tw = (1080 - gap * (cols - 1)) / cols, th = (1920 - gap * (rows - 1)) / rows;
  const imgs = await loadImages(Array.from({length: n}, (_, i) => props.images?.[i % Math.max(1, props.images.length)] ?? null), 360, Math.round(360 * th / tw));
  const back = st.root.append('rect').attr('width', 1080).attr('height', 1920).attr('fill', C.paper), tints = ['wall', 'plaid', 'skin', 'shade', 'wine', 'hair'];
  const order = props.order ?? [4, 0, 8, 2, 6, 1, 7, 3, 5, 9, 10, 11].filter(i => i < n), rank = []; order.forEach((i, r) => { rank[i] = r; });
  const tiles = Array.from({length: n}, (_, i) => { const x = (i % cols) * (tw + gap), y = Math.floor(i / cols) * (th + gap); return {x, y, p: picture(st, st.root, {x, y, w: tw, h: th, image: imgs[i], tint: tints[i % 6], border: false}), r: rank[i] ?? i, dir: (i + Math.floor(i / cols)) % 2 ? 1 : -1}; });
  const s0 = props.startAt ?? .06, step = props.step ?? .03, out = props.out ?? .2;
  return {seek(t) {
    back.attr('opacity', 1 - ease(span(t, s0, step * 2)));
    for (const k of tiles) { const q = easeIn(span(t, s0 + k.r * step, out)) ; k.p.set({y: k.y + k.dir * q * 2100, zoom: 1 + q * .15, opacity: q >= 1 ? 0 : 1}); }
  }};
}
