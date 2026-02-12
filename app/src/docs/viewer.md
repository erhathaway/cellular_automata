# Viewer

The viewer is how the automata is ***displayed***. The same population and rule can look completely different depending on which viewer you use. Each viewer is a Three.js scene that renders generations of cells as 2D or 3D geometry.

The viewer you get depends on the ***dimension*** of the automata and the ***display mode*** you choose.

| Automata | Display | Viewer |
|----------|---------|--------|
| 1D | 2D | 1D-in-2D |
| 2D | 2D | 2D-in-2D |
| 2D | 3D | 2D-in-3D |
| 3D | 3D | 3D-in-3D |


*** Lets break each one down... ***


## 1D-in-2D

A one-dimensional automata has cells along a single line. But a single line isn't much to look at — so this viewer uses the second dimension to show ***time***.

Each horizontal row is one generation. New generations appear at the bottom and scroll upward, building a cascade of patterns as the automata evolves. The vertical axis *is* the history.

```
How it works:
```
```
  ↑ older generations scroll up
  |
  |  ◉ ◯ ◉ ◉ ◯ ◯ ◉    ← generation 3
  |  ◯ ◉ ◉ ◯ ◯ ◉ ◯    ← generation 4
  |  ◉ ◉ ◯ ◯ ◉ ◯ ◉    ← generation 5
  |  ◉ ◯ ◯ ◉ ◯ ◉ ◉    ← generation 6  (newest)
```

This is the classic way to visualize Wolfram rules. Famous patterns like Rule 110's complexity or Rule 30's chaos emerge as these cascading triangles and stripes.

- Alive cells are drawn as ***points***
- Dead cells are empty space
- Generations scroll off the top when they leave the visible area
- The number of visible generations depends on the window height


## 2D-in-2D

A two-dimensional automata viewed from directly above — a flat, top-down view. This is the way most people picture Conway's Game of Life.

The camera looks straight down at the grid. Only the ***current generation*** is shown in full color, but a ***trail*** of recent generations fades behind it so you can see where activity has been.

```
Trail behavior:
```
- The ***newest*** generation is drawn in solid black
- ***Older*** generations shift to a complementary color and fade lighter with age
- Up to ***40*** recent generations are kept visible at once
- The oldest trail generations are quietly removed as new ones arrive

The trail gives the flat view a sense of motion — you can watch gliders streak across the grid and oscillators pulse in place, even though you're only looking at a 2D plane.

Cells are rendered as ***instanced geometry*** matched to the lattice:

| Lattice | Cell Shape |
|---------|-----------|
| Square | Square |
| Hexagonal | Hexagon |
| Triangular | Triangle |
| Truncated Square | Octagon + Square |

The camera is ***orthographic*** (no perspective distortion), so every cell appears the same size regardless of position. There are no orbit controls — the view is fixed top-down.


## 2D-in-3D

The same 2D automata, but now generations are ***stacked vertically*** in 3D space. Each generation becomes a flat layer, and new layers are placed on top of the previous ones — building a sculpture of the automata's history over time.

```
How it works:
```
```
       ┌─────────┐  ← newest generation (solid, on top)
      ┌─────────┐
     ┌─────────┐     ← trail fades as you look down
    ┌─────────┐
   ┌─────────┐
  ┌─────────┐       ← oldest visible generation (faint)
```

- The ***newest*** generation sits on top, drawn solid black
- ***Older*** layers fade in both color and opacity — the oldest are nearly transparent
- Up to ***60*** generations are stacked at once
- The scene shifts downward as each new generation is added, keeping the latest layer at the top

This viewer turns time into a physical axis. A still life becomes a solid column. A blinker becomes a striped tower. A glider traces a diagonal path through the stack.

Cells are rendered as ***3D geometry*** — boxes, hex prisms, triangular prisms, or octagonal prisms depending on the lattice. The scene is lit with ambient and directional lighting for depth.

The camera is ***orthographic*** with ***orbit controls*** — click and drag to rotate the view, scroll to zoom. The default angle is isometric, looking down at the stack from an elevated diagonal.


## 3D-in-3D

A three-dimensional automata rendered directly in 3D space. No trail, no history stacking — just the ***current generation*** displayed as a volume of cells floating in space.

```
How it works:
```
```
  Each living cell is a shape
  positioned at its (x, y, z)
  coordinate in the grid.

  Dead cells are empty space.
```

Because 3D populations can be very dense, cells are colored by ***position*** rather than by state to give a sense of depth and orientation:

- ***Hue*** shifts across the X axis (0° to 300°)
- ***Saturation*** shifts across the Y axis (60% to 100%)
- ***Lightness*** shifts across the Z axis (35% to 75%)

This makes it easy to see structure — you can tell which part of the volume you're looking at by the color.

| Lattice | Cell Shape |
|---------|-----------|
| Cubic | Box |
| FCC | Sphere |
| Hex Prism | Hexagonal prism |

The camera is ***orthographic*** with ***orbit controls*** — rotate, pan, and zoom to inspect the volume from any angle. Only one generation is shown at a time; each step replaces the previous entirely.

> 3D populations default to a smaller grid (40x40x40) compared to 2D (200x100) because the cell count grows cubically. The seed density is also lowered to keep the initial state sparse enough to see structure.


## Interaction

All viewers share some common controls:

- ***Click*** the canvas to toggle play/pause
- ***Scrub*** the generation slider to seek through history — the viewer will rebuild the trail at the target position
- ***Reset*** tears down the scene and reinitializes with a fresh seed


## Summary

| Viewer | Dimensions shown | Time axis | Trail | Camera | Controls |
|--------|-----------------|-----------|-------|--------|----------|
| 1D-in-2D | 1 spatial + time | Vertical (scroll up) | All visible rows | Perspective | None |
| 2D-in-2D | 2 spatial | Faded overlay | 40 generations | Orthographic | None |
| 2D-in-3D | 2 spatial + time | Vertical (stacked) | 60 generations | Orthographic | Orbit |
| 3D-in-3D | 3 spatial | None | 1 generation | Orthographic | Orbit |

The viewer transforms raw cell data into something you can watch, rotate, and explore. The same rule can tell very different stories depending on how you choose to see it.
