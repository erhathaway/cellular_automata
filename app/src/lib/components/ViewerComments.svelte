<script lang="ts">
  const comments = [
    {
      name: 'Alan Turing',
      time: '2 hours ago',
      text: 'Fascinating how such simple rules can produce this level of complexity. Reminds me of morphogenesis.',
      avatar: 'AT',
    },
    {
      name: 'John Conway',
      time: '5 hours ago',
      text: 'Not bad, but have you tried B3/S23? Trust me on this one.',
      avatar: 'JC',
    },
    {
      name: 'Stephen Wolfram',
      time: '1 day ago',
      text: 'This is clearly evidence that the universe is a cellular automaton. See my book for details (1,200 pages).',
      avatar: 'SW',
    },
  ];
</script>

<div class="mx-auto max-w-3xl px-6 pb-16">
  <h2 class="text-lg font-semibold text-neutral-900">{comments.length} Comments</h2>

  <div class="mt-6 flex gap-3">
    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-500">
      You
    </div>
    <textarea
      class="min-h-[40px] w-full resize-none border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
      placeholder="Add a comment..."
      rows="1"
    ></textarea>
  </div>

  <div class="mt-8 flex flex-col gap-6">
    {#each comments as comment}
      <div class="flex gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium text-white">
          {comment.avatar}
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-sm font-medium text-neutral-900">{comment.name}</span>
            <span class="text-xs text-neutral-400">{comment.time}</span>
          </div>
          <p class="mt-1 text-sm leading-relaxed text-neutral-700">{comment.text}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
