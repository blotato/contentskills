import {C, stage, look, tone, up, fit, capH, glyphs, pose, typeOn, txt, sheet, cornerLabels, reveal, hold, span, slam, jit, jtf, easeOut} from '../../kit.js';

// Two sides: a sheet of bone paper is dragged down over the top half with one word in black; the
// other word is typed on the bare wall below in the accent; a scrap with the mark is stamped on the tear.
export const meta = {duration: 4.5, live: true};
export const defaults = {a: 'FAST', b: 'PERFECT', mark: 'VS', aNote: 'SHIPS TODAY', bNote: 'SHIPS SOMEDAY', labels: ['ROUND\nONE', 'PICK\nA SIDE', 'NO TIES'], accents: ['red', 'bone']};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, m = 64, hot = tone(look(props.accents?.[0]).accent), a = up(props.a), b = up(props.b);
  const size = Math.min(fit([a, b], W - m * 2, 320), H * .13 / capH(1)), cap = capH(size);
  const upper = root.append('g'); sheet(upper, {fill: C.bone, seed: 4, sides: 'b', amp: 22, step: 16}).set(-40, -H, W + 80, H + H / 2 - 10);
  const ua = glyphs(upper, a, W / 2, H * .27 + cap / 2, size, {by: 'all', anchor: 'middle', color: C.soot})[0], an = txt(upper, W / 2, H * .27 + cap / 2 + 70, up(props.aNote), {size: 34, anchor: 'middle', color: C.ash});
  const ub = glyphs(root, b, W / 2, H * .73 + cap / 2, size, {anchor: 'middle', color: hot}), bn = txt(fine, W / 2, H * .73 + cap / 2 + 70, up(props.bNote), {size: 34, anchor: 'middle', color: C.paper});
  const vs = root.append('g'), vi = vs.append('g'), r = Math.min(150, H * .09); sheet(vi, {fill: C.soot, seed: 7, amp: 8, rim: C.white}).set(-r, -r * .8, r * 2, r * 1.6);
  txt(vi, 0, capH(r * .95) / 2, up(props.mark), {size: fit(up(props.mark), r * 1.5, r * .95), role: 'head', color: hot, anchor: 'middle'});
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]], {color: C.dust, accent: C.red});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .1, .4)), j = jit(s, 1, 2, .25);
    upper.attr('transform', `translate(${j.x} ${-(1 - q) * H * .6 + j.y}) rotate(${-1.5 + j.r} ${W / 2} ${H / 2})`);
    pose(ua, {o: h >= .55 ? 1 : 0, sx: h >= .55 && h < .65 ? 1.12 : 1}); an.attr('opacity', h >= .8 ? 1 : 0);
    typeOn(ub, span(h, 1, .12 + ub.length * .06), s, {seed: 3}); bn.attr('opacity', h >= 1.2 + ub.length * .06 ? 1 : 0);
    const k = slam(t, 1.9); vs.attr('transform', jtf(W / 2, H / 2, s, 6, {tilt: 7, scale: k.s, amp: 2 + k.hit * 8, rot: .6 + k.hit * 2})).attr('opacity', k.o);
    reveal(corners, t, .2);
  }};
}
