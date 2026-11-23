import {textStage, up, fit, capH, glyphs, pose, txt, readouts, inset, bracketFrame, badge, streak, appear, span, spring, easeOut, easeBack, vel} from '../kit.js';

// Two words stacked and pushed apart: the top one flies in from the left, the bottom one from the
// right, both stretched and split by their speed, and a bracketed picture inset pops between
// them. `image` is an optional picture URL for the inset; without it a stand-in scene is drawn.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  top: 'THINK', bottom: 'BIGGER', caption: 'START BEFORE\nYOU FEEL READY', note: 'THE FIRST DRAFT\nCAN BE BAD',
  labels: ['PART\nTWO', 'MINDSET', 'NOTES\nTO SELF', 'PG. 04'], marks: ['A', 'R'], image: null, accent: 'magenta',
};

export function mount(el, props = defaults) {
  const stage = textStage(el, {accent: props.accent}), {root, W, H, ink} = stage, m = 64, a = up(props.top), b = up(props.bottom);
  const size = fit([a, b], W * .76, H * .26), cap = capH(size), s = Math.max(190, Math.min(cap * .78, 300)), g = s / 2 - cap * .1, cy = H * .5, ix = W * .5 - s / 2 + 40;
  const dashes = [0, 1].map(() => streak(root, stage, ink.alt)), labels = readouts(root, props.labels, 112);
  const words = [glyphs(root, a, m, cy - g, size, {color: ink.head, echo: true}), glyphs(root, b, W - m, cy + g + cap, size, {anchor: 'end', color: ink.text, echo: true})];
  const pic = inset(root, stage, ix, cy - s / 2, s, s, {image: props.image, color: ink.alt}), frame = bracketFrame(pic, -s / 2 - 18, -s / 2 - 18, s + 36, s + 36, {len: s * .22, color: ink.alt, width: 7});
  const caption = txt(root, m, cy - 4, up(props.caption), {size: 34}), note = txt(root, W - m, cy - 4, up(props.note), {size: 34, anchor: 'end'});
  const marks = [badge(root, m + 34, H - 96, 30, props.marks[0], {color: ink.accent}), badge(root, W - m - 34, H - 96, 30, props.marks[1], {color: ink.accent})];
  return {
    seek(t) {
      words.forEach((row, w) => row.forEach(u => {
        const dir = w ? 1 : -1, order = w ? u.i : u.n - 1 - u.i, q = span(t, .1 + w * .22 + order * .035, .6), e = easeBack(q), drift = Math.sin(t * .9 + w * 2) * 8;
        pose(u, {x: dir * (1 - e) * W * 1.1 + (q >= 1 ? dir * drift : 0), sx: 1 + vel(q) * .5, skew: -dir * vel(q) * 14, y: -u.cap * .18 * Math.sin(Math.PI * q) * (order % 2 ? 1 : -1), o: q > 0 ? 1 : 0, apart: vel(q) * 14});
      }));
      const q = span(t, .75, .6), bob = Math.sin(t * 1.4) * 10;
      pic.attr('transform', `translate(0 ${bob}) rotate(${(1 - spring(q)) * -40}) scale(${spring(q)})`);
      frame.attr('transform', `scale(${1 + .5 * (1 - easeOut(span(t, 1, .4))) + .02 * Math.sin(t * 2.8)})`).attr('opacity', appear(t, 1));
      caption.attr('opacity', appear(t, 1.15)).attr('transform', `translate(0 ${20 * (1 - easeOut(span(t, 1.15, .4)))})`);
      note.attr('opacity', appear(t, 1.3)).attr('transform', `translate(0 ${20 * (1 - easeOut(span(t, 1.3, .4)))})`);
      dashes.forEach((p, i) => { const d = (t * (i ? .3 : .24) + i * .45) % 1; p.set(i ? W + 200 - d * (W + 500) : -200 + d * (W + 500), i ? H * .84 : H * .19, 22, 220, i ? 180 : 0, span(t, .6, .2)); });
      labels.forEach((node, i) => node.attr('opacity', appear(t, .45 + i * .06)));
      marks.forEach((node, i) => node.attr('transform', `scale(${spring(span(t, 1.3 + i * .15, .5))})`));
    },
  };
}
