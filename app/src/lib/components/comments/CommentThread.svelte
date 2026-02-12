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

<div class="thread">
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
    <div class="reply-indent">
      <CommentInput
        onsubmit={handleReply}
        placeholder="Add a reply..."
        buttonLabel="Reply"
      />
    </div>
  {/if}

  <!-- Replies -->
  {#if replies.length > 0}
    <div class="replies">
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

<style>
  .thread {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reply-indent {
    margin-left: 44px;
  }

  .replies {
    margin-left: 44px;
    padding-left: 16px;
    border-left: 2px solid #e7e5e4;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
