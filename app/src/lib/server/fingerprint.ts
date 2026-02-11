import { createHash } from 'crypto';

export function generationRunFingerprint(
	dimension: number,
	ruleType: string,
	ruleDefinition: string,
	neighborhoodRadius: number = 1
): string {
	return createHash('sha256')
		.update(`gr:${dimension}:${ruleType}:${ruleDefinition}:${neighborhoodRadius}`)
		.digest('hex')
		.slice(0, 16);
}

export function cellPopulationFingerprint(
	dimension: number,
	ruleType: string,
	ruleDefinition: string,
	stability: string,
	stablePeriod: number | null,
	neighborhoodRadius: number = 1
): string {
	return createHash('sha256')
		.update(`cp:${dimension}:${ruleType}:${ruleDefinition}:${stability}:${stablePeriod ?? ''}:${neighborhoodRadius}`)
		.digest('hex')
		.slice(0, 16);
}
