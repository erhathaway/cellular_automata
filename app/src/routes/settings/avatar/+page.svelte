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
			goto('/mine');
		} catch (err: any) {
			errorMsg = err.message || 'Something went wrong';
			saving = false;
		}
	}

	function handleCancel() {
		goto('/mine');
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
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="title-row">
					<svg class="title-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
		align-items: stretch;
		height: 100%;
		width: 100%;
		background: #000;
		padding: 32px 0;
		box-sizing: border-box;
	}

	.avatar-inner {
		width: 100%;
		max-width: 900px;
		padding: 0 24px;
		display: flex;
		flex-direction: column;
	}

	.avatar-panel {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
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
		border-radius: 10px;
		padding: 36px 32px;
	}

	/* Nails */
	.nails {
		position: absolute;
		top: 10px;
		left: 14px;
		right: 14px;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
	}

	.nails-bottom {
		top: auto;
		bottom: 10px;
	}

	.nail {
		width: 7px;
		height: 7px;
		background: #78716c;
		border-radius: 50%;
		box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
	}

	/* Header */
	.panel-header {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
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
		gap: 12px;
	}

	.title-icon {
		color: #facc15;
		filter: drop-shadow(0 0 4px rgba(250, 204, 21, 0.4));
	}

	.panel-title {
		font-family: 'Space Mono', monospace;
		font-size: 22px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #facc15;
	}

	/* Divider */
	.divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 24px 0;
	}

	/* Error */
	.msg-error {
		margin-bottom: 18px;
		text-align: center;
		font-family: 'Space Mono', monospace;
		font-size: 16px;
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
		border-radius: 10px;
		z-index: 10;
	}

	.saving-text {
		font-family: 'Space Mono', monospace;
		font-size: 22px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #facc15;
	}

	/* Classic link */
	.classic-link {
		display: block;
		text-align: center;
		margin-top: 24px;
		font-family: 'Space Mono', monospace;
		font-size: 15px;
		letter-spacing: 0.06em;
		color: #57534e;
		text-decoration: none;
		transition: color 0.15s;
	}

	.classic-link:hover {
		color: #a8a29e;
	}
</style>
