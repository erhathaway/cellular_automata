<script lang="ts">
  import { onMount } from 'svelte';
  import { automataStore } from '$lib/stores/automata.svelte';

  let progressBarEl: HTMLElement;
  let isDragging = false;
  let wasPlayingBeforeDrag = false;

  function getSeekIndexFromEvent(e: MouseEvent) {
    if (!progressBarEl) return 0;
    const rect = progressBarEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.round(ratio * (automataStore.totalGenerations - 1));
  }

  function handleMouseDown(e: MouseEvent) {
    if (automataStore.totalGenerations <= 1) return;
    isDragging = true;
    wasPlayingBeforeDrag = automataStore.isPlaying;
    if (wasPlayingBeforeDrag) automataStore.pause();
    const index = getSeekIndexFromEvent(e);
    automataStore.seekTo(index);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const index = getSeekIndexFromEvent(e);
    automataStore.seekTo(index);
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    if (wasPlayingBeforeDrag) automataStore.play();
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  let progressPercent = $derived(
    automataStore.totalGenerations > 1
      ? (automataStore.generationIndex / (automataStore.totalGenerations - 1)) * 100
      : 0
  );
</script>

<aside
  class="fixed z-20"
  style="bottom: 20px; left: 250px; height: 95px; width: calc(100% - 500px); min-width: 400px;"
>
  <!-- Progress Bar -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <aside
    bind:this={progressBarEl}
    class="absolute right-0 top-0 flex items-center cursor-pointer"
    style="height: 14px; width: 100%; background-color: black; border-radius: 7px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); overflow: hidden;"
    onmousedown={handleMouseDown}
  >
    <!-- Filled portion -->
    <div
      style="height: 100%; width: {progressPercent}%; background-color: rgba(156,156,156,0.3); border-radius: 7px 0 0 7px; pointer-events: none;"
    ></div>
    <!-- Playhead -->
    {#if automataStore.totalGenerations > 1}
      <div
        style="position: absolute; left: {progressPercent}%; top: 0; width: 2px; height: 100%; background-color: rgba(156,156,156,0.8); transform: translateX(-1px); pointer-events: none;"
      ></div>
    {/if}
  </aside>

  <!-- Play Button -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <aside
    class="absolute bottom-0 left-0 flex cursor-pointer items-center justify-center text-center"
    style="height: 60px; width: 70px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); color: rgba(156,156,156,1); font-size: 25px; background-color: black;"
    onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.backgroundImage = 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.11), rgba(0,0,0,0.1), rgba(0,0,0,0.1))'; }}
    onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.backgroundImage = 'none'; }}
    onclick={() => automataStore.togglePlay()}
  >
    {#if automataStore.isPlaying}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" style="height: 25px; width: 25px;">
        <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" style="height: 25px; width: 25px;">
        <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
      </svg>
    {/if}
  </aside>

  <!-- Menu Container with Reset Button -->
  <aside
    class="absolute bottom-0 right-0 flex items-center justify-center text-center"
    style="height: 60px; width: calc(100% - 90px); background-color: #4040403d; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);"
  >
    <!-- Reset/Reverse Button -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute bottom-0 left-0 flex cursor-pointer flex-col items-center justify-stretch"
      style="height: 100%; width: 90px; border-radius: 4px; border-bottom-right-radius: 0; border-top-right-radius: 0; color: rgba(0,0,0,0);"
      onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundImage = 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.2), rgba(0,0,0,0.11), rgba(0,0,0,0.1), rgba(0,0,0,0.1))'; el.style.color = 'rgba(156,156,156,1)'; }}
      onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundImage = 'none'; el.style.color = 'rgba(0,0,0,0)'; }}
      onclick={() => automataStore.reset()}
    >
      <div
        class="flex flex-grow-[3] items-center text-center"
        style="color: rgba(156,156,156,0.6); font-size: 23px;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  </aside>
</aside>
