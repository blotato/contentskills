import {stage, gridLines, tone} from '../../kit.js';

// A ground of one colour with subtle grid squares: graph paper instead of a flat colour. Put it "behind": true so it
// sits under the clip's windows (the plates and split panes). Holds still.
// Props: color, cell (px), line (grid colour), opacity.
export const meta = {duration: 5, live: false};
export const defaults = {color: '#4A1222', cell: 72, line: '#F1EDE6', opacity: .07};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'});
  st.root.append('rect').attr('width', 1080).attr('height', 1920).attr('fill', tone(props.color ?? defaults.color));
  gridLines(st.root, {cell: props.cell ?? 72, color: props.line ?? defaults.line, opacity: props.opacity ?? .07});
  return {seek() {}};
}
