import {
  types,
  onSnapshot,
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

    return ({
      afterCreate() {
        const targetStore = self.targetPath
          ? resolvePath(self, self.targetPath)
          : getEnv(self).targetStore;

        if (!targetStore) {
          const msg = `Failed to find target store for IndexedHistory.
            Please provide 'targetPath'  property, or a 'targetStore' in the environment`;
          throw new Error(msg);
        }

        snapshotDisposer = onSnapshot(targetStore, snapshot =>
          self.addIndexedHistory(self.indexName(), snapshot)
        );

        // record an initial state if no known
        if (!self.history || Object.keys(self.history).length === 0) self.addIndexedHistory(self.indexName(), getSnapshot(targetStore))
      },
      addIndexedHistory(index, history) {
        // console.log('adding indexed history', history)
        self.history = { ...self.history, [index]: history };
      },
      beforeDestroy() {
        snapshotDisposer()
      },
      useHistoryAtIndex(index) {
        const targetStore = self.targetPath
          ? resolvePath(self, self.targetPath)
          : getEnv(self).targetStore;

        const value = self.history[index];
        if (value) applySnapshot(targetStore, value);
        return value
      },
      applyHistoryMatchingCurrentIndex() {
        const targetStore = self.targetPath
          ? resolvePath(self, self.targetPath)
          : getEnv(self).targetStore;

        const currentIndex = self.indexName();
        const value = self.history[currentIndex];
        if (value) applySnapshot(targetStore, value);
        return value
      },
      takeSnapshot() {
        const targetStore = self.targetPath
          ? resolvePath(self, self.targetPath)
          : getEnv(self).targetStore;

        self.addIndexedHistory(self.indexName(), getSnapshot(targetStore));
      },
    })
  });

export default IndexedHistory
