<script lang="ts">
  import type { AchievementState } from '$lib/stores/achievements.svelte';
  import AchievementIcon from './AchievementIcon.svelte';

  let {
    achievement,
  }: {
    achievement: AchievementState;
  } = $props();

  let earnedDate = $derived(
    achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : null
  );
</script>

<div class="card" class:earned={achievement.earned} class:unseen={achievement.earned && !achievement.seen}>
  <!-- Corner brackets -->
  <div class="bracket tl"></div>
  <div class="bracket tr"></div>
  <div class="bracket bl"></div>
  <div class="bracket br"></div>
  <!-- Nails -->
  <div class="nail nail-tl"></div>
  <div class="nail nail-tr"></div>
  <div class="nail nail-bl"></div>
  <div class="nail nail-br"></div>

  <div class="card-inner">
    <div class="icon-area">
      <AchievementIcon icon={achievement.def.icon} locked={!achievement.earned} size={36} />
      {#if !achievement.earned}
        <div class="lock-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
      {/if}
    </div>
    <div class="info">
      <span class="name">{achievement.def.name}</span>
      <span class="desc">{achievement.def.description}</span>
      {#if earnedDate}
        <span class="date">Earned {earnedDate}</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .card {
    position: relative;
    background: #1a1a1a;
    border: 1px solid #292524;
    border-radius: 8px;
    padding: 14px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .card.earned {
    border-color: #78716c;
    background: #1c1917;
  }

  .card.unseen {
    border-color: #facc15;
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.2), inset 0 0 8px rgba(250, 204, 21, 0.05);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 12px rgba(250, 204, 21, 0.2), inset 0 0 8px rgba(250, 204, 21, 0.05); }
    50% { box-shadow: 0 0 20px rgba(250, 204, 21, 0.35), inset 0 0 12px rgba(250, 204, 21, 0.1); }
  }

  /* Corner brackets */
  .bracket {
    position: absolute;
    width: 8px;
    height: 8px;
    border-color: #44403c;
    border-style: solid;
    border-width: 0;
  }
  .card.earned .bracket { border-color: #facc15; }
  .tl { top: 3px; left: 3px; border-top-width: 1px; border-left-width: 1px; }
  .tr { top: 3px; right: 3px; border-top-width: 1px; border-right-width: 1px; }
  .bl { bottom: 3px; left: 3px; border-bottom-width: 1px; border-left-width: 1px; }
  .br { bottom: 3px; right: 3px; border-bottom-width: 1px; border-right-width: 1px; }

  /* Nails */
  .nail {
    position: absolute;
    width: 3px;
    height: 3px;
    background: #44403c;
    border-radius: 50%;
    opacity: 0.5;
  }
  .card.earned .nail { background: #78716c; }
  .nail-tl { top: 6px; left: 6px; }
  .nail-tr { top: 6px; right: 6px; }
  .nail-bl { bottom: 6px; left: 6px; }
  .nail-br { bottom: 6px; right: 6px; }

  .card-inner {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .icon-area {
    position: relative;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
  }

  .lock-overlay {
    position: absolute;
    bottom: -4px;
    right: -4px;
    color: #57534e;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .name {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #57534e;
  }

  .card.earned .name {
    color: #facc15;
  }

  .desc {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #78716c;
    line-height: 1.4;
  }

  .date {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    color: #57534e;
    margin-top: 2px;
  }
</style>
