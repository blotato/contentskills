import {C, stage, txt, dot, measure, draw, leave, fade, glide, span} from '../../kit.js';
import {inks, plate, typeLine, check, small} from './_ui.js';

// A command window: a near-black card with a small-print title bar. Lines arrive at their cues —
// `kind: 'cmd'` types itself after a poppy prompt, `'out'` fades up dimmed, `'ok'` gets a tick drawn in
// front of it. For "it went to work". (x, y) is the top-left, `w` the width; each line: {text, at, kind, seconds}.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Terminal', x: 90, y: 1180, w: 900, size: 36, theme: 'ink', accent: 'poppy',
  lines: [{text: 'make reel', at: .3, kind: 'cmd', seconds: .5}, {text: 'reading the clip', at: 1, kind: 'out'}, {text: 'silences cut', at: 1.4, kind: 'ok'}, {text: 'captions set', at: 1.8, kind: 'ok'}]};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w, size} = props, pitch = size * 1.75, h = 118 + props.lines.length * pitch + 26, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); small(card, x + 76, y + 58, props.title, ink); dot(card, x + 50, y + 49, 8, st.ink.accent);
  card.append('rect').attr('x', x).attr('y', y + 86).attr('width', w).attr('height', 2).attr('fill', ink.line).attr('opacity', ink.faint);
  const rows = props.lines.map((l, i) => {
    const by = y + 118 + pitch * (i + .62), row = card.append('g'), kind = l.kind ?? 'out';
    if (kind === 'cmd') { txt(row, x + 44, by, '›', {size: size * 1.15, color: st.ink.accent, role: 'bold'}); return {l, kind, row, line: typeLine(row, x + 84, by, l.text, {size, color: ink.head, role: 'bold', caret: st.ink.accent})}; }
    const text = txt(row, x + 84, by, l.text, {size, color: kind === 'ok' ? ink.head : ink.dim, role: 'text'});
    return {l, kind, row, text, tick: kind === 'ok' ? check(row, x + 40, by - size * .82, size * .9, st.ink.accent, 4) : null};
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26));
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      const last = rows.filter(r => r.kind === 'cmd' && t >= r.l.at).at(-1);
      rows.forEach(r => {
        if (r.kind === 'cmd') { r.row.attr('opacity', t >= r.l.at - .05 ? 1 : 0); r.line.set(t, r.l.at, r.l.seconds ?? Math.max(.25, r.l.text.length * .035), r !== last); return; }
        const q = glide(span(t, r.l.at, .28)); r.row.attr('opacity', fade(t, r.l.at, .14)).attr('transform', `translate(${(1 - q) * 16} 0)`);
        if (r.tick) draw(r.tick, glide(span(t, r.l.at + .04, .26)));
      });
    },
  };
}
