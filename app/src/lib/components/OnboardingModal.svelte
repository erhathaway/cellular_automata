<script lang="ts">
  import { AVATARS } from '$lib/avatars';
  import PixelAvatar from './PixelAvatar.svelte';
  import { api } from '$lib/api';

  type UserProfile = { displayName: string | null; avatarId: string | null; email: string | null } | null;

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

  let canSubmit = $derived(displayName.trim().length >= 1 && selectedAvatarId !== '');

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
      errorMsg = err.message || 'Something went wrong';
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
        <input
          id="onboard-name"
          type="text"
          bind:value={displayName}
          maxlength={30}
          placeholder="Your display name"
          class="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
        />
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
