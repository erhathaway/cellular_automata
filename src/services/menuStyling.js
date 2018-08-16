
// is initialized with a sytled object
// {
//    key 'dockingState-placement': styled / emotion CSS object
// }
export default styledObject => ({ placement, dockingState }) => {
  const foundCombination = styledObject[`${dockingState}-${placement}`];
  if (foundCombination) return foundCombination;

  const foundDockingState = styledObject[dockingState];
  if (foundDockingState) return foundDockingState;

  const foundPlacement = styledObject[placement];
  return foundPlacement;
};
