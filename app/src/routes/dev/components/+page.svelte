<script lang="ts">
  import LoadingIcon from '$lib/components/LoadingIcon.svelte';
</script>

<div class="page">
  <h1>Components</h1>

  <section>
    <h2>LoadingIcon</h2>
    <p class="desc">Gem wireframe with sphere nodes and gold pulse shots. Props: <code>size</code>, <code>mode</code> (<code>"dark"</code> | <code>"light"</code>).</p>

    <div class="mode-grid">
      <!-- Dark mode -->
      <div class="mode-panel dark-panel">
        <span class="mode-label">dark</span>
        <div class="demo-row">
          <div class="demo-item">
            <LoadingIcon size={24} mode="dark" />
            <span class="label">24</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={32} mode="dark" />
            <span class="label">32</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={48} mode="dark" />
            <span class="label">48</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={64} mode="dark" />
            <span class="label">64</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={96} mode="dark" />
            <span class="label">96</span>
          </div>
        </div>
      </div>

      <!-- Light mode -->
      <div class="mode-panel light-panel">
        <span class="mode-label light-label">light</span>
        <div class="demo-row">
          <div class="demo-item">
            <LoadingIcon size={24} mode="light" />
            <span class="label light-text">24</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={32} mode="light" />
            <span class="label light-text">32</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={48} mode="light" />
            <span class="label light-text">48</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={64} mode="light" />
            <span class="label light-text">64</span>
          </div>
          <div class="demo-item">
            <LoadingIcon size={96} mode="light" />
            <span class="label light-text">96</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .page {
    padding: 40px;
    max-width: 960px;
    color: #d6d3d1;
    font-family: 'Space Grotesk', sans-serif;
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 32px;
    color: #fafaf9;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #fafaf9;
  }

  .desc {
    font-size: 13px;
    color: #78716c;
    margin: 0 0 20px;
  }

  code {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    background: #292524;
    padding: 1px 5px;
    border-radius: 3px;
  }

  section {
    margin-bottom: 40px;
  }

  .mode-grid {
    display: flex;
    gap: 16px;
  }

  .mode-panel {
    flex: 1;
    padding: 20px;
    border-radius: 8px;
    position: relative;
  }

  .dark-panel {
    background: #0c0a09;
    border: 1px solid #292524;
  }

  .light-panel {
    background: #fafaf9;
    border: 1px solid #d6d3d1;
  }

  .mode-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #57534e;
    margin-bottom: 16px;
    display: block;
  }

  .light-label {
    color: #a8a29e;
  }

  .demo-row {
    display: flex;
    align-items: flex-end;
    gap: 20px;
    flex-wrap: wrap;
  }

  .demo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #57534e;
  }

  .light-text {
    color: #a8a29e;
  }
</style>
