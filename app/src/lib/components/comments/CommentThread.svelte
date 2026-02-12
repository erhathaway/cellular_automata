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
    <div class="shaft-area">
      <div class="shaft-line"></div>
      <div class="shaft-content">
        <CommentInput
          onsubmit={handleReply}
          placeholder="Chisel a reply..."
          buttonLabel="Etch it"
        />
      </div>
    </div>
  {/if}

  <!-- Replies -->
  {#if replies.length > 0}
    <div class="shaft-area">
      <div class="shaft-line">
        {#each replies as _, i}
          <div class="shaft-tick" style="top: {i === 0 ? 8 : 0}px;"></div>
        {/each}
      </div>
      <div class="shaft-content">
        <div class="shaft-header">
          <svg class="shaft-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
          <span>{replies.length} {replies.length === 1 ? 'echo' : 'echoes'}</span>
        </div>
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
    </div>
  {/if}
</div>

<style>
  .thread {
    display: flex;
    flex-direction: column;
  }

  .shaft-area {
    display: flex;
    margin-left: 15px;
    gap: 0;
  }

  .shaft-line {
    position: relative;
    width: 16px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .shaft-line::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 2px;
    transform: translateX(-50%);
    background: repeating-linear-gradient(
      180deg,
      #44403c 0px,
      #44403c 4px,
      transparent 4px,
      transparent 8px
    );
    opacity: 0.7;
  }

  .shaft-content {
    flex: 1;
    min-width: 0;
    padding: 4px 0 4px 8px;
  }

  .shaft-header {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a8a29e;
    padding: 4px 0 2px;
  }

  .shaft-icon {
    width: 10px;
    height: 10px;
    transform: rotate(180deg);
  }
</style>
