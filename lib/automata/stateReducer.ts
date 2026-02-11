export interface OneDimensionResult {
  ruleKey: number;
}

export interface LifeLikeResult {
  neighborStatesCount: Record<number, number>;
  cellState: number;
}

export const oneDimension = ({
  neighbors,
  cell,
}: {
  neighbors: number[];
  cell: number;
}): OneDimensionResult => {
  const left = neighbors[0] << 2;
  const self = cell << 1;
  const right = neighbors[1];
  const ruleKey = left | self | right;
  return { ruleKey };
};

export const lifeLike = ({
  neighbors,
  cell,
}: {
  neighbors: number[];
  cell: number;
}): LifeLikeResult => {
  const neighborStatesCount = neighbors.reduce(
    (acc: Record<number, number>, state: number) => {
      const existingCount = acc[state] || 0;
      acc[state] = existingCount + 1;
      return acc;
    },
    {} as Record<number, number>
  );
  return { neighborStatesCount, cellState: cell };
};
