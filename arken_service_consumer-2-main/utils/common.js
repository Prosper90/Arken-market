const jwt = require('jsonwebtoken');
const crypto = require('crypto');
var CryptoJS = require("crypto-js");
const key = require("../config/key");
const password = "RJ23edrf";


const ENCRYPTION_KEY = key.ENCRYPTION_KEY;


exports.encrypt = (text) => {
  var key = CryptoJS.enc.Hex.parse(password);
  var encrypted = CryptoJS.AES.encrypt(text, key, { mode: CryptoJS.mode.ECB });
  var crypted = encrypted.toString();
  return crypted;
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


exports.decrypt = (text) => {
  var key = CryptoJS.enc.Hex.parse(password);
  var decrypted = CryptoJS.AES.decrypt(text.toString(), key, {
    mode: CryptoJS.mode.ECB,
  });
  dec = decrypted.toString(CryptoJS.enc.Utf8);
  return dec;
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