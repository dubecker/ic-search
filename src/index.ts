global.fetch = require('node-fetch'); // place this in the very top, otherwise an error may occur. Not sure why..
import Crawler from './crawler';

const test = async () => {};

const main = async () => {
    let c = new Crawler();

    c.initializeExport();
    await c.run(true);
};

main();
