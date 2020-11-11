import Fuse from 'fuse.js';

export default fuseSearch(); 

function fuseSearch(event, list, options) {
    let fuse = new Fuse(list, options);
    return fuse.search(event);
}