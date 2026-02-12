<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import { api } from '$lib/api';

  let {
    open = $bindable(false),
    onsaved
  }: {
    open: boolean;
    onsaved?: (info: { id: string; entityType: 'generation_run' | 'cell_population' }) => void;
  } = $props();

  let activeTab: 'run' | 'population' = $state('run');
  let title = $state('');
  let description = $state('');
  let tagInput = $state('');
  let tags: string[] = $state([]);
  let saving = $state(false);
  let error = $state('');
  let success = $state('');

  // Duplicate state
  let duplicate: { existingId: string; existingTitle: string; entityType: string } | null = $state(null);
  let bookmarking = $state(false);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      tags = [...tags, t];
    }
    tagInput = '';
  }

  function removeTag(t: string) {
    tags = tags.filter((tag) => tag !== t);
  }

  function handleTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  async function save() {
    saving = true;
    error = '';
    success = '';
    duplicate = null;

    try {
      const data = automataStore.exportForSave();
      const thumbnail = automataStore.getCanvasDataURL?.() ?? undefined;

      const endpoint = activeTab === 'run' ? '/api/generation-runs' : '/api/cell-populations';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, title, description, thumbnail })
      });

      if (res.status === 409) {
        const body = await res.json();
        duplicate = {
          existingId: body.existingId,
          existingTitle: body.existingTitle || body.existingId,
          entityType: body.entityType
        };
        saving = false;
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const savedEntity = await res.json();

      // Apply tags
      for (const tagName of tags) {
        try {
          await api('POST', '/api/tags', {
            tagName,
            ...(activeTab === 'run'
              ? { generationRunId: savedEntity.id }
              : { cellPopulationId: savedEntity.id })
          });
        } catch {
          // Tag apply failures are non-critical
        }
      }

      success = savedEntity.discovery?.isDiscoverer
        ? 'Saved! You are the first to discover this configuration!'
        : 'Saved successfully!';

      const entityType = activeTab === 'run' ? 'generation_run' as const : 'cell_population' as const;
      onsaved?.({ id: savedEntity.id, entityType });

      // Reset form after brief delay
      setTimeout(() => {
        open = false;
        title = '';
        description = '';
        tags = [];
        success = '';
        duplicate = null;
      }, 1500);
    } catch (e: any) {
      error = e.message ?? 'Failed to save';
    } finally {
      saving = false;
    }
  }

  async function bookmarkExisting() {
    if (!duplicate) return;
    bookmarking = true;
    try {
      const body = duplicate.entityType === 'generation_run'
        ? { generationRunId: duplicate.existingId }
        : { cellPopulationId: duplicate.existingId };
      await api('POST', '/api/bookmarks', body);
      success = 'Bookmarked!';
      setTimeout(() => {
        open = false;
        success = '';
        duplicate = null;
      }, 1000);
    } catch (e: any) {
      if (e.message?.startsWith('409')) {
        success = 'Already bookmarked!';
        setTimeout(() => {
          open = false;
          success = '';
          duplicate = null;
        }, 1000);
      } else {
        error = e.message ?? 'Failed to bookmark';
      }
    } finally {
      bookmarking = false;
    }
  }

  async function likeExisting() {
    if (!duplicate) return;
    try {
      const body = duplicate.entityType === 'generation_run'
        ? { generationRunId: duplicate.existingId }
        : { cellPopulationId: duplicate.existingId };
      await api('POST', '/api/likes', body);
      success = 'Liked!';
      setTimeout(() => {
        open = false;
        success = '';
        duplicate = null;
      }, 1000);
    } catch (e: any) {
      if (e.message?.startsWith('409')) {
        success = 'Already liked!';
        setTimeout(() => {
          open = false;
          success = '';
          duplicate = null;
        }, 1000);
      } else {
        error = e.message ?? 'Failed to like';
      }
    }
  }

  let storeData = $derived(automataStore.exportForSave());
