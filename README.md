# Catalyst Registration

This is a JS implementation of the Catalyst registration logic as defined in [CIP15](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0015).

This package requires you to inject [cardano-serialization-lib](https://github.com/Emurgo/cardano-serialization-lib/) for the cryptography.

## Install

```sh
npm i @dcSpark/catalyst-registration-js --save
```

## Usage

### Create encrypted key

```ts
import * as cip15 from "@dcSpark/catalyst-registration-js";
import CSL from "@emurgo/cardano-serialization-lib-nodejs";

// either get a user-selected PIN code or random one
const pin = cip15.generatePin(); // ex: [1,1,1,1]

// encryption key from the pin
const passBuff = Buffer.from(pin);

// generate a key for Catalyst
const catalystKey = cip15.generatePrivateKeyForCatalyst(CSL);

// encrypt the key with the pin
const encryptedKey = await cip15.encryptWithPassword(passBuff, catalystKey.as_bytes());
```

### Create registration metadata (software wallet)

```ts
import * as cip15 from "@dcSpark/catalyst-registration-js";
import CSL from "@emurgo/cardano-serialization-lib-nodejs";

const catalystKey = ... // CSL.PrivateKey
const stakePrivateKey = ... // CSL.PrivateKey
const rewardAddresss = ... // CSL.RewardAddress
const slotNumber = ... // number

const metadata = cip15.generateRegistrationMetadata(
    CSL,
    Buffer.from(catalystKey.to_public().as_bytes()).toString(
      "hex"
    ),
    Buffer.from(stakePrivateKey.to_public().as_bytes()).toString("hex"),
    Buffer.from(rewardAddresss.to_address().to_bytes()),
    slotNumber,
    (hashedMetadata) => stakePrivateKey.sign(hashedMetadata).to_hex()
  );
```

### Create registration metadata (hardware wallet)

```ts
import * as cip15 from "@dcSpark/catalyst-registration-js";
import CSL from "@emurgo/cardano-serialization-lib-nodejs";

const catalystKey = ... // CSL.PrivateKey
const stakePrivateKey = ... // CSL.PrivateKey
const rewardAddresss = ... // CSL.RewardAddress
const slotNumber = ... // number

const metadata = cip15.generateRegistrationMetadata(
    CSL,
    Buffer.from(catalystKey.to_public().as_bytes()).toString(
      "hex"
    ),
    Buffer.from(stakePrivateKey.to_public().as_bytes()).toString("hex"),
    Buffer.from(rewardAddresss.to_address().to_bytes()),
    slotNumber,
    (_hashedMetadata) => {
      // for hardware wallets, we have to include dummy data
      // since the signature will be replaced later by the hardware wallet itself
      return '0'.repeat(64 * 2);
    }
  );
 
// you will have to call the above-function twice. Once with mock data (as shown) and once with data you get from the hw wallet
```
