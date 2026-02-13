<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { useClerkContext } from 'svelte-clerk';
  import { api } from '$lib/api';

  const clerk = useClerkContext().clerk;
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import UserStats from '$lib/components/UserStats.svelte';

  let { data } = $props();

  // Name modal state
  let nameModalOpen = $state(false);

  function openNameModal() {
    displayName = data.profile.displayName ?? '';
    saveMsg = '';
    errorMsg = '';
    nameAvailable = null;
    nameModalOpen = true;
  }

  function closeNameModal() {
    if (!saving) nameModalOpen = false;
  }

  // Settings form state
  let displayName = $state(data.profile.displayName ?? '');
  let saving = $state(false);
  let saveMsg = $state('');
  let errorMsg = $state('');
  let nameAvailable = $state<boolean | null>(null);
  let nameChecking = $state(false);
  let nameCheckTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let suggestingName = $state(false);

  // Delete account state
  let showDeleteConfirm = $state(false);
  let deleteInput = $state('');
  let deleting = $state(false);

  let canSave = $derived(displayName.trim().length >= 1 && nameAvailable !== false);

  async function checkNameAvailability(name: string) {
    const trimmed = name.trim();
    if (!trimmed || trimmed === data.profile.displayName) {
      nameAvailable = null;
      nameChecking = false;
      return;
    }
    nameChecking = true;
    try {
      const res = await api<{ available: boolean }>('GET', `/api/user/check-name?name=${encodeURIComponent(trimmed)}`);
      if (displayName.trim() === trimmed) {
        nameAvailable = res.available;
        nameChecking = false;
      }
    } catch {
      nameChecking = false;
    }
  }

  function handleNameInput() {
    nameAvailable = null;
    if (nameCheckTimer) clearTimeout(nameCheckTimer);
    nameCheckTimer = setTimeout(() => {
      checkNameAvailability(displayName);
    }, 400);
  }

  async function suggestName() {
    if (suggestingName) return;
    suggestingName = true;
    try {
      const res = await api<{ name: string }>('GET', '/api/user/suggest-name');
      displayName = res.name;
      nameAvailable = true;
    } catch (err: any) {
      errorMsg = err.message || 'Failed to suggest name';
    } finally {
      suggestingName = false;
    }
  }

  async function save() {
    if (!canSave || saving) return;
    saving = true;
    errorMsg = '';
    saveMsg = '';
    try {
      await api('PATCH', '/api/user/profile', {
        displayName: displayName.trim()
      });
      saveMsg = 'Saved!';
      setTimeout(() => { saveMsg = ''; }, 2000);
      await invalidateAll();
    } catch (err: any) {
      const msg = err.message || 'Something went wrong';
      if (msg.includes('409') || msg.toLowerCase().includes('taken')) {
        nameAvailable = false;
        errorMsg = 'Display name is already taken';
      } else {
        errorMsg = msg;
      }
    } finally {
      saving = false;
    }
  }

  async function logout() {
    localStorage.clear();
    await clerk?.signOut({ redirectUrl: '/' });
    // Hard reload to clear in-memory stores
    window.location.href = '/';
  }

  async function deleteAccount() {
    if (deleteInput !== 'DELETE' || deleting) return;
    deleting = true;
    try {
      await api('DELETE', '/api/user/delete');
      localStorage.clear();
      window.location.href = '/';
    } catch (err: any) {
      errorMsg = err.message || 'Failed to delete account';
      deleting = false;
    }
  }
</script>

