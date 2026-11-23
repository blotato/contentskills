import {stage, C, up, fit, capH, txt, stroke, tag, cornerLabels, draw, fade, glide, span, easeInOut} from '../../kit.js';

// A list that builds one row at a time: a serif-italic kicker and heavy title, then each item
// rises in with its number in the accent colour while a hairline draws under it. The row that
// arrived last carries a small dot; earlier rows relax to a softer ink. `step` is the seconds
// between items.
export const meta = {duration: 6, live: true};
export const defaults = {
  title: 'The morning list', kicker: 'four small things', items: ['Open a window', 'Water, then coffee', 'Ten slow minutes', 'One thing by hand'],
  labels: ['Routine', 'In this order'], step: .8, accent: 'leaf',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, W, H, ink} = st, m = 90, n = props.items.length, flat = s => String(s ?? '').replace(/\n/g, ' ');
  const tsize = fit(flat(props.title), W - m * 2, 120), row = Math.min(170, (H * (st.sq ? .5 : .46)) / n), isize = Math.min(row * .42, fit(props.items, W - m * 2 - 150, 72)), block = 70 + capH(tsize) + 70 + n * row, top = (H - block) / 2 + 20;
  const kicker = txt(root, m, top + 30, flat(props.kicker), {size: 56, role: 'serif', color: ink.soft}), title = txt(root, m, top + 70 + capH(tsize), flat(props.title), {size: tsize, role: 'head'});
  const y0 = top + 70 + capH(tsize) + 70, rows = props.items.map((item, i) => {
    const g = root.append('g'), y = y0 + i * row;
    const num = txt(g, m, y + row / 2 + capH(isize * .62, {role: 'wide'}) / 2, String(i + 1).padStart(2, '0'), {size: isize * .62, role: 'wide', color: ink.accent});
    const label = txt(g, m + 150, y + row / 2 + capH(isize) / 2, item, {size: isize, role: 'head'}), dot = g.append('circle').attr('cx', W - m - 14).attr('cy', y + row / 2).attr('r', 13).attr('fill', ink.accent);
    return {g, num, label, dot, line: stroke(root, `M${m} ${y + row}H${W - m}`, C.line, 2.5), at: 1 + i * props.step};
  });
  const first = stroke(root, `M${m} ${y0}H${W - m}`, C.ink, 3), corners = cornerLabels(st, props.labels, {top: Math.max(70, Math.min(104, top - 60))});
  return {
    seek(t) {
      kicker.attr('opacity', fade(t, .1, .6)); title.attr('opacity', fade(t, .25, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .25, .9))) * 22})`); draw(first, glide(span(t, .5, .9)));
      rows.forEach((r, i) => {
        const q = span(t, r.at, .8), latest = t >= r.at && (i === n - 1 || t < rows[i + 1].at), calm = i === n - 1 ? 0 : easeInOut(span(t, rows[i + 1].at, .5));
        r.g.attr('opacity', easeInOut(span(q, 0, .5))).attr('transform', `translate(0 ${(1 - glide(q)) * 26})`); r.label.attr('fill-opacity', 1 - calm * .45);
        r.dot.attr('r', 13 * glide(span(t, r.at + .2, .5)) * (1 - calm)); draw(r.line, glide(span(t, r.at + .1, .9)));
      });
      corners.set(t, .5);
    },
  };
}
