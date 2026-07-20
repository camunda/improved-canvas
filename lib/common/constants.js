// gap between an element and a floating pad, in diagram units; scales with zoom.
// Shared by the append pad, append indicator, and context pad so they keep a
// consistent distance from the element.
export const PAD_GAP = 5;

// mirrors diagram-js' outline offset (Outline#_outlineOffset),
// floating pads sit just outside the element's selection outline.
export const OUTLINE_OFFSET = 5;
