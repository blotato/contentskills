import {C, stage, txt, leave, fade, glide, span, mix} from '../../kit.js';
import {inks, plate, small, pointer} from './_ui.js';

// Switches being flipped: a short settings card, one row per item, and the pointer glides down the
// card pressing each switch at its cue — the knob slides across and the track takes the accent.
// rows: [{label, at}] (seconds after the overlay starts; `on: false` leaves one untouched).
export const meta = {duration: 4, live: true};
export const defaults = {title: 'The look', rows: [{label: 'Warm grade', at: .6}, {label: 'Slow push-in', at: 1.5}], x: 150, y: 1220, w: 780, size: 46, theme: 'bone', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w, size} = props, rh = size * 2.5, top = props.title ? 96 : 30, h = top + props.rows.length * rh + 24, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); if (props.title) small(card, x + 44, y + 60, props.title, ink);
  const rows = props.rows.map((r, i) => {
    const cy = y + top + rh * (i + .5), tw = 124, th = 64, tx = x + w - 44 - tw;
    if (i) card.append('rect').attr('x', x + 44).attr('y', cy - rh / 2).attr('width', w - 88).attr('height', 2).attr('fill', ink.line).attr('opacity', ink.faint);
    txt(card, x + 44, cy + size * .36, r.label, {size, color: ink.head, role: 'bold'});
    const off = card.append('rect').attr('x', tx).attr('y', cy - th / 2).attr('width', tw).attr('height', th).attr('rx', th / 2).attr('fill', ink.line).attr('opacity', .22), on = card.append('rect').attr('x', tx).attr('y', cy - th / 2).attr('width', tw).attr('height', th).attr('rx', th / 2).attr('fill', st.ink.accent);
    return {r, cy, tx, tw, th, on, knob: card.append('circle').attr('cy', cy).attr('r', th / 2 - 7).attr('fill', C.white)};
  });
  const hand = pointer(g, st, {accent: st.ink.accent}), live = rows.filter(r => r.r.on !== false);
  const keys = [{t: (live[0]?.r.at ?? 1) - .5, x: x + w + 30, y: y + h + 140}, ...live.map(r => ({t: r.r.at - .03, x: r.tx + r.tw / 2 + 6, y: r.cy + 10, move: .36})), {t: (live.at(-1)?.r.at ?? 1) + .5, x: 0, y: 0, hold: true}];
  keys.at(-1).x = keys.at(-2).x; keys.at(-1).y = keys.at(-2).y; keys.push({t: keys.at(-1).t + .5, x: keys.at(-1).x + 110, y: keys.at(-1).y + 170, move: .5});
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26));
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      rows.forEach(({r, tx, tw, th, on, knob}) => { const q = r.on === false ? 0 : glide(span(t, r.at, .2)); on.attr('opacity', q); knob.attr('cx', mix(tx + th / 2, tx + tw - th / 2, q)); });
      hand.set(t, keys, live.map(r => r.r.at), 1 - fade(t, keys.at(-2).t + .2, .3));
    },
  };
}
