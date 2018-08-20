import introductionDoc from '../docs/what-is-a-automata.md';
import dimensionDoc from '../docs/dimension.md';
import generationsDoc from '../docs/generations.md';
import stateDoc from '../docs/state.md';
import viewerDoc from '../docs/viewer.md';
import neighborsDoc from '../docs/neighbors.md';

const PAGES = [
  {
    id: '1', pageDisplayName: 'Introduction', pageRouterName: 'introduction', pagePath: introductionDoc,
  },
  {
    id: '2', pageDisplayName: 'Dimensions', pageRouterName: 'dimension', pagePath: dimensionDoc,
  },
  {
    id: '3', pageDisplayName: 'Generations', pageRouterName: 'generations', pagePath: generationsDoc,
  },
  {
    id: '4', pageDisplayName: 'Viewer', pageRouterName: 'viewer', pagePath: viewerDoc,
  },
  {
    id: '5', pageDisplayName: 'Neighbors', pageRouterName: 'neighbors', pagePath: neighborsDoc,
  },
  {
    id: '6', pageDisplayName: 'State', pageRouterName: 'state', pagePath: stateDoc,
  },
];

export default PAGES
