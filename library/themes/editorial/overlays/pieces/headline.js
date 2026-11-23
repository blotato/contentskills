import {C, M, stage, lines, label, rule, fit, veil, span, glide, ease, leave} from '../../kit.js';

// A magazine headline over footage: a tracked kicker, a hairline that draws, then serif lines that rise from behind
// it one after another; words marked *like this* are italic in the accent colour. A soft paper veil keeps it readable.
// Props: kicker, lines, y (top), x, width, size (max), align (left|center), ground (paper|ink|none), folio,
// color (paper|ink: the type colour when ground is none), rule (false hides the hairline), shadow (true: a soft drop
// shadow so light type reads straight on footage, the podcast-title look).
export const meta = {duration: 4, live: true};
export const defaults = {kicker: 'The edit issue', lines: ['One message,', 'a *finished* reel'], y: 250, x: M, width: 936, size: 150, align: 'left', ground: 'paper', folio: ''};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = props.ground === 'ink' || (props.ground === 'none' && props.color === 'paper');
  const fg = dark ? C.paper : C.ink, acc = dark ? C.blush : C.wine;
  if (props.shadow) st.root.style('filter', 'drop-shadow(0 3px 10px rgba(0,0,0,.55)) drop-shadow(0 1px 2px rgba(0,0,0,.45))');
  const x = props.x ?? M, w = props.width ?? 936, y = props.y ?? 250, mid = props.align === 'center', ax = mid ? x + w / 2 : x, arr = [].concat(props.lines);
  const vg = props.ground === 'none' ? null : veil(st, st.root, {top: Math.min(.6, (y + 420) / 1920), color: dark ? 'ink' : 'paper', strength: .9});
  const size = fit(arr, w, props.size ?? 150), kick = props.kicker ? label(st.root, ax, y + 26, props.kicker, {size: 28, color: fg, anchor: mid ? 'middle' : 'start'}) : null;
  const fo = props.folio ? label(st.root, x + w, y + 26, props.folio, {size: 28, color: fg, anchor: 'end', weight: 500}) : null;
  const rl = rule(st.root, x, y + 50, x + w, y + 50, {color: fg, width: 2});
  const hd = lines(st, st.root, arr, ax, y + 84, size, {anchor: mid ? 'middle' : 'start', color: fg, accent: acc});
  const life = props.life ?? meta.duration, out = life - .32;
  return {seek(t) {
    const q = leave(t, life, .32);
    vg?.attr('opacity', ease(span(t, 0, .3)) * (1 - ease(q)));
    if (props.rule === false) rl.range(0, 0); else rl.range(ease(span(t, out, .28)), glide(span(t, 0, .45)));
    kick?.attr('opacity', ease(span(t, .08, .3)) * (1 - q)); fo?.attr('opacity', ease(span(t, .16, .3)) * (1 - q));
    hd.seek(t, .12, out);
  }};
}
