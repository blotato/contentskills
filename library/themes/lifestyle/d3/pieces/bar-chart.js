import {card, C, up, arch, txt, stroke, hand, arrowPath, clipLive, draw, fade, glide, span} from '../../kit.js';

// Arch-topped bars that grow out of a hairline; the tallest takes the accent colour and a
// handwritten note with an arrow. Values sit above in heavy numerals, labels below in small caps.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Where a slow morning goes', unit: 'Illustrative · minutes', clear: false, accent: 'leaf', note: 'the good part', max: null,
  items: [{label: 'Coffee', value: 12}, {label: 'Stretch', value: 18}, {label: 'Walk', value: 34}, {label: 'Journal', value: 15}, {label: 'Phone', value: 8}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, n = props.items.length, slot = 840 / n, w = Math.min(slot * .58, 130), base = 840, full = 410;
  const max = props.max ?? Math.max(...props.items.map(d => d.value)), top = Math.max(...props.items.map(d => d.value)), lead = props.items.findIndex(d => d.value === top);
  stroke(root, `M80 ${base}H920`, C.line, 2.5);
  const bars = props.items.map((d, i) => {
    const x = 80 + i * slot + (slot - w) / 2, h = Math.max(w / 2 + 4, full * d.value / max), clip = clipLive(st);
    root.append('path').attr('d', arch(x, base - h, w, h)).attr('fill', i === lead ? ink.accent : C.deep).attr('clip-path', clip.url);
    txt(root, x + w / 2, base + 48, up(d.label), {size: Math.min(21, slot * .13), role: 'label', anchor: 'middle', color: C.soft});
    return {d, x, h, clip, value: txt(root, x + w / 2, 0, '', {size: 46, role: 'head', anchor: 'middle'})};
  });
  const b = bars[lead], right = lead < n / 2, nx = b.x + w / 2 + (right ? 120 : -120), ny = Math.max(292, base - b.h - 120);
  const note = hand(root, st, nx, ny, props.note, {size: 54, color: ink.accent, anchor: right ? 'start' : 'end', rot: -4});
  const arrow = stroke(root, arrowPath(nx + (right ? -12 : 12), ny + 12, b.x + w / 2 + (right ? w * .62 : -w * .62), base - b.h + 6, right ? -.3 : .3), ink.accent, 4.5);
  return {seek(t) {
    st.header(t);
    bars.forEach(({d, x, h, clip, value}, i) => {
      const e = glide(span(t, .35 + i * .14, 1.2)), hh = h * e;
      clip.set(x - 2, base - hh, w + 4, hh);
      value.attr('y', base - hh - 18).attr('opacity', fade(t, .45 + i * .14, .5)).text(Math.round(d.value * e));
    });
    note.set(glide(span(t, 1.9, .9))); draw(arrow, glide(span(t, 2.5, .7)));
  }};
}
