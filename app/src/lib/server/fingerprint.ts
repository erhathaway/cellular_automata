import { createHash } from 'crypto';

export function generationRunFingerprint(
	dimension: number,
	ruleType: string,
	ruleDefinition: string
): string {
	return createHash('sha256')
		.update(`gr:${dimension}:${ruleType}:${ruleDefinition}`)
		.digest('hex')
		.slice(0, 16);
}

export function cellPopulationFingerprint(
	dimension: number,
	ruleType: string,
	ruleDefinition: string,
	stability: string,
	stablePeriod: number | null
): string {
	return createHash('sha256')
		.update(`cp:${dimension}:${ruleType}:${ruleDefinition}:${stability}:${stablePeriod ?? ''}`)
		.digest('hex')
		.slice(0, 16);
}
