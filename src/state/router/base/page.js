import { types } from 'mobx-state-tree';

const Page = types
  .model('Page', {
    id: types.string,
    name: types.string,
    routeKey: types.string,
  })

const PagesModel = types
  .model('Pages', {
    _pages: types.maybe(types.array(Page)),
    currentPage: types.maybe(Page),
  })
  .actions(self => ({
    navToNextPage() {
      self.currentPage = self.nextPage;
    },
    navToPreviousPage() {
      self.currentPage = self.previousPage;
    },
    setPags(pages) {
      self._pages = pages.map(({ id, name, routerKey }) => Page.create({ id, name, routerKey }));
    },
  }))
  .views(self => ({
    get nextPage() {
      const currentPageIndex = self._pages.findIndex(p => p.id === self.currentPage.id);
      const nextPage = self._pages[currentPageIndex + 1];
      return nextPage;
    },
    get previousPage() {
      const currentPageIndex = self._pages.findIndex(p => p.id === self.currentPage.id);
      const nextPage = self._pages[currentPageIndex - 1];
      return nextPage;
    },
  }))

export default PagesModel;
