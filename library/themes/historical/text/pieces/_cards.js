// Helpers shared by this theme's title cards (not a piece: the underscore keeps it out of piece ids).
import {C, F, measure, capH, fieldOf, fields} from '../../kit.js';

export const DARK = '#15181d';
/** The photographic tone that goes with a field name. */
export const toneFor = field => { const f = fieldOf(field); return f === fields.sepia ? 'sepia' : f === fields.steel ? 'blue' : 'silver'; };
/**
 * A ticker strip: the text repeated end to end with a small lozenge between copies. set(offset)
 * scrolls it (px, either sign). `y` is the baseline; draw any band behind it yourself.
 */
export function ticker(g, W, str, y, size, {color = C.bone, font = F.head, weight = 700, spacing = .04, mark = C.crimson, outline = false} = {}) {
  const o = {font, weight, spacing}, gap = size * 1.1, w = measure(str, size, o) + gap, n = Math.ceil((W + 500) / w) + 2, group = g.append('g'), cap = capH(size, o), r = size * .11;
  for (let i = 0; i < n; i++) {
    const t = group.append('text').attr('x', i * w + gap / 2).attr('y', y).style('font', `${weight} ${size}px ${font}`).style('letter-spacing', `${spacing}em`).text(str);
    if (outline) t.attr('fill', 'none').attr('stroke', color).attr('stroke-width', Math.max(1.5, size * .018)); else t.attr('fill', color);
    group.append('path').attr('d', `M${i * w - r} ${y - cap / 2}l${r} ${-r}l${r} ${r}l${-r} ${r}Z`).attr('fill', mark);
  }
  return {g: group, width: w, set(offset) { group.attr('transform', `translate(${-(((offset % w) + w) % w) - 250} 0)`); }};
}
