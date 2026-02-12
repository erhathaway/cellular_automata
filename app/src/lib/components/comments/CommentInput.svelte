<script lang="ts">
  import { SignedIn, SignedOut } from 'svelte-clerk/client';

  let {
    onsubmit,
    placeholder = 'Scratch an entry...',
    buttonLabel = 'Log it',
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
  <div class="input-wrap" class:focused>
    <textarea
      bind:value={text}
      onfocus={() => (focused = true)}
      onkeydown={handleKeydown}
      class="input-field"
      {placeholder}
      rows="1"
    ></textarea>
  </div>
  {#if focused || text.trim()}
    <div class="input-actions">
      <button
        class="btn-cancel"
        onclick={() => { text = ''; focused = false; }}
      >
        Discard
      </button>
      <button
        class="btn-submit"
        disabled={!text.trim() || submitting}
        onclick={handleSubmit}
      >
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 12 5 5L20 7" />
        </svg>
        {buttonLabel}
      </button>
    </div>
  {/if}
</SignedIn>

<SignedOut>
  <p class="signed-out">
    <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
    Sign in to write in the log
  </p>
</SignedOut>

<style>
  .input-wrap {
    background: rgba(255,255,255,0.04);
    border: 1px solid #44403c;
    border-radius: 4px;
    transition: border-color 0.15s, background 0.15s;
  }

  .input-wrap.focused {
    border-color: #78716c;
    background: rgba(255,255,255,0.07);
  }

  .input-field {
    width: 100%;
    min-height: 40px;
    resize: none;
    border: none;
    outline: none;
    background: transparent;
    padding: 10px 12px;
    font-family: 'Space Grotesk Variable', sans-serif;
    font-size: 13px;
    color: #e7e5e4;
    line-height: 1.5;
  }

  .input-field::placeholder {
    color: #57534e;
    font-style: italic;
  }

  .input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .btn-cancel {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 5px 12px;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    color: #78716c;
    background: transparent;
    transition: all 0.15s;
  }

  .btn-cancel:hover {
    color: #d6d3d1;
    border-color: #44403c;
  }

  .btn-submit {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 5px 14px;
    border-radius: 4px;
    border: 1px solid #facc15;
    cursor: pointer;
    color: #1c1917;
    background: #facc15;
    transition: all 0.15s;
  }

  .btn-submit:hover {
    background: #eab308;
    border-color: #eab308;
  }

  .btn-submit:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .btn-submit:disabled:hover {
    background: #facc15;
    border-color: #facc15;
  }

  .btn-icon {
    width: 12px;
    height: 12px;
  }

  .signed-out {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #57534e;
    font-style: italic;
  }

  .lock-icon {
    width: 14px;
    height: 14px;
    color: #44403c;
  }
</style>
