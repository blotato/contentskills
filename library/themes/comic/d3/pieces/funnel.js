import {C, series, comma, span, spring, easeOut} from '../../kit.js';
import {card, toned, shout, label, twoLine} from './_card.js';

// A funnel of inked slabs that drop into place from the top, each narrower than the last, with the
// share that is left shouted inside and the count beside it. The slabs keep breathing.
export const meta = {duration: 4.6, live: true};
export const defaults = {title: 'From view to sale', unit: 'Illustrative · people', clear: false, colors: series,
  stages: [{label: 'Saw the video', value: 10000}, {label: 'Opened profile', value: 2400}, {label: 'Clicked the link', value: 600}, {label: 'Bought', value: 90}]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, S = props.stages, n = S.length, cx = 330, top = 270, gap = 16, h = (650 - gap * (n - 1)) / n, W = k => 500 - k * (330 / n), first = S[0].value, colors = props.colors ?? series;
  const rows = S.map((d, i) => {
    const y = top + i * (h + gap), a = W(i) / 2, b = W(i + 1) / 2, share = d.value / first * 100, g = root.append('g').attr('transform', `translate(${cx} ${y + h / 2})`).append('g');
    toned(stage, g, {fill: colors[i % colors.length], area: [-a - 10, -h / 2 - 10, a * 2 + 20, h + 20], from: [1, 1], reach: .8, pitch: 20}).set(`M${-a} ${-h / 2}L${a} ${-h / 2 + 4}L${b} ${h / 2}L${-b} ${h / 2 - 3}Z`);
    const pct = shout(g, 0, 24, '', {size: Math.min(72, h * .6), color: C.white}), info = root.append('g');
    const lead = info.append('path').attr('d', `M${cx + (a + b) / 2 + 16} ${y + h / 2}H624`).attr('stroke', C.ink).attr('stroke-width', 5).attr('stroke-dasharray', '3 11').attr('stroke-linecap', 'round');
    const nm = twoLine(d.label, 285, 34, {role: 'slab'}, 28); label(info, 640, y + h / 2 - 8 - (nm.lines.length - 1) * nm.size * 1.05, nm.lines.join('\n'), {size: nm.size, anchor: 'start', leading: 1.05});
    return {d, g, pct, info, share, at: .45 + i * .55, num: shout(info, 640, y + h / 2 + 42, '', {size: 46, color: C.yellow, anchor: 'start'})};
  });
  return {seek(t) {
    stage.intro(t);
    rows.forEach(r => {
      const q = span(t, r.at, .45), c = easeOut(span(t, r.at + .1, .8)), v = r.share * c;
      r.g.attr('transform', `translate(0 ${-60 * (1 - easeOut(q))}) scale(${Math.max(.0001, spring(q) * (q >= 1 ? 1 + .012 * Math.sin(t * 3 - r.at * 3) : 1))})`).attr('opacity', q > 0 ? 1 : 0);
      r.pct.say((v >= 10 ? Math.round(v) : parseFloat(v.toFixed(1))) + '%'); r.info.attr('opacity', span(t, r.at + .25, .15)).attr('transform', `translate(${30 * (1 - easeOut(span(t, r.at + .25, .3)))} 0)`); r.num.say(comma(r.d.value * c));
    });
  }};
}
