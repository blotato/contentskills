import {C, F, M, stage, letters, label, rule, fit, span, ease, glide, leave} from '../../kit.js';

// One big serif word across the frame, its letters fading up one after another; optionally italic, with a small
// tracked kicker and a hairline above. Works with "behind": "person". Props: word, y (baseline), size (max), width,
// italic, font (a CSS family, e.g. the style's '"Anton"'), color (ink|paper|wine|blush|crimson), kicker, step, dur (each letter's fade), outFor (how long before its end it starts to leave), x.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'Edited', y: 520, size: 300, width: 936, italic: false, color: 'ink', kicker: '', step: .045, dur: .3, outFor: .34, x: 540};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), font = props.font ?? (props.italic ? F.italic : F.head), o = {font}, w = props.width ?? 936, x = props.x ?? 540, y = props.y ?? 520;
  const size = fit(props.word, w, props.size ?? 300, o), grp = st.root.append('g').attr('filter', st.url(/paper|blush|white/.test(props.color) ? 'shade' : 'halo'));
  const wd = letters(grp, props.word, x, y, size, {font, color: C[props.color] ?? props.color ?? C.ink});
  const ky = y - size * .78, kick = props.kicker ? label(st.root, x - wd.w / 2, ky - 18, props.kicker, {size: 28, color: C[props.color] ?? C.ink}) : null;
  const rl = props.kicker ? rule(st.root, x - wd.w / 2, ky, x + wd.w / 2, ky, {color: C[props.color] ?? C.ink}) : null;
  const life = props.life ?? meta.duration, out = life - (props.outFor ?? .34), step = props.step ?? .045;
  return {seek(t) {
    wd.seek(t, {at: .03, step, dur: props.dur ?? .3, out});
    rl?.range(ease(span(t, out, .25)), glide(span(t, 0, .4))); kick?.attr('opacity', ease(span(t, .1, .3)) * (1 - leave(t, life, .3)));
  }};
}
