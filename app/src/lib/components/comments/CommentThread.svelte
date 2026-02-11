<script lang="ts">
  import CommentItem, { type CommentData } from './CommentItem.svelte';
  import CommentInput from './CommentInput.svelte';

  let {
    parent,
    replies = [],
    userVotes = {},
    currentUserId = null,
    onvote,
    onreply,
    ondelete,
  }: {
    parent: CommentData;
    replies?: CommentData[];
    userVotes?: Record<string, number>;
    currentUserId?: string | null;
    onvote: (commentId: string, value: 1 | -1) => void;
    onreply: (parentId: string, text: string) => Promise<void>;
    ondelete: (commentId: string) => void;
  } = $props();

  let showReplyInput = $state(false);

  async function handleReply(text: string) {
    await onreply(parent.id, text);
    showReplyInput = false;
  }
</script>

<div class="flex flex-col gap-3">
  <CommentItem
    comment={parent}
    myVote={userVotes[parent.id] ?? 0}
    {currentUserId}
    isTopLevel={true}
    {onvote}
    onreply={() => (showReplyInput = !showReplyInput)}
    {ondelete}
  />

  <!-- Reply input -->
  {#if showReplyInput}
    <div class="ml-11">
      <CommentInput
        onsubmit={handleReply}
        placeholder="Add a reply..."
        buttonLabel="Reply"
      />
    </div>
  {/if}

  <!-- Replies -->
  {#if replies.length > 0}
    <div class="ml-11 flex flex-col gap-3 border-l-2 border-neutral-100 pl-4 dark:border-neutral-800">
      {#each replies as reply (reply.id)}
        <CommentItem
          comment={reply}
          myVote={userVotes[reply.id] ?? 0}
          {currentUserId}
          isTopLevel={false}
          {onvote}
          {ondelete}
        />
      {/each}
    </div>
  {/if}
</div>