</script>

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    onclick={(e) => { if (e.target === e.currentTarget) open = false; }}
  >
    <!-- Dialog -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onclick={(e) => e.stopPropagation()}>
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-black">Save Configuration</h2>
        <button class="text-neutral-400 hover:text-black" onclick={() => (open = false)} aria-label="Close">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      {#if duplicate}
        <!-- Duplicate found -->
        <div class="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p class="text-sm font-medium text-amber-800">This configuration already exists</p>
          <p class="mt-1 text-xs text-amber-600">
            "{duplicate.existingTitle || 'Untitled'}" — you can bookmark or like it instead.
          </p>
        </div>

        <!-- Error / Success -->
        {#if error}
          <p class="mb-3 text-sm text-red-600">{error}</p>
        {/if}
        {#if success}
          <p class="mb-3 text-sm text-green-600">{success}</p>
        {/if}

        <div class="flex justify-end gap-2">
          <button
            onclick={() => { duplicate = null; error = ''; }}
            class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Back
          </button>
          <button
            onclick={likeExisting}
            class="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Like
          </button>
          <button
            onclick={bookmarkExisting}
            disabled={bookmarking}
            class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {bookmarking ? 'Saving...' : 'Bookmark'}
          </button>
        </div>
      {:else}
        <!-- Tabs -->
        <div class="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1">
          <button
            class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeTab === 'run' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}"
            onclick={() => (activeTab = 'run')}
          >
            Save Run
          </button>
          <button
            class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors {activeTab === 'population' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black'}"
            onclick={() => (activeTab = 'population')}
          >
            Save Population
          </button>
        </div>

        <!-- Auto info -->
        <div class="mb-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
          <div class="flex gap-4">
            <span><strong>Dim:</strong> {storeData.dimension}D</span>
            <span><strong>Rule:</strong> {storeData.ruleDefinition}</span>
            {#if storeData.neighborhoodRadius > 1}
              <span><strong>Radius:</strong> {storeData.neighborhoodRadius}</span>
            {/if}
            <span><strong>Gen:</strong> {storeData.generationIndex}</span>
          </div>
          {#if activeTab === 'population'}
            <div class="mt-1">
              <span><strong>Stability:</strong> {storeData.stability}</span>
              {#if storeData.stablePeriod}
                <span class="ml-2"><strong>Period:</strong> {storeData.stablePeriod}</span>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Title -->
        <label class="mb-3 block">
          <span class="mb-1 block text-sm font-medium text-black">Title</span>
          <input
            type="text"
            bind:value={title}
            placeholder="e.g. Glider Gun B3S23"
            class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <!-- Description -->
        <label class="mb-3 block">
          <span class="mb-1 block text-sm font-medium text-black">Description</span>
          <textarea
            bind:value={description}
            placeholder="Optional notes..."
            rows="2"
            class="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          ></textarea>
        </label>

        <!-- Tags -->
        <div class="mb-4">
          <span class="mb-1 block text-sm font-medium text-black">Tags</span>
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={tagInput}
              onkeydown={handleTagKeydown}
              placeholder="Add tag..."
              class="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onclick={addTag}
              class="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200"
            >
              Add
            </button>
          </div>
          {#if tags.length > 0}
            <div class="mt-2 flex flex-wrap gap-1">
              {#each tags as t}
                <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {t}
                  <button onclick={() => removeTag(t)} class="text-blue-400 hover:text-blue-700" aria-label="Remove tag {t}">
                    <svg class="h-3 w-3" viewBox="0 0 12 12" fill="currentColor"><path d="M4 4l4 4m0-4l-4 4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
                  </button>
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Error / Success -->
        {#if error}
          <p class="mb-3 text-sm text-red-600">{error}</p>
        {/if}
        {#if success}
          <p class="mb-3 text-sm text-green-600">{success}</p>
        {/if}

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <button
            onclick={() => (open = false)}
            class="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onclick={save}
            disabled={saving}
            class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
