import {C, stage, look, up, fit, capH, glyphs, pose, txt, brush, rip, scribble, scrawl, cornerLabels, hash, hold, span, slam, jit} from '../../kit.js';

// A countdown cut like a film leader: each number is stamped down on its beat with a marker ring
// thrown round it and a rip flashing across the cut; the last beat is the word, black on a brush stroke.
export const meta = {duration: 4};
export const defaults = {from: 3, go: 'GO', label: 'STARTING IN', note: 'GET READY', labels: ['STAND BY', 'ON AIR\nSOON', 'TAKE 01'], accents: ['red', 'bone', 'lime']};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, fine, W, H} = st, steps = props.from + 1, step = meta.duration / steps, cy = H * .5, o = {role: 'cond'}, accents = props.accents ?? ['red'];
  const beats = Array.from({length: steps}, (_, i) => {
    const last = i === steps - 1, ink = look(accents[i % accents.length]), value = last ? up(props.go) : String(props.from - i), g = root.append('g');
    const size = Math.min(fit(value, W * (last ? .74 : .5), 1100, o), H * .4 / capH(1, o)), cap = capH(size, o), r = Math.min(W * .42, cap * .78);
    if (last) g.append('path').attr('d', brush(W * .08, cy - cap * .68, W * .84, cap * 1.36, {seed: 3, dry: 5})).attr('fill', look(accents[0]).accent).attr('fill-rule', 'evenodd');
    const ring = last ? null : scrawl(g, sd => scribble.circle(W / 2, cy, r, r, sd), {color: i % 2 ? ink.accent : C.bone, width: 12, seed: i + 2});
    const unit = glyphs(g, value, W / 2, cy + cap / 2, size, {by: 'all', anchor: 'middle', ...o, color: last ? C.soot : ink.accent})[0];
    return {g, unit, ring};
  });
  const tear = root.append('path').attr('fill', C.white), label = txt(fine, W / 2, H * .14, up(props.label), {size: 40, anchor: 'middle'}), note = txt(fine, W / 2, H * .88, up(props.note), {size: 34, anchor: 'middle', color: C.paper});
  const corners = cornerLabels(fine, st, [props.labels?.[0], props.labels?.[1], '', props.labels?.[2]]);
  return {seek(t) {
    const s = st.tick(t), h = hold(t), b = Math.min(steps - 1, Math.floor(t / step)), local = t - b * step;
    beats.forEach((beat, i) => {
      beat.g.attr('opacity', i === b ? 1 : 0); if (i !== b) return;
      const k = slam(local, .04), j = jit(s, i, 2 + k.hit * 10, .4 + k.hit * 2);
      pose(beat.unit, {x: j.x, y: j.y, sx: k.s, rot: j.r + (hash(i, 3) - .5) * 5, o: k.o}); beat.ring?.draw(span(hold(local), .2, .3), s);
    });
    tear.attr('d', local < .1 && b > 0 ? rip(-20, H * (.3 + .4 * hash(b, 1)), W + 20, H * (.3 + .4 * hash(b, 2)), {seed: b + 4, thick: 30, amp: 30}) : '');
    label.attr('opacity', b < steps - 1 ? 1 : 0); note.attr('opacity', h >= .3 ? 1 : 0); corners.forEach(c => c.attr('opacity', 1));
  }};
}
