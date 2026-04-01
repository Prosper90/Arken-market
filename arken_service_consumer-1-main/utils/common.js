const jwt = require('jsonwebtoken');
const crypto = require('crypto');
var CryptoJS = require("crypto-js");
const { KMSClient, EncryptCommand, DecryptCommand } = require("@aws-sdk/client-kms");
const key = require("../config/key");

// ─── Legacy password kept only for migrating old records ──────────────────────
const _legacyPassword = "RJ23edrf";
const ENCRYPTION_KEY = key.ENCRYPTION_KEY;

// ─── AWS KMS client ────────────────────────────────────────────────────────────
const kmsClient = new KMSClient({ region: process.env.AWS_REGION || "us-east-1" });
const KMS_KEY_ID = process.env.KMS_KEY_ID;

// ─── KMS encrypt — stores result as "kms:<base64>" ────────────────────────────
exports.encrypt = async (plaintext) => {
  const { CiphertextBlob } = await kmsClient.send(new EncryptCommand({
    KeyId: KMS_KEY_ID,
    Plaintext: Buffer.from(plaintext, "utf8"),
  }));
  return "kms:" + Buffer.from(CiphertextBlob).toString("base64");
};

// ─── Decrypt — handles both KMS (new) and legacy CryptoJS (old) ───────────────
exports.decrypt = async (text) => {
  if (text && text.startsWith("kms:")) {
    const { Plaintext } = await kmsClient.send(new DecryptCommand({
      CiphertextBlob: Buffer.from(text.slice(4), "base64"),
    }));
    return Buffer.from(Plaintext).toString("utf8");
  }
  // Fallback: legacy CryptoJS AES-ECB for records not yet migrated
  return exports.legacyDecrypt(text);
};

// ─── Legacy decrypt — used only during migration ──────────────────────────────
exports.legacyDecrypt = (text) => {
  const legacyKey = CryptoJS.enc.Hex.parse(_legacyPassword);
  const decrypted = CryptoJS.AES.decrypt(text.toString(), legacyKey, {
    mode: CryptoJS.mode.ECB,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};


exports.isEmpty = (req, res, next) => {
  var value = req.body;
  if (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  ) {
    return res.json({ status: false, message: "Please fill all fields" });
  } else {
    next();
  }
};



let encryptionLevel = (exports.encryptionLevel = (text) => {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
});


exports.tokenmiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .send("Warning! Access denied. Unauthorized activity detected.");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .send("Warning! Access denied. Unauthorized activity detected.");
  }

  try {
    const payload = jwt.verify(token, jwt_secret);

    req.userId = payload._id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: false, message: "TokenExpired" });
    }
    console.log(error, "=-=-token error=-=");
    return res
      .status(401)
      .send("Warning! Access denied. Unauthorized activity detected.");
  }
};