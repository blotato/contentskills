import {stage, look, C, FRAME, up, fit, capH, txt, glyphs, settle, stroke, draw, fade, glide, span, leave, drift} from '../../kit.js';
import {soften} from './_local.js';

// An elegant title lockup set straight on the footage: a small wide-caps kicker, the heavy cream
// title settling from wide tracking to tight, a hairline that draws out from the middle and a
// serif-italic subtitle. `y` is the middle of the title; `align` is 'middle' or 'start'.
export const meta = {duration: 4.5, live: true};
export const defaults = {kicker: 'Chapter one', title: 'Slow mornings', subtitle: 'and other small luxuries', y: 300, align: 'middle', accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), W = FRAME.width, m = 80, mid = props.align === 'middle', x = mid ? W / 2 : m, title = up(props.title);
  const words = title.split(/\s+/), halves = k => [words.slice(0, k).join(' '), words.slice(k).join(' ')];
  // A long title breaks into two balanced lines instead of shrinking to a whisper.
  const lines = fit(title, W - m * 2, 150) >= 84 || words.length < 2 ? [title] : words.slice(1).map((_, k) => halves(k + 1)).sort((a, b) => fit(b, W - m * 2, 150) - fit(a, W - m * 2, 150))[0];
  const size = fit(lines, W - m * 2, 150), cap = capH(size), pitch = cap * 1.16, block = cap + (lines.length - 1) * pitch, y = props.y, top = y - block / 2, soft = soften(root, st), g = soft.append('g');
  const kicker = txt(g, x, top - 50, up(props.kicker), {size: 26, role: 'wide', color: C.cream, anchor: props.align});
  const rows = lines.map((line, i) => glyphs(g, line, x, top + cap + i * pitch, size, {anchor: props.align, color: C.cream}));
  const rw = 170, rule = stroke(g, mid ? `M${x - rw / 2} ${top + block + 44}h${rw}` : `M${x} ${top + block + 44}h${rw}`, ink.accent, 6);
  const sub = txt(g, x, top + block + 118, props.subtitle, {size: fit(props.subtitle, W - m * 2, 62, {role: 'serif'}), role: 'serif', color: C.cream, anchor: props.align});
  return {
    seek(t) {
      const out = leave(t, props.life, .5);
      g.attr('transform', `translate(${W / 2} ${y}) scale(${drift(t, .03)}) translate(${-W / 2} ${-y})`);
      kicker.attr('opacity', fade(t, .05, .6) * (1 - out)); rows.forEach((letters, i) => settle(letters, span(t, .2 + i * .15, 1.3), out, .5));
      draw(rule, glide(span(t, .9, .8)) * (1 - out));
      sub.attr('opacity', fade(t, 1.1, .7) * (1 - out)).attr('transform', `translate(0 ${(1 - glide(span(t, 1.1, .9))) * 16})`);
    },
  };
}
