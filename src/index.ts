global.fetch = require('node-fetch'); // place this in the very top, otherwise an error may occur. Not sure why..
import { Principal } from '@dfinity/principal';

import Canister from './canister';
import Crawler from './crawler';

const test = async () => {
    let cid = '';
    let b: string;
    console.log(cid);
    console.log(b);
};

const main = async () => {
    let c = new Crawler();

    c.initializeExport();
    // await c.crawlNetwork();
    await c.crawlCandid();

    // await c.run();
};

main();
// test();
