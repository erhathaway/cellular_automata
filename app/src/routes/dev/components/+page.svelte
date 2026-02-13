<script lang="ts">
  import LoadingIcon from '$lib/components/LoadingIcon.svelte';
</script>

<div class="page">
  <h1>Components</h1>

  <section>
    <h2>LoadingIcon</h2>
    <p class="desc">Gem wireframe with sphere nodes and random edge pulses. Accepts <code>size</code> and <code>class</code> props. Inherits <code>currentColor</code>.</p>

    <div class="demo-row">
      <div class="demo-item">
        <LoadingIcon size={16} />
        <span class="label">16px</span>
      </div>
      <div class="demo-item">
        <LoadingIcon size={24} />
        <span class="label">24px</span>
      </div>
      <div class="demo-item">
        <LoadingIcon size={32} />
        <span class="label">32px</span>
      </div>
      <div class="demo-item">
        <LoadingIcon size={48} />
        <span class="label">48px</span>
      </div>
      <div class="demo-item">
        <LoadingIcon size={64} />
        <span class="label">64px</span>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-item color-yellow">
        <LoadingIcon size={32} />
        <span class="label">yellow</span>
      </div>
      <div class="demo-item color-cyan">
        <LoadingIcon size={32} />
        <span class="label">cyan</span>
      </div>
      <div class="demo-item color-red">
        <LoadingIcon size={32} />
        <span class="label">red</span>
      </div>
      <div class="demo-item color-dim">
        <LoadingIcon size={32} />
        <span class="label">dim</span>
      </div>
    </div>
  </section>
</div>

<style>
  .page {
    padding: 40px;
    max-width: 720px;
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
    margin: 0 0 16px;
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

  .demo-row {
    display: flex;
    align-items: flex-end;
    gap: 24px;
    margin-bottom: 20px;
  }

  .demo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #a8a29e;
  }

  .label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #57534e;
  }

  .color-yellow { color: #facc15; }
  .color-cyan { color: #22d3ee; }
  .color-red { color: #ef4444; }
  .color-dim { color: #44403c; }
</style>
