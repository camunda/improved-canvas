// gap between an element's right edge and the "+", in diagram units; shared by
// the indicator overlay and the append pad so the "+" doesn't move when the pad
// opens (scales with zoom)
export const APPEND_GAP = 17;

// the append pad's structural left offset, in px, that cancels its own CSS so the
// first "+" box lines up with the indicator: it equals the pad's CSS translateX
// (20px, see .djs-append-create-pad in create-pad.css) minus the 4px padding of
// its entries row. Keep it in sync if either CSS value changes.
export const PAD_CONTENT_OFFSET = 16;

// gap between a boundary event and its create pad.
export const CREATE_PAD_MARGIN = 28;
