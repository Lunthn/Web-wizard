export const rgbToHex = (rgb: string): string | null => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  const [, r, g, b] = match.map((v) => parseInt(v, 10));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const rgbToHsl = (rgb: string): string | null => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  let [r, g, b] = match.slice(1).map((v) => parseInt(v, 10) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      r === max
        ? (g - b) / d + (g < b ? 6 : 0)
        : g === max
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`;
};
