import {textStage, up, flow, capH, measure, glyphs, pose, txt, readouts, plate, halo, badge, appear, span, spring, easeOut, vel} from '../kit.js';

// A quote set as a block of heavy caps. Words slide in from the left one after another, leaning
// into the move; then a filled bar swipes behind the last line and its words flip to dark.
export const meta = {duration: 5, live: true};
export const defaults = {
  quote: 'Done beats perfect every single time', by: 'NOTE TO SELF', role: 'PINNED SINCE DAY ONE',
  labels: ['QUOTED', 'WORDS\nTO KEEP', 'NO. 12'], mark: 'Q', accent: 'magenta',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 68;
  const ring = halo(root, stage, {color: ink.alt, ghosts: 5});
  const {size, lines, pitch} = flow(up(props.quote), W - m * 2, H * .44, H * .13, 40), cap = capH(size), top = H * .49 - (lines.length * pitch - (pitch - cap)) / 2, last = lines.length - 1;
  const ticks = [0, 1].map(i => root.append('path').attr('d', `M${m + i * 74} ${top - 60}h52l-26 -${90 * (.6 + .4 * k)}h-52z`).attr('fill', ink.accent));
  const bar = plate(root, {fill: ink.accent}), barW = measure(lines[last], size) + 36;
  const words = lines.flatMap((line, i) => glyphs(root, line, m, top + cap + i * pitch, size, {by: 'word', color: ink.text}).map(u => ({...u, line: i})));
  const endY = top + lines.length * pitch + 34, rule = root.append('rect').attr('x', m).attr('y', endY).attr('height', 5).attr('fill', ink.accent);
  const by = txt(root, m, endY + 62, up(props.by), {size: 44}), role = txt(root, m, endY + 102, up(props.role), {size: 26, color: ink.accent, role: 'mono'});
  const labels = readouts(root, props.labels, 112), seal = badge(root, W - m - 34, H - 96, 32, props.mark, {color: ink.accent});
  return {
    seek(t) {
      const swipe = easeOut(span(t, .5 + words.length * .1 + .25, .45));
      words.forEach((u, j) => {
        const q = span(t, .3 + j * .1, .45), e = easeOut(q);
        pose(u, {x: -(1 - e) * 260, sx: 1 + vel(q) * .22, skew: -vel(q) * 12, o: span(t, .3 + j * .1, .1)});
        u.text.attr('fill', u.line === last && swipe * barW > u.cx - m ? ink.on : ink.text);
      });
      bar.set(m - 18, top + last * pitch - 16, barW * swipe, cap + 32);
      ticks.forEach((p, i) => p.attr('transform', `translate(0 ${-50 * (1 - spring(span(t, .1 + i * .1, .5)))})`).attr('opacity', span(t, .1 + i * .1, .1)));
      const q = span(t, 0, 1); ring.set(W * .86 + Math.sin(t * .5) * 40 + (1 - easeOut(q)) * W * .5, H * .86 + Math.cos(t * .4) * 30, 300 * (.55 + .45 * k), 50 * Math.cos(t * .5) + vel(q) * 300 + 40, 0, q > 0 ? .8 : 0, t * 18);
      rule.attr('width', 220 * easeOut(span(t, 1.3, .5))); by.attr('opacity', appear(t, 1.45)); role.attr('opacity', appear(t, 1.6));
      labels.forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06))); seal.attr('transform', `rotate(${Math.sin(t * 1.5) * 12}) scale(${spring(span(t, 1.5, .5))})`);
    },
  };
}
