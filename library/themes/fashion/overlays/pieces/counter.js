import {stage, capH, fit, glyphs, pose, label, rule, comma, leave, fade, glide, span, easeInOut} from '../../kit.js';

// The figure just spoken, set on the footage in thin tall numerals that come up out of blur while
// they count, over a short accent hairline and one line of small print. `y` is the numerals' baseline.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 12, from: 0, prefix: '', suffix: '', label: 'looks in the edit', seconds: .8, decimals: 0, x: 540, y: 420, maxSize: 300, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, ink} = st, o = {role: 'num'}, show = v => props.prefix + (props.decimals ? v.toFixed(props.decimals) : comma(v)) + props.suffix;
  const final = show(props.value), size = fit(final, 700, props.maxSize, o), g = root.append('g').attr('filter', st.soft).append('g'), x = props.x, y = props.y;
  const num = glyphs(g, final, x, y, size, {by: 'all', anchor: 'middle', role: 'num'})[0]; num.text.style('font-variant-numeric', 'tabular-nums');
  const bar = rule(g, x - 45, y + 46, 90, ink.accent, 4), text = label(g, x, y + 100, props.label, {size: 22, anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25), q = span(t, 0, .4);
      num.text.text(show(props.from + (props.value - props.from) * glide(span(t, .05, props.seconds))));
      pose(num, {o: easeInOut(q) * (1 - out), blur: (1 - glide(q)) * size * .12 + out * 10, sx: 1.04 - .04 * glide(span(t, 0, 1))});
      bar.set(glide(span(t, .12, .4)) * (1 - out)); text.attr('opacity', fade(t, .15, .3) * .9 * (1 - out));
    },
  };
}
