export default addStatsToWindow = () => {
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';

  document.body.appendChild(stats.domElement);
}
