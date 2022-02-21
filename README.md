# ic-search

This tool allows to search all the candids of the canisters hosted on the Internet Computer.

Status:

- Fetch list of all canisters hosted on IC and output to json \[done\]
- Fetch candid of all canisters \[done\]
- Search candid for methods

This currently only works for Motoko canisters as Rust canister don't have their did public by default. They can return did with function ```__get_candid_interface_tmp_hack``` by adding code like [here](https://github.com/dfinity/internet-identity/blob/d0babbab9e14b23bd7d626c01db04e0dfd45424e/src/internet_identity/src/main.rs#L608-L614).

## How to install

Install NodeJS and npm package manager

```bash
sudo apt install nodejs
sudo apt install npm
```

Change directory into ic-search and install the required packages

```bash
npm run install 
```

Now you're ready to go.

## Running

Run the command below to execute the script. In the default mode, it looks through all the subnets and fetches each canister information. Afterwards, it iterates through all the canisters and fetches the candid.

```js
npm run start
```

## How it works

### Fetching canister information

The code fetches the information about the subnets from the registry canister on the NNS subnet. This contains some information about each subnet and includes the range of canister IDs assigned to this subnet. The code then starts at the first canister ID and tries to fetch basic metadata, including module_hash and controller. The code continues until there are no more module_hash or controllers assigned to canisters, which means that these canisters have not yet been used by the subnet.

The information about each subnet is stored in a .json file inside the export folder. A new folder is generated for each time the crawler runs, specified with the current date. When running there is no data about the network avaialable (e.g. the script runs for the first time), it needs to fetch the entire information from the network. This takes a few hours. Upon repeated iterations, the script initializes itself from the previous data.

### Fetching canister Candids

For all defined canisters, the script looks for the respective candid. Unfortunately, the candid can only be publicly fetched for Motoko canisters. The candid for each canister is stored in a text file in the folder ```/did/\[subnet id\]/\[canister id\].txt

### Searching canister candids

ToDo
