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
    history: types.maybe(types.string),
    indexes: types.array(types.string),
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
        self.history[index] = history;
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

        snapshotDisposer = onSnapshot(targetStore, snapshot => self.addIndexedHistory(self.indexName, snapshot));

        // record an initial state if no known
        if (self.history.length === 0)  self.addIndexedHistory(self.indexName, getSnapshot(targetStore))
      },
      beforeDestroy() {
        snapshotDisposer()
      },
      useHistoryAtIndex(index) {
        const value = self.history[index];
        applySnapshot(targetStore, value);
      },
    })
  });

export default IndexedHistory
