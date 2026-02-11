<script lang="ts">
  import { automataStore } from '$lib/stores/automata.svelte';

  function parseNumberList(str: string): number[] {
    return str
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  }
</script>

<div style="width: 270px;" class="flex flex-col items-center justify-center">
  <div
    class="text-center"
    style="height: 30px; color: gray; padding: 10px; letter-spacing: 3px; font-size: 12px;"
  >
    Rule
  </div>

  {#if automataStore.rule.type === 'wolfram'}
    <div class="flex w-4/5 items-center gap-2">
      <span class="text-xs text-gray-500" style="letter-spacing: 2px;">Rule #</span>
      <input
        type="number"
        min="0"
        max="255"
        value={automataStore.rule.rule}
        onchange={(e) => {
          const v = parseInt((e.target as HTMLInputElement).value);
          if (v >= 0 && v <= 255) {
            automataStore.setRule({ type: 'wolfram', rule: v });
          }
        }}
        class="h-[30px] w-full border-b border-gray-300 bg-transparent text-black outline-none"
        style="border-top: none; border-left: none; border-right: none; letter-spacing: 3px;"
      />
    </div>
  {:else}
    <div class="flex w-4/5 flex-col gap-3">
      <div class="flex items-center gap-2">
        <span class="w-14 text-xs text-gray-500" style="letter-spacing: 2px;">Survive</span>
        <input
          type="text"
          value={automataStore.rule.survive.join(', ')}
          onchange={(e) => {
            const survive = parseNumberList((e.target as HTMLInputElement).value);
            automataStore.setRule({
              type: 'conway',
              survive,
              born: automataStore.rule.type === 'conway' ? automataStore.rule.born : [3],
            });
          }}
          class="h-[30px] w-full border-b border-gray-300 bg-transparent text-black outline-none"
          style="border-top: none; border-left: none; border-right: none; letter-spacing: 3px;"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="w-14 text-xs text-gray-500" style="letter-spacing: 2px;">Born</span>
        <input
          type="text"
          value={automataStore.rule.born.join(', ')}
          onchange={(e) => {
            const born = parseNumberList((e.target as HTMLInputElement).value);
            automataStore.setRule({
              type: 'conway',
              survive: automataStore.rule.type === 'conway' ? automataStore.rule.survive : [2, 3],
              born,
            });
          }}
          class="h-[30px] w-full border-b border-gray-300 bg-transparent text-black outline-none"
          style="border-top: none; border-left: none; border-right: none; letter-spacing: 3px;"
        />
      </div>
    </div>
  {/if}
</div>
