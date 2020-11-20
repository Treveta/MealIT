/* eslint-disable require-jsdoc */
import Fuse from 'fuse.js';

export default fuseSearch();

function fuseSearch(event, list, options) {
  const fuse = new Fuse(list, options);
  return fuse.search(event);
}
