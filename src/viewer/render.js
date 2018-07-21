export default ({ renderer, scene, camera, updateFn, stats }) => {
  let reqID = undefined;
  const render = () => {
    renderer.render( scene, camera );
  };
  const animate = () => {
    reqID = requestAnimationFrame(animate);
    if (updateFn) updateFn(animate);
    render();
    if (stats) stats.update();
  };
  reqID = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(reqID)
  };
}
