import {C, stage, txt, ring, fit, measure, leave, fade, glide, span, mix, clamp} from '../../kit.js';
import {inks, plate, field, small, typeLine, pointer, pressed} from './_ui.js';

// A comment being left: the word types itself into the field, the pointer presses the button, and the
// comment lands above as a posted line. For "comment EDIT". Typing runs from `typeAt` for `typeFor`,
// the button is pressed at `postAt` (seconds after the overlay starts). (x, y) top-left, `w` width.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'Comments', placeholder: 'Add a comment', text: 'EDIT', name: 'You', button: 'Post', typeAt: .4, typeFor: .5, postAt: 1.3, x: 90, y: 1200, w: 900, size: 64, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w, size} = props, h = 400, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); small(card, x + 44, y + 62, props.label, ink);
  // the posted comment (appears after the press)
  const posted = card.append('g'); ring(posted, x + 76, y + 150, 30, ink.line, 2.5).attr('opacity', .6); posted.append('circle').attr('cx', x + 76).attr('cy', y + 150).attr('r', 9).attr('fill', st.ink.accent);
  small(posted, x + 130, y + 128, props.name, ink); txt(posted, x + 130, y + 128 + size * .92, props.text, {size: size * .9, color: ink.head, role: 'wide'});
  card.append('rect').attr('x', x + 44).attr('y', y + 222).attr('width', w - 88).attr('height', 2).attr('fill', ink.line).attr('opacity', ink.faint);
  const fy = y + 252, fh = 112, bw = measure(props.button.toUpperCase(), 26 * 1.18, {role: 'label'}) + 76, fw = w - 88 - bw - 20, box = field(card, x + 44, fy, fw, fh, ink, {fill: ink.field, opacity: .28});
  const base = fy + fh / 2 + size * .3, hint = txt(card, x + 76, base, props.placeholder, {size: 40, color: ink.dim, role: 'text'}), line = typeLine(card, x + 76, base, props.text, {size: size * .82, color: ink.head, role: 'wide', caret: st.ink.accent});
  const btn = card.append('g'), bx = x + w - 44 - bw / 2, by = fy + fh / 2, face = btn.append('rect').attr('rx', fh / 2).attr('x', -bw / 2).attr('y', -fh / 2).attr('width', bw).attr('height', fh), cap = small(btn, 0, 10, props.button, ink, {anchor: 'middle', color: C.white, size: 26});
  const hand = pointer(g, st, {accent: st.ink.accent});
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26)), at = props.postAt;
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      const n = line.set(t, props.typeAt, props.typeFor, t > at); hint.attr('opacity', n && t < at + .05 ? 0 : .9); line.node.attr('opacity', t < at + .05 ? 1 : 0);
      box.attr('stroke-opacity', t > props.typeAt && t < at ? .9 : .28);
      btn.attr('transform', `translate(${bx} ${by}) scale(${1 - .08 * pressed(t, at)})`); face.attr('fill', t >= at ? st.ink.accent : props.theme === 'ink' ? '#2C3654' : C.ink);
      const q = glide(span(t, at + .05, .4)); posted.attr('opacity', clamp((t - at - .04) / .12)).attr('transform', `translate(0 ${(1 - q) * 90})`);
      hand.set(t, [{t: props.typeAt + props.typeFor * .5, x: x + w + 20, y: y + h + 140}, {t: at - .04, x: bx + 6, y: by + 8, move: .4}, {t: at + .5, x: bx + 6, y: by + 8}, {t: at + 1, x: bx + 80, y: by + 170, move: .5}], [at], 1 - fade(t, at + .65, .3));
    },
  };
}
