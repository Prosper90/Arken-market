import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

export function createKeypair() {
    const keypair = nacl.box.keyPair();

    return {
        publicKey: naclUtil.encodeBase64(keypair.publicKey),
        secretKey: naclUtil.encodeBase64(keypair.secretKey),
    };
}

export function deriveSharedSecret(
    phantomPublicKeyBase64: string,
    dappSecretKeyBase64: string
) {
    const phantomPub = naclUtil.decodeBase64(phantomPublicKeyBase64);
    const dappSecret = naclUtil.decodeBase64(dappSecretKeyBase64);

    return nacl.box.before(phantomPub, dappSecret);
}

export function decryptPayload(
    encryptedData: string,
    nonce: string,
    sharedSecret: Uint8Array
) {
    const data = naclUtil.decodeBase64(encryptedData);
    const nonceBytes = naclUtil.decodeBase64(nonce);

    const decrypted = nacl.box.open.after(
        data,
        nonceBytes,
        sharedSecret
    );

    if (!decrypted) throw new Error("Decryption failed");

    return JSON.parse(naclUtil.encodeUTF8(decrypted));
}
