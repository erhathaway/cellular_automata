# Generations

A cellular automata evolves in discrete steps called ***generations***. Each generation is a snapshot of every cell's state at one moment in time. The automata advances by applying a ***rule*** to the entire population at once, producing the next generation.


*** Lets break this down... ***


## The Seed

Generation 0 is called the ***seed*** — the initial state of the population before any rules have been applied. This is your starting point.

By default, the seed is generated randomly. Each cell has a chance of being alive or dead, determined by a ***density*** value. A density of 0.5 means roughly half the cells start alive.

```
A random 5x5 seed (density ≈ 0.5):
```

|   |   |   |   |   |
|---|---|---|---|---|
| ◉ | ◯ | ◯ | ◉ | ◯ |
| ◯ | ◉ | ◉ | ◯ | ◉ |
| ◉ | ◯ | ◉ | ◯ | ◯ |
| ◯ | ◯ | ◉ | ◉ | ◯ |
| ◉ | ◉ | ◯ | ◯ | ◉ |

The seed matters. Two runs with the same rule but different seeds can produce wildly different behavior. Some seeds die out immediately, others grow without bound, and others settle into intricate repeating patterns.


## Evolving

To advance from one generation to the next, the rule is applied to ***every cell simultaneously***. This is important — all cells read from the current generation, and all results are written to the next generation at once. No cell "sees" changes that other cells made in the same step.

Here's how it works for a single cell:

1. Look at the cell's current state (alive or dead)
2. Count how many of its neighbors are alive
3. Apply the rule to decide the cell's next state

Then repeat for every cell in the population.

```
Example using Conway's Game of Life rule:
  Born if exactly 3 neighbors alive
  Survive if 2 or 3 neighbors alive
  Die otherwise
```

Given this 3x3 population:

```
Generation 0:
```

|   |   |   |
|---|---|---|
| ◯ | ◉ | ◯ |
| ◯ | ◉ | ◯ |
| ◯ | ◉ | ◯ |

Lets figure out the next state for each cell:
- Top-left cell (◯, dead): has 2 alive neighbors → not exactly 3, stays ***dead***
- Top-middle cell (◉, alive): has 1 alive neighbor → not 2 or 3, ***dies***
- Middle-center cell (◉, alive): has 2 alive neighbors → survives, stays ***alive***
- Middle-left cell (◯, dead): has 3 alive neighbors → exactly 3, ***born***
- ...continue for all cells

```
Generation 1:
```

|   |   |   |
|---|---|---|
| ◯ | ◯ | ◯ |
| ◉ | ◉ | ◉ |
| ◯ | ◯ | ◯ |

The vertical line has become a horizontal line. If we evolve again, it flips back — this is a classic pattern called the ***blinker***, and it oscillates forever between these two states.


## Wrapping

What happens at the edges? When a cell on the left border looks for its left neighbor, it wraps around to the right side of the grid. The same goes for top/bottom and, in 3D, front/back.

This is called a ***toroidal*** topology — imagine the grid rolled into a donut shape where every edge connects to its opposite.

```
Wrapping example (5x1):
```

| ◯ | ◉ | ◯ | ◯ | ◉ |
|---|---|---|---|---|

The leftmost cell (◯) has the cell to its right (◉) as one neighbor, and — because of wrapping — the rightmost cell (◉) as its other neighbor. No cell is ever missing neighbors due to being on an edge.

This means there are no true boundaries. Every cell has the full set of neighbors defined by its lattice, regardless of its position.


## Rules

How the next generation is computed depends on the rule system being used.

### 1D — Wolfram Rules

In one dimension, rules are encoded as a single number from ***0 to 255*** (called a ***Wolfram rule number***). Each cell looks at itself and its two immediate neighbors — three cells total, each either 0 or 1. That's 8 possible combinations (2^3), and the rule number's binary representation defines what each combination produces.

```
Rule 110 (binary: 01101110):
```

| Pattern | ◉◉◉ | ◉◉◯ | ◉◯◉ | ◉◯◯ | ◯◉◉ | ◯◉◯ | ◯◯◉ | ◯◯◯ |
|---------|------|------|------|------|------|------|------|------|
| Result  |  ◯   |  ◉   |  ◉   |  ◯   |  ◉   |  ◉   |  ◉   |  ◯   |

Each row in a 1D automata is one generation. The next row is computed from the current one, producing a cascade of patterns over time.


### 2D & 3D — Life-Like Rules

For two and three dimensions, rules use a ***born/survive*** format. Two lists of numbers define the behavior:

- ***Born***: a dead cell becomes alive if its alive-neighbor count is in this list
- ***Survive***: an alive cell stays alive if its alive-neighbor count is in this list

If neither condition is met, the cell dies (or stays dead).

```
Conway's Game of Life:
  Born:    [3]
  Survive: [2, 3]
```

Different lattices have different default rules because they have different neighbor counts. A rule tuned for 8 neighbors (square grid) won't behave the same on 6 neighbors (hex grid).

| Lattice | Neighbors | Default Rule |
|---------|-----------|-------------|
| Square | 8 | B3 / S2,3 |
| Hexagonal | 6 | B2 / S3,4 |
| Triangular | 6 | B2 / S2,3 |
| Cubic | 26 | B5 / S4,5 |
| FCC | 12 | B4 / S3,4 |
| Hex Prism | 20 | B5 / S5,6,7 |

> The shorthand ***B3/S2,3*** means "born with 3 neighbors, survive with 2 or 3." This notation is common in the cellular automata community.


## Stability

As generations advance, some automata settle into predictable patterns. There are two kinds of stability:

***Exact stability*** — the population repeats a previous generation exactly. The number of generations between repeats is called the ***period***. A still life has period 1 (nothing changes). A blinker has period 2 (alternates between two states).

***Quasi stability*** — the population count (number of alive cells) oscillates within a narrow band without ever exactly repeating. The automata is "alive" but settled.

When stability is detected, the automata can pause automatically — it has found its resting state.


## Summary

The generation lifecycle is straightforward:

1. ***Seed*** — generate or load the initial population (generation 0)
2. ***Evolve*** — apply the rule to every cell simultaneously to produce the next generation
3. ***Repeat*** — keep evolving, one generation at a time
4. ***Settle*** — eventually the automata may reach stability, or it may run forever

Every generation depends only on the one before it. The same seed with the same rule on the same lattice will always produce the same sequence of generations — cellular automata are fully deterministic.
