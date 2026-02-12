<script lang="ts">
	import { AVATARS } from '$lib/avatars';
	import PixelAvatar from '$lib/components/PixelAvatar.svelte';
	import { api } from '$lib/api';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	type UserProfile = { displayName: string | null; avatarId: string | null; email: string | null };

	let currentAvatarId = $derived(($page.data.userProfile as UserProfile | null)?.avatarId ?? '');
	let selectedAvatarId = $state('');
	let saving = $state(false);
	let errorMsg = $state('');

	// Initialize selection from current profile
	$effect(() => {
		if (currentAvatarId && !selectedAvatarId) {
			selectedAvatarId = currentAvatarId;
		}
	});

	let hasChanged = $derived(selectedAvatarId !== '' && selectedAvatarId !== currentAvatarId);
	let previewAvatarId = $derived(selectedAvatarId || currentAvatarId);
	let previewAvatar = $derived(AVATARS.find(a => a.id === previewAvatarId));

	async function save() {
		if (!hasChanged || saving) return;
		saving = true;
		errorMsg = '';
		try {
			await api('PATCH', '/api/user/profile', { avatarId: selectedAvatarId });
			await invalidateAll();
			goto('/');
		} catch (err: any) {
			errorMsg = err.message || 'Something went wrong';
			saving = false;
		}
	}

	function goBack() {
		goto('/');
	}
</script>

<div class="avatar-page">
	<div class="avatar-inner">
		<div class="avatar-panel">
			<!-- Nails -->
			<div class="nails"><div class="nail"></div><div class="nail"></div></div>
			<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

			<!-- Header -->
			<div class="panel-header">
				<button class="back-btn" onclick={goBack} aria-label="Go back">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="title-row">
					<svg class="title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					<span class="panel-title">Choose Avatar</span>
				</div>
			</div>

			<div class="divider"></div>

			<!-- Current selection preview -->
			<div class="preview-section">
				<div class="preview-frame">
					<PixelAvatar avatarId={previewAvatarId || null} size={72} />
				</div>
				{#if previewAvatar}
					<span class="preview-name">{previewAvatar.name}</span>
				{/if}
			</div>

			<div class="divider"></div>

			<!-- Avatar grid -->
			<div class="avatar-grid">
				{#each AVATARS as avatar}
					<button
						class="avatar-btn"
						class:selected={selectedAvatarId === avatar.id}
						class:current={currentAvatarId === avatar.id && selectedAvatarId !== avatar.id}
						onclick={() => { selectedAvatarId = avatar.id; }}
					>
						<PixelAvatar avatarId={avatar.id} size={36} />
						<span class="avatar-name">{avatar.name}</span>
					</button>
				{/each}
			</div>

			{#if errorMsg}
				<p class="msg-error">{errorMsg}</p>
			{/if}

			<!-- Actions -->
			<div class="actions">
				<button class="btn-outline" onclick={goBack}>Cancel</button>
				<button
					class="btn-save"
					class:disabled={!hasChanged || saving}
					disabled={!hasChanged || saving}
					onclick={save}
				>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.avatar-page {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		background: #000;
	}

	.avatar-inner {
		width: 100%;
		max-width: 520px;
		padding: 24px;
	}

	.avatar-panel {
		position: relative;
		background-color: #1c1917;
		background-image:
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 10px,
				rgba(68, 64, 60, 0.1) 10px,
				rgba(68, 64, 60, 0.1) 11px
			);
		border: 2px solid #44403c;
		border-radius: 8px;
		padding: 28px 24px;
	}

	/* Nails */
	.nails {
		position: absolute;
		top: 8px;
		left: 12px;
		right: 12px;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
	}

	.nails-bottom {
		top: auto;
		bottom: 8px;
	}

	.nail {
		width: 6px;
		height: 6px;
		background: #78716c;
		border-radius: 50%;
		box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
	}

	/* Header */
	.panel-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px;
		color: #78716c;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}

	.back-btn:hover {
		color: #f5f5f4;
		background: rgba(255, 255, 255, 0.1);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.title-icon {
		color: #facc15;
		filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
	}

	.panel-title {
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #facc15;
	}

	/* Divider */
	.divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 18px 0;
	}

	/* Preview */
	.preview-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.preview-frame {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 88px;
		height: 88px;
		background: #0c0a09;
		border: 2px solid #292524;
		border-radius: 10px;
	}

	.preview-name {
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a8a29e;
	}

	/* Avatar grid */
	.avatar-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
	}

	@media (max-width: 480px) {
		.avatar-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.avatar-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 10px 4px;
		background: none;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}

	.avatar-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: #292524;
	}

	.avatar-btn.selected {
		background: rgba(250, 204, 21, 0.1);
		border-color: #facc15;
		box-shadow: 0 0 10px rgba(250, 204, 21, 0.15);
	}

	.avatar-btn.current {
		border-color: #44403c;
		border-style: dashed;
	}

	.avatar-name {
		font-family: 'Space Mono', monospace;
		font-size: 8px;
		letter-spacing: 0.04em;
		color: #57534e;
		line-height: 1;
	}

	.avatar-btn.selected .avatar-name {
		color: #facc15;
	}

	/* Error */
	.msg-error {
		margin-top: 14px;
		text-align: center;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		color: #ef4444;
	}

	/* Actions */
	.actions {
		display: flex;
		gap: 10px;
		margin-top: 20px;
	}

	.btn-outline {
		flex: 1;
		padding: 10px 16px;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a8a29e;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid #44403c;
		border-radius: 6px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
	}

	.btn-outline:hover {
		color: #f5f5f4;
		background: rgba(255, 255, 255, 0.1);
	}

	.btn-save {
		flex: 1;
		padding: 10px 16px;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1c1917;
		background: #facc15;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s, box-shadow 0.15s;
	}

	.btn-save:hover:not(.disabled) {
		background: #fde047;
		box-shadow: 0 0 12px rgba(250, 204, 21, 0.3);
	}

	.btn-save.disabled {
		background: #44403c;
		color: #78716c;
		cursor: not-allowed;
	}
</style>
