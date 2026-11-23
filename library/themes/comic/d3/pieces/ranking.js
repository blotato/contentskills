import {C, series, up, fit, measure, slabPath, spark, scaleTo, span, spring, easeOut} from '../../kit.js';
import {card, toned, shout, label, counted} from './_card.js';

// A league table: numbered ink discs pop down the left, slabs punch out to the right with
// overshoot and their values count up at the tip. The leader gets a spark.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Top formats', unit: 'Illustrative · average watch time, seconds', suffix: 's', clear: false, colors: series,
  items: [{label: 'Tutorials', value: 48}, {label: 'Story time', value: 41}, {label: 'Reviews', value: 33}, {label: 'Vlogs', value: 24}, {label: 'Unboxings', value: 17}]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, n = props.items.length, top = 262, row = (930 - top) / n, bh = Math.min(64, row * .46), x0 = 170, maxW = 620, max = Math.max(...props.items.map(d => d.value)), colors = props.colors ?? series;
  const rows = props.items.map((d, i) => {
    const y = top + i * row, by = y + row - bh - 14, g = root.append('g');
    const name = label(g, x0, by - 12, d.label, {size: Math.min(38, row * .3, fit(up(d.label), 640, 38, {role: 'slab'})), anchor: 'start'});
    const bar = toned(stage, g, {fill: colors[i % colors.length], area: [x0 - 10, by - 10, maxW + 40, bh + 20], from: [1, .5], reach: .8, pitch: 18});
    const disc = g.append('g').attr('transform', `translate(108 ${by + bh / 2 - 6})`).append('g');
    disc.append('circle').attr('r', 38).attr('fill', C.ink).attr('cx', 6).attr('cy', 6); disc.append('circle').attr('r', 38).attr('fill', i ? C.white : C.yellow).attr('stroke', C.ink).attr('stroke-width', 6);
    shout(disc, -2, 17, String(i + 1), {size: 50, color: i ? C.white : C.red});
    return {d, i, by, name, bar, disc, w: maxW * d.value / max, value: shout(g, 0, by + bh / 2 + 19, '', {size: 52, color: C.white, anchor: 'start'})};
  });
  const star = spark(root, 0, 0, 30, C.yellow);
  return {seek(t) {
    stage.intro(t);
    rows.forEach(({d, i, by, name, bar, disc, w, value}) => {
      const at = .45 + i * .22, q = span(t, at + .12, .55), ww = Math.max(0, w * spring(q));
      scaleTo(disc, spring(span(t, at, .4)), 0); name.attr('opacity', span(t, at + .05, .15)).attr('transform', `translate(${-30 * (1 - easeOut(span(t, at + .05, .3)))} 0)`);
      bar.set(ww > 4 ? slabPath(x0, by, ww, bh, 18) : ''); bar.g.attr('opacity', q > 0 ? 1 : 0);
      value.say(counted(d.value, Math.min(1, q * 1.5)) + (props.suffix ?? '')).attr('transform', `translate(${x0 + ww + 16} 0)`).attr('opacity', q > .05 ? 1 : 0);
    });
    const r = rows[0], end = x0 + r.w + 22 + measure(r.d.value + (props.suffix ?? ''), 52) + 40;
    star.node().parentNode.setAttribute('transform', `translate(${Math.min(940, end)} ${r.by - 4})`);
    scaleTo(star, spring(span(t, 1.3, .4)) * (1 + .2 * Math.sin(t * 6)), t * 60);
  }};
}
