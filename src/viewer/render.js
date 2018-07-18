export default ({ renderer, scene, camera, updateFn, stats }) => {
  const render = () => {
    renderer.render( scene, camera );
  };
  const animate = () => {
    requestAnimationFrame(animate);
    if (updateFn) updateFn();
    render();
    if (stats) stats.update();
  };
  requestAnimationFrame(animate);
}
