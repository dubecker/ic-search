global.fetch = require('node-fetch'); // place this in the very top, otherwise an error may occur. Not sure why..
import { Principal } from '@dfinity/principal';

import Canister from './canister';
import Crawler from './crawler';

const test = async () => {};

const main = async () => {
    let c = new Crawler();

    c.initializeExport();

    // uncomment this if you only want to fetch canister list from the subnets
    // await c.crawlNetwork();

    // uncomment this if you only want to fetch candids for each canister.
    // for this, canister information needs to be saved in export path.
    // await c.crawlCandid();

    // Uncomment this if you want to run the entire script.
    // This includes fetching the subnet infos and then fetching the candid for all canisters.
    await c.run();
};

main();
