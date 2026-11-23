import {C, stage, glass, label, stroke, ticks, hash, leave, fade, glide, span, mix} from '../../kit.js';
import {inks, small} from './_ui.js';

// Clips being pulled in: small upright clip cards fly in one after another from off-frame and land
// in a tidy row (or rows) inside an open corner-tick frame, the last one in the accent. No figures —
// the cards stand for "all of them". (x, y) top-left of the frame, `w` its width; `count` cards in `cols` columns.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Pulled in', note: 'Every clip', count: 10, cols: 5, step: .09, startAt: .15, from: 'right', x: 90, y: 1160, w: 900, theme: 'clear', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w, cols} = props, rows = Math.ceil(props.count / cols), gap = 22, pad = 40, cw = (w - pad * 2 - gap * (cols - 1)) / cols, ch = cw * 1.5, h = 96 + rows * ch + (rows - 1) * gap + pad;
  const g = st.root.append('g').attr('filter', props.theme === 'clear' ? st.soft : null).append('g'), frame = glass(st.under, st, x, y, w, h, {r: 44, tone: props.theme === 'bone' ? 'bone' : 'ink'}), title = small(g, x + pad, y + 58, props.title, ink, {color: ink.head}), note = small(g, x + w - pad, y + 58, props.note, ink, {anchor: 'end', color: ink.head});
  const cards = Array.from({length: props.count}, (_, i) => {
    const c = i % cols, r = Math.floor(i / cols), cx = x + pad + c * (cw + gap), cy = y + 96 + r * (ch + gap), card = g.append('g'), last = i === props.count - 1, tone = ['#1C2847', '#26346A', '#2D2F66', '#1F3256'][Math.floor(hash(i, 5) * 4)];
    card.append('rect').attr('rx', 18).attr('width', cw).attr('height', ch).attr('fill', last ? st.ink.accent : tone).attr('filter', st.lift);
    card.append('rect').attr('x', .75).attr('y', .75).attr('rx', 17).attr('width', cw - 1.5).attr('height', ch - 1.5).attr('fill', 'none').attr('stroke', '#FFFFFF').attr('stroke-opacity', .28).attr('stroke-width', 1.5);
    card.append('rect').attr('x', 0).attr('y', ch * .62).attr('width', cw).attr('height', ch * .38).attr('fill', '#000').attr('opacity', last ? .12 : .1);
    card.append('path').attr('d', `M${cw / 2 - 11} ${ch * .31 - 15}L${cw / 2 + 15} ${ch * .31}L${cw / 2 - 11} ${ch * .31 + 15}Z`).attr('fill', C.white).attr('opacity', last ? 1 : .92);
    card.append('rect').attr('x', cw * .14).attr('y', ch * .78).attr('width', cw * (.4 + .3 * hash(i, 2))).attr('height', 5).attr('rx', 2.5).attr('fill', C.white).attr('opacity', .55);
    return {card, cx, cy, at: props.startAt + i * props.step, tilt: (hash(i, 9) - .5) * 26};
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .22); g.attr('opacity', fade(t, 0, .14) * (1 - out));
      frame.attr('opacity', fade(t, 0, .25) * (1 - out)); title.attr('opacity', fade(t, .05, .25)); note.attr('opacity', fade(t, props.startAt + props.count * props.step, .25));
      cards.forEach(({card, cx, cy, at, tilt}, i) => {
        const q = glide(span(t, at, .42)), dx = (props.from === 'left' ? -1 : 1) * (1 - q) * (700 + i * 30), dy = (1 - q) * (i % 2 ? 260 : -180);
        card.attr('transform', `translate(${cx + dx} ${cy + dy}) rotate(${(1 - q) * tilt} ${cw / 2} ${ch / 2}) scale(${mix(1.5, 1, q)})`).attr('opacity', fade(t, at, .1));
      });
    },
  };
}
