import type { WebGLRenderer, Scene, Camera } from 'three';

interface RenderOptions {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: Camera;
  updateFn?: (animate: () => void) => void;
}

export default ({ renderer, scene, camera, updateFn }: RenderOptions): (() => void) => {
  let reqID: number | undefined;
  const renderFrame = () => {
    renderer.render(scene, camera);
  };
  const animate = () => {
    reqID = requestAnimationFrame(animate);
    if (updateFn) updateFn(animate);
    renderFrame();
  };
  reqID = requestAnimationFrame(animate);

  return () => {
    if (reqID !== undefined) cancelAnimationFrame(reqID);
  };
};
