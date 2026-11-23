import {C, F, M, stage, furniture, text, veil, span, ease, leave} from '../../kit.js';

// A running head, like the top of a magazine page: a hairline with a tracked section label at the left and a mono
// folio at the right, and optionally a small Didone title centred above it. Can run a whole clip.
// Props: left, right, title, y, color (ink|paper), ground (true = a soft veil behind it).
export const meta = {duration: 6, live: true};
export const defaults = {left: 'The edit issue', right: 'No. 01', title: '', y: 300, color: 'ink', ground: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = props.color === 'paper', col = dark ? C.paper : C.ink, y = props.y ?? 300;
  const vg = props.ground === false ? null : veil(st, st.root, {top: (y + 160) / 1920, color: dark ? 'ink' : 'paper', strength: .8});
  const fur = furniture(st, st.root, {left: props.left, right: props.right, y, color: col, size: 28});
  const ttl = props.title ? text(st.root, 540, y - 20, String(props.title).toUpperCase(), {font: F.serif, size: 44, weight: 600, track: .22, anchor: 'middle', color: col}) : null;
  const life = props.life ?? meta.duration;
  return {seek(t) { const q = leave(t, life, .3); fur(span(t, 0, .5), q); vg?.attr('opacity', ease(span(t, 0, .4)) * (1 - ease(q))); ttl?.attr('opacity', ease(span(t, .2, .35)) * (1 - q)); }};
}
