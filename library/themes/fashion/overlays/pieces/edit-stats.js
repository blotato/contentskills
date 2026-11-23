import {C, stage, txt, label, fit, comma, leave, fade, glide, span} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// The numbers of an edit as a row (or grid) of counting figures: thin tall numerals over small print,
// hairlines between. With `use: 'project'` they are read from this very storyboard and its edit decision
// list, so they are always true of the video they appear in — `show` picks which: cuts, removed (seconds
// of pauses cut), before, after (seconds), graphics, effects, transitions, sounds, layouts, zooms.
// Otherwise pass `items` [{value, label, decimals, suffix}] and label them illustrative if they are.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'This edit', use: '', show: ['cuts', 'removed', 'graphics'], items: [{value: 12, label: 'cuts'}, {value: 36.1, label: 'seconds out', decimals: 1}, {value: 30, label: 'graphics'}], cols: 3, step: .14, startAt: .2, seconds: .6, x: 70, y: 1200, w: 940, theme: 'bone', accent: 'poppy'};

const NAMES = {cuts: ['jump cuts', p => p.edl?.cuts], removed: ['seconds of pauses out', p => p.edl ? p.edl.before - p.edl.after : null, 1], before: ['seconds recorded', p => p.edl?.before, 1], after: ['seconds kept', p => p.edl?.after ?? p.duration, 1],
  graphics: ['graphics', p => p.graphics], effects: ['effects', p => p.effects], transitions: ['transitions', p => p.transitions], sounds: ['sound effects', p => p.sounds], layouts: ['layout changes', p => p.layouts], zooms: ['punch-ins', p => p.zooms]};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, live = props.use === 'project' && props.project;
  const items = live ? props.show.map(k => NAMES[k] && {label: NAMES[k][0], value: NAMES[k][1](props.project), decimals: NAMES[k][2] ?? 0}).filter(i => i && i.value != null) : props.items;
  const cols = Math.min(props.cols, items.length), rowsN = Math.ceil(items.length / cols), cw = (w - 88) / cols, rh = 230, top = props.title ? 92 : 30, h = top + rowsN * rh + 16, g = st.root.append('g'), card = g.append('g');
  plate(card, st, x, y, w, h, props.theme); if (props.title) small(card, x + 44, y + 60, props.title, ink);
  const show = (i, v) => (i.prefix ?? '') + (i.decimals ? v.toFixed(i.decimals) : comma(v)) + (i.suffix ?? ''), size = Math.min(150, ...items.map(i => fit(show(i, i.value), cw - 36, 150, {role: 'num'})));
  const cells = items.map((item, i) => {
    const cx = x + 44 + (i % cols) * cw, cy = y + top + Math.floor(i / cols) * rh, cell = card.append('g');
    if (i % cols) cell.append('rect').attr('x', cx - 1).attr('y', cy + 16).attr('width', 2).attr('height', rh - 50).attr('fill', ink.line).attr('opacity', ink.faint);
    const lab = String(item.label).toUpperCase();
    return {item, cell, num: txt(cell, cx + 18, cy + 138, '', {size, role: 'num', color: i === items.length - 1 ? st.ink.accent : ink.head}).style('font-variant-numeric', 'tabular-nums'), text: label(cell, cx + 20, cy + 186, lab, {size: Math.min(22, fit(lab, cw - 40, 22 * 1.18, {role: 'label'}) / 1.18), color: ink.head}), at: props.startAt + i * props.step};
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26));
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      cells.forEach(({item, cell, num, at}) => { num.text(show(item, item.value * glide(span(t, at, props.seconds)))); cell.attr('opacity', fade(t, at - .05, .18)); });
    },
  };
}
