import {C, F, stage, up, oneLine, fit, capH, measure, txt, typed, glyphs, arrive, bar, rule, print, scenes, cornerLabels, cardMove, span, settle} from '../../kit.js';
import {toneFor} from './_cards.js';

// Two words stacked either side of a long panoramic print: the top word sets from the left above it,
// the bottom word from the right below it, both biting into the paper edge. A caption bar, a serif
// note and two small plate marks. `scene` picks the stand-in photograph; `image` shows a real one.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  top: 'BEFORE', bottom: 'AFTER', caption: 'ONE STREET,\nTWO CENTURIES', note: 'The same corner,\nseen twice',
  labels: ['PART TWO', 'PLACES', 'FIELD NOTES', 'PG. 04'], marks: ['A', 'B'], image: null, art: null, scene: 'landscape', field: 'night',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, k, sq} = st, m = 84, top = up(props.top), bottom = up(props.bottom), o = {weight: 700};
  const ph = H * (sq ? .24 : .25), pw = W * .86, cy = H * .5, hk = sq ? .15 : .19, size = Math.min(fit(top, W - m * 2, H * hk, o), fit(bottom, W - m * 2, H * hk, o)), cap = capH(size, o);
  const pg = root.append('g'), pr = print(pg, pw, ph, {scene: scenes.includes(props.art) ? props.art : props.scene, image: props.image, seed: 9, tone: toneFor(props.field), tapes: 2});
  const ya = cy - ph / 2 - 34 + cap * .22, yb = cy + ph / 2 + 34 + cap * .78;
  const A = glyphs(root, top, m, ya, size, {color: ink.text}), B = glyphs(root, bottom, W - m, yb, size, {anchor: 'end', color: ink.text});
  const ra = rule(root, m, ya - cap - 34, W - m, {color: ink.dim, every: 60, opacity: .7}), rb = rule(root, m, yb + 40, W - m, {color: ink.dim, every: 60, opacity: .7});
  const marks = (props.marks ?? []).slice(0, 2).map((s, i) => s ? txt(root, i ? W - m : m, i ? yb + 40 + 52 : ya - cap - 34 - 26, `[ ${up(s)} ]`, {size: 30 + 6 * k, font: F.type, weight: 400, color: ink.accent === C.bone ? C.bone : C.red, anchor: i ? 'end' : 'start'}) : null);
  const note = txt(root, W - m, ya - cap - 34 - 86 * (.7 + .3 * k), props.note, {size: 30 + 8 * k, font: F.italic, weight: 400, anchor: 'end', color: ink.sub, spacing: .01});
  const cap2 = props.caption ? bar(root, props.caption, {size: 34 + 8 * k, fill: ink.bar}) : null, corners = cornerLabels(st, props.labels);
  cap2?.g.attr('transform', `translate(${m} ${yb + 40 + 70 * (.7 + .3 * k)})`);
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    const q = t / meta.duration; pr.pan(q, {dx: 90}); pg.attr('transform', `translate(${W / 2 - 16 * q} ${cy}) rotate(${1.6 - .4 * q}) scale(${1 + .03 * q})`).attr('opacity', settle(span(t, 0, 1)));
    A.forEach(u => arrive(u, span(t, .4 + u.i * .04, .7))); B.forEach(u => arrive(u, span(t, .9 + (u.n - 1 - u.i) * .04, .7)));
    ra.attr('opacity', .7 * span(t, .3, .6)); rb.attr('opacity', .7 * span(t, .8, .6)); marks.forEach((n, i) => n?.attr('opacity', span(t, .9 + i * .5, .4)));
    note.attr('opacity', span(t, 1.5, .6)); cap2?.reveal(span(t, 1.7, .7)); corners(t, .8);
  }};
}
