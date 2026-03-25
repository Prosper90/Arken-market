const { publishAndWait } = require("../rabbit");
const queuename = require("../queue/queuename");

exports.loginHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    action: queuename.login,
    user_agent: req.headers["user-agent"],
    ip_address: (
      req.header("x-forwarded-for") ||
      req.connection.remoteAddress ||
      ""
    ).replace("::ffff:", ""),
    timestamp: new Date(),
  });

  res.json({
    action: queuename.login,
    ...result,
  });
};
exports.forgotemailHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    action: queuename.forgotemailotp,
  });

  res.json({
    action: queuename.forgotemailotp,
    ...result,
  });
};
exports.forgototpverifyHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    action: queuename.forgototpverify,
  });

  res.json({
    action: queuename.forgototpverify,
    ...result,
  });
};
exports.resendemailotpHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    action: queuename.resendemailotp,
  });

  res.json({
    action: queuename.resendemailotp,
    ...result,
  });
};
exports.forgotpasswordHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    action: queuename.forgotpassword,
  });

  res.json({
    action: queuename.forgotpassword,
    ...result,
  });
};
exports.getAdminHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.getAdmin,
  });

  res.json({
    action: queuename.getAdmin,
    ...result,
  });
};
exports.verifyTokenHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.verifyToken,
  });

  res.json({
    action: queuename.verifyToken,
    ...result,
  });
};
exports.adminloggHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.adminlogg,
  });

  res.json({
    action: queuename.adminlogg,
    ...result,
  });
};
exports.dashboardcountsHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.dashboardcounts,
  });

  res.json({
    action: queuename.dashboardcounts,
    ...result,
  });
};
exports.getAllEventsHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.getAllEvents,
  });

  res.json({
    action: queuename.getAllEvents,
    ...result,
  });
};
exports.getEventHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    id: req.params.id,
    action: queuename.getEvent,
  });

  res.json({
    action: queuename.getEvent,
    ...result,
  });
};
exports.UpdateEventHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    id: req.params.id,
    action: queuename.updateEvent,
  });

  res.json({
    action: queuename.updateEvent,
    ...result,
  });
};
exports.deleteEventHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    id: req.params.id,
    action: queuename.deleteEvent,
  });

  res.json({
    action: queuename.deleteEvent,
    ...result,
  });
};
exports.createEventHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    id: req.params.id,
    action: queuename.createEvent,
  });

  res.json({
    action: queuename.createEvent,
    ...result,
  });
};
exports.getCombinedAllMarketsHandler = async (req, res) => {
  const result = await publishAndWait("onboard_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.getCombinedAllMarkets,
  });

  res.json({
    action: queuename.getCombinedAllMarkets,
    ...result,
  });
};
exports.getAllMarketsHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.getAllMarkets,
  });

  res.json({
    action: queuename.getAllMarkets,
    ...result,
  });
};
exports.getMarketHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    id: req.params.id,
    action: queuename.getMarket,
  });

  res.json({
    action: queuename.getMarket,
    ...result,
  });
};
exports.updateMarketHandler = async (req, res) => {
  const result = await publishAndWait("market_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.UpdateMarket,
  });

  res.json({
    action: queuename.UpdateMarket,
    ...result,
  });
};
exports.deleteMarketHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    userId: req.userId,
    id: req.params.id,
    action: queuename.deleteMarket,
  });

  res.json({
    action: queuename.deleteMarket,
    ...result,
  });
};
exports.createMarketHandler = async (req, res) => {
  const result = await publishAndWait("market_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.createMarket,
  });

  res.json({
    action: queuename.createMarket,
    ...result,
  });
};
exports.getPolyMarketsDetailsHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    action: queuename.markets,
  });

  res.json({
    action: queuename.markets,
    ...result,
  });
};
exports.getPolyEventsDetailsHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    id: req.params.id,
    action: queuename.getPolyEventsDetails,
  });

  res.json({
    action: queuename.getPolyEventsDetails,
    ...result,
  });
};
exports.getPolyMarketsDetailHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    id: req.params.id,
    userId: req.userId,
    action: queuename.getPolyMarketsDetail,
  });

  res.json({
    action: queuename.getPolyMarketsDetail,
    ...result,
  });
};
exports.getPolyEventsDetailHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    id: req.params.id,
    action: queuename.getPolyEventsDetail,
  });

  res.json({
    action: queuename.getPolyEventsDetail,
    ...result,
  });
};
exports.createPolyMarketHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    id: req.params.id,
    action: queuename.createPolyMarket,
  });

  res.json({
    action: queuename.createPolyMarket,
    ...result,
  });
};
exports.getPolyMarketHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    id: req.params.id,
    userId: req.userId,
    action: queuename.getPolyMarket,
  });

  res.json({
    action: queuename.getPolyMarket,
    ...result,
  });
};
exports.getAllPolyMarketsHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    id: req.params.id,
    userId: req.userId,
    action: queuename.getAllPolyMarkets,
  });

  res.json({
    action: queuename.getAllPolyMarkets,
    ...result,
  });
};
exports.deletePolyMarketHandler = async (req, res) => {
  const result = await publishAndWait("auth_queue", {
    ...req.body,
    query: req.query,
    id: req.params.id,
    userId: req.userId,
    action: queuename.deletePolyMarket,
  });

  res.json({
    action: queuename.deletePolyMarket,
    ...result,
  });
};

