import {stage, look, C, up, fit, capH, flow, txt, sheet, clipLive, stroke, squiggle, draw, fade, glide, swell, span, leave} from '../../kit.js';

// A tip card: a paper sheet slides up, a big number in the accent colour sits beside a caps
// "TIP" label, the heavy title fades up and one or two lines of advice follow, with a brushed
// underline under the label. (`x`, `y`) is the top-left; `w` the width.
export const meta = {duration: 5, live: true};
export const defaults = {label: 'Tip', number: '02', title: 'Open a window first', text: 'Fresh air before the phone. Two minutes is plenty.', x: 70, y: 120, w: 940, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y, w} = props, pad = 44, nw = 210, tx = x + nw + pad, tw = w - nw - pad * 2;
  const tsize = fit(props.title, tw, 62), body = flow(props.text, tw, 130, 36, 24, {role: 'text'}), h = Math.max(250, 96 + capH(tsize) + 44 + body.lines.length * body.pitch + 34);
  const mask = clipLive(st), g = root.append('g').attr('clip-path', mask.url), card = g.append('g');
  sheet(card.append('g').attr('filter', st.lift), x, y, w, h, {radius: 6}); card.append('rect').attr('x', x).attr('y', y).attr('width', 12).attr('height', h).attr('fill', ink.accent);
  const nsize = Math.min(fit(String(props.number), nw - 50, 170), (h - 150) / capH(1)), num = txt(card, x + pad + 8, y + h - 44, props.number, {size: nsize, role: 'head', color: ink.accent});
  const label = txt(card, x + pad + 10, y + 62, up(props.label), {size: 24, role: 'wide', color: C.ink}), line = stroke(card, squiggle(x + pad + 10, y + 80, 74, 6, 3, 1), ink.accent, 5);
  const title = txt(card, tx, y + 62 + capH(tsize), props.title, {size: tsize, role: 'head'});
  const text = txt(card, tx, y + 62 + capH(tsize) + 34 + capH(body.size, {role: 'text'}), body.lines.join('\n'), {size: body.size, role: 'text', color: C.soft, leading: body.pitch / body.size});
  return {
    seek(t) {
      const out = leave(t, props.life, .55), e = swell(span(t, 0, .8)) * (1 - out);
      mask.set(x - 60, y - 60, w + 120, h + 140); card.attr('transform', `translate(0 ${(1 - e) * 90})`).attr('opacity', fade(t, 0, .4) * (1 - out));
      num.attr('opacity', fade(t, .35, .6)); label.attr('opacity', fade(t, .3, .5)); draw(line, glide(span(t, .7, .7)));
      title.attr('opacity', fade(t, .5, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .5, .8))) * 16})`);
      text.attr('opacity', fade(t, .8, .7)).attr('transform', `translate(0 ${(1 - glide(span(t, .8, .8))) * 14})`);
    },
  };
}
