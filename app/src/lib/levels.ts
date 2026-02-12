export const LEVELS = [
	{ key: 'easy', label: 'Easy', radii: [1] },
	{ key: 'medium', label: 'Medium', radii: [2, 3] },
	{ key: 'hard', label: 'Hard', radii: [4, 5, 6] }
] as const;

const radiusToLevelMap = new Map<number, string>();
for (const level of LEVELS) {
	for (const r of level.radii) {
		radiusToLevelMap.set(r, level.key);
	}
}

export function radiusToLevel(r: number): string {
	return radiusToLevelMap.get(r) ?? 'hard';
}

export function aggregateByLevel(
	byRadius: Record<string, number>
): Record<string, number> {
	const result: Record<string, number> = {};
	for (const level of LEVELS) {
		let sum = 0;
		for (const r of level.radii) {
			sum += byRadius[String(r)] ?? 0;
		}
		result[level.key] = sum;
	}
	return result;
}
