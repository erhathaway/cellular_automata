<script lang="ts">
  import { achievementsStore } from '$lib/stores/achievements.svelte';
  import AchievementCard from './AchievementCard.svelte';
  import { onMount } from 'svelte';
  import { ACHIEVEMENTS } from '$lib/achievements/config';

  onMount(() => {
    achievementsStore.fetch();
  });
</script>

<div class="grid-wrapper">
  <div class="grid-header">
    <button
      class="check-btn"
      disabled={achievementsStore.checking}
      onclick={() => achievementsStore.checkAll()}
    >
      {#if achievementsStore.checking}
        Checking... {achievementsStore.checkProgress}/{ACHIEVEMENTS.length}
      {:else}
        Check for updates
      {/if}
    </button>
    {#if achievementsStore.checking}
      <div class="progress-bar">
        <div class="progress-fill" style="width: {(achievementsStore.checkProgress / ACHIEVEMENTS.length) * 100}%"></div>
      </div>
    {/if}
  </div>

  {#if achievementsStore.loading}
    <p class="loading-text">Loading achievements...</p>
  {:else}
    {#each achievementsStore.byCategory as group}
      <div class="category">
        <h3 class="category-label">{group.label}</h3>
        <div class="cards">
          {#each group.items as achievement (achievement.def.id)}
            <AchievementCard {achievement} />
          {/each}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .grid-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .grid-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .check-btn {
    align-self: flex-start;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #facc15;
    background: #292524;
    border: 1px solid #44403c;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .check-btn:hover:not(:disabled) {
    background: #44403c;
    border-color: #facc15;
  }

  .check-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .progress-bar {
    width: 100%;
    height: 3px;
    background: #292524;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #facc15;
    transition: width 0.3s ease;
  }

  .loading-text {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #78716c;
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .category-label {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
    margin: 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #292524;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }
</style>
