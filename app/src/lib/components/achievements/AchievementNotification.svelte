<script lang="ts">
  import { achievementsStore } from '$lib/stores/achievements.svelte';
  import AchievementIcon from './AchievementIcon.svelte';
  import { onMount } from 'svelte';

  let visible = $derived(achievementsStore.newlyEarned.length > 0);
  let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (visible) {
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
      autoDismissTimer = setTimeout(() => {
        achievementsStore.dismissNotification();
      }, 8000);
    }
    return () => {
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
    };
  });

  function dismiss() {
    if (autoDismissTimer) clearTimeout(autoDismissTimer);
    achievementsStore.dismissNotification();
  }
</script>

{#if visible}
  <div class="notification" role="alert">
    <div class="glow"></div>
    <div class="content">
      {#if achievementsStore.newlyEarned.length === 1}
        {@const a = achievementsStore.newlyEarned[0]}
        <div class="single">
          <AchievementIcon icon={a.def.icon} size={28} />
          <div class="text">
            <span class="title">Achievement unlocked!</span>
            <span class="name">{a.def.name}</span>
          </div>
        </div>
      {:else}
        <div class="multi">
          <span class="title">{achievementsStore.newlyEarned.length} achievements unlocked!</span>
          <div class="list">
            {#each achievementsStore.newlyEarned as a (a.def.id)}
              <div class="list-item">
                <AchievementIcon icon={a.def.icon} size={16} />
                <span class="list-name">{a.def.name}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      <div class="actions">
        <a href="/backpack?tab=achievements" class="view-link" onclick={dismiss}>View</a>
        <button class="dismiss-btn" onclick={dismiss}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .notification {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .glow {
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    background: radial-gradient(ellipse at center, rgba(250, 204, 21, 0.15) 0%, transparent 70%);
    pointer-events: none;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .content {
    position: relative;
    background: #1c1917;
    border: 1px solid #facc15;
    border-radius: 10px;
    padding: 14px 16px;
    min-width: 240px;
    max-width: 320px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6), 0 0 12px rgba(250, 204, 21, 0.15);
  }

  .single {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
  }

  .name {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #fafaf9;
  }

  .multi {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .list-name {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #d6d3d1;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    justify-content: flex-end;
  }

  .view-link {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #facc15;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .dismiss-btn {
    background: none;
    border: none;
    color: #78716c;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
  }

  .dismiss-btn:hover {
    color: #d6d3d1;
  }
</style>
