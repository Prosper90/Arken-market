const service = {
  signup: "users/register",
  emailotpverify: "users/emailotpverify",
  resendCode: "users/resendCode",
  signin: "users/login",
  logout: "users/logout",
  verifyToken: "adminapi/verifyToken",
  // adminlogin: "auth",
  adminlogin: "adminapi/login",
  adminlogg: "adminapi/adminlogg",
  getTelegramGroupList: "tele/commuget",
  updateTelegramGroupCommission: "tele/commuupdate",
  dashboardstats: "adminapi/dashboard-stats",
  getallpolymarkets: "poly/getPolymarketList",
  verify_otp: "adminapi/verify_otp",
   getpredictionmanagementlist: "resolution/getpredictionmanagementlist",
  manualSettlePrediction: "resolution/manualSettlePrediction",

  dashboardcounts: "adminapi/dashboard-counts",
  changeUserAccountStatus: "adminapi/changeUserAccountStatus",
  updateLiquidityProvider: "adminapi/updateLiquidityProvider",
  kycAprove: "adminapi/kycAprove",
  kycReject: "adminapi/kycReject",
  getdepositinfo: "adminapi/getdepositinfo",
  partner_list: "adminapi/partner_list",
  verifyDeposit: "adminapi/verifyDeposit",
  addBank: "adminapi/editadmin",
  addedBanks: "adminapi/alladmins",
  getcurrency: "adminapi/getcurrency",
  addResearch: "adminapi/research",
  updateResearch: "adminapi/research/update",
  updateReferralSettings: "adminapi/updateReferralSettings",
  getReferralSettings: "adminapi/getReferralSettings",
  createPlatformfee: "update/platformfee",
  getplatformfee: "get/platformfee",

  getKyclist: "adminapi/getKyclist",

  rewardManagement: "adminapi/reward-settings",
  referralrewardManagement: "adminapi/referral-reward-settings",
  getRewardManagement: "adminapi/get-reward",

  airdropManagement: "adminapi/airdrop-settings",
  getAirdropManagement: "adminapi/get-airdrop",

  activatedUserList: "adminapi/activatedUserList",
  activatedUserKycList: "adminapi/activatedUserKycList",

  tradepair_view: "adminapi/tradepair/view",
  research_itemview: "adminapi/researchitem/view",
  changetradeStatus: "adminapi/tradepair/changestatus",
  changeliqudityStatus: "adminapi/tradepair/changeliqstatus",
  tradecurrency: "adminapi/tradepair/currency",
  getTradepairOne: "adminapi/tradepair/getTradepairOne",
  addTradePair: "adminapi/tradepair/addTradePair",
  deletetradepair: "adminapi/tradepair/deletetradepair",
  deleteresearch: "adminapi/research/delete",
  mmbotStatusUpdate: "adminapi/bot_update",

  getAdminTfaDetials: "adminapi/getQRcode",
  adminChangeTfaStatus: "adminapi/changeTfaStatus",
  adminChangePassword: "adminapi/changePassword",

  userbalance: "adminapi/userbalance",
  useraddress: "adminapi/useraddress",
  // get_all_user_withdraw: "withdraw/get_all_user_withdraw",
  admin_withdraw_approve: "withdraw/admin_withdraw_approve",
  get_all_user_fiat_withdraw: "withdraw/get_all_user_fiat_withdraw",
  get_all_user_fiat_deposit: "withdraw/get_all_user_fiat_deposit",
  changeEmail: "adminapi/changeEmail",
  Addbalance: "adminapi/Addbalance",

  cms_update: "adminapi/cms_update",

  getStaking: "adminapi/getStaking",

  getprofit: "adminapi/getprofit",
  cms_list: "adminapi/cms_list",
  updateStakingFlexible: "adminapi/updateStakingFlexible",

  cms_get: "adminapi/cms_get",
  mailtemplate_list: "adminapi/mailtemplate_list",
  mailtemplate_update: "adminapi/mailtemplate_update",
  mailtemplate_get: "adminapi/mailtemplate_get",
  deletetemplate: "adminapi/deletetemplate",
  deletecmsdetail: "adminapi/deletecmsdetail",
  getAdminProfile: "adminapi/admindetails",
  get_sitedata: "adminapi/get_sitedata",
  update_settings: "adminapi/update_settings",
  updateProfile: "adminapi/updateProfile",
  updateTfa: "adminapi/updateTfa",
  checkPassword: "adminapi/check_password",

  sitesetting: "adminapi/addsitesettings",
  getSitedata: "adminapi/getsitesettings",

  support_category_list: "adminapi/support_category_list",
  support_category_get: "adminapi/support_category_get",
  support_category_update: "adminapi/support_category_update",
  support_category_delete: "adminapi/support_category_delete",
  support_save: "adminapi/support_save",
  support_list: "adminapi/support_list",
  highriskwallet_list: "adminapi/highriskwallet_list",
  highriskwallet_view: "adminapi/highriskwallet_view",
  support_view: "adminapi/support_view",
  ticket_close: "adminapi/ticket_close",
  forgotemailotp: "adminapi/forgotemailotp",
  forgototpverify: "adminapi/forgototpverify",
  resetpassword: "adminapi/forgotpassword",
  resendemailotp: "adminapi/resendemailotp",

  getActiveOrders: "adminapi/getActiveOrders",
  getOrdersHistory: "adminapi/getTradeHistory",
  getCancelOrdersHistory: "adminapi/getCancelOrders",
  get_all_user_swap: "adminapi/get_all_user_swap",
  getProfit: "adminapi/getprofit",
  getinternalTransfer: "adminapi/getTransferHistory",
  getP2Porders: "adminapi/getP2POrdersHistory",
  getP2PconfirmOrders: "adminapi/getP2PConfirmOrdersHistory",
  getP2Pdispute: "adminapi/getP2PDisputeHistory",
  getdisputedetail: "adminapi/getDisputeDetail",
  changeActivedispute: "adminapi/changeActivedispute",
  changefreezedispute: "adminapi/changefreezedispute",
  getadminProfitDetails: "adminapi/getProfitDetails",
  downloadProfits: "adminapi/downloadProfits",

  //wallet
  wallet_login: "adminapi/wallet_login",
  walletCurrenList: "adminapi/fund_wallet_list",
  generateAdminaddress: "address/generateAdminAddress",
  transaction: "adminapi/get_deposit_list",
  fieldValidate: "withdraw/fieldvalidateAdmin",
  withdrawProcess: "withdraw/processAdmin",
  getBalanceBlock: "adminapi/getBalance",
  getWalletTransaction: "adminapi/adminwallet_transactions",
  cancel_p2pOrder: "adminapi/cancel_confirm_order",
  confirm_p2pOrder: "adminapi/release_coin",
  get_user: "adminapi/get_user",

  //Otc
  getOtcSettings: "adminapi/getOtcSettings",
  editOtcSettings: "adminapi/editOtcSettings",
  createOtcSettings: "adminapi/createOtcSettings",
  getfiatWithdraw: "adminapi/getwithdrawinfo",
  verifyWithdraw: "adminapi/verifyWithdraw",

  //launchpad

  getAllLaunchTokensList: "launchpad/getAllLaunchTokensList",
  viewOneToken: "launchpad/viewOneToken",
  approveToken: "launchpad/approveToken",
  rejectToken: "launchpad/rejectToken",
  deleteToken: "launchpad/deleteToken",

  //staking

  stakeAdd: "staking/stakeAdd",
  getStake: "staking/getStake",
  stakeUpdate: "staking/stakeUpdate",
  deleteStake: "staking/deleteStake",
  getStakePlansHistoryAdmin: "staking/getStakePlansHistoryAdmin",
  updatestakesetting: "staking/updatestakesetting",
  getStakesettings: "staking/getStakesettings",

  getfiatdeposit: "adminapi/getfiatdeposit",

  getAdminChat: "adminapi/getAdminChat",
  submitChatAdmin: "adminapi/submitChatAdmin",
  resolved: "adminapi/resolved",
  adminReleaseCrypto: "adminapi/adminReleaseCrypto",
  getAllstakingHistory: "adminapi/getAllstakingHistory",

  //CSV
  get_user_details_csv: "adminapi/get_user_details_csv",
  get_deposit_details_csv: "withdraw/get_deposit_details_csv",
  get_withdraw_details_csv: "withdraw/get_all_user_withdraw_csv",
  getActiveOrders_csv: "adminapi/getActiveOrders_csv",
  getOrdersHistory_csv: "adminapi/getOrdersHistory_csv",
  getCancelOrdersHistory_csv: "adminapi/getCancelOrdersHistory_csv",

  //FAQ
  faq_create_update: "adminapi/faq_create_update",
  deleteFaq: "adminapi/deleteFaq",
  getFaq: "adminapi/getFaq",
  faq_getFaq_One: "adminapi/faq_getFaq_One",

  //SUB ADMIN

  subadmin_list: "adminapi/subadmin_list",
  subadmin_get: "adminapi/subadmin_get",
  deletesubadmindetail: "adminapi/deletesubadmindetail",
  subadmin_update: "adminapi/subadmin_update",
  get_oneAdmin: "adminapi/get_oneAdmin",
  getAdmin: "adminapi/getAdmin",

  getAdminChat: "adminapi/getAdminChat",
  submitChatAdmin: "adminapi/submitChatAdmin",
  resolved: "adminapi/resolved",
  adminReleaseCrypto: "adminapi/adminReleaseCrypto",
  getAllstakingHistory: "adminapi/getAllstakingHistory",
  //SUB ADMIN

  // NOTES
  notes_get: "adminapi/notes_get",
  notes_list: "adminapi/notes_list",
  deletenotesdetail: "adminapi/deletenotesdetail",
  notes_update: "adminapi/notes_update",

  getKyclistCSV: "adminapi/getKyclistCSV",
  create_adminWallet: "adminapi/create_adminWallet",

  nameUpdate: "adminapi/nameUpdate",

  // markets

  market_get: "market/getMarket",
  market_list: "market/getCombinedAllMarkets",
  market_update: "market/UpdateMarket",
  market_create: "market/createMarket",
  submitUMAAssertion: "user/submitUMAAssertion",

  market_delete: "market/combineDeleteMarket",

  // Events

  events_get: "event/getEvent",
  events_list: "event/getAllEvents",
  events_delete: "event/deleteEvent",
  events_update: "event/updateEvent",
  events_create: "event/createEvent",

  //New
  
  get_all_user_deposit: "depositList",
  get_all_user_withdraw:"withdrawList",
  deletecurrency: "deletecurrency",
  allCurrencyListCrypto: "allCurrencyListCrypto",
  currencyAddUpdate: "currencyAddUpdate",
  viewOneCurrency: "viewOneCurrency",
};

export default service;
