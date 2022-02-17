global.fetch = require('node-fetch'); // place this in the very top, otherwise an error may occur. Not sure why..
import { Principal } from '@dfinity/principal';

import Canister from './canister';
import Crawler from './crawler';

const test = async () => {
    let cid = 'agetr-5iaaa-aaaal-aacsa-cai';
    let c = new Canister(Principal.fromText(cid));
    await c.fetchCandid();
    console.log(c._did);
};

const main = async () => {
    let c = new Crawler();

    c.initializeExport();
    // await c.crawlNetwork();
    await c.crawlCandid();
    c.printCandid();
    // console.log(c._subnets[1]._canisters[7].exportCandid());
};

main();
// test();
