import {C, stage, card, label, rule, loadImages, mix, span, ease, glide, smooth, leave} from '../../kit.js';

// A real screenshot on a paper card: the card rises in showing the whole screen, then the camera pushes in on one
// region of it (`focus`, as shares of the image) and keeps drifting slowly, with a crimson outline settling on that
// region. For showing the actual tool, e.g. the editor's review page for this very video.
// Props: image (url), label, labelSize, kicker, focus {x, y, w, h} (0..1 of the image), pushAt, pushFor, drift, x, y (top), w, field.
export const meta = {duration: 2, live: true};
export const defaults = {image: '', label: 'The edit', kicker: 'This video', focus: {x: .33, y: .64, w: .42, h: .34}, pushAt: .5, pushFor: .6, drift: .06,
  x: 70, y: 280, w: 940, aspect: 1.72, field: 'paper'};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 280, w = props.w ?? 940, pd = 22, head = 58, A = props.aspect ?? defaults.aspect;
  const iw = w - pd * 2, ih = Math.round(iw / A), h = head + ih + pd;
  const [src] = await loadImages([props.image], Math.round(iw * 3), Math.round(iw * 3 / A));
  const cd = card(st, st.root, {x, y, w, h, field: props.field ?? 'paper', radius: 10}), f = cd.f;
  const lb = label(cd.body, x + pd + 4, y + 42, props.label ?? '', {size: props.labelSize ?? 24, color: f.fg, track: .12}), kk = label(cd.body, x + w - pd - 4, y + 40, props.kicker ?? '', {size: 24, color: f.accent, anchor: 'end'});
  const ix = x + pd, iy = y + head, cid = st.uid('scr');
  st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', ix).attr('y', iy).attr('width', iw).attr('height', ih).attr('rx', 4);
  const win = cd.body.append('g').attr('clip-path', `url(#${cid})`);
  win.append('rect').attr('x', ix).attr('y', iy).attr('width', iw).attr('height', ih).attr('fill', '#FFFFFF');
  const pic = src ? win.append('image').attr('href', src).attr('preserveAspectRatio', 'none') : null;
  const ring = win.append('rect').attr('fill', 'none').attr('stroke', C.crimson).attr('stroke-width', 5).attr('rx', 6);
  const F0 = props.focus ?? defaults.focus, k1 = Math.max(1, Math.min(1 / F0.w, 1 / F0.h) * .92), life = props.life ?? meta.duration;
  const pushAt = props.pushAt ?? .5, pushFor = props.pushFor ?? .6, drift = props.drift ?? .06;
  return {seek(t) {
    cd.set({a: span(t, 0, .38), b: leave(t, life, .26)}); lb.attr('opacity', ease(span(t, .1, .3))); kk.attr('opacity', ease(span(t, .16, .3)));
    // scale and centre: whole screen, then the focus region, then a slow drift further in
    const q = smooth(span(t, pushAt, pushFor)), d = span(t, pushAt + pushFor, Math.max(.01, life - pushAt - pushFor));
    const k = mix(1, k1, q) * (1 + drift * d), cx = mix(.5, F0.x + F0.w / 2, q), cy = mix(.5, F0.y + F0.h / 2, q);
    const W = iw * k, H = ih * k, px = ix + iw / 2 - cx * W, py = iy + ih / 2 - cy * H;
    const clampX = v => Math.min(ix, Math.max(ix + iw - W, v)), clampY = v => Math.min(iy, Math.max(iy + ih - H, v)), X = clampX(px), Y = clampY(py);
    pic?.attr('x', X.toFixed(1)).attr('y', Y.toFixed(1)).attr('width', W.toFixed(1)).attr('height', H.toFixed(1));
    const r = ease(span(t, pushAt + pushFor * .7, .3));
    ring.attr('x', (X + F0.x * W).toFixed(1)).attr('y', (Y + F0.y * H).toFixed(1)).attr('width', (F0.w * W).toFixed(1)).attr('height', (F0.h * H).toFixed(1)).attr('opacity', r);
  }};
}