exports.getPolymarketListHandler = async (req, res) => {
  const result = await publishAndWait("onboard_queue", {
    ...req.body,
    userId: req.userId,
    action: queuename.getPolymarketList,
  });
  res.json({
    action: queuename.getPolymarketList,
    ...result,
  });
};
exports.getMergedMarketsHandler = async (req, res) => {
  const result = await publishAndWait("user_queue", {
    ...req.body,
    action: queuename.getmergedmarkets,
  });
  res.json({
    action: queuename.getmergedmarkets,
    ...result,
  });
};
exports.verifyTelegramWebAppHandler = async (req, res) => {
  const result = await publishAndWait("bot_queue", {
    ...req.body,
    action: queuename.telegramwebapp,
  });
  res.json({
    action: queuename.telegramwebapp,
    ...result,
  });
};
exports.verifyWalletAppHandler = async (req, res) => {
  const result = await publishAndWait("bot_queue", {
    ...req.body,
    action: queuename.verifyWallet,
  });
  res.json({
    action: queuename.verifyWallet,
    ...result,
  });
};
exports.userbetplaceHandler = async (req, res) => {
  // 90-second timeout — Arken EVM bets do one on-chain tx.wait(1)
  const result = await publishAndWait("bet_queue", {
    ...req.body,
    action: queuename.userbetplace,
  }, 90000);
  res.json({
    action: queuename.userbetplace,
    ...result,
  });
};
exports.getActiveBetsForUserHandler = async (req, res) => {
  const result = await publishAndWait("bet_queue", {
    ...req.body,
    action: queuename.getActiveBetsForUser,
  });
  res.json({
    action: queuename.getActiveBetsForUser,
    ...result,
  });
};
exports.getCompletedBetsForUserHandler = async (req, res) => {
  const result = await publishAndWait("bet_queue", {
    ...req.body,
    action: queuename.getCompletedBetsForUser,
  });
  res.json({
    action: queuename.getCompletedBetsForUser,
    ...result,
  });
};
exports.getUserProfileHandler = async (req, res) => {
  const result = await publishAndWait("bet_queue", {
    ...req.body,
    action: queuename.getUserProfile,
  });
  res.json({
    action: queuename.getUserProfile,
    ...result,
  });
};

exports.getAdminDashboardHandler = async (req, res) => {
  const result = await publishAndWait("dashboard_queue", {
    ...req.body,
    action: queuename.getAdminDashboard,
  });
  res.json({
    action: queuename.getAdminDashboard,
    ...result,
  });
};
exports.getUserManagementListHandler = async (req, res) => {
  const result = await publishAndWait("dashboard_queue", {
    ...req.body,
    action: queuename.getUserManagementList,
  });
  res.json({
    action: queuename.getUserManagementList,
    ...result,
  });
};

exports.verifyUniqueIdHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.verifyUniqueId,
  });
  res.json({
    action: queuename.verifyUniqueId,
    ...result,
  });
};
exports.getUniqueIdHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.getUniqueId,
  });
  res.json({
    action: queuename.getUniqueId,
    ...result,
  });
};
exports.createWalletHandler = async (req, res) => {
  const result = await publishAndWait("new_wallet_queue", {
    ...req.body,
    action: queuename.createWalletNew,
  });
  res.json({
    action: queuename.createWalletNew,
    ...result,
  });
};
exports.send_otp = async (req, res) => {
  const result = await publishAndWait("new_wallet_queue", {
    ...req.body,
    action: queuename.send_otp,
  });
  res.json({
    action: queuename.send_otp,
    ...result,
  });
};

exports.resend_otp = async (req, res) => {
  const result = await publishAndWait("new_wallet_queue", {
    ...req.body,
    action: queuename.resend_otp,
  });
  res.json({
    action: queuename.resend_otp,
    ...result,
  });
};
exports.get_deposit_list = async (req, res) => {
  const result = await publishAndWait("new_wallet_queue", {
    ...req.body,
    action: queuename.get_deposit_list,
  });
  res.json({
    action: queuename.get_deposit_list,
    ...result,
  });
};


