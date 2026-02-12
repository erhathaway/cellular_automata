<script lang="ts">
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from '../PixelAvatar.svelte';

  export type CommentData = {
    id: string;
    userId: string;
    parentId: string | null;
    body: string;
    score: number;
    createdAt: string;
    userName: string | null;
    userImageUrl: string | null;
    userAvatarId: string | null;
  };

  let {
    comment,
    myVote = 0,
    currentUserId = null,
    isTopLevel = false,
    onvote,
    onreply,
    ondelete,
  }: {
    comment: CommentData;
    myVote?: number;
    currentUserId?: string | null;
    isTopLevel?: boolean;
    onvote: (commentId: string, value: 1 | -1) => void;
    onreply?: () => void;
    ondelete: (commentId: string) => void;
  } = $props();

  let initials = $derived(
    (comment.userName ?? 'A')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );
</script>

<div class="entry">
  <!-- Left: vote rail -->
  <div class="vote-rail">
    <button
      class="vote-btn {myVote === 1 ? 'active' : ''}"
      onclick={() => onvote(comment.id, 1)}
      aria-label="Upvote"
    >
      <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 2L10 8H2z" /></svg>
    </button>
    <span class="vote-score {myVote === 1 ? 'up' : ''} {myVote === -1 ? 'down' : ''}">{comment.score}</span>
    <button
      class="vote-btn {myVote === -1 ? 'active down' : ''}"
      onclick={() => onvote(comment.id, -1)}
      aria-label="Downvote"
    >
      <svg viewBox="0 0 12 12" fill="currentColor"><path d="M6 10L2 4h8z" /></svg>
    </button>
  </div>

  <!-- Right: content -->
  <div class="content">
    <!-- Avatar + meta row -->
    <div class="meta-row">
      <div class="avatar-wrap">
        {#if comment.userAvatarId}
          <PixelAvatar avatarId={comment.userAvatarId} size={20} fallbackInitials={initials} />
        {:else if comment.userImageUrl}
          <img src={comment.userImageUrl} alt="" class="avatar-img" />
        {:else}
          <div class="avatar-fallback">{initials}</div>
        {/if}
      </div>
      <span class="author">{comment.userName ?? 'Anonymous'}</span>
      <span class="dot">·</span>
      <span class="time">{timeAgo(comment.createdAt)}</span>
    </div>

    <!-- Body -->
    <p class="body">{comment.body}</p>

    <!-- Actions -->
    <div class="actions">
      {#if isTopLevel && onreply}
        <button class="action-btn" onclick={onreply}>
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
          </svg>
          Reply
        </button>
      {/if}
      {#if currentUserId && currentUserId === comment.userId}
        <button class="action-btn delete" onclick={() => ondelete(comment.id)}>
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="m19 6-.7 11.4a2 2 0 0 1-2 1.6H7.7a2 2 0 0 1-2-1.6L5 6" />
          </svg>
          Delete
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .entry {
    display: flex;
    gap: 0;
    padding: 10px 0;
    border-top: 1px solid rgba(255,255,255,0.04);
  }

  .entry:first-child {
    border-top: none;
  }

  /* Vote rail */
  .vote-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    width: 32px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .vote-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #44403c;
    border-radius: 2px;
    transition: color 0.15s, background 0.15s;
  }

  .vote-btn svg {
    width: 10px;
    height: 10px;
  }

  .vote-btn:hover {
    color: #facc15;
    background: rgba(250, 204, 21, 0.1);
  }

  .vote-btn.active {
    color: #facc15;
  }

  .vote-btn.active.down {
    color: #ef4444;
  }

  .vote-score {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #57534e;
    min-width: 16px;
    text-align: center;
    line-height: 1;
  }

  .vote-score.up { color: #facc15; }
  .vote-score.down { color: #ef4444; }

  /* Content */
  .content {
    flex: 1;
    min-width: 0;
    padding-left: 8px;
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .avatar-wrap {
    flex-shrink: 0;
  }

  .avatar-img {
    width: 20px;
    height: 20px;
    border-radius: 50%;
  }

  .avatar-fallback {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #292524;
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    font-weight: 700;
    color: #78716c;
  }

  .author {
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #d6d3d1;
  }

  .dot {
    color: #44403c;
    font-size: 10px;
  }

  .time {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #57534e;
  }

  .body {
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: 13px;
    line-height: 1.55;
    color: #a8a29e;
    white-space: pre-wrap;
    margin-top: 4px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #57534e;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    transition: color 0.15s, background 0.15s;
  }

  .action-btn:hover {
    color: #d6d3d1;
    background: rgba(255,255,255,0.06);
  }

  .action-btn.delete:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .action-icon {
    width: 12px;
    height: 12px;
  }
</style>
