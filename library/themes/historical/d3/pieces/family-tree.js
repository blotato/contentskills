import {span, settle, up, fit} from '../../kit.js';
import {card, ink, ruled, drawOn, INK, SOFT, PAPER, C, F} from './_card.js';

// A lineage: generations of name boxes joined by ruled lines, drawn on generation by generation.
// `generations` is a list of rows; each person is {name, dates, of} where `of` is the position of
// their parent in the row above. `mark` (a name) picks the person the story is about, in crimson.
export const meta = {duration: 6};
export const defaults = {title: 'The house of Arden', unit: 'Illustrative lineage · invented names', clear: false, mark: 'Tomas',
  generations: [[{name: 'Edmund I', dates: 'FOUNDER'}], [{name: 'Alys', dates: 'ELDEST', of: 0}, {name: 'Edmund II', dates: 'HEIR', of: 0}, {name: 'Rowan', dates: 'YOUNGEST', of: 0}], [{name: 'Maren', of: 0, dates: 'LINE ENDS'}, {name: 'Tomas', of: 1, dates: 'CLAIMANT'}, {name: 'Isolde', of: 1, dates: 'ABBESS'}, {name: 'Corin', of: 2, dates: 'EXILE'}]]};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), gens = props.generations, G = gens.length, x0 = 120, x1 = 880, y0 = 300, y1 = 850, bh = Math.min(104, (y1 - y0) / G * .56), gy = i => G > 1 ? y0 + bh / 2 + i * (y1 - y0 - bh) / (G - 1) : (y0 + y1) / 2;
  const lines = body.append('g'), boxes = body.append('g'), pos = [], rows = gens.map((row, gi) => {
    const n = row.length, slot = (x1 - x0) / n, bw = Math.min(250, slot - 22); pos.push(row.map((_, i) => x0 + slot * (i + .5)));
    return row.map((p, i) => { const x = pos[gi][i], y = gy(gi), g = boxes.append('g'), hot = props.mark && p.name === props.mark, name = up(p.name), size = fit(name, bw - 24, bh * .36, {weight: 500});
      g.append('rect').attr('x', x - bw / 2 + 5).attr('y', y - bh / 2 + 6).attr('width', bw).attr('height', bh).attr('fill', INK).attr('opacity', .25);
      g.append('rect').attr('x', x - bw / 2).attr('y', y - bh / 2).attr('width', bw).attr('height', bh).attr('fill', hot ? C.crimson : PAPER).attr('stroke', INK).attr('stroke-width', 2.5);
      g.append('rect').attr('x', x - bw / 2 + 6).attr('y', y - bh / 2 + 6).attr('width', bw - 12).attr('height', bh - 12).attr('fill', 'none').attr('stroke', hot ? C.bone : INK).attr('stroke-width', 1).attr('opacity', .6);
      ink(g, x, y + (p.dates ? -2 : size * .36), name, {size, anchor: 'middle', color: hot ? C.bone : INK});
      if (p.dates) { const d = up(p.dates); ink(g, x, y + bh * .32, d, {size: fit(d, bw - 24, bh * .19, {font: F.type, weight: 400, spacing: .06}), font: F.type, weight: 400, anchor: 'middle', color: hot ? C.bone : SOFT, spacing: .06}); }
      const link = gi && pos[gi - 1][p.of ?? 0] != null ? (() => { const px = pos[gi - 1][p.of ?? 0], py = gy(gi - 1) + bh / 2, my = (py + y - bh / 2) / 2; return drawOn(lines.append('path').attr('d', `M${px} ${py}V${my}H${x}V${y - bh / 2}`).attr('fill', 'none').attr('stroke', hot ? C.crimson : INK).attr('stroke-width', hot ? 4 : 2.5)); })() : null;
      return {g, link, i, n}; });
  });
  return {seek(t) {
    intro(t);
    rows.forEach((row, gi) => row.forEach(({g, link, i}) => { const at = .7 + gi * 1.25 + i * .12; link?.(settle(span(t, at - .7, .9))); const q = settle(span(t, at, .7)); g.attr('opacity', span(t, at, .35)).attr('transform', `translate(0 ${(1 - q) * 10})`); }));
  }};
}