<div class="user-page">
  <div class="mx-auto max-w-7xl px-6 pt-8 pb-16">
    <!-- Hero row -->
    <div class="hero">
      <!-- Left: Avatar -->
      <div class="hero-avatar">
        <a href="/settings/avatar" class="avatar-frame" aria-label="Change avatar">
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          <div class="avatar-inner">
            <PixelAvatar
              avatarId={data.profile.avatarId}
              size={360}
              fallbackInitials={(data.profile.displayName ?? '?')[0]}
              minerConfig={data.profile.minerConfig}
            />
          </div>
          <div class="avatar-hover-overlay">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            <span>Change Miner</span>
          </div>
        </a>
        <div class="hero-name-row">
          <span class="hero-name">{data.profile.displayName ?? 'Anonymous'}</span>
          <button class="name-edit-btn" onclick={openNameModal} aria-label="Edit name">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
        </div>
        <div class="hero-joined">Joined {timeAgo(data.profile.createdAt)}</div>
      </div>

      <!-- Right: Stats -->
      <div class="hero-stats">
        <UserStats stats={data.stats} />
      </div>
    </div>

    <!-- Account actions -->
    <div class="settings-section">
      <div class="footer-actions">
        <button class="btn-footer" onclick={logout}>Log Out</button>

        <button class="btn-footer btn-footer-danger" onclick={() => { showDeleteConfirm = true; deleteInput = ''; }}>
          Delete Account
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Name editing modal -->
<svelte:window onkeydown={(e) => { if (e.key === 'Escape') { if (nameModalOpen) closeNameModal(); if (showDeleteConfirm && !deleting) { showDeleteConfirm = false; deleteInput = ''; } } }} />
{#if nameModalOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={closeNameModal}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-panel" onclick={(e) => e.stopPropagation()}>
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

      <button class="modal-close" onclick={closeNameModal} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <div class="modal-title">Edit Display Name</div>

      <div class="field">
        <label class="field-label" for="modal-name">Display Name</label>
        <div class="name-input-row">
          <div class="name-input-wrap" class:name-taken={nameAvailable === false} class:name-ok={nameAvailable === true}>
            <input
              id="modal-name"
              type="text"
              bind:value={displayName}
              oninput={handleNameInput}
              maxlength={30}
              class="field-input name-field"
            />
            {#if nameChecking}
              <span class="name-status checking" title="Checking...">...</span>
            {:else if nameAvailable === true}
              <span class="name-status available" title="Available">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            {:else if nameAvailable === false}
              <span class="name-status taken" title="Already taken">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </span>
            {/if}
          </div>
          <button
            class="dice-btn"
            onclick={suggestName}
            disabled={suggestingName}
            title="Generate random name"
            aria-label="Generate random name"
          >
            {#if suggestingName}
              <svg class="dice-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            {:else}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.5" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            {/if}
          </button>
        </div>
        {#if nameAvailable === false}
          <p class="name-taken-msg">This name is already taken</p>
        {/if}
      </div>

      {#if errorMsg}
        <p class="msg-error">{errorMsg}</p>
      {/if}

      {#if saveMsg}
        <p class="msg-success">{saveMsg}</p>
      {/if}

      <button
        class="btn-save"
        class:disabled={!canSave || saving}
        disabled={!canSave || saving}
        onclick={async () => { await save(); if (!errorMsg) closeNameModal(); }}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </div>
{/if}

<!-- Delete account modal -->
{#if showDeleteConfirm}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={() => { if (!deleting) { showDeleteConfirm = false; deleteInput = ''; } }}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-panel" onclick={(e) => e.stopPropagation()}>
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

      <button class="modal-close" onclick={() => { if (!deleting) { showDeleteConfirm = false; deleteInput = ''; } }} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <div class="modal-title modal-title-danger">Delete Account</div>

      <p class="danger-text">This is permanent. All data will be deleted.</p>
      <p class="danger-prompt">Type <strong>DELETE</strong> to confirm:</p>
      <input
        type="text"
        bind:value={deleteInput}
        placeholder="DELETE"
        class="field-input danger-input"
      />

      {#if errorMsg}
        <p class="msg-error">{errorMsg}</p>
      {/if}

      <div class="danger-actions">
        <button
          class="btn-footer"
          onclick={() => { showDeleteConfirm = false; deleteInput = ''; }}
          disabled={deleting}
        >
          Cancel
        </button>
        <button
          class="btn-danger"
          class:disabled={deleteInput !== 'DELETE' || deleting}
          disabled={deleteInput !== 'DELETE' || deleting}
          onclick={deleteAccount}
        >
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .user-page {
    background: #000;
    min-height: 100%;
  }

  /* Hero */
  .hero {
    display: flex;
    gap: 40px;
    margin-bottom: 48px;
  }

  .hero-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .avatar-frame {
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
    border: 1px solid #44403c;
    border-radius: 8px;
    padding: 24px;
    width: 340px;
    height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-decoration: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .avatar-frame:hover {
    border-color: #facc15;
  }

  .avatar-hover-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 7px;
    opacity: 0;
    transition: opacity 0.2s ease;
    color: #facc15;
    pointer-events: none;
  }

  .avatar-frame:hover .avatar-hover-overlay {
    opacity: 1;
  }

  .avatar-hover-overlay span {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
  }

  .avatar-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }

  .hero-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #d6d3d1;
    text-align: center;
  }

  .name-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #44403c;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #78716c;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
    flex-shrink: 0;
  }

  .name-edit-btn:hover {
    color: #facc15;
    border-color: #facc15;
    background: rgba(250, 204, 21, 0.1);
  }

  .hero-joined {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #78716c;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }

  /* Stats column */
  .hero-stats {
    width: 400px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Settings section */
  .settings-section {
    max-width: 480px;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  .modal-panel {
    position: relative;
    width: 100%;
    max-width: 420px;
    margin: 0 16px;
    padding: 28px;
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
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-close {
    position: absolute;
    top: 18px;
    right: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    color: #78716c;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
    z-index: 1;
  }

  .modal-close:hover {
    color: #f5f5f4;
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #facc15;
    margin-bottom: 20px;
  }

  .modal-title-danger {
    color: #ef4444;
  }

  /* Fields */
  .field {
    display: flex;
    flex-direction: column;
  }

  .field-label {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #78716c;
    margin-bottom: 8px;
  }

  .field-input {
    width: 100%;
    padding: 10px 14px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: #d6d3d1;
    background: #0c0a09;
    border: 1px solid #292524;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.15s;
  }

  .field-input:focus {
    border-color: #facc15;
    box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.2);
  }

  .field-input::placeholder {
    color: #44403c;
  }

  /* Name input row */
  .name-input-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .name-input-wrap {
    position: relative;
    flex: 1;
  }

  .name-field {
    padding-right: 36px !important;
  }

  .name-input-wrap.name-taken .name-field {
    border-color: #ef4444;
  }

  .name-input-wrap.name-taken .name-field:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
  }

  .name-input-wrap.name-ok .name-field {
    border-color: #22c55e;
  }

  .name-input-wrap.name-ok .name-field:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.2);
  }

  .name-status {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .name-status.checking {
    color: #78716c;
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    letter-spacing: 2px;
  }

  .name-status.available {
    color: #22c55e;
  }

  .name-status.taken {
    color: #ef4444;
  }

  .name-taken-msg {
    margin-top: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #ef4444;
  }

  .dice-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    padding: 0;
    background: rgba(250, 204, 21, 0.1);
    border: 1px solid #44403c;
    border-radius: 6px;
    color: #facc15;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .dice-btn:hover:not(:disabled) {
    background: rgba(250, 204, 21, 0.2);
    border-color: #facc15;
  }

  .dice-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .dice-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes dice-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .dice-spin {
    animation: dice-spin 0.6s linear infinite;
  }

  /* Messages */
  .msg-error {
    margin-top: 12px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #ef4444;
  }

  .msg-success {
    margin-top: 12px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #facc15;
  }

  .btn-save {
    margin-top: 16px;
    padding: 12px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #1c1917;
    background: #facc15;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .btn-save:hover:not(.disabled) {
    background: #fde047;
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
  }

  .btn-save.disabled {
    background: #44403c;
    color: #78716c;
    cursor: not-allowed;
  }

  /* Footer actions */
  .footer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-footer {
    display: block;
    width: 100%;
    padding: 10px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
    text-decoration: none;
    color: #78716c;
    background: none;
    border: 1px solid #292524;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .btn-footer:hover {
    color: #d6d3d1;
    border-color: #44403c;
  }

  .btn-footer-danger {
    color: #78716c;
    border-color: #292524;
  }

  .btn-footer-danger:hover {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
  }

  /* Danger zone */
  .danger-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #ef4444;
  }

  .danger-prompt {
    margin-top: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #a8a29e;
  }

  .danger-prompt strong {
    color: #ef4444;
  }

  .danger-input {
    margin-top: 8px;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .danger-input:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2);
  }

  .danger-actions {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .danger-actions .btn-footer {
    flex: 1;
  }

  .btn-danger {
    flex: 1;
    padding: 10px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fff;
    background: #ef4444;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-danger:hover:not(.disabled) {
    background: #dc2626;
  }

  .btn-danger.disabled {
    background: #44403c;
    color: #78716c;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .hero-stats {
      width: 100%;
    }

    .avatar-frame {
      width: 260px;
      height: 260px;
    }
  }
</style>
