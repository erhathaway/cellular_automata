<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { SignOutButton } from 'svelte-clerk';
  import { api } from '$lib/api';
  import { LEVELS, aggregateByLevel } from '$lib/levels';
  import { LATTICE_REGISTRY } from '$lib-core';
  import { timeAgo } from '$lib/utils/timeAgo';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';

  let { data } = $props();

  // Stats derivations
  let levelData = $derived.by(() => {
    const agg = aggregateByLevel(data.stats.byRadius);
    return LEVELS.map(l => ({ key: l.key, label: l.label, count: agg[l.key] ?? 0 }));
  });

  let maxLevel = $derived.by(() => {
    const m = Math.max(...levelData.map(d => d.count));
    return m > 0 ? m : 1;
  });

  let latticeData = $derived.by(() => {
    return Object.entries(data.stats.byLattice)
      .map(([type, count]) => ({
        type,
        label: (LATTICE_REGISTRY as Record<string, { label: string }>)[type]?.label ?? type,
        count
      }))
      .sort((a, b) => b.count - a.count);
  });

  let maxLattice = $derived.by(() => {
    const m = Math.max(...latticeData.map(d => d.count));
    return m > 0 ? m : 1;
  });

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

  async function deleteAccount() {
    if (deleteInput !== 'DELETE' || deleting) return;
    deleting = true;
    try {
      await api('DELETE', '/api/user/delete');
      goto('/intro');
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
        <div class="avatar-frame">
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
        </div>
        <div class="hero-name">{data.profile.displayName ?? 'Anonymous'}</div>
        <div class="hero-joined">Joined {timeAgo(data.profile.createdAt)}</div>
      </div>

      <!-- Right: Stats -->
      <div class="hero-stats">
        <!-- Total Claims -->
        <div class="panel">
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          <div class="stat-label">Total Claims</div>
          <div class="claims-row">
            <svg class="claims-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 3h12l4 6-10 13L2 9Z" />
              <path d="M11 3 8 9l4 13 4-13-3-6" />
              <path d="M2 9h20" />
            </svg>
            <span class="total-value">{data.stats.claimCount.toLocaleString()}</span>
          </div>
        </div>

        <!-- Level Distribution -->
        <div class="panel">
          <div class="nails"><div class="nail"></div><div class="nail"></div></div>
          <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
          <div class="stat-label">Level Distribution</div>
          <div class="hbar-list">
            {#each levelData as d (d.key)}
              <div class="hbar-row">
                <div class="hbar-name">{d.label}</div>
                <div class="hbar-track">
                  <div
                    class="hbar-fill"
                    style="width: {Math.max(2, (d.count / maxLevel) * 100)}%;"
                  ></div>
                </div>
                <div class="hbar-count">{d.count}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Lattice Distribution -->
        {#if latticeData.length > 0}
          <div class="panel">
            <div class="nails"><div class="nail"></div><div class="nail"></div></div>
            <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>
            <div class="stat-label">Lattice Distribution</div>
            <div class="hbar-list">
              {#each latticeData as d (d.type)}
                <div class="hbar-row">
                  <div class="hbar-name">{d.label}</div>
                  <div class="hbar-track">
                    <div
                      class="hbar-fill"
                      style="width: {Math.max(2, (d.count / maxLattice) * 100)}%;"
                    ></div>
                  </div>
                  <div class="hbar-count">{d.count}</div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Settings section -->
    <div class="settings-section">
      <div class="panel settings-panel">
        <div class="nails"><div class="nail"></div><div class="nail"></div></div>
        <div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

        <div class="section">
          <span class="section-label">
            <svg class="section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </span>

          <div class="field">
            <label class="field-label" for="settings-name">Display Name</label>
            <div class="name-input-row">
              <div class="name-input-wrap" class:name-taken={nameAvailable === false} class:name-ok={nameAvailable === true}>
                <input
                  id="settings-name"
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
            onclick={save}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div class="divider"></div>

        <!-- Avatar link -->
        <a href="/settings/avatar" class="btn-footer">Change Avatar</a>

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
  </div>
</div>

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
  }

  .avatar-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #d6d3d1;
    margin-top: 16px;
    text-align: center;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  /* Panel */
  .panel {
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
    padding: 20px 16px;
  }

  .nails {
    position: absolute;
    top: 8px;
    left: 10px;
    right: 10px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
  }

  .nails-bottom {
    top: auto;
    bottom: 8px;
  }

  .nail {
    width: 4px;
    height: 4px;
    background: #a8a29e;
    border-radius: 50%;
    opacity: 0.45;
  }

  .stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fde68a;
    margin-bottom: 10px;
  }

  .claims-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .claims-icon {
    flex-shrink: 0;
  }

  .total-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: #fef08a;
  }

  /* Horizontal bar chart */
  .hbar-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .hbar-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hbar-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #d6d3d1;
    width: 68px;
    flex-shrink: 0;
  }

  .hbar-track {
    flex: 1;
    height: 16px;
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid #44403c;
    overflow: hidden;
  }

  .hbar-fill {
    height: 100%;
    background: linear-gradient(90deg, #facc15 0%, #fde047 100%);
    box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .hbar-count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #d6d3d1;
    width: 36px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Settings section */
  .settings-section {
    max-width: 480px;
  }

  .settings-panel {
    padding: 28px;
  }

  /* Section */
  .section {
    display: flex;
    flex-direction: column;
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
    margin-bottom: 16px;
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

  /* Divider */
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
    margin: 20px 0;
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
  .danger-zone {
    padding: 16px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
  }

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

    .avatar-frame {
      width: 260px;
      height: 260px;
    }
  }
</style>
