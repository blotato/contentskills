// Small helpers shared by the diagrams in this folder (not a piece: the underscore keeps it out of piece ids).
import {fade, glide, span} from '../../kit.js';
/** The standard soft arrival for a node: fades up while rising `dy` px into place. Starts at `start` seconds. */
export const arrive = (node, t, start, dy = 18, length = .7) => node.attr('opacity', fade(t, start, length * .7)).attr('transform', `translate(0 ${(1 - glide(span(t, start, length))) * dy})`);
/** A gentle idle sway (px) once things have landed. */
export const sway = (t, i = 0, amount = 3) => Math.sin(t * .8 + i * 1.3) * amount;
