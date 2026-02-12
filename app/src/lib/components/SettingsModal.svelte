<script lang="ts">
  import { AVATARS } from '$lib/avatars';
  import PixelAvatar from './PixelAvatar.svelte';
  import { SignOutButton } from 'svelte-clerk';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';

  type UserProfile = { displayName: string | null; avatarId: string | null; email: string | null } | null;

  let {
    open = $bindable(false),
    userProfile,
    onprofileupdated
  }: {
    open: boolean;
    userProfile: UserProfile;
    onprofileupdated: (profile: UserProfile) => void;
  } = $props();

  let displayName = $state('');
  let selectedAvatarId = $state('');
  let saving = $state(false);
  let saveMsg = $state('');
  let errorMsg = $state('');

  // Delete account state
  let showDeleteConfirm = $state(false);
  let deleteInput = $state('');
  let deleting = $state(false);

  // Reset form when modal opens
  $effect(() => {
    if (open && userProfile) {
      displayName = userProfile.displayName ?? '';
      selectedAvatarId = userProfile.avatarId ?? '';
      saveMsg = '';
      errorMsg = '';
      showDeleteConfirm = false;
      deleteInput = '';
    }
  });

  let canSave = $derived(displayName.trim().length >= 1 && selectedAvatarId !== '');

  async function save() {
    if (!canSave || saving) return;
    saving = true;
    errorMsg = '';
    saveMsg = '';
    try {
      const result = await api<NonNullable<UserProfile>>('PATCH', '/api/user/profile', {
        displayName: displayName.trim(),
        avatarId: selectedAvatarId
      });
      onprofileupdated(result);
      saveMsg = 'Saved!';
      setTimeout(() => { saveMsg = ''; }, 2000);
    } catch (err: any) {
      errorMsg = err.message || 'Something went wrong';
    } finally {
      saving = false;
    }
  }

  async function deleteAccount() {
    if (deleteInput !== 'DELETE' || deleting) return;
    deleting = true;
    try {
      await api('DELETE', '/api/user/delete');
      open = false;
      goto('/intro');
    } catch (err: any) {
      errorMsg = err.message || 'Failed to delete account';
      deleting = false;
    }
  }

  function handleBackdrop() {
    if (!saving && !deleting) open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !saving && !deleting) open = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" onclick={handleBackdrop}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-panel" onclick={(e) => e.stopPropagation()}>
      <!-- Nails -->
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

      <div class="modal-header">
        <div class="modal-title-row">
          <svg class="title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span class="modal-title">Settings</span>
        </div>
        <button class="close-btn" onclick={() => { open = false; }} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div class="divider"></div>

      <!-- Email (read-only) -->
      <div class="field">
        <label class="field-label">Email</label>
        <p class="field-readonly">{userProfile?.email ?? ''}</p>
      </div>

      <!-- Display name -->
      <div class="field">
        <label class="field-label" for="settings-name">Display Name</label>
        <input
          id="settings-name"
          type="text"
          bind:value={displayName}
          maxlength={30}
          class="field-input"
        />
      </div>

      <!-- Avatar picker -->
      <div class="field">
        <p class="field-label">Avatar</p>
        <div class="avatar-grid">
          {#each AVATARS as avatar}
            <button
              class="avatar-btn"
              class:selected={selectedAvatarId === avatar.id}
              onclick={() => { selectedAvatarId = avatar.id; }}
            >
              <PixelAvatar avatarId={avatar.id} size={36} />
              <span class="avatar-name">{avatar.name}</span>
            </button>
          {/each}
        </div>
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
        onclick={save}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      <div class="divider"></div>

      <SignOutButton redirectUrl="/intro">
        <button class="btn-outline">Log Out</button>
      </SignOutButton>

      <!-- Danger zone -->
      <div class="divider"></div>

      {#if !showDeleteConfirm}
        <button class="btn-danger-outline" onclick={() => { showDeleteConfirm = true; }}>
          Delete Account
        </button>
      {:else}
        <div class="danger-zone">
          <p class="danger-text">This action is permanent. All your data will be deleted.</p>
          <p class="danger-prompt">Type <strong>DELETE</strong> to confirm:</p>
          <input
            type="text"
            bind:value={deleteInput}
            placeholder="DELETE"
            class="field-input danger-input"
          />
          <div class="danger-actions">
            <button
              class="btn-outline"
              onclick={() => { showDeleteConfirm = false; deleteInput = ''; }}
            >
              Cancel
            </button>
            <button
              class="btn-danger"
              class:disabled={deleteInput !== 'DELETE' || deleting}
              disabled={deleteInput !== 'DELETE' || deleting}
              onclick={deleteAccount}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
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
    max-height: 90vh;
    overflow-y: auto;
    margin: 0 16px;
    padding: 28px 24px;
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
    scrollbar-width: thin;
    scrollbar-color: #44403c transparent;
  }

  .modal-panel::-webkit-scrollbar { width: 6px; }
  .modal-panel::-webkit-scrollbar-track { background: transparent; }
  .modal-panel::-webkit-scrollbar-thumb { background: #44403c; border-radius: 3px; }

  /* Nails */
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

  /* Header */
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-icon {
    color: #facc15;
    filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
  }

  .modal-title {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #facc15;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    color: #78716c;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .close-btn:hover {
    color: #f5f5f4;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
    margin: 18px 0;
  }

  /* Fields */
  .field {
    margin-top: 14px;
  }

  .field:first-of-type {
    margin-top: 0;
  }

  .field-label {
    display: block;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #78716c;
    margin-bottom: 6px;
  }

  .field-readonly {
    padding: 8px 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #57534e;
    background: #0c0a09;
    border: 1px solid #292524;
    border-radius: 6px;
  }

  .field-input {
    width: 100%;
    padding: 8px 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
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

  /* Avatar grid */
  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 4px;
  }

  .avatar-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    background: none;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .avatar-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #292524;
  }

  .avatar-btn.selected {
    background: rgba(250, 204, 21, 0.1);
    border-color: #facc15;
    box-shadow: 0 0 8px rgba(250, 204, 21, 0.15);
  }

  .avatar-name {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.04em;
    color: #57534e;
    line-height: 1;
  }

  .avatar-btn.selected .avatar-name {
    color: #facc15;
  }

  /* Messages */
  .msg-error {
    margin-top: 14px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #ef4444;
  }

  .msg-success {
    margin-top: 14px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #facc15;
  }

  /* Buttons */
  .btn-save {
    width: 100%;
    margin-top: 18px;
    padding: 10px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
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

  .btn-outline {
    width: 100%;
    padding: 10px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #44403c;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }

  .btn-outline:hover {
    color: #f5f5f4;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Danger */
  .btn-danger-outline {
    width: 100%;
    padding: 10px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .btn-danger-outline:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .danger-zone {
    padding: 16px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
  }

  .danger-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #ef4444;
  }

  .danger-prompt {
    margin-top: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
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
    gap: 8px;
    margin-top: 12px;
  }

  .danger-actions .btn-outline {
    flex: 1;
  }

  .btn-danger {
    flex: 1;
    padding: 10px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
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
</style>
