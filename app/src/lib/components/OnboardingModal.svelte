<script lang="ts">
  import { AVATARS } from '$lib/avatars';
  import PixelAvatar from './PixelAvatar.svelte';
  import { api } from '$lib/api';

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
  let selectedAvatarId = $state('');
  let saving = $state(false);
  let errorMsg = $state('');
  let nameAvailable = $state<boolean | null>(null);
  let nameChecking = $state(false);
  let nameCheckTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let suggestingName = $state(false);

  let canSubmit = $derived(displayName.trim().length >= 1 && selectedAvatarId !== '' && nameAvailable !== false);

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

  async function submit() {
    if (!canSubmit || saving) return;
    saving = true;
    errorMsg = '';
    try {
      const result = await api<NonNullable<UserProfile>>('PATCH', '/api/user/profile', {
        displayName: displayName.trim(),
        avatarId: selectedAvatarId
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
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
    <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <h2 class="text-center text-xl font-bold text-neutral-900">Welcome! Choose your identity</h2>
      <p class="mt-1 text-center text-sm text-neutral-500">Pick a name and avatar to get started.</p>

      <!-- Name input -->
      <div class="mt-6">
        <label for="onboard-name" class="block text-sm font-medium text-neutral-700">Display Name</label>
        <div class="mt-1 flex items-center gap-2">
          <div class="relative flex-1">
            <input
              id="onboard-name"
              type="text"
              bind:value={displayName}
              oninput={handleNameInput}
              maxlength={30}
              placeholder="Your display name"
              class="w-full rounded-lg border px-3 py-2 pr-9 text-sm outline-none transition-colors
                {nameAvailable === false
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : nameAvailable === true
                    ? 'border-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                    : 'border-neutral-300 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500'}"
            />
            {#if nameChecking}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">...</span>
            {:else if nameAvailable === true}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            {:else if nameAvailable === false}
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </span>
            {/if}
          </div>
          <button
            class="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-lg border border-neutral-300 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50"
            onclick={suggestName}
            disabled={suggestingName}
            title="Generate random name"
            aria-label="Generate random name"
          >
            {#if suggestingName}
              <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <p class="mt-1 text-xs text-red-500">This name is already taken</p>
        {/if}
      </div>

      <!-- Avatar picker -->
      <div class="mt-6">
        <p class="text-sm font-medium text-neutral-700">Choose an Avatar</p>
        <div class="mt-2 grid grid-cols-5 gap-3">
          {#each AVATARS as avatar}
            <button
              class="flex flex-col items-center gap-1 rounded-lg p-2 transition-all
                {selectedAvatarId === avatar.id
                  ? 'bg-neutral-100 ring-2 ring-neutral-900'
                  : 'hover:bg-neutral-50'}"
              onclick={() => { selectedAvatarId = avatar.id; }}
            >
              <PixelAvatar avatarId={avatar.id} size={36} />
              <span class="text-[9px] leading-tight text-neutral-400">{avatar.name}</span>
            </button>
          {/each}
        </div>
      </div>

      {#if errorMsg}
        <p class="mt-4 text-center text-sm text-red-500">{errorMsg}</p>
      {/if}

      <button
        class="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors
          {canSubmit && !saving
            ? 'bg-neutral-900 hover:bg-neutral-800'
            : 'cursor-not-allowed bg-neutral-300'}"
        disabled={!canSubmit || saving}
        onclick={submit}
      >
        {saving ? 'Saving...' : 'Get Started'}
      </button>
    </div>
  </div>
{/if}
