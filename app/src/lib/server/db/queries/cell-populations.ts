import { db } from '../index';
import { cellPopulation, user } from '../schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export interface CreateCellPopulationInput {
	userId: string;
	generationRunId?: string;
	dimension: number;
	viewer: number;
	ruleType: 'wolfram' | 'conway';
	ruleDefinition: string;
	neighborhoodRadius?: number;
	latticeType?: string | null;
	populationShape: string;
	cellStates: string;
	populationData?: Buffer;
	generationIndex?: number;
	stepCount?: number;
	stability?: 'evolving' | 'quasi_stable' | 'fixed';
	stablePeriod?: number;
	title?: string;
	description?: string;
	thumbnail?: string;
	fingerprint: string;
}

export async function createCellPopulation(input: CreateCellPopulationInput) {
	const result = await db
		.insert(cellPopulation)
		.values({
			userId: input.userId,
			generationRunId: input.generationRunId,
			dimension: input.dimension,
			viewer: input.viewer,
			ruleType: input.ruleType,
			ruleDefinition: input.ruleDefinition,
			neighborhoodRadius: input.neighborhoodRadius ?? 1,
			latticeType: input.latticeType ?? null,
			populationShape: input.populationShape,
			cellStates: input.cellStates,
			populationData: input.populationData,
			generationIndex: input.generationIndex,
			stepCount: input.stepCount ?? 1,
			stability: input.stability ?? 'evolving',
			stablePeriod: input.stablePeriod,
			title: input.title ?? '',
			description: input.description ?? '',
			thumbnail: input.thumbnail,
			fingerprint: input.fingerprint
		})
		.returning();
	return result[0];
}

export interface ListCellPopulationsParams {
	dimension?: number;
	stability?: string;
	sort?: 'newest' | 'most_liked';
	cursor?: string;
	limit?: number;
}

export async function listCellPopulations(params: ListCellPopulationsParams) {
	const limit = Math.min(params.limit ?? 20, 50);
	const conditions = [];

	if (params.dimension) {
		conditions.push(eq(cellPopulation.dimension, params.dimension));
	}
	if (params.stability) {
		conditions.push(
			eq(
				cellPopulation.stability,
				params.stability as 'evolving' | 'quasi_stable' | 'fixed'
			)
		);
	}

	if (params.cursor) {
		if (params.sort === 'most_liked') {
			conditions.push(sql`${cellPopulation.likeCount} <= ${parseInt(params.cursor)}`);
		} else {
			const cursorDate = new Date(parseInt(params.cursor));
			conditions.push(sql`${cellPopulation.createdAt} < ${cursorDate}`);
		}
	}

	const where = conditions.length > 0 ? and(...conditions) : undefined;
	const orderBy =
		params.sort === 'most_liked'
			? [desc(cellPopulation.likeCount), desc(cellPopulation.createdAt)]
			: [desc(cellPopulation.createdAt)];

	const rows = await db
		.select({
			id: cellPopulation.id,
			userId: cellPopulation.userId,
			generationRunId: cellPopulation.generationRunId,
			dimension: cellPopulation.dimension,
			viewer: cellPopulation.viewer,
			ruleType: cellPopulation.ruleType,
			ruleDefinition: cellPopulation.ruleDefinition,
			neighborhoodRadius: cellPopulation.neighborhoodRadius,
			populationShape: cellPopulation.populationShape,
			cellStates: cellPopulation.cellStates,
			generationIndex: cellPopulation.generationIndex,
			stability: cellPopulation.stability,
			stablePeriod: cellPopulation.stablePeriod,
			title: cellPopulation.title,
			description: cellPopulation.description,
			thumbnail: cellPopulation.thumbnail,
			fingerprint: cellPopulation.fingerprint,
			likeCount: cellPopulation.likeCount,
			bookmarkCount: cellPopulation.bookmarkCount,
			createdAt: cellPopulation.createdAt,
			userName: user.name,
			userImageUrl: user.imageUrl
		})
		.from(cellPopulation)
		.leftJoin(user, eq(cellPopulation.userId, user.id))
		.where(where)
		.orderBy(...orderBy)
		.limit(limit + 1);

	const hasMore = rows.length > limit;
	const items = hasMore ? rows.slice(0, limit) : rows;
	const nextCursor = hasMore
		? params.sort === 'most_liked'
			? String(items[items.length - 1].likeCount)
			: String(items[items.length - 1].createdAt?.getTime())
		: null;

	return { items, nextCursor };
}

export async function getCellPopulation(id: string) {
	const rows = await db
		.select({
			id: cellPopulation.id,
			userId: cellPopulation.userId,
			generationRunId: cellPopulation.generationRunId,
			dimension: cellPopulation.dimension,
			viewer: cellPopulation.viewer,
			ruleType: cellPopulation.ruleType,
			ruleDefinition: cellPopulation.ruleDefinition,
			neighborhoodRadius: cellPopulation.neighborhoodRadius,
			populationShape: cellPopulation.populationShape,
			cellStates: cellPopulation.cellStates,
			populationData: cellPopulation.populationData,
			generationIndex: cellPopulation.generationIndex,
			stepCount: cellPopulation.stepCount,
			stability: cellPopulation.stability,
			stablePeriod: cellPopulation.stablePeriod,
			title: cellPopulation.title,
			description: cellPopulation.description,
			thumbnail: cellPopulation.thumbnail,
			fingerprint: cellPopulation.fingerprint,
			likeCount: cellPopulation.likeCount,
			bookmarkCount: cellPopulation.bookmarkCount,
			createdAt: cellPopulation.createdAt,
			updatedAt: cellPopulation.updatedAt,
			userName: user.name,
			userImageUrl: user.imageUrl
		})
		.from(cellPopulation)
		.leftJoin(user, eq(cellPopulation.userId, user.id))
		.where(eq(cellPopulation.id, id));

	return rows[0] ?? null;
}

export async function deleteCellPopulation(id: string, userId: string) {
	return db
		.delete(cellPopulation)
		.where(and(eq(cellPopulation.id, id), eq(cellPopulation.userId, userId)));
}
