import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export function encodeGif(
  frames: ImageData[],
  width: number,
  height: number,
  delay: number
): Blob {
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
