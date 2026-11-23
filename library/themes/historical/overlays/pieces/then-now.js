import {C, stage, print, bar, tone, span, settle} from '../../kit.js';
import {live} from './_overlay.js';

// Then and now, side by side: two small prints leaning toward each other, the old one silver and
// the new one in a cooler tone, each with its label and date on bars, and a crimson rule running
// from one to the other. `y` is the centre line. Pass `image` on either side for real pictures.
export const meta = {duration: 5, live: true};
export const defaults = {
  then: {label: 'THEN', date: '1920', scene: 'city', tone: 'sepia', image: null}, now: {label: 'NOW', date: 'TODAY', scene: 'city', tone: 'blue', image: null},
  y: 350, w: 430, h: 330, gap: 70, color: 'crimson',
};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), {w, h} = props, off = (w + props.gap) / 2 + 12;
  const linkAt = () => g.append('path').attr('stroke', C.crimson).attr('stroke-width', 7).attr('stroke-dasharray', '16 10');
  const sides = [props.then, props.now].map((d, i) => { const s = g.append('g'), pg = s.append('g'), pr = print(pg, w, h, {scene: d.scene, tone: d.tone, image: d.image, seed: 3 + i * 2, border: 18, tapes: 1});
    const label = bar(s, d.label, {size: 46, fill: i ? tone(props.color) : 'char', weight: 700, seed: i + 2}), date = d.date ? bar(s, d.date, {size: 34, fill: 'glass', seed: i + 5, spacing: .08}) : null;
    label.g.attr('transform', `translate(${-pr.w / 2 - 8} ${pr.h / 2 - 8})`); date?.g.attr('transform', `translate(${-pr.w / 2 + 30} ${pr.h / 2 - 8 + label.h / 2 + date.h / 2 - 3})`); return {s, pg, pr, label, date}; });
  const link = linkAt();
  return {seek(t) {
    const x = live(st, t, props), q = t / (props.life ?? meta.duration); g.attr('transform', `translate(540 ${props.y + 40 * x})`);
    sides.forEach(({s, pg, pr, label, date}, i) => { const at = i * .7, e = settle(span(t, at, 1)), sgn = i ? 1 : -1;
      s.attr('transform', `translate(${sgn * (off + 3 * q)} ${18 * (1 - e)})`).attr('opacity', span(t, at, .5)); pg.attr('transform', `rotate(${sgn * (2.6 - .6 * q)}) scale(${.96 + .04 * e})`);
      pr.pan(q, {dx: 30 * -sgn, zoom: .1}); label.reveal(span(t, at + .5, .8)); date?.reveal(span(t, at + .8, .8)); });
    const lq = settle(span(t, 1.1, .8)); link.attr('d', `M${-props.gap / 2 - 34} ${-h * .12}h${(props.gap + 68) * lq}`).attr('opacity', lq ? 1 : 0);
  }};
}
