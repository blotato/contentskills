// Helpers shared by the overlays in this folder (not a piece: the underscore keeps it out of piece ids).

/**
 * A group for cream type set straight on footage. The kit's `st.soft` shadow is gentle; bright
 * footage (white walls, sky) needs it twice to stay readable, so this nests two of them.
 * The shadow filters are in frame coordinates: never put a transform on the returned group's
 * parents — transform a child group instead.
 */
export const soften = (root, st) => root.append('g').attr('filter', st.soft).append('g').attr('filter', st.soft);
