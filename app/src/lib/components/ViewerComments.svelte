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

  // Current rule params for posting
  let currentParams = $derived.by(() => {
    const rule = automataStore.rule;
    return {
      dimension: automataStore.dimension,
      ruleType: rule.type,
      ruleDefinition: serializeRule(rule),
      neighborhoodRadius: automataStore.neighborhoodRadius
    };
  });

  // Debounced fetch when config changes
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

  // Group flat comments into threads
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
      body: JSON.stringify({
        ...currentParams,
        text
      })
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
      body: JSON.stringify({
        ...currentParams,
        parentId,
        text
      })
    });
    if (res.ok) {
      const newReply: CommentData = await res.json();
      comments = [...comments, newReply];
    }
  }

  function handleVote(commentId: string, value: 1 | -1) {
    const oldVote = userVotes[commentId] ?? 0;

    // Optimistic update
    let scoreDelta: number;
    let newVote: number;
    if (oldVote === value) {
      // Toggle off
      scoreDelta = -value;
      newVote = 0;
    } else if (oldVote === 0) {
      // New vote
      scoreDelta = value;
      newVote = value;
    } else {
      // Flip vote
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

    // Fire and forget
    fetch(`/api/comments/${commentId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    }).catch(() => {
      // Revert on failure
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

    // Optimistic: remove comment and its replies
    comments = comments.filter(
      (c) => c.id !== commentId && c.parentId !== commentId
    );

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) {
        comments = previousComments;
      }
    } catch {
      comments = previousComments;
    }
  }

  function setSort(s: 'newest' | 'top') {
    sort = s;
  }
</script>

<div class="mx-auto max-w-3xl px-6 pb-16">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
      {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
    </h2>
    <div class="flex gap-1">
      <button
        class="rounded px-2.5 py-1 text-xs font-medium {sort === 'newest' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}"
        onclick={() => setSort('newest')}
      >
        Newest
      </button>
      <button
        class="rounded px-2.5 py-1 text-xs font-medium {sort === 'top' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}"
        onclick={() => setSort('top')}
      >
        Top
      </button>
    </div>
  </div>

  <div class="mt-6">
    <CommentInput onsubmit={handleCreate} />
  </div>

  {#if loading && comments.length === 0}
    <p class="mt-8 text-center text-sm text-neutral-400 dark:text-neutral-500">Loading comments...</p>
  {:else if comments.length === 0}
    <p class="mt-8 text-center text-sm text-neutral-400 dark:text-neutral-500">No comments yet</p>
  {:else}
    <div class="mt-8 flex flex-col gap-6">
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
