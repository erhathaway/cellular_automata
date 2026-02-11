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
      // Redirect to intro — Clerk will detect signed-out state
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
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onclick={handleBackdrop}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-xl" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-neutral-900">Settings</h2>
        <button
          class="rounded-full p-1 text-neutral-400 transition-colors hover:text-neutral-600"
          onclick={() => { open = false; }}
          aria-label="Close"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- Email (read-only) -->
      <div class="mt-6">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="block text-sm font-medium text-neutral-700">Email</label>
        <p class="mt-1 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-500">{userProfile?.email ?? ''}</p>
      </div>

      <!-- Display name -->
      <div class="mt-4">
        <label for="settings-name" class="block text-sm font-medium text-neutral-700">Display Name</label>
        <input
          id="settings-name"
          type="text"
          bind:value={displayName}
          maxlength={30}
          class="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <!-- Avatar picker -->
      <div class="mt-4">
        <p class="text-sm font-medium text-neutral-700">Avatar</p>
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

      {#if saveMsg}
        <p class="mt-4 text-center text-sm text-green-600">{saveMsg}</p>
      {/if}

      <button
        class="mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors
          {canSave && !saving
            ? 'bg-neutral-900 hover:bg-neutral-800'
            : 'cursor-not-allowed bg-neutral-300'}"
        disabled={!canSave || saving}
        onclick={save}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      <hr class="my-6 border-neutral-200" />

      <SignOutButton redirectUrl="/intro">
        <button
          class="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Log Out
        </button>
      </SignOutButton>

      <!-- Danger zone -->
      <hr class="my-6 border-neutral-200" />

      {#if !showDeleteConfirm}
        <button
          class="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          onclick={() => { showDeleteConfirm = true; }}
        >
          Delete Account
        </button>
      {:else}
        <div class="rounded-lg border border-red-200 bg-red-50 p-4">
          <p class="text-sm font-medium text-red-800">This action is permanent. All your data will be deleted.</p>
          <p class="mt-2 text-sm text-red-700">Type <strong>DELETE</strong> to confirm:</p>
          <input
            type="text"
            bind:value={deleteInput}
            placeholder="DELETE"
            class="mt-2 w-full rounded-lg border border-red-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <div class="mt-3 flex gap-2">
            <button
              class="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
              onclick={() => { showDeleteConfirm = false; deleteInput = ''; }}
            >
              Cancel
            </button>
            <button
              class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-colors
                {deleteInput === 'DELETE' && !deleting
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'cursor-not-allowed bg-red-300'}"
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
