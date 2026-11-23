import {C, F, hudStage, chamfer, plate, line, text, brackets} from '../../hud.js';

/** Shared diagram card: grid background (or a see-through plate when `clear`), frame, title and unit line. */
export function card(el, props) {
  const stage = hudStage(el, {clear: props.clear}), {root} = stage;
  if (props.clear) plate(root, chamfer(30, 30, 940, 940, 36), .74);
  const frame = line(root, brackets(30, 30, 940, 940, 70), C.cyan, 4);
  text(root, 80, 128, props.title.toUpperCase(), {size: Math.min(54, 800 / (props.title.length * .8)), font: F.display, weight: 800, color: C.white, spacing: '.03em'});
  text(root, 80, 172, (props.unit ?? '').toUpperCase(), {size: 22, color: C.amber, spacing: '.22em'});
  line(root, 'M80 196H920', C.dim, 2);
  return {...stage, frame};
}
