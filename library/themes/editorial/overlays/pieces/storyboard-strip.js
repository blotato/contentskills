import {C, F, stage, card, picture, label, folio, rule, line, text, typed, pad, loadImages, mix, span, ease, glide, smooth, leave} from '../../kit.js';

// The storyboard, shot by shot: a paper card with a row of small frames; the current shot is shown large beneath
// with its number and title, and changes at each `steps` time (a soft glide); an editor's note in italic types on
// beside a wine margin rule and is ticked off as `done`. Props: title, kicker, shots [{title}], images, steps
// [{shot, at}], note {text, at, seconds, done}, x, y (top), w, big (width of the large frame), field.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'The *storyboard*', kicker: 'For approval', shots: [{title: 'Hook'}, {title: 'Proof'}, {title: 'Demo'}, {title: 'Turn'}, {title: 'Payoff'}, {title: 'Ask'}], images: [],
  steps: [{shot: 0, at: .5}, {shot: 1, at: 1.3}, {shot: 2, at: 1.8}, {shot: 3, at: 2.3}], note: {text: 'Tighter here', at: 2.7, seconds: .6, done: 'Applied'}, x: 70, y: 470, w: 940, big: 330, field: 'paper'};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 70, y = props.y ?? 470, w = props.w ?? 940, pd = 36, shots = props.shots ?? [], n = shots.length, gap = 12, R = 16 / 9;
  const tw = (w - pd * 2 - gap * (n - 1)) / n, th = tw * R * .78, bw = props.big ?? 330, bh = bw * R * .86, top = 112, by0 = y + top + th + 56, h = by0 - y + bh + 36;
  const [small, large] = await Promise.all([loadImages((props.images ?? []).slice(0, n), 200, Math.round(200 * R * .78)), loadImages((props.images ?? []).slice(0, n), 440, Math.round(440 * R * .86))]);
  const cd = card(st, st.root, {x, y, w, h, field: props.field}), f = cd.f, tints = ['wall', 'plaid', 'skin', 'shade', 'wine', 'hair'];
  const ttl = line(st, cd.body, props.title, x + pd, y + 76, 64, {color: f.fg, accent: f.accent}), kk = label(cd.body, x + w - pd, y + 66, props.kicker, {size: 28, color: f.sub, anchor: 'end'}), rl = rule(cd.body, x + pd, y + 94, x + w - pd, y + 94, {color: f.fg});
  const cells = shots.map((s, i) => { const cx = x + pd + i * (tw + gap), cy = y + top; return {cx, cy, p: picture(st, cd.body, {x: cx, y: cy, w: tw, h: th, image: small[i] ?? null, tint: tints[i % 6]}), no: folio(cd.body, cx, cy + th + 30, pad(i + 1), {size: 26, color: f.sub})}; });
  const mark = cd.body.append('rect').attr('y', y + top - 5).attr('width', tw + 10).attr('height', th + 10).attr('fill', 'none').attr('stroke', C.crimson).attr('stroke-width', 5);
  const bigs = shots.map((s, i) => picture(st, cd.body, {x: x + pd, y: by0, w: bw, h: bh, image: large[i] ?? null, tint: tints[i % 6]}).set({opacity: 0}));
  const ix = x + pd + bw + 40, num = text(cd.body, ix, by0 + 150, '01', {font: F.serif, weight: 500, size: 170, color: f.accent}), nm = text(cd.body, ix, by0 + 232, '', {font: F.head, size: 72, color: f.fg});
  const note = props.note, ny = by0 + bh - 130, nr = note ? rule(cd.body, ix, ny, ix, ny + 120, {color: C.crimson, width: 5}) : null;
  const nl = note ? label(cd.body, ix + 24, ny + 26, 'Note', {size: 26, color: f.sub}) : null, ntx = note ? text(cd.body, ix + 24, ny + 96, '', {font: F.italic, size: 62, color: f.fg}) : null;
  const steps = (props.steps ?? []).slice().sort((a, b) => a.at - b.at), life = props.life ?? meta.duration;
  return {seek(t) {
    cd.set({a: span(t, 0, .4), b: leave(t, life, .28)}); ttl.set(span(t, .08, .4)); rl.draw(glide(span(t, .1, .45)));
    cells.forEach((c, i) => { const a = glide(span(t, .2 + i * .06, .3)); c.p.set({y: c.cy + (1 - a) * 20, opacity: ease(span(t, .2 + i * .06, .16))}); c.no.attr('opacity', a); });
    let k = -1; steps.forEach((s, i) => { if (t >= s.at) k = i; });
    const cur = k < 0 ? null : steps[k], prev = k > 0 ? steps[k - 1] : null, q = cur ? glide(span(t, cur.at, .3)) : 0;
    bigs.forEach((b, i) => b.set({opacity: cur && i === cur.shot ? q : prev && i === prev.shot ? 1 - q : 0, zoom: cur && i === cur.shot ? 1.1 - .1 * q : 1}));
    const mx = cur ? mix(prev ? cells[prev.shot].cx : cells[cur.shot].cx, cells[cur.shot].cx, smooth(span(t, cur.at, .26))) : 0; mark.attr('x', mx - 5).attr('opacity', cur ? (prev ? 1 : q) : 0);
    num.text(cur ? pad(cur.shot + 1) : '').attr('opacity', q); nm.text(cur ? shots[cur.shot].title ?? '' : '').attr('opacity', q);
    if (note) { const a = note.at ?? 2.7, d = t >= a + (note.seconds ?? .6) + .25; nr.draw(glide(span(t, a - .1, .3))); nl.attr('opacity', ease(span(t, a - .05, .2))); nl.select('tspan').text((d ? note.done ?? 'Applied' : 'Note').toUpperCase()); nl.attr('fill', d ? C.crimson : f.sub); ntx.text(typed(note.text, span(t, a, note.seconds ?? .6))); }
  }};
}
