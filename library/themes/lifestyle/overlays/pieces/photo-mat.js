import {stage, look, C, FRAME, up, txt, tag, hand, sheet, fade, glide, span, leave, swell} from '../../kit.js';

// A paper mat around the whole picture, like a mounted print: four paper bars slide in from the
// edges and settle into a border, with a caps title and date on the wide bottom bar, a pill tag
// in the top corner and a handwritten note. The footage shows through the window untouched.
// `inset` is the border width in px; `foot` the height of the bottom bar.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Sunday, slowly', date: 'No. 04 — June', tag: 'Journal', note: 'keep this one', inset: 44, foot: 210, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {width: W, height: H} = FRAME, b = props.inset, f = props.foot;
  const bars = [root.append('rect').attr('fill', C.paper), root.append('rect').attr('fill', C.paper), root.append('rect').attr('fill', C.paper), root.append('rect').attr('fill', C.paper)];
  const foot = root.append('g'), title = txt(foot, b + 26, H - f + 92, props.title, {size: 68, role: 'head'}), date = txt(foot, b + 28, H - f + 146, up(props.date), {size: 24, role: 'label', color: C.soft});
  const note = hand(foot, st, W - b - 30, H - f + 120, props.note, {size: 62, color: ink.accent, anchor: 'end', rot: -4});
  const chip = tag(root, b + 28, b + 62, props.tag, {fill: C.paper, color: C.ink, size: 24, dot: ink.accent});
  return {
    seek(t) {
      const x = leave(t, props.life, .6), e = swell(span(t, 0, .9)) * (1 - x);
      bars[0].attr('x', 0).attr('y', 0).attr('width', W).attr('height', b * e);
      bars[1].attr('x', 0).attr('y', H - f * e).attr('width', W).attr('height', f * e + 2);
      bars[2].attr('x', 0).attr('y', 0).attr('width', b * e).attr('height', H);
      bars[3].attr('x', W - b * e).attr('y', 0).attr('width', b * e).attr('height', H);
      foot.attr('transform', `translate(0 ${f * (1 - e)})`);
      title.attr('opacity', fade(t, .55, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .55, .8))) * 20})`); date.attr('opacity', fade(t, .8, .6));
      note.set(glide(span(t, 1.2, 1.1))); chip.g.attr('opacity', fade(t, .9, .5) * (1 - x)).attr('transform', `translate(0 ${(1 - glide(span(t, .9, .7))) * -16})`);
    },
  };
}
