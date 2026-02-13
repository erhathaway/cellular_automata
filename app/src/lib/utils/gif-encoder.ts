export async function encodeGif(
  frames: ImageData[],
  width: number,
  height: number,
  delay: number
): Promise<Blob> {
  const gifenc = await import('gifenc');
  // Handle CJS interop: named exports may be on module or on module.default
  const mod = (gifenc as any).default ?? gifenc;
  const GIFEncoder = typeof mod === 'function' ? mod : mod.GIFEncoder;
  const quantize = mod.quantize ?? gifenc.quantize;
  const applyPalette = mod.applyPalette ?? gifenc.applyPalette;

  const gif = GIFEncoder();

  for (let i = 0; i < frames.length; i++) {
    const data = frames[i].data;
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, { palette, delay });
  }

  gif.finish();
  return new Blob([gif.bytesView()], { type: 'image/gif' });
}
