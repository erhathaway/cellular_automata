/** Tracks scroll positions for pages that should restore on back-navigation from the viewer. */

const TRACKED_PATHS = new Set(['/gallery', '/backpack']);
const VIEWER_PATH = '/';

class ScrollPositionStore {
	/** path → scrollTop */
	positions = new Map<string, number>();
	/** The path we're navigating away from */
	lastPath = '';

	/** Call before navigation. Saves scroll position if leaving a tracked page. */
	save(fromPath: string, scrollTop: number) {
		this.lastPath = fromPath;
		if (TRACKED_PATHS.has(fromPath)) {
			this.positions.set(fromPath, scrollTop);
		}
	}

	/** Call after navigation. Returns the scrollTop to restore, or 0 to reset. */
	restore(toPath: string): number {
		if (!TRACKED_PATHS.has(toPath)) return 0;
		// Only restore if coming back from the viewer
		if (this.lastPath === VIEWER_PATH || this.lastPath.startsWith('/?')) {
			return this.positions.get(toPath) ?? 0;
		}
		// Coming from elsewhere — reset
		this.positions.delete(toPath);
		return 0;
	}
}

export const scrollPositionStore = new ScrollPositionStore();