exports.verify_otp = async (req, res) => {
  const result = await publishAndWait("new_wallet_queue", {
    ...req.body,
    action: queuename.verify_otp,
  });
  res.json({
    action: queuename.verify_otp,
    ...result,
  });
};

exports.saveUniqueIdHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.saveUniqueId,
  });
  res.json({
    action: queuename.saveUniqueId,
    ...result,
  });
};
exports.getDappKeyHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.getDappKey,
  });
  res.json({
    action: queuename.getDccsssaappKey,
    ...result,
  });
};

exports.tokenDepositHandler = async (req, res) => {
  const result = await publishAndWait("deposit_queue", {
    ...req.body,
    action: queuename.Deposit,
  });
  res.json({
    action: queuename.Deposit,
    ...result,
  });
};
exports.checkTelegramId = async (req, res) => {
  const result = await publishAndWait("ID_queue", {
    ...req.body,
    action: queuename.checkTelegramId,
  });
  res.json({
    action: queuename.checkTelegramId,
    ...result,
  });
};



exports.getAddress = async (req, res) => {
  console.log("enter address")
  const result = await publishAndWait("Address_queue", {
    ...req.body,
    action: queuename.getAddressWallet,
  });
  res.json({
    action: queuename.getAddressWallet,
    ...result,
  });
};


exports.depositListHandler = async (req, res) => {
  const result = await publishAndWait("deposit_admin_queue", {
    ...req.body,
    action: queuename.getDepositList,
  });
  res.json({
    action: queuename.getDepositList,
    ...result,
  });
};
exports.WithdrawlistHandler = async (req, res) => {
  const result = await publishAndWait("withdraw_admin_queue", {
    ...req.body,
    action: queuename.getWithdrawlist,
  });
  res.json({
    action: queuename.getWithdrawlist,
    ...result,
  });
};
exports.currencyAddUpdateHandler = async (req, res) => {
  const result = await publishAndWait("admin_currency_queue", {
    ...req.body,
    action: queuename.currencyAddUpdate,
  });
  res.json({
    action: queuename.currencyAddUpdate,
    ...result,
  });
};

exports.currencyDeleteHandler = async (req, res) => {
  const result = await publishAndWait("admin_currency_queue", {
    ...req.body,
    action: queuename.currencyDelete,
  });
  res.json({
    action: queuename.currencyDelete,
    ...result,
  });
};
exports.allCurrencyListHandler = async (req, res) => {
  const result = await publishAndWait("admin_currency_queue", {
    ...req.body,
    action: queuename.allCurrencyList,
  });
  res.json({
    action: queuename.allCurrencyList,
    ...result,
  });
};
exports.viewOneCurrencyHandler = async (req, res) => {
  const result = await publishAndWait("admin_currency_queue", {
    ...req.body,
    action: queuename.viewOneCurrency,
  });
  res.json({
    action: queuename.viewOneCurrency,
    ...result,
  });
};

exports.getCurrenyListHandler = async (req, res) => {
  const result = await publishAndWait("currency_queue", {
    ...req.body,
    action: queuename.getCurrenyList,
  });
  res.json({
    action: queuename.getCurrenyList,
    ...result,
  });
};

exports.getPredictionManagementListHandler = async (req, res) => {
  const result = await publishAndWait("resol_queue", {
    ...req.body,
    action: queuename.getPredictionManagementList,
  });
  res.json({
    action: queuename.getPredictionManagementList,
    ...result,
  });
};
exports.manualSettlePredictionHandler = async (req, res) => {
  const result = await publishAndWait("resol_queue", {
    ...req.body,
    action: queuename.manualSettlePrediction,
  });
  res.json({
    action: queuename.manualSettlePrediction,
    ...result,
  });
};

exports.withdrawHandler = async (req, res) => {
  const result = await publishAndWait("user_withdraw_queue", {
    ...req.body,
    action: queuename.userWithdraw,
  });
  res.json({
    action: queuename.userWithdraw,
    ...result,
  });
};


