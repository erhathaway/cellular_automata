<script lang="ts">
	import { SignUp } from 'svelte-clerk';
</script>

<div class="flex h-full w-full items-center justify-center">
	<SignUp fallbackRedirectUrl="/mine" />
</div>
