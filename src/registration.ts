import blake2b from "blake2b";
import type {
  AuxiliaryData,
  BigNum,
  GeneralTransactionMetadata,
  MetadataList,
  MetadataJsonSchema,
  TransactionMetadatum,
  PrivateKey,
  encode_json_str_to_metadatum,
} from "@emurgo/cardano-serialization-lib-nodejs";

export const CatalystLabels = {
  DATA: 61284,
  SIG: 61285,
} as const;

export const CATALYST_PURPOSE = 0;

function prefix0x(hex: string): string {
  if (hex.startsWith("0x")) {
    return hex;
  }
  return "0x" + hex;
}

export function generateRegistrationMetadata(
  csl: {
    encode_json_str_to_metadatum: typeof encode_json_str_to_metadatum;
    MetadataJsonSchema: typeof MetadataJsonSchema;
    GeneralTransactionMetadata: typeof GeneralTransactionMetadata;
    BigNum: typeof BigNum;
    MetadataList: typeof MetadataList;
    TransactionMetadatum: typeof TransactionMetadatum;
    AuxiliaryData: typeof AuxiliaryData;
  },
  votingPublicKey: string,
  stakingPublicKey: string,
  rewardAddress: string,
  nonce: number,
  signer: (arg: Uint8Array) => string
): AuxiliaryData {
  /**
   * Catalyst follows a certain standard to prove the voting power
   * A transaction is submitted with following metadata format for the registration process
   * label: 61284
   * {
   *   1: delegations: [ a tuple of ["pubkey generated for catalyst app", voting_weight (int)]],
   *   2: "stake key public key",
   *   3: "address to receive rewards to"
   *   4: "slot number",
   *   5: "voting purpose" (catalyst = 0)
   * }
   * label: 61285
   * {
   *   1: "signature of blake2b-256 hash of the metadata signed using stakekey"
   * }
   */
  const registrationData = csl.encode_json_str_to_metadatum(
    JSON.stringify({
      "1": [[prefix0x(votingPublicKey), 1]],
      "2": prefix0x(stakingPublicKey),
      "3": prefix0x(rewardAddress),
      "4": nonce,
      "5": CATALYST_PURPOSE,
    }),
    csl.MetadataJsonSchema.BasicConversions
  );
  const generalMetadata = csl.GeneralTransactionMetadata.new();
  generalMetadata.insert(
    csl.BigNum.from_str(CatalystLabels.DATA.toString()),
    registrationData
  );
  const hashedMetadata = blake2b(256 / 8)
    .update(generalMetadata.to_bytes())
    .digest("binary");
  generalMetadata.insert(
    csl.BigNum.from_str(CatalystLabels.SIG.toString()),
    csl.encode_json_str_to_metadatum(
      JSON.stringify({
        "1": prefix0x(signer(hashedMetadata)),
      }),
      csl.MetadataJsonSchema.BasicConversions
    )
  );
  // This is how Ledger constructs the metadata. We must be consistent with it.
  const metadataList = csl.MetadataList.new();
  metadataList.add(
    csl.TransactionMetadatum.from_bytes(generalMetadata.to_bytes())
  );
  metadataList.add(csl.TransactionMetadatum.new_list(csl.MetadataList.new()));

  return csl.AuxiliaryData.from_bytes(metadataList.to_bytes());
}

export function generateRegistration(request: {
  csl: {
    encode_json_str_to_metadatum: typeof encode_json_str_to_metadatum;
    MetadataJsonSchema: typeof MetadataJsonSchema;
    GeneralTransactionMetadata: typeof GeneralTransactionMetadata;
    BigNum: typeof BigNum;
    MetadataList: typeof MetadataList;
    TransactionMetadatum: typeof TransactionMetadatum;
    AuxiliaryData: typeof AuxiliaryData;
  };
  stakePrivateKey: PrivateKey;
  catalystPrivateKey: PrivateKey;
  receiverAddress: Buffer;
  slotNumber: number;
}): AuxiliaryData {
  return generateRegistrationMetadata(
    request.csl,
    Buffer.from(request.catalystPrivateKey.to_public().as_bytes()).toString(
      "hex"
    ),
    Buffer.from(request.stakePrivateKey.to_public().as_bytes()).toString("hex"),
    Buffer.from(request.receiverAddress).toString("hex"),
    request.slotNumber,
    (hashedMetadata) => request.stakePrivateKey.sign(hashedMetadata).to_hex()
  );
}
