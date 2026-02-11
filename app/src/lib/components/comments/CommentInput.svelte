<script lang="ts">
  import { SignedIn, SignedOut } from 'svelte-clerk/client';

  let {
    onsubmit,
    placeholder = 'Add a comment...',
    buttonLabel = 'Comment',
  }: {
    onsubmit: (text: string) => Promise<void>;
    placeholder?: string;
    buttonLabel?: string;
  } = $props();

  let text = $state('');
  let submitting = $state(false);
  let focused = $state(false);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    submitting = true;
    try {
      await onsubmit(trimmed);
      text = '';
      focused = false;
    } finally {
      submitting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }
</script>

<SignedIn>
  <div class="flex gap-3">
    <textarea
      bind:value={text}
      onfocus={() => (focused = true)}
      onkeydown={handleKeydown}
      class="min-h-[40px] w-full resize-none border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-neutral-400"
      {placeholder}
      rows="1"
    ></textarea>
  </div>
  {#if focused || text.trim()}
    <div class="mt-2 flex justify-end gap-2">
      <button
        class="rounded px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        onclick={() => { text = ''; focused = false; }}
      >
        Cancel
      </button>
      <button
        class="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        disabled={!text.trim() || submitting}
        onclick={handleSubmit}
      >
        {buttonLabel}
      </button>
    </div>
  {/if}
</SignedIn>

<SignedOut>
  <p class="text-sm text-neutral-400 dark:text-neutral-500">Sign in to comment</p>
</SignedOut>
