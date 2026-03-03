const cron = require("node-cron");
const axios = require("axios");
const Prediction = require("./models/predictions");
const UserWallet = require("./models/userWallet");
const usersDB = require("./models/users");
const TelegramGroup = require("./models/telegramGroup");
const PlatformFeeSettings = require("./models/PlatformFeeSettings");
const AdminWallet = require("./models/adminWallet");
const userPublicWallet = require("./models/publicWallet");
const AdminWalletHistory = require("./models/AdminWalletHistory");
const Market = require("./models/markets");
const { callDelphi, callLex } = require("./services/oracle.service");
const { settleUMAAssertion } = require("./services/uma.service");

// cron.schedule("0 0 * * *", async () => {

//   console.log("Running prediction settlement cron...");

//   try {
//     const openPredictions = await Prediction.find({ status: "OPEN", source: "poly" });

//     for (const prediction of openPredictions) {
//       try {
//         const marketRes = await axios.get(
//           `https://gamma-api.polymarket.com/markets/${prediction.marketId}`
//         );

//         const market = marketRes.data;

//         if (!market.resolved) continue;

//         const userOutcome = market.outcomes[prediction.outcomeIndex];
//         const isWinner = userOutcome.name === market.resolution;

//         prediction.status = isWinner ? "WON" : "LOST";
//         prediction.resolvedOutcome = market.resolution;
//         prediction.finalPayout = isWinner ? prediction.potentialPayout : 0;
//         prediction.settledAt = new Date();
//         await prediction.save();

//         const walletDoc = await UserWallet.findOne({ userId: prediction.userId });
//         if (!walletDoc) continue;

//         const currencyWallet = walletDoc.wallets.find(
//           (w) => w.currencySymbol === prediction.currency
//         );
//         if (!currencyWallet) continue;

//         currencyWallet.holdAmount -= prediction.amount;

//         if (isWinner) {
//           currencyWallet.amount += prediction.finalPayout;
//         }

//         await walletDoc.save();

//         console.log(
//           `Prediction ${prediction._id} settled: ${prediction.status}`
//         );

//         const userStats = await Prediction.aggregate([
//           { $match: { userId: prediction.userId, status: { $in: ["WON", "LOST"] } } },
//           {
//             $group: {
//               _id: "$userId",
//               totalPredictions: { $sum: 1 },
//               totalWins: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
//             },
//           },
//         ]);

//         if (userStats.length) {
//           const { totalPredictions, totalWins } = userStats[0];
//           const winRate = (totalWins / totalPredictions) * 100;

//           await usersDB.findByIdAndUpdate(prediction.userId, {
//             totalPredictions,
//             totalWins,
//             totalLosses: totalPredictions - totalWins,
//             winRate,
//           });
//         }

//       } catch (innerErr) {
//         console.error(
//           `Error processing prediction ${prediction._id}:`,
//           innerErr.message
//         );
//       }
//     }
//   } catch (err) {
//     console.error("Cron error:", err.message);
//   }
// });

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running prediction settlement cron...");

//   try {
//     const openPredictions = await Prediction.find({
//       status: "OPEN",
//       source: "poly"
//     });

//     for (const prediction of openPredictions) {
//       try {
//         const marketRes = await axios.get(
//           `https://gamma-api.polymarket.com/markets/${prediction.marketId}`
//         );

//         const market = marketRes.data;
//         if (!market.resolved) continue;

//         const userOutcome = market.outcomes[prediction.outcomeIndex];
//         const isWinner = userOutcome.name === market.resolution;

//         prediction.status = isWinner ? "WON" : "LOST";
//         prediction.resolvedOutcome = market.resolution;
//         prediction.finalPayout = isWinner ? prediction.potentialPayout : 0;
//         prediction.settledAt = new Date();
//         await prediction.save();

//         const walletDoc = await UserWallet.findOne({ userId: prediction.userId });
//         if (!walletDoc) continue;

