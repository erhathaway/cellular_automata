# What is a cellular automata?

It's a group of ***cells*** that ***evolve*** from one generation to the next by way of a ***rule***. The rule *can* use a cell's current state and the state of certain neighbors to figure out the next generation.


*** Lets break this down... ***  



## Cells

Cells exist in a geometric pattern, usually a grid. Here is 1 cell in a 5x3 grid

|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   |   |
|   |   | ◯ |   |   |
|   |   |   |   |   |

## Cells & Neighbors

Cells have ***neighboring*** cells.
For example, the center cell has 3 neighbors.

|   |   |   |   |   |
|---|---|---|---|---|
| ◯ |   |   |   | ◍ |
|   | ◉ | ◯ |   |   |
|   |   |   |   |   |

Furthermore, since all but 1 neighbor is more than 1 spaces away, we would say the center cell ony has 1 immediate neighbor.

Here is the same center cell with only its immediate neighbor shown:

|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   |   |
|   | ◉ | ◯ |   |   |
|   |   |   |   |   |

As another example, here is a center cell with 3 immediate neighbors:

|   |   |   |   |   |
|---|---|---|---|---|
|   |   | ◍ |   |   |
|   | ◉ | ◯ |   |   |
|   |   | ◍ |   |   |

## Cells & State

Cells have a ***state***. Usually, states are defined by numbers, such as 0, 1, 2...

Lets say that cells match to a state in the following way:

◯ --> 0

◉ --> 1

Based on the above mapping, we could say the following middle cell has the *0* state, and the cell to its left has the *1* state, etc...

```
Cell representation:
```

|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   | ◍ |
|   | ◉ | ◯ |   |   |
|   | ◯ |   |   |   |

```
State representation:
```

|   |   |   |   |   |
|---|---|---|---|---|
|   |   |   |   | 1 |
|   | 1 | 0 |   |   |
|   | 0 |   |   |   |


As another example, a middle cell with the *0* state, and all neighbors in the *1* state, would look like:

```
Cell representation:
```

|   |   |   |   |   |
|---|---|---|---|---|
| ◉ |   |   |   |   |
|   | ◉ | ◯ | ◉ |   |
|   |   |   |   | ◉ |

```
State representation:
```
|   |   |   |   |   |
|---|---|---|---|---|
| 1  |  |   |   |   |
|   | 1 | 0 | 1 |   |
|   |   |   |   | 1 |

In the above example, it's important to note that the middle cell only has ***two immediate*** neighbors with the *1* state.

## Cells & Rules

A rule describes how each cell changes (or *evolves*) over time. Usually the same rule is applied to each cell.

Lets start with a simple rule...


```
Example Rule 1:
```
>>The next generation of a cell will be 0 if less than 50% of its *immediate neighbors* are 0, but will be 1 if 50% or more of its *immediate neighbors* are 1.

Given this generation:
```
Generation 1:
```
|   |   |   |
|---|---|---|
| 0 | 1 | 0 |
| 1 | 1 | 0 |
| 1 | 1 | 0 |

```
Notes:
```
```
Assume cells on the edge of the grid DO NOT wrap around. AKA, they will always have less neighbors.

Dont count diagonal cells as immediate neighbors
```
Lets figure out the next generation using the above rule
 - Top leff cell (0 - state)
    - all of its immediate neighbors are 1, so it will *evolve* into a 1 in the next generation.
-  Top middle cell (1 -state)
    - two of its immediate neighbors are 0 but only one is 1, so it will *evolve* into a 0 in the next generation.
- ...continue for all remaining cells in the population


Thus, applying the rule to *Generation 1* gives us the next generation, *Generation 2*:

```
Generation 2:
```
|   |   |   |
|---|---|---|
| 1 | 0 | 1 |
| 1 | 1 | 0 |
| 1 | 1 | 1 |

If we evolve the population again using the same rule, we get the next generation, *Generation 3*:

```
Generation 3:
```
|   |   |   |
|---|---|---|
| 1 | 1 | 1 |
| 1 | 1 | 1 |
| 1 | 1 | 1 |


From the way *Generation 3* looks, we can say our population of cells evolves to a steady state of all *1s* after two generations

## Conclusion


By now you should understand that a cellular automata is a ***population of cells*** that ***evolve*** together, from one ***generation*** to the next, based on some rule that looks at the ***state*** of the ***neighboring*** cells!

The following topics investigate neighborhoods, cell states, common rules in more detail.
