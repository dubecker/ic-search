# ic-search

This tool allows to search all the candids of the canisters hosted on the Internet Computer.

Status:

- Fetch list of all canisters hosted on IC and output to json \[done\]
- Fetch candid of all canisters \[done\]
- Search candid for methods

This currently only works for Motoko canisters as Rust canister don't have their did public by default. They can return did with function ```__get_candid_interface_tmp_hack``` by adding code like [here](https://github.com/dfinity/internet-identity/blob/d0babbab9e14b23bd7d626c01db04e0dfd45424e/src/internet_identity/src/main.rs#L608-L614).

## How to install

Make sure you have NodeJS installed.

## Running

Run the command below to execute the script. In the default mode, it looks through all the subnets and fetches each canister information. Afterwards, it iterates through all the canisters and fetches the candid.

```js
npm run start
```

## How it works