//         const currencyWallet = walletDoc.wallets.find(
//           (w) => w.currencySymbol === prediction.currency
//         );
//         if (!currencyWallet) continue;

//         currencyWallet.holdAmount -= prediction.amount;

//         if (isWinner) {
//           currencyWallet.amount += prediction.finalPayout;
//         }

//         await walletDoc.save();

       
//         if (prediction.groupId && isWinner) {
//           const group = await TelegramGroup.findOne({
//             groupId: prediction.groupId,
//             isActive: true
//           });

//           if (group && group.commissionPercent > 0) {
//             const commission =
//               (prediction.finalPayout * group.commissionPercent) / 100;

//             const owner = await usersDB.findOne({
//               telegramId: group.groupOwnerId
//             });

//             if (owner) {
//               const ownerWallet = await UserWallet.findOne({
//                 userId: owner._id
//               });

//               if (ownerWallet) {
//                 const ownerCurrencyWallet = ownerWallet.wallets.find(
//                   (w) => w.currencySymbol === prediction.currency
//                 );

//                 if (ownerCurrencyWallet) {
//                   ownerCurrencyWallet.amount += commission;
//                   await ownerWallet.save();
//                 }
//               }
//             }
//           }
//         }
        

//         console.log(
//           `Prediction ${prediction._id} settled: ${prediction.status}`
//         );

//         const userStats = await Prediction.aggregate([
//           {
//             $match: {
//               userId: prediction.userId,
//               status: { $in: ["WON", "LOST"] },
//             },
//           },
//           {
//             $group: {
//               _id: "$userId",
//               totalPredictions: { $sum: 1 },
//               totalWins: {
//                 $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] },
//               },
//             },
//           },
//         ]);

//         if (userStats.length) {
//           const { totalPredictions, totalWins } = userStats[0];
//           const winRate = (totalWins / totalPredictions) * 100;

//           await usersDB.findByIdAndUpdate(prediction.userId, {
//             totalPredictions,
//             totalWins,
//             totalLosses: totalPredictions - totalWins,
//             winRate,
//           });
//         }
//       } catch (innerErr) {
//         console.error(
//           `Error processing prediction ${prediction._id}:`,
//           innerErr.message
//         );
//       }
//     }
//   } catch (err) {
//     console.error("Cron error:", err.message);
//   }
// });



