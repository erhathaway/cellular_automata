<div class="card">
  <div class="containment-frame">
    <span class="corner tl"></span>
    <span class="corner tr"></span>
    <span class="corner bl"></span>
    <span class="corner br"></span>
    <span class="edge top"></span>
    <span class="edge bottom"></span>
    <span class="edge left"></span>
    <span class="edge right"></span>
    <div class="thumb-placeholder"></div>
  </div>
  <div class="info-row">
    <div class="bar w60"></div>
    <div class="bar w8"></div>
  </div>
  <div class="meta-row">
    <div class="avatar-dot"></div>
    <div class="bar w20"></div>
    <div class="bar w10"></div>
  </div>
</div>

<style>
  .card {
    padding: 6px 6px 8px;
    border-radius: 6px;
  }

  .containment-frame {
    position: relative;
    border-radius: 6px;
    overflow: visible;
  }

  /* Corner brackets */
  .corner {
    position: absolute;
    width: 16px;
    height: 16px;
    z-index: 3;
    pointer-events: none;
  }

  .corner.tl {
    top: -1px; left: -1px;
    border-top: 3px solid #d6d3d1;
    border-left: 3px solid #d6d3d1;
    border-top-left-radius: 4px;
  }

  .corner.tr {
    top: -1px; right: -1px;
    border-top: 3px solid #d6d3d1;
    border-right: 3px solid #d6d3d1;
    border-top-right-radius: 4px;
  }

  .corner.bl {
    bottom: -1px; left: -1px;
    border-bottom: 3px solid #d6d3d1;
    border-left: 3px solid #d6d3d1;
    border-bottom-left-radius: 4px;
  }

  .corner.br {
    bottom: -1px; right: -1px;
    border-bottom: 3px solid #d6d3d1;
    border-right: 3px solid #d6d3d1;
    border-bottom-right-radius: 4px;
  }

  /* Electric edges (muted for skeleton) */
  .edge {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    opacity: 0.25;
  }

  .edge.top, .edge.bottom {
    left: 16px;
    right: 16px;
    height: 2px;
    background: repeating-linear-gradient(
      90deg, #d6d3d1 0px, #d6d3d1 3px, transparent 3px, transparent 7px
    );
    background-size: 14px 2px;
  }

  .edge.top { top: 0; }
  .edge.bottom { bottom: 0; }

  .edge.left, .edge.right {
    top: 16px;
    bottom: 16px;
    width: 2px;
    background: repeating-linear-gradient(
      180deg, #d6d3d1 0px, #d6d3d1 3px, transparent 3px, transparent 7px
    );
    background-size: 2px 14px;
  }

  .edge.left { left: 0; }
  .edge.right { right: 0; }

  .thumb-placeholder {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    background: linear-gradient(110deg, #f5f5f4 30%, #ede9e4 50%, #f5f5f4 70%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
  }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    padding: 0 2px;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    padding: 0 2px;
  }

  .bar {
    height: 10px;
    border-radius: 4px;
    background: linear-gradient(110deg, #f5f5f4 30%, #ede9e4 50%, #f5f5f4 70%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
  }

  .w60 { width: 60%; }
  .w20 { width: 80px; }
  .w10 { width: 40px; }
  .w8  { width: 32px; }

  .avatar-dot {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 50%;
    background: linear-gradient(110deg, #f5f5f4 30%, #ede9e4 50%, #f5f5f4 70%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
  }

  @keyframes skeleton-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
