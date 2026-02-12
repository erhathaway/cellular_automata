import { createHash } from 'crypto';

export function generationRunFingerprint(
	dimension: number,
	ruleType: string,
	ruleDefinition: string,
	neighborhoodRadius: number = 1,
	latticeType?: string
): string {
	// Only append lattice when non-default for backward compatibility
	const latSuffix = latticeType ? `:${latticeType}` : '';
	return createHash('sha256')
		.update(`gr:${dimension}:${ruleType}:${ruleDefinition}:${neighborhoodRadius}${latSuffix}`)
		.digest('hex')
		.slice(0, 16);
}

export function cellPopulationFingerprint(
	dimension: number,
	ruleType: string,
	ruleDefinition: string,
	stability: string,
	stablePeriod: number | null,
	neighborhoodRadius: number = 1,
	latticeType?: string
): string {
	const latSuffix = latticeType ? `:${latticeType}` : '';
	return createHash('sha256')
		.update(`cp:${dimension}:${ruleType}:${ruleDefinition}:${stability}:${stablePeriod ?? ''}:${neighborhoodRadius}${latSuffix}`)
		.digest('hex')
		.slice(0, 16);
}
