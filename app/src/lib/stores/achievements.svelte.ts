import { api } from '$lib/api';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, type AchievementDef } from '$lib/achievements/config';

export interface AchievementState {
	def: AchievementDef;
	earned: boolean;
	earnedAt: string | null;
	seen: boolean;
}

type CheckResult = {
	achievementId: string;
	earned: boolean;
	newlyEarned: boolean;
	revoked: boolean;
};

class AchievementsStore {
	achievements: AchievementState[] = $state([]);
	loading = $state(false);
	checking = $state(false);
	checkProgress = $state(0);
	unseenCount = $state(0);
	newlyEarned: AchievementState[] = $state([]);

	get byCategory(): { category: string; label: string; items: AchievementState[] }[] {
		return ACHIEVEMENT_CATEGORIES.map((cat) => ({
			category: cat.id,
			label: cat.label,
			items: this.achievements.filter((a) => a.def.category === cat.id),
		}));
	}

	async fetch() {
		this.loading = true;
		try {
			const data = await api<{
				achievements: { id: string; earned: boolean; earnedAt: string | null; seen: boolean }[];
				unseenCount: number;
			}>('GET', '/api/achievements');

			this.achievements = data.achievements.map((a) => ({
				def: ACHIEVEMENTS.find((d) => d.id === a.id)!,
				earned: a.earned,
				earnedAt: a.earnedAt,
				seen: a.seen,
			}));
			this.unseenCount = data.unseenCount;
		} catch {
			// ignore
		} finally {
			this.loading = false;
		}
	}

	async checkAll() {
		if (this.checking) return;
		this.checking = true;
		this.checkProgress = 0;
		const newlyEarnedList: AchievementState[] = [];

		const ids = ACHIEVEMENTS.map((a) => a.id);
		for (let i = 0; i < ids.length; i++) {
			try {
				const result = await api<CheckResult>('POST', `/api/achievements/check/${ids[i]}`);
				// Update local state
				const idx = this.achievements.findIndex((a) => a.def.id === ids[i]);
				if (idx !== -1) {
					if (result.newlyEarned) {
						this.achievements[idx].earned = true;
						this.achievements[idx].earnedAt = new Date().toISOString();
						this.achievements[idx].seen = false;
						newlyEarnedList.push(this.achievements[idx]);
					} else if (result.revoked) {
						this.achievements[idx].earned = false;
						this.achievements[idx].earnedAt = null;
						this.achievements[idx].seen = false;
					} else if (result.earned) {
						this.achievements[idx].earned = true;
					}
				}
			} catch {
				// skip failed checks
			}
			this.checkProgress = i + 1;
		}

		this.checking = false;
		this.newlyEarned = newlyEarnedList;
		this.unseenCount = this.achievements.filter((a) => a.earned && !a.seen).length;
	}

	async markSeen(ids: string[]) {
		if (ids.length === 0) return;
		try {
			await api('POST', '/api/achievements/seen', { achievementIds: ids });
			for (const id of ids) {
				const a = this.achievements.find((a) => a.def.id === id);
				if (a) a.seen = true;
			}
			this.unseenCount = this.achievements.filter((a) => a.earned && !a.seen).length;
		} catch {
			// ignore
		}
	}

	markAllEarnedSeen() {
		const unseen = this.achievements.filter((a) => a.earned && !a.seen).map((a) => a.def.id);
		this.markSeen(unseen);
	}

	dismissNotification() {
		const ids = this.newlyEarned.map((a) => a.def.id);
		this.newlyEarned = [];
		this.markSeen(ids);
	}
}

export const achievementsStore = new AchievementsStore();
