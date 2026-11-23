import {glass, C, stage, capH, fit, up, flat, glyphs, pose, rule, leave, fade, glide, span, easeInOut, clamp} from '../../kit.js';

// Kinetic type: a stack of short lines, each landing at its cue — it arrives large and soft and settles
// sharp in a few frames (no bounce), while the lines before it step back. Every line is fitted to the
// same width, so short words come out huge: scale IS the emphasis. lines: [{text, at, face: 'wide' | 'tall',
// accent: true}]. (x, y) is the top centre of the stack; `theme: 'ink'` sets it in near-black for bone grounds.
export const meta = {duration: 4, live: true};
export const defaults = {lines: [{text: 'Not', at: .1}, {text: 'A single', at: .45, face: 'tall'}, {text: 'Cut', at: .9, accent: true}], x: 540, y: 150, w: 760, maxWide: 190, maxTall: 330, gap: 30, dim: .5, theme: 'clear', accent: 'poppy', pane: false};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {x, w} = props, color = props.theme === 'ink' ? C.ink : C.white, g = st.root.append('g').attr('filter', props.theme === 'ink' ? null : st.soft).append('g');
  let top = props.y;
  const lines = props.lines.map(l => {
    const tall = l.face === 'tall', role = tall ? 'tall' : 'wide', str = up(flat(l.text)), size = fit(str, w, tall ? props.maxTall : props.maxWide, {role}), cap = capH(size, {role}), base = top + cap;
    const unit = glyphs(g, str, x, base, size, {by: 'all', anchor: 'middle', role, color: l.accent ? st.ink.accent : color})[0];
    top = base + props.gap + cap * .08;
    return {l, unit, size};
  });
  const bar = rule(g, x - 60, top + 6, 120, st.ink.accent, 6), lastAt = Math.max(...props.lines.map(l => l.at));
  // `pane: true` sets the stack on smoked glass so it reads on any wall; the pane grows a line at a time with the words
  const kids = [...g.node().children], panes = !props.pane ? [] : lines.map((_, k) => {
    const hide = k + 1 < lines.length ? kids.filter(n => !lines.slice(0, k + 1).some(({unit}) => unit.g?.node?.() === n || n.contains(unit.text.node()))) : [];
    hide.forEach(n => n.style.display = 'none'); const b = g.node().getBBox(); hide.forEach(n => n.style.display = '');
    return glass(st.under.append('g'), st, b.x - 64, b.y - 40, b.width + 128, b.height + 80, {r: 44, tone: 'ink'});
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .2);
      lines.forEach(({l, unit, size}, i) => {
        const q = span(t, l.at, .2), e = glide(q), later = lines.slice(i + 1).reduce((n, o) => Math.max(n, glide(span(t, o.l.at, .2))), 0);
        pose(unit, {sx: 1.42 - .42 * e, o: clamp(q * 4) * (1 - out) * (1 - (1 - props.dim) * later * (l.accent ? 0 : 1)), blur: (1 - e) * size * .1 + out * 8});
      });
      bar.set(glide(span(t, lastAt + .12, .3)) * (1 - out));
      panes.forEach((p, k) => p.attr('opacity', glide(span(t, lines[k].l.at - .08, .2)) * (k + 1 < panes.length ? 1 - glide(span(t, lines[k + 1].l.at - .08, .2)) : 1) * (1 - out)));
    },
  };
}
