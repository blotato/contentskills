import {C, series, burst, boxPath, scaleTo, span, spring, hash} from '../../kit.js';
import {card, toned, shout, label, counted, twoLine} from './_card.js';

// Bars that shoot up from an ink baseline and overshoot, each with halftone shading and its value
// lettered above; a burst pops behind the tallest.
export const meta = {duration: 3.6, live: true};
export const defaults = {title: 'Where creators earn', unit: 'Illustrative · percent', max: 50, suffix: '', clear: false, colors: series,
  items: [{label: 'Sponsors', value: 42}, {label: 'Products', value: 31}, {label: 'Ads', value: 14}, {label: 'Affiliates', value: 9}, {label: 'Tips', value: 4}]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, n = props.items.length, x0 = 90, slot = 820 / n, w = Math.min(150, slot * .62), base = 830, top = 360, colors = props.colors ?? series;
  const best = props.items.reduce((a, d, i) => d.value > props.items[a].value ? i : a, 0), full = d => (base - top) * Math.min(1, d.value / props.max);
  const names = props.items.map(d => twoLine(d.label, slot - 14, 34)), lsize = Math.min(...names.map(l => l.size));
  const star = burst(root.append('g').attr('transform', `translate(${x0 + best * slot + slot / 2} ${base - full(props.items[best]) - 48})`), 108, {fill: C.yellow, inner: C.white, points: 11, seed: 3, drop: 7, width: 6});
  const bars = props.items.map((d, i) => {
    const x = x0 + i * slot + (slot - w) / 2, bar = toned(stage, root, {fill: colors[i % colors.length], area: [x - 10, top - 80, w + 20, base - top + 90], from: [1, 1], reach: 1.1});
    label(root, x + w / 2, base + 22 + lsize, names[i].lines.join('\n'), {size: lsize, leading: 1.05});
    return {d, i, x, bar, value: shout(root, x + w / 2, 0, '', {size: i === best ? 66 : 54, color: i === best ? C.red : C.white})};
  });
  root.append('path').attr('d', `M70 ${base + 4}L930 ${base}`).attr('stroke', C.ink).attr('stroke-width', 9).attr('stroke-linecap', 'round');
  return {seek(t) {
    stage.intro(t);
    bars.forEach(({d, i, x, bar, value}) => {
      const q = span(t, .5 + i * .16, .6), h = Math.max(0, full(d) * spring(q)) + (q >= 1 ? Math.sin(t * 2.4 + i) * 2 : 0);
      bar.set(h > 3 ? boxPath(x, base - h, w, h, 3, i + 2) : ''); bar.g.attr('opacity', q > 0 ? 1 : 0);
      value.say(counted(d.value, Math.min(1, q * 1.4)) + (props.suffix ?? '')).attr('transform', `translate(0 ${base - h - 22})`).attr('opacity', q > .05 ? 1 : 0);
    });
    const bq = span(t, .5 + best * .16 + .35, .45); star.boil(t); scaleTo(star.g, spring(bq), Math.sin(t * 1.6) * 3);
  }};
}
