/**
 * Mathematically lightens or darkens a hex color.
 * @param hex The original hex color (e.g., "#9339C6")
 * @param percent How much to adjust it (e.g., 40 for 40% lighter, -40 for 40% darker)
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  // 1. Strip the hash if it exists
  const cleanHex = hex.replace("#", "");

  // 2. Parse the Red, Green, and Blue values
  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  // 3. Adjust them by the percentage
  r = parseInt(`${(r * (100 + percent)) / 100}`);
  g = parseInt(`${(g * (100 + percent)) / 100}`);
  b = parseInt(`${(b * (100 + percent)) / 100}`);

  // 4. Cap the values at 255 (Pure White) and 0 (Pure Black)
  r = r < 255 ? r : 255;
  g = g < 255 ? g : 255;
  b = b < 255 ? b : 255;

  // 5. Convert back to hex strings and pad with zeros if needed
  const rr = r.toString(16).length == 1 ? "0" + r.toString(16) : r.toString(16);
  const gg = g.toString(16).length == 1 ? "0" + g.toString(16) : g.toString(16);
  const bb = b.toString(16).length == 1 ? "0" + b.toString(16) : b.toString(16);

  return "#" + rr + gg + bb;
}
