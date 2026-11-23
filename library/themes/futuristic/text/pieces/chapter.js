import {textStage, up, fit, capH, glyphs, pose, txt, readouts, bracketFrame, streak, badge, clipBox, clipLive, appear, span, spring, easeOut, easeBack, vel} from '../kit.js';

// A chapter or section opener. A giant outlined number flies in from the right and fills with
// light from the bottom up, the title rises letter by letter beneath it, a bracket frame snaps
// around the card and a streak keeps crossing.
export const meta = {duration: 4.5, live: true};
export const defaults = {number: '02', kicker: 'CHAPTER', title: 'THE BUILD', note: 'WHERE THE IDEA\nBECOMES A THING', labels: ['SECTION', 'KEEP\nWATCHING', 'PT. 02'], mark: 'N', accent: 'cyan'};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent, frame: false}), {root, W, H, ink, k} = stage, m = 80, number = String(props.number), title = up(props.title);
  const nsize = fit(number, W * .66, H * .46), ncap = capH(nsize), tsize = fit(title, W - m * 2, H * .14), tcap = capH(tsize), total = ncap + 76 + tcap, base = (H - total) / 2 + ncap + 30, ty = base + 76 + tcap;
  const dash = streak(root, stage, ink.alt), frame = root.append('g').attr('transform', `translate(${W / 2} ${H / 2})`).append('g'); bracketFrame(frame, -W / 2 + 30, -H / 2 + 30, W - 60, H - 60, {len: 70, color: ink.accent, width: 5});
  const num = root.append('g'), ghost = glyphs(num, number, W - m, base, nsize, {by: 'all', anchor: 'end', color: 'none'})[0]; ghost.text.attr('stroke', ink.accent).attr('stroke-width', 5);
  const fill = clipLive(stage); fill.rect.attr('x', 0).attr('width', W);
  const solid = glyphs(num.append('g').attr('clip-path', fill.url), number, W - m, base, nsize, {by: 'all', anchor: 'end', color: ink.accent})[0];
  const kicker = txt(root, m, base - ncap - 44, up(props.kicker), {size: 52, color: ink.text, spacing: .2}), rule = root.append('rect').attr('x', m).attr('y', base - ncap - 26).attr('height', 6).attr('fill', ink.alt);
  const letters = glyphs(root.append('g').attr('clip-path', clipBox(stage, 0, ty - tcap - 12, W, tcap + 24)), title, m, ty, tsize, {color: ink.text});
  const note = txt(root, m, ty + 70, up(props.note), {size: 34, color: ink.accent}), labels = readouts(root, props.labels, 130, {x0: m, x1: W - m}), seal = badge(root, W - m - 30, H - 110, 30, props.mark, {color: ink.alt});
  return {
    seek(t) {
      const q = span(t, .1, .6), e = easeBack(q), pulse = q >= 1 ? 1 + Math.sin(t * 1.8) * .012 : 1;
      [ghost, solid].forEach(u => pose(u, {x: (1 - e) * W, sx: (1 + vel(q) * .5) * pulse, sy: pulse, skew: -vel(q) * 14, o: q > 0 ? 1 : 0}));
      const f = easeOut(span(t, .7, .7)); fill.rect.attr('y', base + 20 - (ncap + 40) * f).attr('height', (ncap + 40) * f + 40);
      letters.forEach(u => { const p = span(t, .75 + u.i * .045, .45); pose(u, {y: (1 - easeBack(p)) * u.cap * 1.3, sy: 1 + vel(p) * .3, o: p > 0 ? 1 : 0}); });
      kicker.attr('opacity', appear(t, .5)); rule.attr('width', 200 * easeOut(span(t, .55, .4)));
      frame.attr('transform', `scale(${1 + .12 * (1 - spring(span(t, .3, .6)))})`).attr('opacity', appear(t, .3));
      note.attr('opacity', appear(t, 1.5)).attr('transform', `translate(0 ${20 * (1 - easeOut(span(t, 1.5, .4)))})`);
      const d = (t * .28 + .1) % 1; dash.set(-200 + d * (W + 500), H * .14 + 70 * k, 22, 240, 0, span(t, .6, .2));
      labels.forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06))); seal.attr('transform', `scale(${spring(span(t, 1.4, .5))})`);
    },
  };
}
