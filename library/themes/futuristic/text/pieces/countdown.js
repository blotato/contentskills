import {theme, textStage, look, up, fit, capH, glyphs, slam, txt, readouts, plate, streak, gradient, appear, span, easeOut, clamp} from '../kit.js';

// A countdown: each number slams in led by the next accent as a scan line sweeps up the frame,
// while a ring around it runs down. The final beat is the `go` word on a filled plate with a
// burst of streaks. It counts from `from` and always fills the piece's duration.
export const meta = {duration: 4};
export const defaults = {from: 3, go: 'GO', label: 'STARTING IN', note: 'GET READY', labels: ['STAND BY', 'ON AIR\nSOON', 'TAKE 01'], accents: ['cyan', 'magenta', 'amber']};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accents[0], frame: false}), {root, W, H, k} = stage, steps = props.from + 1, step = meta.duration / steps, cy = H * .5;
  const beats = Array.from({length: steps}, (_, i) => {
    const ink = look(props.accents[i % props.accents.length]), last = i === steps - 1, value = last ? up(props.go) : String(props.from - i), g = root.append('g');
    const size = fit(value, W * (last ? .74 : .5), H * .44), cap = capH(size), r = Math.min(W * .43, cap * .9), len = 2 * Math.PI * r;
    const scan = g.append('g'); scan.append('rect').attr('width', W).attr('height', 260).attr('fill', gradient(stage, [[ink.accent, .35], [ink.accent, 0]], -90)); scan.append('rect').attr('width', W).attr('height', 8).attr('fill', ink.accent);
    const rays = last ? Array.from({length: 10}, () => streak(g, stage, ink.accent)) : [], slab = last ? plate(g, {fill: ink.accent, cut: 40}) : null;
    const track = last ? null : g.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', ink.dim).attr('stroke-width', 3).attr('stroke-dasharray', '4 14');
    const ring = last ? null : g.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 12).attr('stroke-dasharray', len).attr('transform', `rotate(-90 ${W / 2} ${cy})`);
    const word = glyphs(g, value, W / 2, cy + cap / 2, size, {by: 'all', anchor: 'middle', color: last ? ink.on : ink.head, echo: !last})[0];
    const label = txt(g, W / 2, last ? cy - cap / 2 - 60 - 56 : cy - r - 60 * k - 20, up(last ? props.note : props.label), {size: 44, color: ink.text, anchor: 'middle', spacing: .2});
    const frame = g.append('path').attr('d', theme.frame(26, 26, W - 52, H - 52, 64)).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 4);
    readouts(g, props.labels, 112, {color: ink.text});
    return {g, scan, ring, track, len, word, rays, slab, label, r, frame, pw: word.w + 120, ph: cap + 120};
  });
  return {
    seek(t) {
      const at = clamp(Math.floor(t / step), 0, steps - 1);
      beats.forEach((b, i) => {
        const u = t - i * step; b.g.attr('display', i === at ? null : 'none');
        const w = span(u, 0, .4); b.scan.attr('transform', `translate(0 ${H * (1 - easeOut(w)) - 8})`).attr('opacity', w < 1 ? 1 - w * w : 0);
        slam(b.word, span(u, .02, .5), 0, {from: 3.2}); b.label.attr('opacity', appear(u, .12)); b.frame.attr('opacity', appear(u, 0, .2));
        if (b.ring) { b.ring.attr('stroke-dashoffset', b.len * clamp(u / step)).attr('opacity', span(u, .1, .1)).attr('stroke-width', 12 + 30 * (1 - easeOut(span(u, .1, .3)))); b.track.attr('opacity', span(u, .1, .1)); }
        if (b.slab) { const p = easeOut(span(u, 0, .3)); b.slab.set(W / 2 - b.pw / 2 * p, cy - b.ph / 2, b.pw * p, b.ph); }
        b.rays.forEach((ray, j) => { const p = span(u, .05 + (j % 3) * .04, .7), a = j * 36 + 12, d = b.r * 1.1 + easeOut(p) * H * .3, rad = a * Math.PI / 180; ray.set(W / 2 + Math.cos(rad) * d, cy + Math.sin(rad) * d, 20, 220 * (1 - p) + 40, a, p > 0 ? 1 - p * p : 0); });
      });
    },
  };
}