cron.schedule("0 0 * * *", async () => {
  console.log("Running prediction settlement cron...");

  try {
    const openPredictions = await Prediction.find({
      status: "OPEN",
      source: "poly",
    });

    for (const prediction of openPredictions) {
      try {
        const marketRes = await axios.get(
          `https://gamma-api.polymarket.com/markets/${prediction.marketId}`
        );

        const market = marketRes.data;
        if (!market.closed) continue;

        const clobRes = await axios.get(
          `https://clob.polymarket.com/markets/${market.conditionId}`
        );

        const tokens = clobRes.data.tokens || [];
        const winningTokenIndex = tokens.findIndex(
          (t) => t.winner === true
        );

        if (winningTokenIndex === -1) continue;

        const winningToken = tokens[winningTokenIndex];

        const isWinner =
          prediction.outcomeIndex === winningTokenIndex;

        prediction.status = isWinner ? "WON" : "LOST";
        prediction.resolvedOutcome = winningToken.outcome;
        prediction.finalPayout = isWinner
          ? prediction.potentialPayout
          : 0;
        prediction.settledAt = new Date();
        await prediction.save();

      
        if (prediction.deductedFrom === "userWallet") {
          const walletDoc = await UserWallet.findOne({
            telegramId: prediction.telegramId,
          });
          if (!walletDoc) continue;

          const currencyWallet = walletDoc.wallets.find(
            (w) => w.currencySymbol === prediction.currency
          );
          if (!currencyWallet) continue;

          // Fee was already collected at bet time — just release holdAmount and pay full payout
          currencyWallet.holdAmount -= prediction.amount;

          if (isWinner) {
            currencyWallet.amount += prediction.finalPayout;
          }

          walletDoc.markModified("wallets");
          await walletDoc.save();
        }


        if (prediction.deductedFrom === "userPublicWallet") {
          // Use top-level balance/holdBalance fields (new unified path)
          await userPublicWallet.updateOne(
            { telegramId: prediction.telegramId },
            {
              $inc: {
                holdBalance: -prediction.amount,
                balance: isWinner ? prediction.finalPayout : 0,
              }
            }
          );
        }

        // NOTE: Group owner commission and referral fees are now collected at bet placement time,
        // not at resolution time. See userbetplaceHandler in auth.service.js.

        console.log(
          `Prediction ${prediction._id} settled: ${prediction.status}`
        );

        const userStats = await Prediction.aggregate([
          {
            $match: {
              telegramId: prediction.telegramId,
              status: { $in: ["WON", "LOST"] },
            },
          },
          {
            $group: {
              _id: "$userId",
              totalPredictions: { $sum: 1 },
              totalWins: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "WON"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);

        if (userStats.length) {
          const { totalPredictions, totalWins } =
            userStats[0];

          const winRate =
            (totalWins / totalPredictions) * 100;

          await usersDB.findByIdAndUpdate(
            prediction.telegramId,
            {
              totalPredictions,
              totalWins,
              totalLosses:
                totalPredictions - totalWins,
              winRate,
            }
          );
        }
      } catch (innerErr) {
        console.error(
          `Error processing prediction ${prediction._id}:`,
          innerErr.message
        );
      }
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});


// ─── AI Oracle: Delphi + Lex resolution (every 30 minutes) ───────────────────
cron.schedule("*/30 * * * *", async () => {
  console.log("⏰ AI Oracle cron: scanning expired AI markets...");

  try {
    const now = new Date();

    // Pass 1: Find expired AI markets with no verdict yet → call Delphi + Lex
    const pendingAI = await Market.find({
      oracleType: "ai",
      marketStatus: "active",
      endDate: { $lt: now },
      "aiResolution.verdict": null,
    }).lean();

    for (const market of pendingAI) {
      try {
        console.log(`  → Resolving AI market: ${market._id} "${market.question.slice(0, 60)}"`);

        const delphiData = await callDelphi(market.question);
        const lexResult = await callLex(market.question, market.outcomes, delphiData);

        const verdict = lexResult.verdict || null;
        const confidence = lexResult.confidence || null;
        const source = delphiData.sources ? delphiData.sources.join(", ") : null;
        const disputeDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

        await Market.findByIdAndUpdate(market._id, {
          "aiResolution.verdict": verdict,
          "aiResolution.confidence": confidence,
          "aiResolution.source": source,
          "aiResolution.resolvedAt": now,
          disputeDeadline,
          disputeStatus: "none",
        });

        console.log(`    ✅ Verdict: ${verdict} (confidence: ${confidence})`);
      } catch (innerErr) {
        console.error(`    ❌ Failed AI resolution for ${market._id}:`, innerErr.message);
      }
    }

    // Pass 2: Auto-resolve markets where dispute window has passed with no dispute
    const readyToResolve = await Market.find({
      oracleType: "ai",
      marketStatus: "active",
      "aiResolution.verdict": { $ne: null },
      disputeDeadline: { $lt: now },
      disputeStatus: "none",
    }).lean();

    for (const market of readyToResolve) {
      try {
        const verdict = market.aiResolution.verdict;
        const winningIndex = market.outcomes.findIndex(
          (o) => o.toLowerCase() === (verdict || "").toLowerCase()
        );

        if (winningIndex === -1) {
          console.warn(`  ⚠️ Verdict "${verdict}" not in outcomes for market ${market._id}`);
          continue;
        }

        await Market.findByIdAndUpdate(market._id, {
          marketStatus: "resolved",
          active: false,
          closed: true,
        });

        // Settle all open predictions for this market
        const predictions = await Prediction.find({
          marketId: market._id.toString(),
          status: "OPEN",
        });

        for (const prediction of predictions) {
          const isWinner = prediction.outcomeIndex === winningIndex;
          prediction.status = isWinner ? "WON" : "LOST";
          prediction.resolvedOutcome = verdict;
          prediction.finalPayout = isWinner ? prediction.potentialPayout : 0;
          prediction.settledAt = new Date();
          await prediction.save();

          if (isWinner && prediction.deductedFrom === "userWallet") {
            const walletDoc = await UserWallet.findOne({ telegramId: prediction.telegramId });
            if (walletDoc) {
              const cw = walletDoc.wallets.find(w => w.currencySymbol === prediction.currency);
              if (cw) {
                cw.holdAmount -= prediction.amount;
                cw.amount += prediction.finalPayout;
                walletDoc.markModified("wallets");
                await walletDoc.save();
              }
            }
          }
        }

        console.log(`  ✅ AI market ${market._id} resolved → "${verdict}" (${predictions.length} bets settled)`);
      } catch (innerErr) {
        console.error(`  ❌ Failed to resolve market ${market._id}:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error("AI Oracle cron error:", err.message);
  }
});


// ─── UMA Oracle: settle expired assertions (every 15 minutes) ────────────────
cron.schedule("*/15 * * * *", async () => {
  console.log("⏰ UMA cron: checking for assertions ready to settle...");

  try {
    const now = new Date();

    const readyMarkets = await Market.find({
      oracleType: "uma",
      umaStatus: "submitted",
      umaChallengePeriodEnd: { $lt: now },
    }).lean();

    if (readyMarkets.length === 0) {
      console.log("  → No UMA markets ready to settle");
      return;
    }

    for (const market of readyMarkets) {
      try {
        console.log(`  → Settling UMA assertion for market ${market._id}`);

        const { txHash } = await settleUMAAssertion(market.umaAssertionId);

        await Market.findByIdAndUpdate(market._id, {
          umaStatus: "accepted",
          umaSettledTxHash: txHash,
          marketStatus: "resolved",
          active: false,
          closed: true,
        });

        // Settle all open predictions (same pattern as AI Pass 2)
        const verdict = market.umaVerdict;
        const winningIndex = (market.outcomes || []).findIndex(
          (o) => o.toLowerCase() === (verdict || "").toLowerCase()
        );

        if (winningIndex === -1) {
          console.warn(`  ⚠️ UMA verdict "${verdict}" not in outcomes for market ${market._id}`);
          continue;
        }

        const predictions = await Prediction.find({
          marketId: market._id.toString(),
          status: "OPEN",
        });

        for (const prediction of predictions) {
          const isWinner = prediction.outcomeIndex === winningIndex;
          prediction.status = isWinner ? "WON" : "LOST";
          prediction.resolvedOutcome = verdict;
          prediction.finalPayout = isWinner ? prediction.potentialPayout : 0;
          prediction.settledAt = new Date();
          await prediction.save();

          if (isWinner && prediction.deductedFrom === "userWallet") {
            const walletDoc = await UserWallet.findOne({ telegramId: prediction.telegramId });
            if (walletDoc) {
              const cw = walletDoc.wallets.find(w => w.currencySymbol === prediction.currency);
              if (cw) {
                cw.holdAmount -= prediction.amount;
                cw.amount += prediction.finalPayout;
                walletDoc.markModified("wallets");
                await walletDoc.save();
              }
            }
          }
        }

        console.log(`  ✅ UMA market ${market._id} settled → "${verdict}" (${predictions.length} bets resolved) tx:${txHash}`);
      } catch (innerErr) {
        console.error(`  ❌ Failed to settle UMA market ${market._id}:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error("UMA settlement cron error:", err.message);
  }
});

