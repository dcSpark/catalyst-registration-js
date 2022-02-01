// https://github.com/cardano-foundation/CIPs/blob/master/CIP-0015/test-vector.md

import CSL from "@emurgo/cardano-serialization-lib-nodejs";
import { CatalystLabels, generateRegistration } from "../src/registration";
import * as keyGen from "../src/keyGen";
import {
  encryptWithPassword,
  decryptWithPassword,
} from "../src/catalystCipher";

test("Generate Catalyst registration tx", () => {
  // const paymentKey = CSL.PublicKey.from_bytes(
  //   Buffer.from('3273a5316e4de228863bd7cf8dac90d57149e1a595f3dd131073b84e35546676', 'hex')
  // );
  const stakePrivateKey = CSL.PrivateKey.from_normal_bytes(
    Buffer.from(
      "f5beaeff7932a4164d270afde7716067582412e8977e67986cd9b456fc082e3a",
      "hex"
    )
  );
  const catalystPrivateKey = CSL.PrivateKey.from_extended_bytes(
    Buffer.from(
      "4820f7ce221e177c8eae2b2ee5c1f1581a0d88ca5c14329d8f2389e77a465655c27662621bfb99cb9445bf8114cc2a630afd2dd53bc88c08c5f2aed8e9c7cb89",
      "hex"
    )
  );

  // eslint-disable-next-line max-len
  // this gives stake_test1uzhr5zn6akj2affzua8ylcm8t872spuf5cf6tzjrvnmwemcehgcjm (e0ae3a0a7aeda4aea522e74e4fe36759fca80789a613a58a4364f6ecef)
  const address = CSL.RewardAddress.new(
    CSL.NetworkInfo.testnet().network_id(),
    CSL.StakeCredential.from_keyhash(stakePrivateKey.to_public().hash())
  );

  const nonce = 1234;
  const metadata = generateRegistration({
    csl: CSL,
    stakePrivateKey,
    catalystPrivateKey,
    receiverAddress: Buffer.from(address.to_address().to_bytes()),
    slotNumber: nonce,
  });
  const result = CSL.GeneralTransactionMetadata.from_bytes(
    CSL.MetadataList.from_bytes(metadata.to_bytes()).get(0).to_bytes()
  );
  const data = result.get(CSL.BigNum.from_str(CatalystLabels.DATA.toString()));
  if (data == null) throw new Error("Should never happen");
  const sig = result.get(CSL.BigNum.from_str(CatalystLabels.SIG.toString()));
  if (sig == null) throw new Error("Should never happen");
  const dataJson = CSL.decode_metadatum_to_json_str(
    data,
    CSL.MetadataJsonSchema.BasicConversions
  );
  const sigJson = CSL.decode_metadatum_to_json_str(
    sig,
    CSL.MetadataJsonSchema.BasicConversions
  );
  const expectedResult = {
    "61284": {
      "1": "0x0036ef3e1f0d3f5989e2d155ea54bdb2a72c4c456ccb959af4c94868f473f5a0",
      "2": "0x86870efc99c453a873a16492ce87738ec79a0ebd064379a62e2c9cf4e119219e",
      "3": "0xe0ae3a0a7aeda4aea522e74e4fe36759fca80789a613a58a4364f6ecef",
      "4": nonce,
    },
    "61285": {
      "1": "0x6c2312cd49067ecf0920df7e067199c55b3faef4ec0bce1bd2cfb99793972478c45876af2bc271ac759c5ce40ace5a398b9fdb0e359f3c333fe856648804780e",
    },
  };

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  expect({
    [CatalystLabels.DATA]: JSON.parse(dataJson),
    [CatalystLabels.SIG]: JSON.parse(sigJson),
  }).toEqual(expectedResult);
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */
});

test("Generate Catalyst key creation & encryption", async () => {
  const pin = keyGen.generatePin();
  const passBuff = Buffer.from(pin);
  const rootKey = keyGen.generatePrivateKeyForCatalyst(CSL);
  const encryptedKey = await encryptWithPassword(passBuff, rootKey.as_bytes());
  const decryptedKey = await decryptWithPassword(passBuff, encryptedKey);
  expect(decryptedKey).toEqual(Buffer.from(rootKey.as_bytes()).toString("hex"));
});
