declare module "chacha" {
  class Cipher {
    setAAD(aad: Buffer): void;
    getAuthTag(): Buffer;
    setAuthTag(tag: Buffer): void;
    update(
      data: string | Buffer,
      inputEnc: void | BufferEncoding,
      outputEnc: void
    ): Buffer;
    update(
      data: string | Buffer,
      inputEnc: void | BufferEncoding,
      outputEnc: BufferEncoding
    ): string;
    final(outputEnc: void): Buffer;
    final(outputEnc: BufferEncoding): string;
  }
  const noTypesYet: {
    createCipher: (key: Buffer, iv: Buffer) => Cipher;
    createDecipher: (key: Buffer, iv: Buffer) => Cipher;
    aead: Cipher;
  };
  export default noTypesYet;
}
