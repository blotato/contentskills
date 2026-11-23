import {C, stage, hash, leave, fade, glide, span, swell, mix} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// "Which ones worked": a row of clip cards, a hairline bar rising over each, then the row sorts
// itself — the cards glide into order and the tallest takes the accent and a small-print flag. A
// diagram of the idea, deliberately without figures or axes; `heights` (0..1) only shape the picture.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Which ones worked', note: 'Sketch, not data', flag: 'Worked', heights: [.42, .9, .3, .62, .5], sortAt: 1.2, x: 70, y: 1090, w: 940, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, n = props.heights.length, pad = 56, gap = 26, cw = (w - pad * 2 - gap * (n - 1)) / n, ch = cw * 1.45, barH = 250, h = 110 + barH + 30 + ch + 96, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); small(card, x + 44, y + 60, props.title, ink, {color: ink.head}); const note = small(card, x + w - 44, y + h - 40, props.note, ink, {anchor: 'end'});
  const order = props.heights.map((v, i) => i).sort((a, b) => props.heights[b] - props.heights[a]), rank = []; order.forEach((idx, r) => rank[idx] = r);
  const base = y + 110 + barH, slot = i => x + pad + i * (cw + gap);
  const cols = props.heights.map((v, i) => {
    const col = card.append('g'), win = rank[i] === 0, tone = props.theme === 'ink' ? '#1C2540' : ['#D6DFEE', '#C9D4E6', '#E4EAF4'][i % 3];
    const bar = col.append('rect').attr('x', cw / 2 - (win ? 7 : 3)).attr('width', win ? 14 : 6).attr('fill', ink.head), tile = col.append('rect').attr('y', base + 30).attr('width', cw).attr('height', ch).attr('fill', tone), frame = col.append('rect').attr('x', -6).attr('y', base + 24).attr('width', cw + 12).attr('height', ch + 12).attr('fill', 'none').attr('stroke', st.ink.accent).attr('stroke-width', 6);
    col.append('path').attr('d', `M${cw / 2 - 12} ${base + 30 + ch * .42 - 16}L${cw / 2 + 16} ${base + 30 + ch * .42}L${cw / 2 - 12} ${base + 30 + ch * .42 + 16}Z`).attr('fill', ink.head).attr('opacity', .55);
    return {col, bar, frame, v, i, win, at: .2 + i * .09};
  });
  const flag = small(card, 0, 0, props.flag, ink, {color: st.ink.accent, size: 26});
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26)), sort = swell(span(t, props.sortAt, .55)), lit = fade(t, props.sortAt + .45, .2);
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      cols.forEach(c => {
        const q = glide(span(t, c.at, .4)), px = mix(slot(c.i), slot(rank[c.i]), sort), lift = Math.sin(Math.PI * sort) * (rank[c.i] < c.i ? -26 : 26), hgt = barH * c.v * swell(span(t, c.at + .15, .5));
        c.col.attr('transform', `translate(${px} ${(1 - q) * 50 + lift})`).attr('opacity', fade(t, c.at, .14) * (c.win ? 1 : 1 - .45 * lit));
        c.bar.attr('y', base - hgt).attr('height', hgt).attr('fill', c.win && lit > .5 ? st.ink.accent : ink.head); c.frame.attr('opacity', c.win ? lit : 0);
        if (c.win) flag.attr('transform', `translate(${px - 4} ${base - barH * c.v - 22})`).attr('opacity', lit);
      });
      note.attr('opacity', fade(t, .4, .3));
    },
  };
}
