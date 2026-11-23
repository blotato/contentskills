import {C, F, stage, print, bar, fit, up, tone, span, settle} from '../../kit.js';
import {live, float, strip} from './_overlay.js';

// A portrait name plate: a small taped portrait print beside the person's name on a crimson bar,
// their dates typed on a dark strip and a line about them in serif. For someone the speaker
// mentions. (x, y) is the top-left; pass `image` for a real portrait.
export const meta = {duration: 4.5, live: true};
export const defaults = {name: 'ALEX RIVERA', dates: '1904 – 1987', role: 'Surveyor and letter writer', x: 60, y: 150, scene: 'portrait', image: null, tone: 'silver', color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), pw = 210, ph = 262, pg = g.append('g');
  const pr = print(pg, pw, ph, {scene: props.scene, image: props.image, tone: props.tone, seed: 6, border: 16, tapes: 1});
  const tx = pr.w + 6, room = 1080 - props.x - tx - 70, name = bar(g, props.name, {size: fit(up(props.name), room - 50, 58, {weight: 700, spacing: .04}), fill: tone(props.color), weight: 700, seed: 3});
  const dates = props.dates ? strip(g, props.dates, {size: 32, seed: 4, spacing: .08}) : null, role = props.role ? bar(g, props.role, {size: fit(props.role, room - 80, 34, {font: F.italic, weight: 400, spacing: .01}), fill: 'glass', font: F.italic, weight: 400, caps: false, spacing: .01, seed: 5}) : null;
  name.g.attr('transform', `translate(${tx} ${pr.h * .36})`); dates?.g.attr('transform', `translate(${tx + 30} ${pr.h * .36 - name.h / 2 - dates.h / 2 + 3})`); role?.g.attr('transform', `translate(${tx + 44} ${pr.h * .36 + name.h / 2 + role.h / 2 - 3})`);
  return {seek(t) {
    const x = live(st, t, props), q = t / meta.duration; g.attr('transform', float(t, x, props.x, props.y, {dx: 4}));
    pr.pan(q, {dx: 14, zoom: .1}); pg.attr('transform', `translate(${pr.w / 2} ${pr.h / 2}) rotate(${-3.5 + q}) scale(${.94 + .06 * settle(span(t, 0, 1))})`).attr('opacity', span(t, 0, .5));
    dates?.set(span(t, .7, 1)); name.reveal(span(t, .3, .8)); role?.reveal(span(t, .9, .8));
  }};
}
