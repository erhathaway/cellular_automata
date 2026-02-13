<script lang="ts">
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';
  import { randomConfig } from '$lib/miner/parts/index';
  import type { MinerConfig } from '$lib/miner/types';
  import MinerPreview from './miner/MinerPreview.svelte';
  import MinerEditor from './miner/MinerEditor.svelte';

  type UserProfile = { displayName: string | null; avatarId: string | null; minerConfig: string | null; email: string | null } | null;

  let {
    userProfile,
    onprofileupdated
  }: {
    userProfile: UserProfile;
    onprofileupdated: (profile: UserProfile) => void;
  } = $props();

  let show = $derived(
    userProfile != null && (userProfile.displayName == null || userProfile.avatarId == null)
  );

  let displayName = $state('');
  let minerConfig: MinerConfig = $state(randomConfig());
  let saving = $state(false);
  let errorMsg = $state('');
  let nameAvailable = $state<boolean | null>(null);
  let nameChecking = $state(false);
  let nameCheckTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let suggestingName = $state(false);
  let editing = $state(false);

  let canSubmit = $derived(displayName.trim().length >= 1 && nameAvailable !== false);

  // When mounted inside <SignedIn> with no profile data, re-run server load
  let invalidated = false;
  $effect(() => {
    if (userProfile === null && !invalidated) {
      invalidated = true;
      invalidateAll();
    }
  });

  // Auto-suggest a name on first show
  let hasSuggested = false;
  $effect(() => {
    if (show && !hasSuggested) {
      hasSuggested = true;
      suggestName();
    }
  });

  async function checkNameAvailability(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
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

  function rerollMiner() {
    minerConfig = randomConfig();
  }

  function handleEditorSave(config: MinerConfig) {
    minerConfig = config;
    editing = false;
  }

  function handleEditorCancel() {
    editing = false;
  }

  async function submit() {
    if (!canSubmit || saving) return;
    saving = true;
    errorMsg = '';
    try {
      const result = await api<NonNullable<UserProfile>>('PATCH', '/api/user/profile', {
        displayName: displayName.trim(),
        avatarId: '__miner__',
        minerConfig: JSON.stringify(minerConfig)
      });
      onprofileupdated(result);
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
</script>

{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="backdrop">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-panel" class:modal-wide={editing} onclick={(e) => e.stopPropagation()}>
      <!-- Nails -->
      <div class="nails"><div class="nail"></div><div class="nail"></div></div>
      <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

      {#if editing}
        <!-- Full MinerEditor view -->
        <h2 class="modal-title">Customize Your Miner</h2>
        <div class="editor-wrap">
          <MinerEditor
            initialConfig={minerConfig}
            onsave={handleEditorSave}
            oncancel={handleEditorCancel}
          />
        </div>
      {:else}
        <!-- Main onboarding view -->
        <h2 class="modal-title">Welcome, Miner!</h2>
        <p class="modal-subtitle">Choose a name and your miner avatar.</p>

        <!-- Name section -->
        <div class="section">
          <span class="section-label">
            <svg class="section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Name
          </span>

          <div class="name-input-row">
            <div class="name-input-wrap" class:name-taken={nameAvailable === false} class:name-ok={nameAvailable === true}>
              <input
                type="text"
                bind:value={displayName}
                oninput={handleNameInput}
                maxlength={30}
                placeholder="Your display name"
                class="field-input name-field"
              />
              {#if nameChecking}
                <span class="name-status checking">...</span>
              {:else if nameAvailable === true}
                <span class="name-status available">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
              {:else if nameAvailable === false}
                <span class="name-status taken">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                  <path d="M12 2 L22 7 L12 12 L2 7 Z"/>
                  <path d="M2 7 L12 12 L12 22 L2 17 Z"/>
                  <path d="M12 12 L22 7 L22 17 L12 22 Z"/>
                  <circle cx="12" cy="7" r="1.3" fill="currentColor" stroke="none"/>
                  <circle cx="5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="7" cy="14.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="9" cy="18.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="19" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="15" cy="18.5" r="1.1" fill="currentColor" stroke="none"/>
                </svg>
              {/if}
            </button>
          </div>
          {#if nameAvailable === false}
            <p class="name-taken-msg">This name is already taken</p>
          {/if}
        </div>

        <div class="divider"></div>

        <!-- Miner avatar section -->
        <div class="section">
          <span class="section-label">
            <svg class="section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Your Miner
          </span>

          <div class="avatar-area">
            <div class="preview-frame">
              <MinerPreview config={minerConfig} scale={3} />
            </div>
            <div class="avatar-actions">
              <button class="dice-btn" onclick={rerollMiner} title="Randomize miner" aria-label="Randomize miner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                  <path d="M12 2 L22 7 L12 12 L2 7 Z"/>
                  <path d="M2 7 L12 12 L12 22 L2 17 Z"/>
                  <path d="M12 12 L22 7 L22 17 L12 22 Z"/>
                  <circle cx="12" cy="7" r="1.3" fill="currentColor" stroke="none"/>
                  <circle cx="5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="7" cy="14.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="9" cy="18.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="19" cy="10.5" r="1.1" fill="currentColor" stroke="none"/>
                  <circle cx="15" cy="18.5" r="1.1" fill="currentColor" stroke="none"/>
                </svg>
              </button>
              <button class="edit-btn" onclick={() => { editing = true; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>

        {#if errorMsg}
          <p class="msg-error">{errorMsg}</p>
        {/if}

        <button
          class="btn-submit"
          class:disabled={!canSubmit || saving}
          disabled={!canSubmit || saving}
          onclick={submit}
        >
          {saving ? 'Saving...' : 'Get Started'}
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
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
    scrollbar-width: thin;
    scrollbar-color: #44403c transparent;
  }

  .modal-panel::-webkit-scrollbar { width: 6px; }
  .modal-panel::-webkit-scrollbar-track { background: transparent; }
  .modal-panel::-webkit-scrollbar-thumb { background: #44403c; border-radius: 3px; }

  .modal-wide {
    max-width: 780px;
  }

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

  /* Title */
  .modal-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #f5f5f4;
    text-align: center;
    margin: 8px 0 0;
  }

  .modal-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #78716c;
    text-align: center;
    margin-top: 6px;
  }

  /* Section */
  .section {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
  }

  .section-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #facc15;
    margin-bottom: 12px;
  }

  .section-icon {
    color: #facc15;
    filter: drop-shadow(0 0 3px rgba(250, 204, 21, 0.3));
  }

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
    margin: 20px 0 0;
  }

  /* Field input */
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

  /* Dice button */
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

  /* Avatar area */
  .avatar-area {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .preview-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0c0a09;
    border: 2px solid #292524;
    border-radius: 14px;
    padding: 16px;
  }

  .avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .edit-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a29e;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #44403c;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
  }

  .edit-btn:hover {
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.3);
    background: rgba(250, 204, 21, 0.05);
  }

  /* Editor wrap */
  .editor-wrap {
    margin-top: 20px;
    min-height: 400px;
  }

  /* Messages */
  .msg-error {
    margin-top: 16px;
    text-align: center;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #ef4444;
  }

  /* Submit button */
  .btn-submit {
    margin-top: 20px;
    width: 100%;
    padding: 14px 16px;
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

  .btn-submit:hover:not(.disabled) {
    background: #fde047;
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
  }

  .btn-submit.disabled {
    background: #44403c;
    color: #78716c;
    cursor: not-allowed;
  }
</style>
