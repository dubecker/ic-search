global.fetch = require('node-fetch'); // place this in the very top, otherwise an error may occur. Not sure why..
import { BinaryBlob, blobFromText, blobFromUint8Array } from '@dfinity/candid';
// const IC = require('./ic');
// import fetch from 'node-fetch';
// const Subnet = require('./subnet');
import Principal from '@dfinity/principal';

import Canister from './canister';
import Crawler from './crawler';
import Subnet from './subnet';
import { blobFromPrincipalString, textFromPrincipalBlob } from './utils';

// const {blobFromPrincipalString} = require('./utils');
// const {blobFromText, blobFromUint8Array} = require('@dfinity/candid');
// global.fetch = fetch;

const test = async () => {};

const main = async () => {
    let c = new Crawler();

    c.initializeExport();
    await c.run();

    // let id = blobFromPrincipalString('v2nog-2aaaa-aaaab-p777q-cai');
    // console.log(Canister.canisterIdToDecimal(id));
};

main();
