import { generateMnemonic, mnemonicToEntropy } from "bip39";
import type {
  PrivateKey,
  Bip32PrivateKey,
} from "@emurgo/cardano-serialization-lib-nodejs";
import cryptoRandomString from "crypto-random-string";

/**
 * Generate catalyst private key for QR code
 */
export function generatePrivateKeyForCatalyst(csl: {
  Bip32PrivateKey: typeof Bip32PrivateKey;
}): PrivateKey {
  const mnemonic = generateMnemonic(160);
  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from("");
  const rootKey = csl.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, "hex"),
    EMPTY_PASSWORD
  );

  return rootKey.to_raw_key();
}

export function generatePin(): number[] {
  const pin = cryptoRandomString({ length: 4, type: "numeric" });
  return pin.split("").map(Number);
}
