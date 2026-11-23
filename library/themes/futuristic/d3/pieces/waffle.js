import {C, F, series, chamfer, line, text, ticks, draw, span, flicker, hash} from '../../hud.js';
import {card} from './_card.js';

// A hundred cells, one per unit: they light up in order, category by category, each with a
// white flash, while the totals count along. A soft shimmer keeps crossing the grid.
export const meta = {duration: 4.4, live: true};
export const defaults = {title: 'Who finishes the video', unit: 'Illustrative · out of 100 viewers', note: 'Each cell = 1 viewer', suffix: '%', clear: false,
  items: [{label: 'Watch to the end', value: 37}, {label: 'Leave halfway', value: 45}, {label: 'Skip in 3 seconds', value: 18}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), pitch = 58, size = 50, gx = 84, gy = 250, owners = []; props.items.forEach((d, i) => { for (let k = 0; k < d.value && owners.length < 100; k++) owners.push(i); });
  const cells = Array.from({length: 100}, (_, k) => { const col = k % 10, row = Math.floor(k / 10), x = gx + col * pitch, y = gy + row * pitch, user = owners[k];
    line(root, chamfer(x, y, size, size, 9), C.grid, 1.5);
    return {k, col, row, user, at: .45 + k * .024 + (user ?? 0) * .25, node: root.append('path').attr('d', chamfer(x, y, size, size, 9)).attr('opacity', 0)}; });
  const keys = props.items.map((d, i) => { const color = series[i % series.length], g = root.append('g').attr('transform', `translate(692 ${270 + i * 196})`), words = d.label.toUpperCase().split(' '), half = Math.ceil(words.length / 2);
    line(g, 'M0 0V150', color, 6);
    text(g, 22, 100, words.slice(0, half).join(' '), {size: 26, font: F.text, weight: 700, color: C.white, spacing: '.04em'}); text(g, 22, 132, words.slice(half).join(' '), {size: 26, font: F.text, weight: 700, color: C.white, spacing: '.04em'});
    return {g, d, i, num: text(g, 20, 62, '', {size: 66, font: F.display, weight: 900, color, spacing: '0'})}; });
  const rule = ticks(root, gx, gy + 10 * pitch + 6, 10 * pitch - 8, 50, C.dim), note = text(root, gx, gy + 10 * pitch + 62, String(props.note ?? '').toUpperCase(), {size: 22, color: C.dim, spacing: '.2em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); draw(rule, span(t, .3, .6)); note.attr('opacity', flicker(t, .6));
    const lit = props.items.map(() => 0);
    for (const c of cells) {
      if (c.user == null) continue;
      const since = t - c.at, on = since > 0; if (on) lit[c.user]++;
      const wave = .82 + .18 * Math.sin(t * 3.2 - (c.col + c.row) * .55), spark = hash(c.k, Math.floor(t * 3)) > .975;
      c.node.attr('fill', on && (since < .09 || spark) ? C.white : series[c.user % series.length]).attr('opacity', on ? wave : 0);
    }
    for (const key of keys) { key.g.attr('opacity', flicker(t, .35 + key.i * .2)); key.num.text(lit[key.i] + (props.suffix ?? '')); }
  }};
}
