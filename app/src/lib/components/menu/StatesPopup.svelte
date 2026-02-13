<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';
  import type { TrailStepFn } from '$lib/stores/automata.svelte';

  let editingState: string | null = $state(null);
  let editingTrail = $state(false);

  function hslString(color: { h: number; s: number; l: number; a: number }): string {
    return `hsla(${Math.floor(color.h)}, ${Math.floor(color.s * 100)}%, ${Math.floor(color.l * 100)}%, ${color.a})`;
  }

  function toggleColorEditor(role: string) {
    editingState = editingState === role ? null : role;
  }

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
</script>

<div style="width: 300px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Cell States
  </div>

  <!-- Key header -->
  <div class="mb-4 flex w-[200px] justify-between">
    <div
      class="flex w-full justify-center border-b border-gray-300 px-5 py-1 text-center text-xs text-black"
      style="letter-spacing: 3px;"
    >
      #
    </div>
    <div
      class="flex w-full justify-center border-b border-gray-300 px-5 py-1 text-center text-xs text-black"
      style="letter-spacing: 3px;"
    >
      Color
    </div>
  </div>

  <!-- State rows -->
  <div class="flex w-[200px] flex-col">
    {#each automataStore.cellStates as cellState}
      <div class="flex h-10 w-[200px] items-center justify-evenly">
        <div class="flex h-[30px] w-full items-center justify-center p-1 text-black" style="margin-left: 10px; margin-right: 20px;">
          {capitalize(cellState.role)}
        </div>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="flex w-full cursor-pointer justify-center p-1"
          style="margin-left: 20px; margin-right: 20px; margin-bottom: 10px;"
          onclick={() => toggleColorEditor(cellState.role)}
        >
          <div
            class="mr-1 h-[30px] w-[30px] border border-gray-300"
            style="background-color: {hslString(cellState.color)};"
          ></div>
        </div>
      </div>

      {#if editingState === cellState.role}
        <div class="mb-3 flex flex-col gap-2 px-2">
          <label class="flex items-center gap-2 text-xs text-black">
            H
            <input
              type="range"
              min="0"
              max="360"
              value={cellState.color.h}
              oninput={(e) => {
                automataStore.setCellStateColor(cellState.role, {
                  ...cellState.color,
                  h: parseInt((e.target as HTMLInputElement).value),
                });
              }}
              class="w-full"
            />
          </label>
          <label class="flex items-center gap-2 text-xs text-black">
            S
            <input
              type="range"
              min="0"
              max="100"
              value={Math.floor(cellState.color.s * 100)}
              oninput={(e) => {
                automataStore.setCellStateColor(cellState.role, {
                  ...cellState.color,
                  s: parseInt((e.target as HTMLInputElement).value) / 100,
                });
              }}
              class="w-full"
            />
          </label>
          <label class="flex items-center gap-2 text-xs text-black">
            L
            <input
              type="range"
              min="0"
              max="100"
              value={Math.floor(cellState.color.l * 100)}
              oninput={(e) => {
                automataStore.setCellStateColor(cellState.role, {
                  ...cellState.color,
                  l: parseInt((e.target as HTMLInputElement).value) / 100,
                });
              }}
              class="w-full"
            />
          </label>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Trail config -->
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px; margin-top: 8px;"
  >
    Trail
  </div>

  <div class="flex w-[200px] flex-col">
    <!-- Trail color row -->
    <div class="flex h-10 w-[200px] items-center justify-evenly">
      <div class="flex h-[30px] w-full items-center justify-center p-1 text-black" style="margin-left: 10px; margin-right: 20px;">
        Color
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex w-full cursor-pointer justify-center p-1"
        style="margin-left: 20px; margin-right: 20px; margin-bottom: 10px;"
        onclick={() => editingTrail = !editingTrail}
      >
        <div
          class="mr-1 h-[30px] w-[30px] border border-gray-300"
          style="background-color: {hslString(automataStore.trailConfig.color)};"
        ></div>
      </div>
    </div>

    {#if editingTrail}
      <div class="mb-3 flex flex-col gap-2 px-2">
        <label class="flex items-center gap-2 text-xs text-black">
          H
          <input
            type="range"
            min="0"
            max="360"
            value={automataStore.trailConfig.color.h}
            oninput={(e) => {
              automataStore.setTrailColor({
                ...automataStore.trailConfig.color,
                h: parseInt((e.target as HTMLInputElement).value),
              });
            }}
            class="w-full"
          />
        </label>
        <label class="flex items-center gap-2 text-xs text-black">
          S
          <input
            type="range"
            min="0"
            max="100"
            value={Math.floor(automataStore.trailConfig.color.s * 100)}
            oninput={(e) => {
              automataStore.setTrailColor({
                ...automataStore.trailConfig.color,
                s: parseInt((e.target as HTMLInputElement).value) / 100,
              });
            }}
            class="w-full"
          />
        </label>
        <label class="flex items-center gap-2 text-xs text-black">
          L
          <input
            type="range"
            min="0"
            max="100"
            value={Math.floor(automataStore.trailConfig.color.l * 100)}
            oninput={(e) => {
              automataStore.setTrailColor({
                ...automataStore.trailConfig.color,
                l: parseInt((e.target as HTMLInputElement).value) / 100,
              });
            }}
            class="w-full"
          />
        </label>
      </div>
    {/if}

    <!-- Trail size -->
    <div class="mb-2 flex items-center gap-2 px-2">
      <span class="text-xs text-black" style="min-width: 32px;">Size</span>
      <input
        type="range"
        min="1"
        max="100"
        value={automataStore.trailConfig.size}
        oninput={(e) => automataStore.setTrailSize(parseInt((e.target as HTMLInputElement).value))}
        class="w-full"
      />
      <span class="text-xs text-black" style="min-width: 20px; text-align: right;">{automataStore.trailConfig.size}</span>
    </div>

    <!-- Trail step function -->
    <div class="mb-2 flex items-center gap-2 px-2">
      <span class="text-xs text-black" style="min-width: 32px;">Fade</span>
      <select
        value={automataStore.trailConfig.stepFn}
        onchange={(e) => automataStore.setTrailStepFn((e.target as HTMLSelectElement).value as TrailStepFn)}
        class="w-full rounded border border-gray-300 bg-white px-1 py-0.5 text-xs text-black"
      >
        <option value="linear">Linear</option>
        <option value="exponential">Exponential</option>
        <option value="none">None</option>
      </select>
    </div>
  </div>
</div>
