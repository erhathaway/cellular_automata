<div class="skeleton-unit">
  <!-- Corner electrodes -->
  <span class="electrode tl"></span>
  <span class="electrode tr"></span>
  <span class="electrode bl"></span>
  <span class="electrode br"></span>

  <div class="thumb-placeholder"></div>
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
  .skeleton-unit {
    position: relative;
    padding: 8px;
    border: 2px solid #d6d3d1;
    border-radius: 8px;
    background: white;
  }

  /* Corner electrodes */
  .electrode {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d6d3d1;
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(0, 0, 0, 0.08);
    z-index: 2;
  }

  .electrode.tl { top: -3px; left: -3px; }
  .electrode.tr { top: -3px; right: -3px; }
  .electrode.bl { bottom: -3px; left: -3px; }
  .electrode.br { bottom: -3px; right: -3px; }

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
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
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
