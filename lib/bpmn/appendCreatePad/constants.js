// gap between an element's right edge and the "+", shared by the indicator
// overlay and the append pad. The pad gap scales with zoom to track the indicator
// so the "+" doesn't jump when the pad opens.
export const APPEND_GAP = 12;

// smallest screen-px gap the append pad keeps from the element.
export const MIN_PAD_GAP = 8;

// the append pad's structural left offset, in px, that cancels its own CSS so the
// first "+" box lines up with the indicator: it equals the pad's CSS translateX
// (20px, see .djs-append-create-pad in create-pad.css) minus the 4px padding of
// its entries row. Keep it in sync if either CSS value changes.
export const PAD_CONTENT_OFFSET = 16;
