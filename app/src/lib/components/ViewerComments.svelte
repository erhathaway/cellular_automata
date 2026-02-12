<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { serializeRule } from '$lib/stores/persistence';
  import CommentInput from './comments/CommentInput.svelte';
  import CommentThread from './comments/CommentThread.svelte';
  import type { CommentData } from './comments/CommentItem.svelte';

  let comments: CommentData[] = $state([]);
  let userVotes: Record<string, number> = $state({});
  let currentUserId: string | null = $state(null);
  let sort: 'newest' | 'top' = $state('newest');
  let loading = $state(false);
  let lookupTimer: ReturnType<typeof setTimeout> | undefined;

  let currentParams = $derived.by(() => {
    const rule = automataStore.rule;
    return {
      dimension: automataStore.dimension,
      ruleType: rule.type,
      ruleDefinition: serializeRule(rule),
      neighborhoodRadius: automataStore.neighborhoodRadius
    };
  });

  $effect(() => {
    const dim = automataStore.dimension;
    const rule = automataStore.rule;
    const nr = automataStore.neighborhoodRadius;
    const currentSort = sort;

    const ruleType = rule.type;
    const ruleDefinition = serializeRule(rule);

    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(() => fetchComments(dim, ruleType, ruleDefinition, nr, currentSort), 500);
  });

  async function fetchComments(
    dim: number,
    ruleType: string,
    ruleDefinition: string,
    nr: number,
    s: string
  ) {
    loading = true;
    try {
      const params = new URLSearchParams({
        d: String(dim),
        rt: ruleType,
        rd: ruleDefinition,
        nr: String(nr),
        sort: s
      });
      const res = await fetch(`/api/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        comments = data.comments;
        userVotes = data.userVotes;
        currentUserId = data.currentUserId ?? null;
      }
    } catch {
      // silently fail
    } finally {
      loading = false;
    }
  }

  let threads = $derived.by(() => {
    const topLevel = comments.filter((c) => !c.parentId);
    const replyMap = new Map<string, CommentData[]>();
    for (const c of comments) {
      if (c.parentId) {
        if (!replyMap.has(c.parentId)) replyMap.set(c.parentId, []);
        replyMap.get(c.parentId)!.push(c);
      }
    }
    return topLevel.map((parent) => ({
      parent,
      replies: replyMap.get(parent.id) ?? []
    }));
  });

  let commentCount = $derived(comments.length);

  async function handleCreate(text: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentParams, text })
    });
    if (res.ok) {
      const newComment: CommentData = await res.json();
      comments = [newComment, ...comments];
    }
  }

  async function handleReply(parentId: string, text: string) {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentParams, parentId, text })
    });
    if (res.ok) {
      const newReply: CommentData = await res.json();
      comments = [...comments, newReply];
    }
  }

  function handleVote(commentId: string, value: 1 | -1) {
    const oldVote = userVotes[commentId] ?? 0;
    let scoreDelta: number;
    let newVote: number;
    if (oldVote === value) {
      scoreDelta = -value;
      newVote = 0;
    } else if (oldVote === 0) {
      scoreDelta = value;
      newVote = value;
    } else {
      scoreDelta = value - oldVote;
      newVote = value;
    }

    comments = comments.map((c) =>
      c.id === commentId ? { ...c, score: c.score + scoreDelta } : c
    );
    if (newVote === 0) {
      const { [commentId]: _, ...rest } = userVotes;
      userVotes = rest;
    } else {
      userVotes = { ...userVotes, [commentId]: newVote };
    }

    fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    }).catch(() => {
      comments = comments.map((c) =>
        c.id === commentId ? { ...c, score: c.score - scoreDelta } : c
      );
      if (oldVote === 0) {
        const { [commentId]: _, ...rest } = userVotes;
        userVotes = rest;
      } else {
        userVotes = { ...userVotes, [commentId]: oldVote };
      }
    });
  }

  async function handleDelete(commentId: string) {
    const previousComments = comments;
    comments = comments.filter(
      (c) => c.id !== commentId && c.parentId !== commentId
    );
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) comments = previousComments;
    } catch {
      comments = previousComments;
    }
  }

  function setSort(s: 'newest' | 'top') {
    sort = s;
  }
</script>

<div class="log-root">
  <!-- Mine log panel -->
  <div class="log-panel">
    <!-- Corner nails -->
    <div class="nails"><div class="nail"></div><div class="nail"></div></div>
    <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

    <!-- Header -->
    <div class="log-header">
      <div class="header-left">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
        <h2 class="header-title">Mine Log</h2>
        <span class="header-count">{commentCount}</span>
      </div>
      <div class="sort-group">
        <button
          class="sort-btn {sort === 'newest' ? 'active' : ''}"
          onclick={() => setSort('newest')}
        >Recent</button>
        <button
          class="sort-btn {sort === 'top' ? 'active' : ''}"
          onclick={() => setSort('top')}
        >Top</button>
      </div>
    </div>

    <div class="log-divider"></div>

    <!-- Input -->
    <div class="input-area">
      <CommentInput onsubmit={handleCreate} />
    </div>

    <!-- Threads -->
    {#if loading && comments.length === 0}
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
          <path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
        </svg>
        <span>Loading entries...</span>
      </div>
    {:else if comments.length === 0}
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h6" />
          <path d="M8 11h8" />
        </svg>
        <span>The log is empty — scratch the first entry.</span>
      </div>
    {:else}
      <div class="threads">
        {#each threads as thread (thread.parent.id)}
          <CommentThread
            parent={thread.parent}
            replies={thread.replies}
            {userVotes}
            {currentUserId}
            onvote={handleVote}
            onreply={handleReply}
            ondelete={handleDelete}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .log-root {
    max-width: 48rem;
    margin: 0 auto;
    padding: 0 24px 64px;
  }

  .log-panel {
    position: relative;
    background-color: #1c1917;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 10px,
        rgba(68, 64, 60, 0.1) 10px,
        rgba(68, 64, 60, 0.1) 11px
      );
    border: 2px solid #44403c;
    border-radius: 8px;
    padding: 20px 24px 24px;
  }

  .nails {
    position: absolute;
    top: 8px;
    left: 12px;
    right: 12px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 8px;
  }

  .nail {
    width: 6px;
    height: 6px;
    background: #78716c;
    border-radius: 50%;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
  }

  .log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-icon {
    width: 18px;
    height: 18px;
    color: #facc15;
  }

  .header-title {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #facc15;
  }

  .header-count {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #78716c;
    background: rgba(255,255,255,0.06);
    padding: 1px 7px;
    border-radius: 10px;
  }

  .sort-group {
    display: flex;
    gap: 2px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    padding: 2px;
  }

  .sort-btn {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 3px 10px;
    border-radius: 3px;
    border: none;
    cursor: pointer;
    color: #78716c;
    background: transparent;
    transition: all 0.15s;
  }

  .sort-btn:hover {
    color: #d6d3d1;
  }

  .sort-btn.active {
    background: rgba(250, 204, 21, 0.15);
    color: #facc15;
  }

  .log-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
    margin: 14px 0;
  }

  .input-area {
    margin-bottom: 20px;
  }

  .threads {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 28px 0;
  }

  .empty-state span {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #57534e;
  }

  .empty-icon {
    width: 28px;
    height: 28px;
    color: #44403c;
  }
</style>
