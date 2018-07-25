function* oneDimension(currentPopulation) {
  for (let i = 0; i < currentPopulation.length; i++) {
    yield i;
  }
}

function* twoDimension(currentPopulation) {
  for (let y = 0; y < currentPopulation.length; y++) {
    const row = currentPopulation[y];
    for (let x = 0; x < row.length; x++) {
      yield { x, y };
    }
  }
}

export { oneDimension, twoDimension }
