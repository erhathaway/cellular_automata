<script lang="ts">
  let {
    size = 32,
    class: className = ''
  }: {
    size?: number;
    class?: string;
  } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="loading-icon {className}"
>
  <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
  <line x1="12" y1="22" x2="12" y2="15.5" />
  <polyline points="22 8.5 12 15.5 2 8.5" />
  <polyline points="2 15.5 12 8.5 22 15.5" />
  <line x1="12" y1="2" x2="12" y2="8.5" />
</svg>

<style>
  .loading-icon {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
