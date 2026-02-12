# Neighbors & Lattices

A cell's ***neighbors*** are the cells surrounding it. But *which* cells count as neighbors depends on two things: the ***lattice*** (the geometric tiling that cells live on) and the ***radius*** (how far away a neighbor can be).

*** Lets break this down... ***


## Lattice

A lattice is the repeating geometric pattern that arranges cells in space. Different lattices produce different neighborhoods because the shapes tile together differently.

Think of it this way — if you change the shape of the tiles, you change which tiles touch, and *that* changes who your neighbors are.


## 2D Lattices

### Square

The most common lattice. Cells are squares on a grid. Each cell has ***8*** neighbors at radius 1 — this is called the ***Moore neighborhood***.

```
r=1 neighbors: 8
```

| ◍ | ◍ | ◍ |
|---|---|---|
| ◍ | ◯ | ◍ |
| ◍ | ◍ | ◍ |

All 8 surrounding cells count — horizontals, verticals, *and* diagonals. This is the neighborhood used by Conway's Game of Life.

> You might also hear about the ***Von Neumann neighborhood***, which only counts the 4 orthogonal (non-diagonal) neighbors. This app uses the Moore neighborhood for square lattices.


### Hexagonal

Cells are hexagons packed together. Because hexagons have 6 sides, each cell naturally has ***6*** neighbors at radius 1.

```
r=1 neighbors: 6
```

|   | ◍ | ◍ |   |
|---|---|---|---|
| ◍ | ◯ | ◍ |   |
|   | ◍ | ◍ |   |

Unlike a square grid where diagonal neighbors feel "farther away," every hex neighbor shares a full edge with the center cell. This makes the hexagonal lattice feel more uniform — all 6 neighbors are equidistant.


### Triangular

Cells are triangles that alternate pointing up and down. This is a ***multi-shape*** lattice — there are two distinct tile types that each have their own neighborhood.

```
r=1 neighbors: 6 (both shapes)
```

Both up-triangles and down-triangles have ***6*** neighbors, but *which* cells those are differs based on orientation.

An up-triangle's neighbors:

|   | ◍ |   | ◍ |   |
|---|---|---|---|---|
| ◍ | ◍ | ◯ | ◍ | ◍ |

A down-triangle's neighbors:

| ◍ | ◍ | ◯ | ◍ | ◍ |
|---|---|---|---|---|
|   | ◍ |   | ◍ |   |

The triangles share edges, and the up/down orientation alternates in a checkerboard pattern across the grid. Even though both shapes have the same neighbor count, their spatial relationships are mirror images of each other.


### Truncated Square

This is the most complex 2D lattice. It tiles the plane with ***octagons*** and ***squares*** — another ***multi-shape*** lattice. The two shapes have *different* neighbor counts.

```
r=1 neighbors:
  Octagon → 8
  Square  → 4
```

An octagon's neighborhood (8 neighbors — 4 squares + 4 octagons):

| ◍ | ◍ | ◍ |
|---|---|---|
| ◍ | ◯ | ◍ |
| ◍ | ◍ | ◍ |

A square's neighborhood (4 neighbors — all octagons):

|   | ◍ |   |
|---|---|---|
| ◍ | ◯ | ◍ |
|   | ◍ |   |

Because the two shapes have different neighbor counts, they can each have their own ***rule***. An octagon might survive with 2 or 3 neighbors, while a square might only need 1 or 2. This asymmetry creates unique dynamics that single-shape lattices can't produce.


## 3D Lattices

In three dimensions, cells are stacked in space. The neighbor counts get much larger because there are more directions to reach from.

### Cubic

The 3D equivalent of the square lattice. Cells are cubes packed in a grid. Each cell has ***26*** neighbors at radius 1 — that's every cube touching it by face, edge, or corner.

```
r=1 neighbors: 26
```

Think of it as the Moore neighborhood extended into 3D: a 3x3x3 cube around the center, minus the center cell itself (27 - 1 = 26).


### FCC (Face-Centered Cubic)

A lattice inspired by crystallography — it's how atoms are arranged in metals like gold, silver, and aluminum. Each cell has ***12*** neighbors at radius 1.

```
r=1 neighbors: 12
```

The 12 neighbors sit at the face-diagonal positions — each one is reachable by moving along two axes at once (but not along a single axis or all three). This creates a denser, more symmetric packing than the cubic lattice.


### Hexagonal Prism

Layers of hexagonal grids stacked on top of each other. Each cell has ***20*** neighbors at radius 1: 6 in the same layer plus 7 above and 7 below.

```
r=1 neighbors: 20
  Same layer → 6
  Layer above → 7
  Layer below → 7
```

The in-plane neighbors are the same as a 2D hex grid. Above and below, a cell touches the cell directly on top/bottom *plus* the 6 hex neighbors in those layers — giving 7 per layer.


## Radius

So far, all examples have used ***radius 1*** (r=1) — only *immediate* neighbors. But the radius can be increased to include cells farther away.

As the radius grows, the neighborhood expands outward by following the lattice's natural connectivity. A cell at r=2 isn't just "two grid spaces away" — it's any cell reachable by taking two neighbor-steps along the lattice.

```
Square lattice:
```

| r=1 | r=2 |
|-----|-----|
| 8 neighbors | 24 neighbors |

```
Hexagonal lattice:
```

| r=1 | r=2 |
|-----|-----|
| 6 neighbors | 18 neighbors |

Higher radii mean each cell looks at more of the population when deciding its next state. This can dramatically change the behavior of the automata — patterns that are stable at r=1 might become chaotic at r=2, and vice versa.


## Summary

| Lattice | Dimension | Shapes | r=1 Neighbors |
|---------|-----------|--------|---------------|
| Square | 2D | 1 | 8 |
| Hexagonal | 2D | 1 | 6 |
| Triangular | 2D | 2 (up, down) | 6 each |
| Truncated Square | 2D | 2 (octagon, square) | 8 / 4 |
| Cubic | 3D | 1 | 26 |
| FCC | 3D | 1 | 12 |
| Hex Prism | 3D | 1 | 20 |

The lattice you choose shapes the entire character of your automata. More neighbors generally means more possible rules, and multi-shape lattices add another layer of complexity by allowing different rules for different tile types.
