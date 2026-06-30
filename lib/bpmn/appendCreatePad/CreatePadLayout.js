/**
 * Shared positioning constants for the append pad and the append indicator.
 *
 * The grey indicator mirrors the pad so the "+" doesn't jump when hovering opens
 * the pad — both must use the same values, hence this single source of truth.
 */

// gap between an element's right edge and the "+", in diagram units; shared by
// the indicator overlay and the append pad so the "+" doesn't move when the pad
// opens (scales with zoom)
export const APPEND_GAP = 17;

// the append pad's structural left offset, in px: its CSS translate(-20px) minus
// its 4px entries padding, i.e. how far the first "+" box sits inside the pad
export const PAD_CONTENT_OFFSET = 16;

// distance from a boundary event's edge to its pad container, in px (the boundary
// pad has no indicator to mirror)
export const CREATE_PAD_MARGIN = 28;
