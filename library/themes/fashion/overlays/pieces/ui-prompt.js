import {C, stage, txt, fit, measure, leave, fade, glide, span, mix, clamp} from '../../kit.js';
import {inks, plate, field, typeLine, pointer, pressed, check, small} from './_ui.js';
import {draw} from '../../kit.js';

// A message box that gets used: the placeholder waits, the message types itself with a caret, the
// pointer glides to the send button and presses it, and the message leaves upward as a sent line.
// For "I just sent one message". (x, y) is the card's top-left, `w` its width. Times are seconds
// after the overlay starts: typing runs from `typeAt` for `typeFor`, the button is pressed at `sendAt`.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'One message', placeholder: 'Ask for anything', text: 'Turn this into a reel', sent: 'Sent', typeAt: .5, typeFor: 1, sendAt: 1.9, x: 90, y: 1240, w: 900, size: 54, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, h = 268, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme);
  small(card, x + 44, y + 58, props.label, ink); const state = small(card, x + w - 44, y + 58, props.sent, ink, {anchor: 'end', color: ink.head}), tick = check(card, x + w - 44 - measure(props.sent.toUpperCase(), 22 * 1.18, {role: 'label'}) - 44, y + 34, 30, st.ink.accent, 3.5);
  const fx = x + 40, fy = y + 92, fw = w - 80, fh = 132, box = field(card, fx, fy, fw, fh, ink, {fill: ink.field, opacity: .28});
  const size = Math.min(props.size, fit(props.text, fw - 190, props.size, {role: 'bold'})), base = fy + fh / 2 + size * .36;
  const hint = txt(card, fx + 36, base, props.placeholder, {size: size * .82, color: ink.dim, role: 'text'}), line = typeLine(card, fx + 36, base, props.text, {size, color: ink.head, role: 'bold', caret: st.ink.accent});
  const bx = fx + fw - 66, by = fy + fh / 2, button = card.append('g'), disc = button.append('circle').attr('r', 42), arrow = button.append('path').attr('d', 'M0 17V-15M-14 -2L0 -16L14 -2').attr('fill', 'none').attr('stroke', C.white).attr('stroke-width', 5).attr('stroke-linecap', 'square');
  // The sent message: an ink line that rises above the card.
  const sentG = g.append('g'), sw = measure(props.text, size * .8, {role: 'bold'}) + 72, pill = sentG.append('rect').attr('x', x + w - sw).attr('y', -46).attr('width', sw).attr('height', 92).attr('fill', props.theme === 'ink' ? C.bone : C.ink).attr('filter', st.lift);
  txt(sentG, x + w - sw / 2, size * .28, props.text, {size: size * .8, color: props.theme === 'ink' ? C.ink : C.white, role: 'bold', anchor: 'middle'});
  const hand = pointer(g, st, {accent: st.ink.accent});
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26)), sendAt = props.sendAt, gone = span(t, sendAt + .06, .22);
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      const n = line.set(t, props.typeAt, props.typeFor, t > sendAt + .05); hint.attr('opacity', n ? 0 : .9); line.node.attr('opacity', 1 - gone);
      box.attr('stroke-opacity', t > props.typeAt && t < sendAt ? .9 : .28);
      const hit = pressed(t, sendAt), lit = fade(t, props.typeAt + props.typeFor * .2, .25);
      button.attr('transform', `translate(${bx} ${by}) scale(${1 - .12 * hit})`); disc.attr('fill', t >= sendAt ? st.ink.accent : ink.head).attr('opacity', .35 + .65 * lit); arrow.attr('stroke', t >= sendAt || props.theme !== 'ink' ? C.white : C.ink);
      const rise = glide(span(t, sendAt + .05, .45)); sentG.attr('transform', `translate(0 ${mix(base - 10, y - 78, rise)})`).attr('opacity', clamp((t - sendAt - .04) / .1));
      const done = fade(t, sendAt + .3, .2); state.attr('opacity', done); draw(tick, glide(span(t, sendAt + .32, .3)));
      hand.set(t, [{t: props.typeAt + props.typeFor * .55, x: x + w + 40, y: y + h + 150}, {t: sendAt - .04, x: bx + 4, y: by + 6, move: .42}, {t: sendAt + .5, x: bx + 4, y: by + 6}, {t: sendAt + 1.1, x: bx + 90, y: by + 150, move: .5}], [sendAt], 1 - fade(t, sendAt + .7, .3));
    },
  };
}
