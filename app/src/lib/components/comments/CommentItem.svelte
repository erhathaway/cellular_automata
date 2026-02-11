<script lang="ts">
  import { timeAgo } from '$lib/utils/timeAgo';

  export type CommentData = {
    id: string;
    userId: string;
    parentId: string | null;
    body: string;
    score: number;
    createdAt: string;
    userName: string | null;
    userImageUrl: string | null;
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

<div class="flex gap-3">
  {#if comment.userImageUrl}
    <img
      src={comment.userImageUrl}
      alt=""
      class="h-8 w-8 shrink-0 rounded-full"
    />
  {:else}
    <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300">
      {initials}
    </div>
  {/if}

  <div class="min-w-0 flex-1">
    <div class="flex items-baseline gap-2">
      <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {comment.userName ?? 'Anonymous'}
      </span>
      <span class="text-xs text-neutral-400 dark:text-neutral-500">
        {timeAgo(comment.createdAt)}
      </span>
    </div>

    <p class="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
      {comment.body}
    </p>

    <div class="mt-1.5 flex items-center gap-3">
      <!-- Vote controls -->
      <div class="flex items-center gap-1">
        <button
          class="rounded p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 {myVote === 1 ? 'text-blue-500 dark:text-blue-400' : ''}"
          onclick={() => onvote(comment.id, 1)}
          aria-label="Upvote"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3z" clip-rule="evenodd" />
            <path d="M10 7.5a.75.75 0 01.75.75v7a.75.75 0 01-1.5 0v-7A.75.75 0 0110 7.5z" />
          </svg>
        </button>
        <span class="min-w-[1.25rem] text-center text-xs font-medium {myVote === 1 ? 'text-blue-500 dark:text-blue-400' : myVote === -1 ? 'text-red-500 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}">
          {comment.score}
        </span>
        <button
          class="rounded p-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 {myVote === -1 ? 'text-red-500 dark:text-red-400' : ''}"
          onclick={() => onvote(comment.id, -1)}
          aria-label="Downvote"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 17a.75.75 0 01-.55-.24l-3.25-3.5a.75.75 0 111.1-1.02L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5A.75.75 0 0110 17z" clip-rule="evenodd" />
            <path d="M10 12.5a.75.75 0 01-.75-.75v-7a.75.75 0 011.5 0v7a.75.75 0 01-.75.75z" />
          </svg>
        </button>
      </div>

      <!-- Reply button (top-level only) -->
      {#if isTopLevel && onreply}
        <button
          class="text-xs font-medium text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
          onclick={onreply}
        >
          Reply
        </button>
      {/if}

      <!-- Delete button (own comments only) -->
      {#if currentUserId && currentUserId === comment.userId}
        <button
          class="text-xs font-medium text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400"
          onclick={() => ondelete(comment.id)}
        >
          Delete
        </button>
      {/if}
    </div>
  </div>
</div>
