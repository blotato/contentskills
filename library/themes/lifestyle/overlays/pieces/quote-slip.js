import {stage, look, C, flow, capH, measure, txt, sheet, tape, hand, glyphs, wordsIn, fade, glide, swell, span, leave} from '../../kit.js';

// A short quote on a slip of paper held by a strip of tape: the slip floats up at a slight
// tilt, the words arrive one after another in bold lowercase, and a handwritten attribution
// signs itself underneath. (`x`, `y`) is the top-left; `w` the width.
export const meta = {duration: 5.5, live: true};
export const defaults = {quote: 'do less, but notice more of it', by: '— note to self', x: 130, y: 140, w: 820, accent: 'sun'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y, w} = props, pad = 54, o = {role: 'soft'}, f = flow(props.quote, w - pad * 2 - 60, 230, 62, 34, o, 1.55), h = pad + 40 + f.lines.length * f.pitch + 96;
  const outer = root.append('g').attr('filter', st.lift).append('g').attr('transform', `translate(${x + w / 2} ${y + h / 2})`), g = outer.append('g'); sheet(g, -w / 2, -h / 2, w, h, {radius: 4, fill: C.cream});
  tape(g, -w * .22, -h / 2, 170, 46, -5, ink.accent); g.append('text').attr('x', -w / 2 + pad - 8).attr('y', -h / 2 + pad + 62).attr('fill', ink.accent).style('font', `110px "Instrument Serif Italic"`).text('“');
  let k = 0; const units = f.lines.flatMap((line, i) => glyphs(g, line, -w / 2 + pad + 50, -h / 2 + pad + 30 + capH(f.size, o) + i * f.pitch, f.size, {by: 'word', role: 'soft', color: C.ink}).map(u => ({...u, i: k++})));
  const by = hand(g, st, w / 2 - pad, h / 2 - 40, props.by, {size: 52, color: C.soft, anchor: 'end', rot: -2}), end = .5 + k * .16;
  return {
    seek(t) {
      const out = leave(t, props.life, .55), e = swell(span(t, 0, .9));
      outer.attr('opacity', fade(t, 0, .4) * (1 - out)); g.attr('transform', `translate(0 ${(1 - e) * 80 + out * 50}) rotate(${-1.5 - (1 - e) * 3 + Math.sin(t * .7) * .3})`);
      wordsIn(units, t, {start: .5, step: .16}); by.set(glide(span(t, end + .2, .9)));
    },
  };
}