exports.getuserBalanceHandler = async (req, res) => {
  console.log(req.body,"=====-=-=-=-=-=-=-=-=-=-=-=-")
  const result = await publishAndWait("userBalance_queue", {
    ...req.body,
    action: queuename.userBalance,
  });
  res.json({
    action: queuename.userBalance,
    ...result,
  });
};
exports.getTelegramGroupListHandler = async (req, res) => {
  const result = await publishAndWait("commision_queue", {
    ...req.body,
    action: queuename.getTelegramGroupList,
  });
  res.json({
    action: queuename.getTelegramGroupList,
    ...result,
  });
};
exports.updateGroupCommissionHandler = async (req, res) => {
  const result = await publishAndWait("commision_queue", {
    ...req.body,
    action: queuename.updateGroupCommission,
  });
  res.json({
    action: queuename.updateGroupCommission,
    ...result,
  });
};
exports.getUserTotalWinningsHandler = async (req, res) => {
  const result = await publishAndWait("commision_queue", {
    ...req.body,
    action: queuename.getUserTotalWinnings,
  });
  res.json({
    action: queuename.getUserTotalWinnings,
    ...result,
  });
};
exports.exitPredictionHandler = async (req, res) => {
  const result = await publishAndWait("cashout_queue", {
    ...req.body,
    action: queuename.exitPrediction,
  });
  res.json({
    action: queuename.exitPrediction,
    ...result,
  });
};
exports.createPlatformfeeHandler = async (req, res) => {
  const result = await publishAndWait("platformfee_queue", {
    ...req.body,
    action: queuename.createPlatformfee,
  });
  res.json({
    action: queuename.createPlatformfee,
    ...result,
  });
};
exports.getPlatformFeeSettingsHandler = async (req, res) => {
  const result = await publishAndWait("platformfee_queue", {
    ...req.body,
    action: queuename.getPlatformFeeSettings,
  });
  res.json({
    action: queuename.getPlatformFeeSettings,
    ...result,
  });
};
exports.getHomeTodayNewsHandler = async (req, res) => {
  const result = await publishAndWait("userBalance_queue", {
    ...req.body,
    action: queuename.getHomeTodayNews,
  });
  res.json({
    action: queuename.getHomeTodayNews,
    ...result,
  });
};
exports.getMergedMarketByIdHandler = async (req, res) => {
  const result = await publishAndWait("userBalance_queue", {
    ...req.body,
    action: queuename.getMergedMarketById,
  });
  res.json({
    action: queuename.getMergedMarketById,
    ...result,
  });
};


exports.getDappKeyHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.getDappKey,
  });
  res.json({
    action: queuename.getDappKey,
    ...result,
  });
};
exports.disconnectWalletHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.disconnectWallet,
  });
  res.json({
    action: queuename.disconnectWallet,
    ...result,
  });
};
exports.getUserByTelegramIdHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.getUserByTelegramId,
  });
  res.json({
    action: queuename.getUserByTelegramId,
    ...result,
  });
};

exports.sweepUserDepositsHandler = async (req, res) => {
  const result = await publishAndWait("unique_id_queue", {
    ...req.body,
    action: queuename.sweepUserDeposits,
  });
  res.json({
    action: queuename.sweepUserDeposits,
    ...result,
  });
};

exports.getReferralInfoHandler = async (req, res) => {
  const result = await publishAndWait("commision_queue", {
    ...req.body,
    action: queuename.getReferralInfo,
  });
  res.json({
    action: queuename.getReferralInfo,
    ...result,
  });
};

exports.createUserMarketHandler = async (req, res) => {
  // 120-second timeout — market creation does 2 on-chain tx.wait(1) calls
  // (factory deploy + liquidity seed) which can take 30–90s under load.
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.createUserMarket,
  }, 120000);
  res.json({
    action: queuename.createUserMarket,
    ...result,
  });
};

exports.submitUMAAssertionHandler = async (req, res) => {
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.submitUMAAssertion,
  });
  res.json({
    action: queuename.submitUMAAssertion,
    ...result,
  });
};

exports.joinPrivateMarketHandler = async (req, res) => {
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.joinPrivateMarket,
  });
  res.json({
    action: queuename.joinPrivateMarket,
    ...result,
  });
};

exports.disputeMarketHandler = async (req, res) => {
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.disputeMarket,
  });
  res.json({
    action: queuename.disputeMarket,
    ...result,
  });
};

exports.getUserMarketsHandler = async (req, res) => {
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.getUserMarkets,
  });
  res.json({
    action: queuename.getUserMarkets,
    ...result,
  });
};

exports.confirmJoinPrivateMarketHandler = async (req, res) => {
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.confirmJoinPrivateMarket,
  });
  res.json({
    action: queuename.confirmJoinPrivateMarket,
    ...result,
  });
};

exports.getUserWithdrawListHandler = async (req, res) => {
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.getUserWithdrawList,
  });
  res.json({
    action: queuename.getUserWithdrawList,
    ...result,
  });
};

exports.addMarketLiquidityHandler = async (req, res) => {
  // 90-second timeout — one on-chain tx.wait(1)
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.addMarketLiquidity,
  }, 90000);
  res.json({
    action: queuename.addMarketLiquidity,
    ...result,
  });
};

exports.sellPositionHandler = async (req, res) => {
  // 90-second timeout — one on-chain tx.wait(1)
  const result = await publishAndWait("markets_queue", {
    ...req.body,
    action: queuename.sellPosition,
  }, 90000);
  res.json({
    action: queuename.sellPosition,
    ...result,
  });
};