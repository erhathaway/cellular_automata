<script lang="ts">
	import type { MinerConfig } from '$lib/miner/types';
	import MinerEditor from '$lib/components/miner/MinerEditor.svelte';
	import { api } from '$lib/api';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	type UserProfile = {
		displayName: string | null;
		avatarId: string | null;
		email: string | null;
		minerConfig: string | null;
	};

	let saving = $state(false);
	let errorMsg = $state('');

	let existingConfig = $derived.by(() => {
		const profile = $page.data.userProfile as UserProfile | null;
		if (profile?.minerConfig) {
			try {
				return JSON.parse(profile.minerConfig) as MinerConfig;
			} catch {
				return null;
			}
		}
		return null;
	});

	async function handleSave(config: MinerConfig) {
		if (saving) return;
		saving = true;
		errorMsg = '';
		try {
			await api('PATCH', '/api/user/profile', {
				avatarId: '__miner__',
				minerConfig: JSON.stringify(config)
			});
			await invalidateAll();
			goto('/');
		} catch (err: any) {
			errorMsg = err.message || 'Something went wrong';
			saving = false;
		}
	}

	function handleCancel() {
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
				<button class="back-btn" onclick={handleCancel} aria-label="Go back">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="title-row">
					<svg class="title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
					</svg>
					<span class="panel-title">Miner Editor</span>
				</div>
			</div>

			<div class="divider"></div>

			{#if errorMsg}
				<p class="msg-error">{errorMsg}</p>
			{/if}

			<MinerEditor
				initialConfig={existingConfig}
				onsave={handleSave}
				oncancel={handleCancel}
			/>

			{#if saving}
				<div class="saving-overlay">
					<span class="saving-text">Saving...</span>
				</div>
			{/if}
		</div>

		<a href="/settings/avatar-classic" class="classic-link">
			Use classic avatar picker
		</a>
	</div>
</div>

<style>
	.avatar-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100%;
		width: 100%;
		background: #000;
		padding: 24px 0;
	}

	.avatar-inner {
		width: 100%;
		max-width: 520px;
		padding: 0 24px;
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

	/* Error */
	.msg-error {
		margin-bottom: 14px;
		text-align: center;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		color: #ef4444;
	}

	/* Saving overlay */
	.saving-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(28, 25, 23, 0.8);
		border-radius: 8px;
		z-index: 10;
	}

	.saving-text {
		font-family: 'Space Mono', monospace;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #facc15;
	}

	/* Classic link */
	.classic-link {
		display: block;
		text-align: center;
		margin-top: 16px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.06em;
		color: #57534e;
		text-decoration: none;
		transition: color 0.15s;
	}

	.classic-link:hover {
		color: #a8a29e;
	}
</style>
