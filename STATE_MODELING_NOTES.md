Dimension
Viewer (dependent on Dimension)
State
Neighbors
Population (dependent on Dimension)
Rule (dependent on Neighbors)
Genesis (dependent on Dimension & State)

ex:
Viewer (dependent on Dimension)
  { value:
    history: {
      [dimension]: value,
    }
    ifNotifiedOfDependencyChanged:
      - fetch validated value from history
      - getClosestDefault based on current parameter
    validate:
    getClosestDefault:
    notifyDependentObservers:
  }
