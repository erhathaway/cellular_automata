<script lang="ts">
  import type { AchievementState } from '$lib/stores/achievements.svelte';
  import { ACHIEVEMENT_CATEGORIES } from '$lib/achievements/config';
  import { timeAgo } from '$lib/utils/timeAgo';
  import AchievementIcon from './AchievementIcon.svelte';

  const categoryLabelMap = new Map(ACHIEVEMENT_CATEGORIES.map(c => [c.id, c.label]));

  let {
    achievement,
  }: {
    achievement: AchievementState;
  } = $props();
</script>

<div class="card" class:earned={achievement.earned} class:locked={!achievement.earned} class:unseen={achievement.earned && !achievement.seen}>
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

  {#if achievement.earned && !achievement.seen}
    <span class="new-badge">New</span>
  {/if}
  <span class="category">{categoryLabelMap.get(achievement.def.category) ?? achievement.def.category}</span>

  <div class="icon-area">
    <AchievementIcon icon={achievement.def.icon} locked={!achievement.earned} size={44} />
    {#if !achievement.earned}
      <div class="lock-overlay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
    {/if}
  </div>

  <div class="text">
    <span class="name">{achievement.def.name}</span>
    <span class="desc">{achievement.def.description}</span>
    {#if achievement.earned && achievement.earnedAt}
      <span class="date"><span class="date-label">Awarded:</span> {timeAgo(achievement.earnedAt)}</span>
    {/if}
  </div>
</div>

<style>
  .card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px 16px 16px;
    background: #1c1917;
    border: 1px solid #78716c;
    border-radius: 8px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .card.locked {
    border-color: #292524;
    background: #1a1a1a;
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

  .new-badge {
    position: absolute;
    top: -6px;
    left: -6px;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #000;
    background: #facc15;
    padding: 2px 7px;
    border-radius: 4px;
    z-index: 1;
    animation: badge-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes badge-pop {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .category {
    position: absolute;
    top: 6px;
    right: 10px;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a8a29e;
  }

  .card.locked .category {
    color: #57534e;
  }

  .icon-area {
    position: relative;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
  }

  .lock-overlay {
    position: absolute;
    bottom: -4px;
    right: -4px;
    color: #57534e;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .name {
    font-family: 'Space Mono', monospace;
    font-size: 15px;
    font-weight: 700;
    color: #facc15;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .card.locked .name {
    color: #57534e;
  }

  .desc {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    color: #a8a29e;
    line-height: 1.4;
    margin: 6px 0;
  }

  .card.locked .desc {
    color: #78716c;
  }

  .date {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #d6d3d1;
    white-space: nowrap;
    margin-top: 6px;
  }

  .date-label {
    color: #78716c;
  }
</style>
