import {M, stage, lines, label, rule, fit, span, glide, ease, leave} from '../../kit.js';
import {sc, ground, fade, fitWrap} from './_local.js';

// One big serif word over footage: a tracked kicker, a hairline that draws from the centre, and the word rising from
// behind it (italic: true sets it in accent italic; or mark part of it *like this*). A soft paper veil keeps it readable.
// A phrase too long for one line wraps onto two. Props: word, kicker, x (centre), y (top), width, maxSize (or size), italic, ground (paper|ink|none), color (ink|paper, for ground none).
export const meta = {duration: 3.5, live: true};
export const defaults = {word: 'Effortless', kicker: 'Word of the day', x: 540, y: 290, width: 860, maxSize: 250, italic: false, ground: 'paper', color: 'ink'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), x = props.x ?? 540, y = props.y ?? 290, w = Math.min(props.width ?? 860, 2 * Math.min(x - 70, 1010 - x));
  const raw = sc(props.word), str = props.italic ? `*${raw.replace(/\*/g, '')}*` : raw, max = props.size ?? props.maxSize ?? 250, one = fit(str, w, max), two = one < 130 && /\s/.test(raw) ? fitWrap(str, w, max, 2) : null, size = two ? two.size : one, arr = two ? two.lines : [str], kh = props.kicker ? 50 : 0;
  const gr = ground(st, st.root, {y, h: kh + 30 + size * arr.length, mode: props.ground ?? 'paper', color: props.color});
  const kick = props.kicker ? label(st.root, x, y + 26, props.kicker, {size: 28, color: gr.fg, anchor: 'middle'}) : null; if (gr.shadow) kick?.attr('filter', st.url(gr.shadow));
  const hw = Math.max(160, Math.min(w, size * 2.2)) / 2, rl = rule(st.root, x - hw, y + kh, x + hw, y + kh, {color: gr.fg, width: 2});
  const hd = lines(st, st.root, arr, x, y + kh + 34, size, {anchor: 'middle', color: gr.fg, accent: gr.acc, shadow: gr.shadow});
  const life = props.life ?? meta.duration, out = life - .32;
  return {seek(t) {
    const q = leave(t, life, .32), a = glide(span(t, 0, .45)) * (1 - ease(span(t, out, .28)));
    gr.node?.attr('opacity', ease(span(t, 0, .3)) * (1 - ease(q)));
    rl.range(.5 - .5 * a, .5 + .5 * a); kick?.attr('opacity', fade(t, .1, out, .3)); hd.seek(t, .12, out);
  }};
}
