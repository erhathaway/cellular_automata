<script lang="ts">
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
      saveMsg = '';
      errorMsg = '';
      showDeleteConfirm = false;
      deleteInput = '';
    }
  });

  let canSave = $derived(displayName.trim().length >= 1);

  async function save() {
    if (!canSave || saving) return;
    saving = true;
    errorMsg = '';
    saveMsg = '';
    try {
      const result = await api<NonNullable<UserProfile>>('PATCH', '/api/user/profile', {
        displayName: displayName.trim()
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

  function goToChangeAvatar() {
    open = false;
    goto('/settings/avatar');
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

      <!-- Close button (top-right) -->
      <button class="close-btn" onclick={() => { open = false; }} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <!-- Profile identity hero -->
      <div class="profile-hero">
        <button class="avatar-frame" onclick={goToChangeAvatar} aria-label="Change avatar">
          <PixelAvatar avatarId={userProfile?.avatarId ?? null} size={56} />
          <div class="avatar-edit-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </div>
        </button>
        <p class="profile-name">{userProfile?.displayName ?? 'No name set'}</p>
        <p class="profile-email">{userProfile?.email ?? ''}</p>
      </div>

      <div class="divider"></div>

      <!-- Account fields -->
      <div class="section">
        <span class="section-label">
          <svg class="section-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </span>

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
      </div>

      <div class="divider"></div>

      <!-- Footer actions -->
      <div class="footer-actions">
        <SignOutButton redirectUrl="/intro">
          <button class="btn-footer">Log Out</button>
        </SignOutButton>

        {#if !showDeleteConfirm}
          <button class="btn-footer btn-footer-danger" onclick={() => { showDeleteConfirm = true; }}>
            Delete Account
          </button>
        {:else}
          <div class="danger-zone">
            <p class="danger-text">This is permanent. All data will be deleted.</p>
            <p class="danger-prompt">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              bind:value={deleteInput}
              placeholder="DELETE"
              class="field-input danger-input"
            />
            <div class="danger-actions">
              <button
                class="btn-footer"
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
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        {/if}
      </div>
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
    max-width: 380px;
    max-height: 90vh;
    overflow-y: auto;
    margin: 0 16px;
    padding: 24px;
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

  /* Close */
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
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
    z-index: 1;
  }

  .close-btn:hover {
    color: #f5f5f4;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Profile hero */
  .profile-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0 4px;
  }

  .avatar-frame {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: #0c0a09;
    border: 2px solid #292524;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .avatar-frame:hover {
    border-color: #facc15;
  }

  .avatar-edit-badge {
    position: absolute;
    bottom: -4px;
    right: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #facc15;
    border-radius: 50%;
    color: #1c1917;
    box-shadow: 0 0 0 2px #1c1917;
  }

  .profile-name {
    margin-top: 10px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #f5f5f4;
  }

  .profile-email {
    margin-top: 2px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    color: #57534e;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
    margin: 16px 0;
  }

  /* Section */
  .section {
    display: flex;
    flex-direction: column;
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #facc15;
    margin-bottom: 14px;
  }

  .section-icon {
    color: #facc15;
    filter: drop-shadow(0 0 3px rgba(250, 204, 21, 0.3));
  }

  /* Fields */
  .field {
    display: flex;
    flex-direction: column;
  }

  .field-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #78716c;
    margin-bottom: 6px;
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

  /* Messages */
  .msg-error {
    margin-top: 10px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #ef4444;
  }

  .msg-success {
    margin-top: 10px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #facc15;
  }

  .btn-save {
    margin-top: 14px;
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

  /* Footer actions */
  .footer-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .btn-footer {
    width: 100%;
    padding: 8px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
  .danger-zone {
    padding: 14px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
  }

  .danger-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    color: #ef4444;
  }

  .danger-prompt {
    margin-top: 6px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
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
    margin-top: 10px;
  }

  .danger-actions .btn-footer {
    flex: 1;
  }

  .btn-danger {
    flex: 1;
    padding: 8px 16px;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
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
