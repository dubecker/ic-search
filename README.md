# ic-search

This tool allows to search all the candids of the canisters hosted on the Internet Computer.

Status:

- Fetch list of all canisters hosted on IC and output to json
- Fetch candid of all canisters

This currently only works for Motoko canisters as Rust canister don't have their did public by default. They can return did with function ```__get_candid_interface_tmp_hack``` by adding code like [here](https://github.com/dfinity/internet-identity/blob/d0babbab9e14b23bd7d626c01db04e0dfd45424e/src/internet_identity/src/main.rs#L608-L614).

## How it works

aaa

## Building

```js
npm run build
```
