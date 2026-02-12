# State

Every cell in the automata has a ***state*** — a value that describes what the cell "is" at any given moment. The rule reads each cell's state (and its neighbors' states) to decide what comes next.


## Binary States

This automata engine uses ***two states***:

| State | Meaning | Symbol |
|-------|---------|--------|
| 0 | Dead | ◯ |
| 1 | Alive | ◉ |

That's it. Every cell is either alive or dead. Despite this simplicity, two states are enough to produce an enormous range of behavior — from static crystals to chaotic turbulence to self-replicating structures.

Here is a small population with each cell's state labeled:

```
Cell view:
```

|   |   |   |   |
|---|---|---|---|
| ◉ | ◯ | ◯ | ◉ |
| ◯ | ◉ | ◉ | ◯ |
| ◉ | ◯ | ◉ | ◯ |

```
State view:
```

|   |   |   |   |
|---|---|---|---|
| 1 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |

Both views describe the same population — one uses symbols, the other uses numbers.


## How Rules Use State

When a rule runs, it looks at the states of a cell's neighbors to decide the cell's next state.

### Counting Neighbors

For 2D and 3D rules, the key question is: ***how many neighbors are alive (state 1)?***

Take the center cell below. It has 8 neighbors on a square lattice:

|   |   |   |
|---|---|---|
| ◉ | ◯ | ◉ |
| ◯ | ◯ | ◯ |
| ◉ | ◯ | ◯ |

The center cell is dead (state 0). It has 3 alive neighbors. If the rule says "born with 3 neighbors" — like Conway's Game of Life — this cell will become alive in the next generation.

### Pattern Matching

For 1D rules, state works differently. Instead of counting, the rule looks at the exact ***pattern*** of states — the cell and its two neighbors form a 3-cell sequence. Each possible pattern maps to a specific output:

| Left | Self | Right | Next State |
|------|------|-------|------------|
| 1 | 1 | 1 | ? |
| 1 | 1 | 0 | ? |
| 1 | 0 | 1 | ? |
| ... | ... | ... | ... |

There are 8 possible patterns (2^3), and the Wolfram rule number encodes the answer for each one.


## Rendering States

States are mapped to ***colors*** for display. By default:

- State 0 (dead) → ***white*** — used as the background color
- State 1 (alive) → ***black*** — used to render living cells

Dead cells aren't drawn as individual shapes — instead, the background color fills the empty space. Only alive cells are rendered as geometry (squares, hexagons, triangles, etc.) on top of that background.

> The dead cell color can be customized in the Cell States panel. Changing it shifts the background color, which can dramatically change the visual feel of the same automata. The alive cell color is always black.


## Population Count

At any generation, the ***population count*** is the total number of alive cells. This single number can reveal a lot about the automata's behavior over time:

- ***Growing*** — population count increasing each generation
- ***Dying*** — population count decreasing toward zero
- ***Oscillating*** — population count bouncing between values in a regular cycle
- ***Stable*** — population count holding steady

Tracking the population count across generations is one way the engine detects when an automata has reached ***stability*** — either settling to a fixed state or falling into a repeating loop.


## Summary

| Concept | Detail |
|---------|--------|
| States | 0 (dead) and 1 (alive) |
| Rule input | Neighbor state counts (2D/3D) or exact patterns (1D) |
| Colors | Dead = white background, Alive = black cells |
| Population count | Total alive cells — tracks growth, decay, and stability |

Simple binary states are the foundation. Every pattern, every glider, every oscillator in a cellular automata emerges from nothing more than cells switching between 0 and 1.
