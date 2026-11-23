import {textStage, up, fit, capH, glyphs, pose, txt, readouts, plate, mark, appear, span, spring, easeOut, easeInOut, vel, clamp} from '../kit.js';

// A list or agenda. The title rises in, each row flies in from the right behind its number, and
// then a filled bar steps down the list one row at a time, flipping the row it sits on to dark.
// Up to six `items`; `step` is the seconds the bar rests on each.
export const meta = {duration: 6, live: true};
export const defaults = {
  title: 'THE PLAN', kicker: 'FOUR MOVES', items: ['FIND THE HOOK', 'WRITE IT SHORT', 'CUT THE FLUFF', 'POST IT TODAY'],
  labels: ['AGENDA', 'TODAY', 'IN THIS\nORDER'], step: .8, accent: 'cyan',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink} = stage, m = 68, items = props.items.slice(0, 6).map(up), n = items.length;
  const tsize = fit(up(props.title), W - m * 2 - 120, H * .13), tcap = capH(tsize), rh = Math.min((H - 400 - tcap) / n, 240), ty = 200 + (H - 310 - tcap - 70 - rh * n) / 2 + tcap;
  const top = ty + 70, size = Math.min(fit(items, W - m * 2 - 180, 400), rh * .46 / capH(1)), cap = capH(size);
  const bar = plate(root, {fill: ink.accent, cut: 22});
  const title = glyphs(root, up(props.title), m, ty, tsize, {color: ink.head, echo: true}), kicker = txt(root, m, ty - tcap - 26, up(props.kicker), {size: 36});
  const star = mark(root, W - m - 34, ty - 40, 34, ink.alt);
  const rows = items.map((item, i) => {
    const y = top + i * rh, g = root.append('g');
    return {y, rule: root.append('rect').attr('x', m).attr('y', y).attr('height', 2).attr('fill', ink.dim),
      num: txt(g, m + 8, y + rh / 2 + cap * .5, String(i + 1).padStart(2, '0'), {size: cap / capH(1, {role: 'mono'}), role: 'mono', color: ink.accent, spacing: 0}), word: glyphs(g, item, m + 170, y + rh / 2 + cap / 2, size, {by: 'all', color: ink.text})[0]};
  });
  const labels = readouts(root, props.labels, 112), begin = .75 + n * .13 + .35;
  return {
    seek(t) {
      title.forEach(u => { const q = span(t, .08 + u.i * .04, .5); pose(u, {y: (1 - spring(q)) * u.cap * 1.2, sy: 1 + vel(q) * .3, o: q > 0 ? 1 : 0, apart: vel(q) * 10}); });
      const at = Math.max(0, (t - begin) / props.step), idx = clamp(Math.floor(at), 0, n - 1), move = idx > 0 && at < n ? easeInOut(span(at - idx, 0, .3)) : 1, by = rows[Math.max(0, idx - 1)].y + (rows[idx].y - rows[Math.max(0, idx - 1)].y) * move;
      const open = easeOut(span(t, begin - .3, .3)), squash = Math.sin(Math.PI * move) * .35;
      bar.set(m - 20, by + 8 + (rh - 16) * squash / 2, (W - m * 2 + 40) * open, (rh - 16) * (1 - squash));
      rows.forEach((row, i) => {
        const q = span(t, .6 + i * .13, .5), e = easeOut(q), lit = open > .5 && Math.abs(by - row.y) < rh / 2;
        pose(row.word, {x: (1 - e) * W, sx: 1 + vel(q) * .4, skew: -vel(q) * 16, o: q > 0 ? 1 : 0});
        row.word.text.attr('fill', lit ? ink.on : ink.text); row.num.attr('fill', lit ? ink.on : ink.accent).attr('opacity', appear(t, .55 + i * .13));
        row.rule.attr('width', (W - m * 2) * easeOut(span(t, .45 + i * .1, .5)));
      });
      kicker.attr('opacity', appear(t, .5)); star.attr('transform', `rotate(${t * 60}) scale(${spring(span(t, .5, .5))})`);
      labels.forEach((node, i) => node.attr('opacity', appear(t, .4 + i * .06)));
    },
  };
}
