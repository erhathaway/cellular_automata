import {
  types,
  onSnapshot,
  onPatch,
  applySnapshot,
  getSnapshot,
  getEnv,
  resolvePath,
} from 'mobx-state-tree';

const IndexedHistory = types
  .model('IndexedHistory', {
    history: types.frozen(),
    targetPath: '',
  })
  .views(() => ({
    indexName() {
      const msg = `
        Failed to fetch index name for current snapshot in IndexedHistory
        self.indexName not specified
        Use type composition of this model to specify the indexName view
        reference: https://github.com/mobxjs/mobx-state-tree#simulate-inheritance-by-using-type-composition
      `;
      throw new Error(msg);
    },
  }))
  .actions((self) => {
    let snapshotDisposer;
    let targetStore;

    return ({
      addIndexedHistory(index, history) {
        console.log('adding indexed history')
        self.history = { ...self.history, [index]: history };
        console.log(self.history)
      },
      afterCreate() {
        targetStore = self.targetPath
          ? resolvePath(self, self.targetPath)
          : getEnv(self).targetStore;

        if (!targetStore) {
          const msg = `Failed to find target store for IndexedHistory.
            Please provide 'targetPath'  property, or a 'targetStore' in the environment`;
          throw new Error(msg);
        }

        snapshotDisposer = onSnapshot(targetStore, snapshot => {
          try {
            self.addIndexedHistory(self.indexName(), snapshot)
          } catch (e) {
            console.error(e)
          }}
        );
        console.log('hererere ')
        // record an initial state if no known
        if (!self.history || Object.keys(self.history).length === 0) self.addIndexedHistory(self.indexName(), getSnapshot(targetStore))
        console.log('hererere ')

      },
      beforeDestroy() {
        console.log('destroying')
        snapshotDisposer()
      },
      useHistoryAtIndex(index) {
        const value = self.history[index];
        if (value) applySnapshot(targetStore, value);
      },
    })
  });

export default IndexedHistory
