export function isWebCodecsSupported(): boolean {
  return (
    typeof VideoEncoder !== 'undefined' &&
    typeof VideoFrame !== 'undefined' &&
    typeof EncodedVideoChunk !== 'undefined'
  );
}

export async function encodeMp4(
  frames: ImageData[],
  width: number,
  height: number,
  fps: number
): Promise<Blob> {
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

  // H.264 requires even dimensions
  const encWidth = width % 2 === 0 ? width : width + 1;
  const encHeight = height % 2 === 0 ? height : height + 1;

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width: encWidth,
      height: encHeight,
    },
    fastStart: 'in-memory',
  });

  const frameDurationMicros = Math.round(1_000_000 / fps);

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
    error: (e) => { throw e; },
  });

  encoder.configure({
    codec: 'avc1.42001f', // Baseline profile — maximum compatibility
    width: encWidth,
    height: encHeight,
    bitrate: 2_000_000,
    framerate: fps,
  });

  // If we need to pad, create a shared canvas for compositing
  const needsPad = encWidth !== width || encHeight !== height;
  let padCanvas: OffscreenCanvas | undefined;
  let padCtx: OffscreenCanvasRenderingContext2D | undefined;
  if (needsPad) {
    padCanvas = new OffscreenCanvas(encWidth, encHeight);
    padCtx = padCanvas.getContext('2d')!;
  }

  for (let i = 0; i < frames.length; i++) {
    let source: OffscreenCanvas;

    if (needsPad) {
      padCtx!.clearRect(0, 0, encWidth, encHeight);
      padCtx!.putImageData(frames[i], 0, 0);
      source = padCanvas!;
    } else {
      // Draw ImageData onto an OffscreenCanvas for VideoFrame
      source = new OffscreenCanvas(width, height);
      const ctx = source.getContext('2d')!;
      ctx.putImageData(frames[i], 0, 0);
    }

    const vf = new VideoFrame(source, {
      timestamp: i * frameDurationMicros,
      duration: frameDurationMicros,
    });

    const keyFrame = i % 30 === 0;
    encoder.encode(vf, { keyFrame });
    vf.close();
  }

  await encoder.flush();
  encoder.close();
  muxer.finalize();

  return new Blob([target.buffer], { type: 'video/mp4' });
}
