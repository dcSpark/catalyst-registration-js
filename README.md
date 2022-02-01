# Catalyst Registration

This is a JS implementation of the Catalyst registration logic as defined in [CIP15](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0015).

This package requires you to inject [cardano-serialization-lib](https://github.com/Emurgo/cardano-serialization-lib/) for the cryptography.

## Install

```sh
npm i @dcSpark/catalyst-registration-js --save
```

## Usage

```ts
import * as keyGen from "@dcSpark/catalyst-registration-js/keyGen";
import CSL from "@emurgo/cardano-serialization-lib-nodejs";

// either get a user-selected PIN code or random one
const pin = keyGen.generatePin(); // ex: [1,1,1,1]

// encryption key from the pin
const passBuff = Buffer.from(pin);

// generate a key for Catalyst
const rootKey = keyGen.generatePrivateKeyForCatalyst(CSL);

// encrypt the key with the pin
const encryptedKey = await encryptWithPassword(passBuff, rootKey.as_bytes());
```
