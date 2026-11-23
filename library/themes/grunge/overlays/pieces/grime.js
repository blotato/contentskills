import {C, stage, up, txt, cracks, dust, hold, presence} from '../../kit.js';

// The base wear for footage: plaster cracks creeping in from the corners, dust, hairs and
// scratches that change eight times a second, burnt edges, and one typed label top left.
export const meta = {duration: 5, live: true};
export const defaults = {label: 'TAPE 04 / SIDE B', sub: 'COPY OF A COPY', cracks: 9, dust: 60, edge: .55, seed: 3};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true, seed: props.seed}), {svg, defs, under, fine, W, H, id} = st;
  const vg = defs.append('radialGradient').attr('id', id + '-edge').attr('cx', .5).attr('cy', .5).attr('r', .8);
  vg.append('stop').attr('offset', .55).attr('stop-color', '#000').attr('stop-opacity', 0); vg.append('stop').attr('offset', 1).attr('stop-color', '#000').attr('stop-opacity', props.edge);
  under.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id}-edge)`);
  const veins = [0, 1, 2].map(i => cracks(under, W, H, {seed: props.seed + 5, n: props.cracks, color: C.white, opacity: .5}).attr('transform', `translate(${i - 1} ${(i * 7) % 3 - 1})`));
  const specks = dust(under.append('g'), W, H, {color: C.white, n: props.dust, seed: props.seed, opacity: .8});
  const label = txt(fine, 56, 96, up(props.label), {size: 30, shade: true}), sub = txt(fine, 56, 134, up(props.sub), {size: 26, shade: true});
  return {seek(t) {
    const s = st.tick(t), o = presence(t, props.life);
    svg.attr('opacity', o); specks.set(s); veins.forEach((v, i) => v.attr('display', i === s % 3 ? null : 'none'));
    label.attr('opacity', hold(t) >= .3 ? 1 : 0); sub.attr('opacity', hold(t) >= .5 ? 1 : 0);
  }};
}
