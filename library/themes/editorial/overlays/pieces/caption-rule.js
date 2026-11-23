import {C, M, stage, line, label, folio, rule, veil, span, ease, glide, leave} from '../../kit.js';

// A picture caption, the way a magazine sets one under a photograph: a hairline draws, a line of serif rises above
// it and a tracked credit with a mono index sits beneath. Lower part of the frame by default.
// Props: caption, sub, index, y (the rule), x0, x1, color (ink|paper), size, ground.
export const meta = {duration: 3.5, live: true};
export const defaults = {caption: 'The *raw* take', sub: 'One recording', index: '03', y: 1360, x0: M, x1: 1008, color: 'paper', size: 84, ground: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = props.color !== 'ink', col = dark ? C.paper : C.ink, y = props.y ?? 1360, x0 = props.x0 ?? M, x1 = props.x1 ?? 1008;
  const vg = props.ground === false ? null : veil(st, st.root, {top: 0, bottom: (1920 - y + 260) / 1920, color: dark ? 'ink' : 'paper', strength: .8});
  const cap = line(st, st.root, props.caption, x0, y - 26, props.size ?? 84, {color: col, accent: dark ? C.blush : C.wine}), rl = rule(st.root, x0, y, x1, y, {color: col});
  const sub = props.sub ? label(st.root, x0, y + 48, props.sub, {size: 28, color: col}) : null, idx = props.index ? folio(st.root, x1, y + 48, props.index, {size: 28, anchor: 'end', color: col}) : null;
  const life = props.life ?? meta.duration, out = life - .3;
  return {seek(t) { const q = leave(t, life, .3); vg?.attr('opacity', ease(span(t, 0, .3)) * (1 - ease(q)));
    rl.range(ease(span(t, out, .26)), glide(span(t, 0, .45))); cap.set(span(t, .1, .45), span(t, out, .24)); sub?.attr('opacity', ease(span(t, .3, .3)) * (1 - q)); idx?.attr('opacity', ease(span(t, .36, .3)) * (1 - q)); }};
}
