import {theme, textStage, look, up, fit, capH, glyphs, slam, txt, readouts, appear, span, spring, easeOut} from '../kit.js';

// Two sides of an argument on two tinted panels that slide in from opposite edges and meet on a
// slanted seam. Each word slams in letter by letter in its own accent, then a badge punches in
// on the seam and knocks both halves back. `accents` are the two sides' colours.
export const meta = {duration: 4.5, live: true};
export const defaults = {a: 'FAST', b: 'PERFECT', mark: 'VS', aNote: 'SHIPS TODAY', bNote: 'SHIPS SOMEDAY', labels: ['ROUND\nONE', 'PICK\nA SIDE', 'NO TIES'], accents: ['cyan', 'magenta']};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accents[0], frame: false}), {root, W, H, k} = stage, m = 64, A = look(props.accents[0]), B = look(props.accents[1]), slant = 70, r = 130 * (.65 + .35 * k);
  const lower = root.append('g'), upper = root.append('g'), top = `M${-W} ${-H}H${W * 2}V${H / 2 - slant - 40}L${-W} ${H / 2 + slant + 40}Z`, bottom = `M${-W} ${H / 2 + slant + 40}L${W * 2} ${H / 2 - slant - 40}V${H * 2}H${-W}Z`;
  upper.append('path').attr('d', top).attr('fill', A.accent).attr('fill-opacity', .035).attr('stroke', A.accent).attr('stroke-width', 5);
  lower.append('path').attr('d', bottom).attr('fill', B.accent).attr('fill-opacity', .035).attr('stroke', B.accent).attr('stroke-width', 5);
  const size = fit([up(props.a), up(props.b)], W - m * 2, H * .22), cap = capH(size), ya = H * .25 + cap / 2 + 30, yb = H * .75 + cap / 2 - 20;
  const a = glyphs(upper, up(props.a), W / 2, ya, size, {anchor: 'middle', color: A.head, echo: true}), b = glyphs(lower, up(props.b), W / 2, yb, size, {anchor: 'middle', color: B.head, echo: true});
  const aNote = txt(upper, m, ya + 70, up(props.aNote), {size: 40}), bNote = txt(lower, W - m, yb - cap - 36, up(props.bNote), {size: 40, anchor: 'end'});
  const labels = readouts(upper, props.labels, 112);
  const seal = root.append('g').attr('transform', `translate(${W / 2} ${H / 2})`).append('g'); seal.append('path').attr('d', theme.cell(r)).attr('fill', A.bg).attr('stroke', A.third).attr('stroke-width', 6);
  const ring = seal.append('path').attr('d', theme.cell(r - 20)).attr('fill', 'none').attr('stroke', A.third).attr('stroke-width', 3).attr('stroke-dasharray', '18 14');
  const msize = fit(up(props.mark), r * 1.05, r * .9), word = seal.append('g'); txt(word, 0, capH(msize) / 2, up(props.mark), {size: msize, role: 'head', color: A.third, anchor: 'middle'});
  return {
    seek(t) {
      const inA = easeOut(span(t, 0, .4)), inB = easeOut(span(t, .08, .4)), hit = 1.15, knock = t > hit ? 46 * Math.exp(-7 * (t - hit)) * Math.cos((t - hit) * 26) : 0;
      upper.attr('transform', `translate(${-(1 - inA) * W * 1.3} ${-knock})`); lower.attr('transform', `translate(${(1 - inB) * W * 1.3} ${knock})`);
      a.forEach(u => { const q = span(t, .3 + u.i * .05, .5); slam(u, q, 0, {from: 2.2, live: q >= 1 ? Math.sin(t * 2 - u.i * .5) * .015 : 0}); });
      b.forEach(u => { const q = span(t, .55 + u.i * .05, .5); slam(u, q, 0, {from: 2.2, live: q >= 1 ? Math.sin(t * 2 + u.i * .5) * .015 : 0}); });
      aNote.attr('opacity', appear(t, 1.3)); bNote.attr('opacity', appear(t, 1.45));
      const q = span(t, hit - .12, .5), s = q <= 0 ? 0 : 1 + 1.6 * (1 - spring(q));
      seal.attr('transform', `rotate(${Math.sin(t * 1.6) * 5}) scale(${s})`); ring.attr('transform', `rotate(${t * 40})`); word.attr('transform', `rotate(-8)`);
      labels.forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06)));
    },
  };
}
