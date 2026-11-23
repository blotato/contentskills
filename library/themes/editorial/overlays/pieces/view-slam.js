import {C, F, stage, card, picture, label, text, loadImages, span, ease, glide, leave} from '../../kit.js';

// Which posts worked, in your face: up to three rows, each a cover thumbnail beside a HUGE serif figure that counts up
// as the row slams in (it lands a touch big, then settles). Rows land from the smallest to the biggest; the biggest
// lands last, turns the accent colour, gets a "Worked" flag and a small jolt. Use real figures only.
// Props: title, items [{label, value, image}], prefix, suffix, decimals, flag, first (time of the first slam), every, x, y (top), w, size, field.
export const meta = {duration: 2.2, live: true};
export const defaults = {title: 'Which reels *worked*', items: [{label: 'Reel one', value: 12.4}, {label: 'Reel two', value: 5.1}, {label: 'Reel three', value: 4.7}],
  prefix: '', suffix: 'M', decimals: 1, flag: 'Worked', first: .15, every: .32, x: 70, y: 270, w: 940, size: 150, field: 'paper'};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 270, w = props.w ?? 940, size = props.size ?? 150, rh = Math.round(size * 1.18), gap = 14;
  const items = (props.items ?? []).slice().sort((a, b) => b.value - a.value).slice(0, 3), n = items.length;
  const imgs = await loadImages(items.map(d => d.image ?? null), 240, 300);
  const fmt = v => `${props.prefix ?? ''}${v.toFixed(props.decimals ?? 1)}${props.suffix ?? ''}`, at = props.first ?? .15, every = props.every ?? .32, life = props.life ?? meta.duration;
  const tcd = card(st, st.root, {x, y, w, h: 78, field: props.field ?? 'paper', radius: 10}), ttl = text(tcd.body, x + 28, y + 56, String(props.title ?? '').replace(/\*/g, ''), {font: F.head, size: 54, color: tcd.f.fg});
  const rows = items.map((d, k) => {
    const ry = y + 92 + k * (rh + gap), cd = card(st, st.root, {x, y: ry, w, h: rh, field: props.field ?? 'paper', radius: 10}), f = cd.f, tw = Math.round(rh * .8);
    const pic = picture(st, cd.body, {x: x + 14, y: ry + 14, w: tw, h: rh - 28, image: imgs[k], tint: ['plaid', 'wall', 'skin'][k % 3], radius: 4});
    const fig = text(cd.body, x + tw + 44, ry + rh * .5 + size * .34, fmt(0), {font: F.serif, weight: 600, size, color: f.fg});
    const cap = label(cd.body, x + w - 26, ry + 46, d.label ?? '', {size: 24, color: f.sub, anchor: 'end'});
    let tag = null; if (k === 0 && props.flag) { tag = cd.body.append('g'); const fw = String(props.flag).length * 22 + 50; tag.append('rect').attr('x', x + w - 26 - fw).attr('y', ry + rh - 78).attr('width', fw).attr('height', 54).attr('rx', 3).attr('fill', f.accent); label(tag, x + w - 26 - fw / 2, ry + rh - 41, props.flag, {size: 28, weight: 700, track: .14, anchor: 'middle', color: f.bg}); }
    return {d, cd, f, pic, fig, cap, tag, ry, cx: x + w / 2, cy: ry + rh / 2, land: at + (n - 1 - k) * every};      // smallest first, the winner last
  });
  return {seek(t) {
    const out = leave(t, life, .24); tcd.set({a: span(t, 0, .3), b: out});
    for (const r of rows) {
      const u = t - r.land, a = span(u, 0, .16), s = u < 0 ? 1.4 : 1 + .4 * (1 - glide(span(u, 0, .16))) - .06 * Math.sin(Math.PI * span(u, .16, .14));
      const hero = r.tag != null, hot = hero ? ease(span(u, .18, .2)) : 0, jolt = hero && u > .14 && u < .34 ? Math.sin(u * 90) * 7 * (1 - span(u, .14, .2)) : 0;
      r.cd.g.attr('opacity', (ease(a) * (1 - out)).toFixed(3)).attr('transform', `translate(${(r.cx + jolt).toFixed(1)} ${r.cy}) scale(${s.toFixed(3)}) translate(${-r.cx} ${-r.cy})`);
      r.pic.set({zoom: 1.2 - .2 * glide(span(u, 0, .4))});
      r.fig.text(fmt(r.d.value * glide(span(u, 0, .42))));
      r.fig.attr('fill', hero ? (hot > .5 ? r.f.accent : r.f.fg) : r.f.fg);
      r.cap.attr('opacity', ease(span(u, .1, .2)));
      r.tag?.attr('opacity', hot).attr('transform', `translate(0 ${((1 - hot) * -14).toFixed(1)})`);
    }
  }};
}
