<script lang="ts">
	import { fade, fly } from 'svelte/transition';
</script>

<div
	class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
	in:fade={{ duration: 500 }}
>
	<div class="flex max-w-xl flex-col items-center px-6 text-center">
		<h1
			class="mb-6 text-5xl font-bold text-white"
			in:fly={{ y: -50, duration: 800, delay: 200 }}
		>
			Cellular Automata
		</h1>

		<p
			class="mb-10 text-lg leading-relaxed text-gray-300"
			in:fly={{ y: 30, duration: 800, delay: 500 }}
		>
			Explore the emergent complexity of cellular automata. From simple rules come intricate
			patterns — in one, two, or three dimensions.
		</p>

		<div
			class="flex flex-col items-center gap-4"
			in:fly={{ y: 30, duration: 800, delay: 700 }}
		>
			<a
				href="/"
				class="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-black transition hover:bg-gray-200"
			>
				Start Exploring
			</a>

			<span class="text-sm text-gray-500">or</span>

			<a href="/docs" class="text-sm text-gray-400 underline transition hover:text-white">
				Learn More
			</a>
		</div>
	</div>

	<div
		class="absolute bottom-6 right-8 text-xs text-gray-600"
		in:fly={{ x: 50, duration: 800, delay: 1200 }}
	>
		Built by Ethan Hathaway
	</div>
</div>
