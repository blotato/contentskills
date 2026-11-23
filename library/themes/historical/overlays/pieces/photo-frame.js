import {stage, print, plate, tone, span, settle} from '../../kit.js';
import {live} from './_overlay.js';

// An archival print laid over the footage doing the documentary pan: the picture pushes in and its
// layers slide while the print itself turns a little. A year and a caption wipe on across its lower
// edge. (x, y) is the centre of the picture, w x h its size. `scene` picks the stand-in picture
// (city, portrait, landscape, ship, group, ruins); pass `image` for a real one.
export const meta = {duration: 5, live: true};
export const defaults = {scene: 'city', image: null, tone: 'silver', date: '1931', caption: 'Main street on market day', credit: 'Stand-in picture', x: 540, y: 340, w: 640, h: 400, tilt: -2.5, tapes: 2, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), pg = g.append('g');
  const pr = print(pg, props.w, props.h, {scene: props.scene, image: props.image, tone: props.tone, seed: 2, tapes: props.tapes, border: 24});
  const p = plate(g, {date: props.date, name: props.caption, sub: props.credit, fill: tone(props.color), scale: .82});
  p.g.attr('transform', `translate(${-pr.w / 2 - 20} ${pr.h / 2 - p.h * .62})`);
  return {seek(t) {
    const x = live(st, t, props), q = t / (props.life ?? meta.duration), e = settle(span(t, 0, 1.2));
    g.attr('transform', `translate(${props.x} ${props.y + 40 * x})`); pr.pan(q, {dx: 60, zoom: .12});
    pg.attr('transform', `translate(${10 * q} ${-6 * q + 20 * (1 - e)}) rotate(${props.tilt + 1.2 * q}) scale(${.96 + .04 * e + .03 * q})`).attr('opacity', span(t, 0, .6));
    p.reveal(t, .7);
  }};
}
