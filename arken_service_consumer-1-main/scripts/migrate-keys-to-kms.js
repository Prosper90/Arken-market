/**
 * One-time migration script: re-encrypts all private keys from legacy CryptoJS
 * AES-ECB to AWS KMS.
 *
 * Safe to run while the app is live — the decrypt function in utils/common.js
 * already falls back to legacy CryptoJS for any key that doesn't start with "kms:".
 *
 * Usage:
 *   AWS_REGION=us-east-1 KMS_KEY_ID=<your-key-id> MONGO_URI=<uri> node scripts/migrate-keys-to-kms.js
 *
 * What it does:
 *   - Iterates userPublicWallet, userWallet, and adminWallet collections
 *   - For each wallet sub-document where privateKey does NOT start with "kms:"
 *     it legacy-decrypts then KMS-encrypts and saves the result
 *   - Prints a summary at the end
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { KMSClient, EncryptCommand } = require("@aws-sdk/client-kms");
const CryptoJS = require("crypto-js");

// ─── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const KMS_KEY_ID = process.env.KMS_KEY_ID;

if (!MONGO_URI || !KMS_KEY_ID) {
  console.error("MONGO_URI and KMS_KEY_ID env vars are required.");
  process.exit(1);
}

const kms = new KMSClient({ region: AWS_REGION });
const LEGACY_PASSWORD = "RJ23edrf";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function legacyDecrypt(text) {
  const legacyKey = CryptoJS.enc.Hex.parse(LEGACY_PASSWORD);
  const decrypted = CryptoJS.AES.decrypt(text.toString(), legacyKey, {
    mode: CryptoJS.mode.ECB,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

async function kmsEncrypt(plaintext) {
  const { CiphertextBlob } = await kms.send(new EncryptCommand({
    KeyId: KMS_KEY_ID,
    Plaintext: Buffer.from(plaintext, "utf8"),
  }));
  return "kms:" + Buffer.from(CiphertextBlob).toString("base64");
}

// ─── Migrate one collection ────────────────────────────────────────────────────
async function migrateCollection(Model, collectionName) {
  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  const cursor = Model.find({}).cursor();

  for await (const doc of cursor) {
    let dirty = false;

    for (const wallet of doc.wallets || []) {
      if (!wallet.privateKey || wallet.privateKey.startsWith("kms:")) {
        skipped++;
        continue;
      }

      try {
        const plaintext = legacyDecrypt(wallet.privateKey);
        if (!plaintext) {
          console.warn(`[${collectionName}] doc ${doc._id} wallet ${wallet.address} — legacy decrypt returned empty, skipping`);
          errors++;
          continue;
        }
        wallet.privateKey = await kmsEncrypt(plaintext);
        dirty = true;
        migrated++;
      } catch (err) {
        console.error(`[${collectionName}] doc ${doc._id} wallet ${wallet.address} — error:`, err.message);
        errors++;
      }
    }

    if (dirty) {
      await doc.save();
    }
  }

  console.log(`[${collectionName}] migrated=${migrated} skipped=${skipped} errors=${errors}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Load models after connect
  const UserPublicWallet = require("../models/publicWallet");
  const UserWallet = require("../models/userWallet");
  const AdminWallet = require("../models/adminWallet");

  await migrateCollection(UserPublicWallet, "userPublicWallet");
  await migrateCollection(UserWallet, "userWallet");
  await migrateCollection(AdminWallet, "adminWallet");

  console.log("\nMigration complete.");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
