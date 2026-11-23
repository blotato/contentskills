import {C, stage, glass, capH, fit, glyphs, pose, label, rule, comma, leave, fade, glide, span, clamp, mix} from '../../kit.js';

// A figure that counts fast and lands hard: thin tall numerals race from `from` to `value`, and on
// the last frame of the count the number arrives a size too large and settles in a few frames, a wide
// accent rule shooting out under it. `strike` (a string) shows the old figure above with the accent line
// through it. `pane: true` sets it on a frosted glass card that rises in with the count and leaves with it. The count starts at `startAt` and runs for `seconds`. (x, y) is the centre of the numerals. `theme: 'ink'` for bone grounds.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 12, from: 0, prefix: '', suffix: '', decimals: 0, label: 'cuts', strike: '', startAt: .05, seconds: .5, x: 540, y: 380, width: 760, maxSize: 420, theme: 'clear', accent: 'poppy', pane: false};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {x, y} = props, color = props.theme === 'ink' ? C.ink : C.white, show = v => props.prefix + (props.decimals ? v.toFixed(props.decimals) : comma(v)) + props.suffix;
  const final = show(props.value), widest = [final, show(props.from)].sort((a, b) => b.length - a.length)[0], size = fit(widest, props.width, props.maxSize, {role: 'num'}), cap = capH(size, {role: 'num'}), padY = 56, top = y - cap / 2 - padY - (props.strike ? 70 : 0), paneH = cap + 112 + 30 + padY * 2 + (props.strike ? 70 : 0),
    pane = props.pane ? glass(st.root.append('g'), st, x - props.width / 2, top, props.width, paneH, {r: 48, tone: props.theme === 'ink' ? 'bone' : 'ink'}) : null, g = st.root.append('g').attr('filter', props.theme === 'ink' ? null : st.soft).append('g');
  const num = glyphs(g, final, x, y + cap / 2, size, {by: 'all', anchor: 'middle', role: 'num', color})[0]; num.text.style('font-variant-numeric', 'tabular-nums');
  const bar = rule(g, x - props.width * .32, y + cap / 2 + 46, props.width * .64, st.ink.accent, 8), text = label(g, x, y + cap / 2 + 112, props.label, {size: 30, anchor: 'middle', color});
  const old = props.strike ? label(g, x, y - cap / 2 - 50, props.strike, {size: 34, anchor: 'middle', color}) : null, cut = props.strike ? rule(g, x - 110, y - cap / 2 - 61, 220, st.ink.accent, 5) : null;
  return {
    seek(t) {
      const out = leave(t, props.life, .2), land = props.startAt + props.seconds, q = span(t, props.startAt, props.seconds), hit = glide(span(t, land, .18)), running = t < land;
      num.text.text(show(mix(props.from, props.value, q * q * (3 - 2 * q)))).attr('fill', running ? color : props.theme === 'ink' ? C.ink : C.white);
      pose(num, {sx: running ? 1 : 1.3 - .3 * hit, o: clamp((t - props.startAt + .1) / .1) * (1 - out), blur: running ? size * .012 : (1 - hit) * size * .05 + out * 8});
      pane?.attr('opacity', glide(span(t, props.startAt - .1, .16)) * (1 - out)).attr('transform', `translate(0 ${(1 - glide(span(t, props.startAt - .1, .22))) * 28})`);
      bar.set(glide(span(t, land, .3)) * (1 - out)); text.attr('opacity', fade(t, land + .05, .2) * (1 - out));
      old?.attr('opacity', fade(t, 0, .2) * .85 * (1 - out)); cut?.set(glide(span(t, props.startAt + .1, .25)) * (1 - out));
    },
  };
}
