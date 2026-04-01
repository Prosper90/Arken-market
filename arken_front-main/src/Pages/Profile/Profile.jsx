import React, { useEffect, useState } from "react";
import "./profile.css";
import { moderateScale } from "../../utils/Scale";
import ImageComponent from "../../Components/ImageComponent";
import BottomTab from "../BottomTab/BottomTab";
import profile_img from "../../assets/image/profile_img.webp";
import logos_telegram from "../../assets/image/logos_telegram.webp";
import nodatafound from "../../assets/image/nodatafound.webp";
import apiService from "../../core/sevice/detail";
import { postMethod, getMethod } from "../../core/sevice/common.api";
import group_iconImg from "../../assets/image/group_iconImg.webp";
import histry_img from "../../assets/image/histry_img.webp";
import { useUserSocket } from "../../hooks/useSocket";
import betAmunt_img from "../../assets/image/betAmunt_img.webp";
import balnc_mesImg from "../../assets/image/balnc_mesImg.webp";
import cup_img2 from "../../assets/image/cup_img2.webp";

import { GoArrowUpRight } from "react-icons/go";
import { profileCardDetail, profileTabContent, profileTeamGroup } from "./data";
import { useTelegramUser } from "../../context/TelegramUserContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { telegramUser } = useTelegramUser();
  const [tabActive, setTabActive] = useState(1);
  const [loadingBets, setLoadingBets] = useState(false);
  const [loadingCashout, setLoadingCashout] = useState(false);
  const [cashoutLoadingId, setCashoutLoadingId] = useState(null);
  const [sellLoadingId, setSellLoadingId] = useState(null);
  const [activeBets, setActiveBets] = useState([]);
  console.log(activeBets, "activeBets==");
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [tabName, setTabName] = useState("Active");
  const [completedBets, setCompletedBets] = useState([]);
  const [loadingCompletedBets, setLoadingCompletedBets] = useState(false);

  const [profileCardData, setProfileCardData] = useState(profileCardDetail);
  const [referralInfo, setReferralInfo] = useState(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const [myMarkets, setMyMarkets] = useState([]);
  const [loadingMyMarkets, setLoadingMyMarkets] = useState(false);
  const [closingMarketId, setClosingMarketId] = useState(null);

  useEffect(() => {
    tabFilter(tabName);
  }, [tabName]);

  useUserSocket(telegramUser?.telegramId, (data) => {
    setActiveBets((prev) =>
      prev.map((p) =>
        p._id === data.predictionId
          ? {
              ...p,
              currentPrice: data.currentPrice,
              unrealizedPnl: data.pnl,
            }
          : p
      )
    );
  });

  const tabFilter = (tabName) => {
    const data = profileCardDetail.filter((item) => {
      if (item.tabTitle === tabName) {
        return item;
      }
      // else if (item.tabTitle === tabName){
      //   return item
      // }
    });
    setProfileCardData(data);
  };

  useEffect(() => {
    getActiveBets();
    getUserProfile();
    getCompletedBets();
    getReferralInfo();
  }, []);

  const getActiveBets = async () => {
    try {
      setLoadingBets(true);

      const telegramUserID = telegramUser?.telegramId;
      // const telegramUserID = Number('1453204703');
      if (!telegramUserID) {
        console.error("Telegram user not found");
        setLoadingBets(false);
        return;
      }

      const data = {
        apiUrl: apiService.activebets,
        payload: { telegramId: telegramUserID },
      };

      const resp = await postMethod(data);

      setLoadingBets(false);

      if (resp.success) {
        setActiveBets(resp.data);
        console.log("Active bets fetched:", resp.data);
      } else {
        console.error(resp.message || "Failed to fetch active bets");
      }
    } catch (error) {
      setLoadingBets(false);
      console.error("Error fetching active bets:", error);
    }
  };
  const handleCashout = async (predictionId) => {
    try {
      setLoadingCashout(true);
      setCashoutLoadingId(predictionId);

      if (!predictionId) {
        console.error("Prediction ID missing");
        setLoadingCashout(false);
        return;
      }

      const data = {
        apiUrl: apiService.exitPrediction,
        payload: {
          predictionId,
        },
      };

      const resp = await postMethod(data);

      setLoadingCashout(false);

      if (resp.status) {
        console.log("Cashout success:", resp.data);
        toast.success("Cashout successfully");
        getActiveBets();
        getCompletedBets();
      } else {
        console.error(resp.Message || "Cashout failed");
      }

      setCashoutLoadingId(null);
    } catch (error) {
      setLoadingCashout(false);
      setCashoutLoadingId(null);
      console.error("Cashout error:", error);
    }
  };

  const getCompletedBets = async () => {
    try {
      setLoadingCompletedBets(true);

      const telegramUserID = telegramUser?.telegramId;
      // const telegramUserID = Number("1453204703");
      if (!telegramUserID) {
        console.error("Telegram user not found");
        setLoadingCompletedBets(false);
        return;
      }

      const data = {
        apiUrl: apiService.completedbets,
        payload: { telegramId: telegramUserID },
      };

      const resp = await postMethod(data);

      setLoadingCompletedBets(false);

      if (resp.success) {
        setCompletedBets(resp.data);
        console.log("Completed bets fetched:", resp.data);
      } else {
        console.error(resp.message || "Failed to fetch completed bets");
      }
    } catch (error) {
      setLoadingCompletedBets(false);
      console.error("Error fetching completed bets:", error);
    }
  };

  const getUserProfile = async () => {
    try {
      setLoadingProfile(true);

      const telegramUserID = telegramUser?.telegramId;
      // const telegramUserID = Number("1453204703");

      if (!telegramUserID) {
        console.error("Telegram user not found");
        setLoadingProfile(false);
        return;
      }

      const data = {
        apiUrl: apiService.getUserProfile,
        payload: { telegramId: telegramUserID },
      };

      const resp = await postMethod(data);

      setLoadingProfile(false);

      if (resp.success) {
        setUserProfile(resp.data);
        console.log("User profile fetched:", resp.data);
      } else {
        console.error(resp.message || "Failed to fetch user profile");
      }
    } catch (error) {
      setLoadingProfile(false);
      console.error("Error fetching user profile:", error);
    }
  };

  const getReferralInfo = async () => {
    try {
      setLoadingReferral(true);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) { setLoadingReferral(false); return; }
      const data = {
        apiUrl: apiService.getReferralInfo,
        payload: { telegramId: telegramUserID },
      };
      const resp = await postMethod(data);
      setLoadingReferral(false);
      if (resp.success) {
        setReferralInfo(resp.data);
      }
    } catch (error) {
      setLoadingReferral(false);
      console.error("Error fetching referral info:", error);
    }
  };

  const handleSellPosition = async (predictionId) => {
    try {
      setSellLoadingId(predictionId);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;

      const resp = await postMethod({
        apiUrl: apiService.sellPosition,
        payload: { telegramId: telegramUserID, predictionId },
      });

      setSellLoadingId(null);
      if (resp.status || resp.success) {
        const payout = resp.payout?.toFixed(4) ?? "0";
        toast.success(`Sold! You received $${payout} USDT`);
        getActiveBets();
        getCompletedBets();
      } else {
        toast.error(resp.message || "Failed to sell position");
      }
    } catch (error) {
      setSellLoadingId(null);
      toast.error("Error selling position");
      console.error("Sell error:", error);
    }
  };

  const getMyMarkets = async () => {
    try {
      setLoadingMyMarkets(true);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) { setLoadingMyMarkets(false); return; }
      const resp = await postMethod({
        apiUrl: apiService.mymarkets,
        payload: { telegramId: telegramUserID },
      });
      setLoadingMyMarkets(false);
      if (resp.success) {
        setMyMarkets(resp.data);
      }
    } catch (error) {
      setLoadingMyMarkets(false);
      console.error("Error fetching my markets:", error);
    }
  };

  const handleCloseMarket = async (marketId) => {
    try {
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      setClosingMarketId(marketId);
      const resp = await postMethod({
        apiUrl: apiService.closeMarket,
        payload: { telegramId: telegramUserID, marketId },
      });
      setClosingMarketId(null);
      if (resp.success) {
        setMyMarkets((prev) =>
          prev.map((m) =>
            m._id === marketId ? { ...m, marketStatus: "closed" } : m
          )
        );
      }
    } catch (error) {
      setClosingMarketId(null);
      console.error("Error closing market:", error);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(""), 2000);
    });
  };

  return (
    <div
      className="cmmn_bdy_mainwrp prf_bdy_mainwrp"
      style={pageStyle.prf_bdy_mainwrp}
    >
      <div className="prfl_bdy_cntWrp" style={pageStyle.prfl_bdy_cntWrp}>
        <div className="prfl_top_cntWrp" style={pageStyle.prfl_top_cntWrp}>
          <ImageComponent
            styles={pageStyle.wllt_top_img}
            imgPic={profile_img}
            alt="profile_img"
          />
          <div className="prfl_top_cnt" style={pageStyle.prfl_top_cnt}>
            <h5 style={pageStyle.prfl_top_cntHead}>
              {userProfile && userProfile.firstName
                ? userProfile.firstName
                : ""}
            </h5>

            <div className="image_para_profile">
              <ImageComponent
                styles={pageStyle.edit_imgnewone}
                imgPic={logos_telegram}
                alt="telegram_icon"
              />
              <p
                style={pageStyle.prfl_top_cntPara}
                className="prfl_top_cntPara"
              >
                {userProfile && userProfile.username
                  ? `@${userProfile.username}`
                  : ""}
              </p>
            </div>
          </div>

          {/* <span>
            <ImageComponent styles={pageStyle.edit_img} imgPic={edit_img} alt="edit_img" />
          </span> */}
        </div>

        {/* <div className='prfl_grop_cntWrp' style={pageStyle.prfl_grop_cntWrp}>
          <h5 className='prfl_grop_cnt' style={pageStyle.prfl_grop_cnt}>
            <ImageComponent styles={pageStyle.group_iconImg} imgPic={group_iconImg} alt="group_iconImg" />
            <span>My Groups</span>
          </h5>

          <div className='prfl_grop_row' style={pageStyle.prfl_grop_row}>
            {
              profileTeamGroup.map((item, index) => {
                return (
                  <div key={index} className='prfl_grop_col' style={pageStyle.prfl_grop_col}>
                    <ImageComponent styles={pageStyle.group_teamImg} imgPic={item.img} alt="group_teamImg" />
                    <h6 style={pageStyle.group_teamHead}>{item.groupName}</h6>
                    <span className='group_teamIcon'>
                      <GoArrowUpRight style={pageStyle.group_teamIcon} />
                    </span>
                  </div>
                )
              })
            }
          </div>
        </div> */}
        <div className="prfl_grop_cntWrp" style={pageStyle.prfl_grop_cntWrp}>
          <div className="prfl_betHst_wrp" style={pageStyle.prfl_betHst_wrp}>
            <div className="prfl_Hst_topWrp" style={pageStyle.prfl_Hst_topWrp}>
              <ImageComponent
                styles={pageStyle.histry_img}
                imgPic={histry_img}
                alt="histry_img"
              />
              <span style={pageStyle.prfl_Hst_topCnt}>Bet History</span>
            </div>

            <div className="profl_tab_main" style={pageStyle.profl_tab_main}>
              <ul
                className="nav mb-3 proflchat_tab_wrp profl_tab_wrp"
                style={pageStyle.profl_tab_wrp}
                id="pills-tab"
                role="tablist"
              >
                {profileTabContent.map((item, i) => {
                  return (
                    <li
                      key={i}
                      onClick={() => {
                        setTabActive(item.id);
                        tabFilter(item.tabTitle);
                        setTabName(item.tabTitle);
                        getActiveBets();
                        getCompletedBets();
                        if (item.tabTitle === "My Markets") getMyMarkets();
                      }}
                      role="presentation"
                    >
                      <button
                        className={`${
                          tabActive == item.id ? "active" : ""
                        } profl_tab_btn`}
                        id={`pills-${item.tabTitle}-tab`}
                        data-bs-toggle="pill"
                        data-bs-target={`#pills-${item.tabTitle}`}
                        type="button"
                        role="tab"
                        aria-controls={`pills-${item.tabTitle}`}
                        aria-selected="true"
                        style={pageStyle.profl_tab_btn}
                      >
                        {item.tabTitle}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div
                className="tab-content profl_tab_content"
                style={pageStyle.profl_tab_content}
                id="pills-tabContent"
              >
                {profileTabContent.map((tabItem, i) => {
                  return (
                    <div
                      key={i}
                      className={`tab-pane fade profl_tab_contpane ${
                        tabActive == tabItem.id ? "show active" : ""
                      }`}
                      id={`pills-${tabItem.tabTitle}`}
                      role="tabpanel"
                      aria-labelledby={`pills-${tabItem.tabTitle}-tab`}
                      tabIndex="0"
                    >
                      {tabItem.tabTitle === "Referral" ? (
                        <div style={{ padding: `${moderateScale(4)}px 0` }}>
                          {loadingReferral ? (
                            <div style={{ textAlign: "center", padding: `${moderateScale(20)}px` }}>Loading...</div>
                          ) : referralInfo ? (
                            <>
                              <div className="profl_tab_itm" style={{ ...pageStyle.profl_tab_itm, marginBottom: `${moderateScale(12)}px` }}>
                                <h6 style={{ ...pageStyle.prfl_tab_CountHed, fontSize: `${moderateScale(11)}px`, marginBottom: `${moderateScale(6)}px` }}>Your Referral Code</h6>
                                <div style={{ display: "flex", alignItems: "center", gap: `${moderateScale(8)}px` }}>
                                  <p style={{ ...pageStyle.prfl_tab_CountPara, fontWeight: "600", letterSpacing: "1px", margin: 0 }}>
                                    {referralInfo.referralCode || "—"}
                                  </p>
                                  {referralInfo.referralCode && (
                                    <span
                                      onClick={() => copyToClipboard(referralInfo.referralCode, "code")}
                                      style={{ cursor: "pointer", fontSize: `${moderateScale(11)}px`, color: "#4fa3ff" }}
                                    >
                                      {copySuccess === "code" ? "Copied!" : "Copy"}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {referralInfo.referralLink && (
                                <div className="profl_tab_itm" style={{ ...pageStyle.profl_tab_itm, marginBottom: `${moderateScale(12)}px` }}>
                                  <h6 style={{ ...pageStyle.prfl_tab_CountHed, fontSize: `${moderateScale(11)}px`, marginBottom: `${moderateScale(6)}px` }}>Referral Link</h6>
                                  <div style={{ display: "flex", alignItems: "center", gap: `${moderateScale(8)}px` }}>
                                    <p style={{ ...pageStyle.prfl_tab_CountPara, margin: 0, wordBreak: "break-all", flex: 1 }}>
                                      {referralInfo.referralLink}
                                    </p>
                                    <span
                                      onClick={() => copyToClipboard(referralInfo.referralLink, "link")}
                                      style={{ cursor: "pointer", fontSize: `${moderateScale(11)}px`, color: "#4fa3ff", whiteSpace: "nowrap" }}
                                    >
                                      {copySuccess === "link" ? "Copied!" : "Copy"}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="profl_tab_itm" style={{ ...pageStyle.profl_tab_itm, marginBottom: `${moderateScale(12)}px` }}>
                                <h6 style={{ ...pageStyle.prfl_tab_CountHed, fontSize: `${moderateScale(11)}px`, marginBottom: `${moderateScale(6)}px` }}>Referral Earnings</h6>
                                <p style={{ ...pageStyle.prfl_tab_CountPara, fontWeight: "600", color: "#34C759", margin: 0 }}>
                                  {Number(referralInfo.referralEarnings || 0).toFixed(4)} USDC
                                </p>
                              </div>

                              <div className="profl_tab_itm" style={pageStyle.profl_tab_itm}>
                                <h6 style={{ ...pageStyle.prfl_tab_CountHed, fontSize: `${moderateScale(11)}px`, marginBottom: `${moderateScale(10)}px` }}>
                                  Downlines ({referralInfo.downlineCount || 0})
                                </h6>
                                {referralInfo.downlines && referralInfo.downlines.length > 0 ? (
                                  referralInfo.downlines.map((dl, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${moderateScale(8)}px 0`, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                      <div>
                                        <p style={{ ...pageStyle.prfl_tab_CountPara, margin: 0 }}>User #{dl.referredUserId}</p>
                                        <p style={{ fontSize: `${moderateScale(10)}px`, color: "#888", margin: 0 }}>{dl.source} · {new Date(dl.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      <p style={{ ...pageStyle.prfl_tab_CountPara, color: "#34C759", margin: 0 }}>
                                        +{Number(dl.totalEarned || 0).toFixed(4)}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p style={{ ...pageStyle.prfl_tab_CountPara, color: "#888" }}>No referrals yet. Share your link to earn!</p>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="cmmn_tbl_noData">
                              <ImageComponent imgPic={nodatafound} alt="no referral" styles={pageStyle.home_tab_leftimgnodata} />
                            </div>
                          )}
                        </div>
                      ) : tabItem.tabTitle === "Active" ? (
                        <div
                          className="profl_tab_row"
                          style={pageStyle.profl_tab_row}
                        >
                          {loadingBets ? (
                            Array.from({ length: 3 }).map((_, index) => (
                              <div
                                key={index}
                                className="profl_tab_itm skeleton"
                                style={pageStyle.profl_tab_itm}
                              >
                                <h6 className="prfl_tab_itmHead skeleton-line w-80"></h6>

                                <div className="prfl_tab_itmBdgWrp">
                                  <span className="prfl_tab_itmBdg skeleton-pill"></span>
                                  <span className="prfl_tab_itmBdg skeleton-pill"></span>
                                </div>

                                <div className="prfl_tab_CountWrp">
                                  <div className="prfl_tab_Countitm">
                                    <h6 className="prfl_tab_CountHed skeleton-line w-60"></h6>
                                    <p className="prfl_tab_CountPara skeleton-line w-40"></p>
                                  </div>

                                  <div className="prfl_tab_Countitm">
                                    <h6 className="prfl_tab_CountHed skeleton-line w-50"></h6>
                                    <p className="prfl_tab_CountPara skeleton-line w-30"></p>
                                  </div>

                                  <div className="prfl_tab_Countitm">
                                    <h6 className="prfl_tab_CountHed skeleton-line w-70"></h6>
                                    <p className="prfl_tab_CountPara skeleton-line w-50"></p>
                                  </div>
                                </div>

                                <p className="prfl_tab_plcedOn skeleton-line w-45"></p>
                              </div>
                            ))
                          ) : activeBets?.length > 0 ? (
                            activeBets.map((item, index) => (
                              <div
                                key={index}
                                style={pageStyle.profl_tab_itm}
                                className="profl_tab_itm"
                              >
                                <h6
                                  style={pageStyle.prfl_tab_itmHead}
                                  className="prfl_tab_itmHead"
                                >
                                  {item.question}
                                </h6>
                                <div
                                  className="prfl_tab_itmBdgWrp"
                                  style={pageStyle.prfl_tab_itmBdgWrp}
                                >
                                  <div className="prfl_tab_itmexit">
                                    <span
                                      className="prfl_tab_itmBdg pendg_Bdg"
                                      style={pageStyle.prfl_tab_itmBdg}
                                    >
                                      {item.status}
                                    </span>
                                    <span
                                      className={`prfl_tab_itmBdg ${
                                        item.type === "lp"
                                          ? "pendg_Bdg"
                                          : item?.bitSide?.toLocaleLowerCase() === "yes"
                                          ? "pendg_Yes"
                                          : "pendg_No"
                                      }`}
                                      style={pageStyle.prfl_tab_itmBdg}
                                    >
                                      {item.outcomeLabel}
                                    </span>
                                  </div>

                                  {item.type !== "lp" && (
                                    <div>
                                      {item.source === "arken" ? (
                                        <span
                                          onClick={() =>
                                            sellLoadingId === item._id
                                              ? null
                                              : handleSellPosition(item._id)
                                          }
                                          className="prfl_tab_itmexit pendg_Bdg"
                                          style={{
                                            ...pageStyle.prfl_tab_itmBdg,
                                            backgroundColor: "rgba(255,165,0,0.15)",
                                            color: "#FFA500",
                                            cursor: sellLoadingId === item._id ? "not-allowed" : "pointer",
                                          }}
                                        >
                                          {sellLoadingId === item._id
                                            ? "Selling..."
                                            : "Sell"}
                                        </span>
                                      ) : (
                                        <span
                                          onClick={() =>
                                            cashoutLoadingId === item._id
                                              ? null
                                              : handleCashout(item._id)
                                          }
                                          className="prfl_tab_itmexit pendg_Bdg"
                                          style={pageStyle.prfl_tab_itmBdg}
                                        >
                                          {cashoutLoadingId === item._id
                                            ? "Processing..."
                                            : "Closebet"}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div
                                  className="prfl_tab_CountWrp"
                                  style={pageStyle.prfl_tab_CountWrp}
                                >
                                  <div
                                    className="prfl_tab_Countitm"
                                    style={pageStyle.prfl_tab_Countitm}
                                  >
                                    <h6
                                      style={pageStyle.prfl_tab_CountHed}
                                      className="prfl_tab_CountHed"
                                    >
                                      <ImageComponent
                                        styles={pageStyle.prfl_tab_Countimg}
                                        imgPic={betAmunt_img}
                                        alt="betAmunt_img"
                                      />
                                      {item.type === "lp" ? "LP Amount" : "Bet Amount"}
                                    </h6>
                                    <p
                                      style={pageStyle.prfl_tab_CountPara}
                                      className="prfl_tab_CountPara"
                                    >
                                      {item.amount + " USDC"}
                                    </p>
                                  </div>
                                  {item.type !== "lp" && (
                                    <>
                                      <div
                                        className="prfl_tab_Countitm"
                                        style={pageStyle.prfl_tab_Countitm}
                                      >
                                        <h6
                                          style={pageStyle.prfl_tab_CountHed}
                                          className="prfl_tab_CountHed"
                                        >
                                          <ImageComponent
                                            styles={pageStyle.prfl_tab_Countimg}
                                            imgPic={balnc_mesImg}
                                            alt="balnc_mesImg"
                                          />
                                          PNL
                                        </h6>
                                        <p
                                          style={pageStyle.prfl_tab_CountPara}
                                          className="prfl_tab_CountPara"
                                        >
                                          {Number(item.unrealizedPnl).toFixed(6) ?? "0.00"}
                                        </p>
                                      </div>
                                      <div
                                        className="prfl_tab_Countitm"
                                        style={pageStyle.prfl_tab_Countitm}
                                      >
                                        <h6
                                          style={pageStyle.prfl_tab_CountHed}
                                          className="prfl_tab_CountHed"
                                        >
                                          <ImageComponent
                                            styles={pageStyle.prfl_tab_Countimg}
                                            imgPic={cup_img2}
                                            alt="cup_img2"
                                          />
                                          Potential Win
                                        </h6>
                                        <p
                                          style={pageStyle.prfl_tab_CountPara}
                                          className="prfl_tab_CountPara poten_win"
                                        >
                                          {item.potentialPayout.toFixed(6)}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                                <p
                                  style={pageStyle.prfl_tab_plcedOn}
                                  className="prfl_tab_plcedOn"
                                >
                                  {item.type === "lp" ? "Added on" : "Placed on"}{" "}
                                  {new Date(item.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="cmmn_tbl_noData">
                              <ImageComponent
                                imgPic={nodatafound}
                                alt="market"
                                styles={pageStyle.home_tab_leftimgnodata}
                              />
                            </div>
                          )}
                        </div>
                      ) : tabItem.tabTitle === "History" ? (
                        <div
                          className="profl_tab_row"
                          style={pageStyle.profl_tab_row}
                        >
                          {completedBets?.length > 0 ? (
                            completedBets.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  style={pageStyle.profl_tab_itm}
                                  className="profl_tab_itm"
                                >
                                  <h6
                                    style={pageStyle.prfl_tab_itmHead}
                                    className="prfl_tab_itmHead"
                                  >
                                    {item.question}
                                  </h6>
                                  <div
                                    className="prfl_tab_itmBdgWrp"
                                    style={pageStyle.prfl_tab_itmBdgWrp}
                                  >
                                    <span
                                      className={`prfl_tab_itmBdg ${
                                        item?.bitSide?.toLocaleLowerCase() ===
                                        "yes"
                                          ? "pendg_Yes"
                                          : "pendg_No"
                                      }`}
                                      style={pageStyle.prfl_tab_itmBdg}
                                    >
                                      {item.resolvedOutcome ?? "Closed"}
                                    </span>
                                  </div>
                                  <div
                                    className="prfl_tab_CountWrp prfl_histrytab_CountWrp"
                                    style={pageStyle.prfl_tab_CountWrp}
                                  >
                                    <div
                                      className="prfl_tab_Countitm"
                                      style={pageStyle.prfl_tab_Countitm}
                                    >
                                      <h6
                                        style={pageStyle.prfl_tab_CountHed}
                                        className="prfl_tab_CountHed"
                                      >
                                        <ImageComponent
                                          styles={pageStyle.prfl_tab_Countimg}
                                          imgPic={betAmunt_img}
                                          alt="betAmunt_img"
                                        />
                                        Bet Amount
                                      </h6>
                                      <p
                                        style={pageStyle.prfl_tab_CountPara}
                                        className="prfl_tab_CountPara"
                                      >
                                        {/* {item.amount} {item.currency} */}
                                        {item.amount} {'USDC'}
                                      </p>
                                    </div>
                                    <div
                                      className="prfl_tab_Countitm"
                                      style={pageStyle.prfl_tab_Countitm}
                                    >
                                      <h6
                                        style={pageStyle.prfl_tab_CountHed}
                                        className="prfl_tab_CountHed"
                                      >
                                        <ImageComponent
                                          styles={pageStyle.prfl_tab_Countimg}
                                          imgPic={balnc_mesImg}
                                          alt="balnc_mesImg"
                                        />
                                        Odds
                                      </h6>
                                      <p
                                        style={pageStyle.prfl_tab_CountPara}
                                        className="prfl_tab_CountPara"
                                      >
                                        {item.odds}
                                      </p>
                                    </div>
                                    <h6
                                      style={{
                                        ...pageStyle.prfl_tab_WinngAmnt,
                                        color:
                                          item.status === "WON" ||
                                          item.status === "CLOSED"
                                            ? "#34C759"
                                            : "#FF383C",
                                      }}
                                      className="prfl_tab_WinngAmnt"
                                    >
                                      Winnings:{" "}
                                      {item.status === "WON" ||
                                      item.status === "CLOSED"
                                        ? item.finalPayout?.toFixed(6)
                                        : "0"}
                                    </h6>
                                  </div>
                                  <p
                                    style={pageStyle.prfl_tab_plcedOn}
                                    className="prfl_tab_plcedOn"
                                  >
                                    Resolved:{" "}
                                    {new Date(item.settledAt).toLocaleString()}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="cmmn_tbl_noData">
                              <ImageComponent
                                imgPic={nodatafound}
                                alt="market"
                                styles={pageStyle.home_tab_leftimgnodata}
                              />
                            </div>
                          )}
                        </div>
                      ) : tabItem.tabTitle === "My Markets" ? (
                        <div
                          className="profl_tab_row"
                          style={pageStyle.profl_tab_row}
                        >
                          {loadingMyMarkets ? (
                            <div style={{ textAlign: "center", padding: `${moderateScale(20)}px` }}>Loading...</div>
                          ) : myMarkets?.length > 0 ? (
                            myMarkets.map((item, index) => (
                              <div key={index} className="profl_tab_itm" style={pageStyle.profl_tab_itm}>
                                <h6 className="prfl_tab_itmHead" style={pageStyle.prfl_tab_itmHead}>
                                  {item.question}
                                </h6>
                                <div className="prfl_tab_itmBdgWrp" style={pageStyle.prfl_tab_itmBdgWrp}>
                                  <span className={`prfl_tab_itmBdg ${item.marketStatus === 'active' ? 'actv_Bdg' : item.marketStatus === 'resolved' ? 'cmplt_Bdg' : 'pendg_Bdg'}`} style={pageStyle.prfl_tab_itmBdg}>
                                    {item.marketStatus}
                                  </span>
                                  <span className="prfl_tab_itmBdg" style={pageStyle.prfl_tab_itmBdg}>
                                    {item.oracleType}
                                  </span>
                                </div>
                                <p className="prfl_tab_plcedOn" style={pageStyle.prfl_tab_plcedOn}>
                                  Ends: {item.endDate ? new Date(item.endDate).toLocaleDateString() : "—"}
                                </p>
                                {item.marketStatus === "active" && (
                                  <button
                                    style={pageStyle.closeMarketBtn}
                                    disabled={closingMarketId === item._id}
                                    onClick={() => handleCloseMarket(item._id)}
                                  >
                                    {closingMarketId === item._id ? "Closing..." : "Close Market"}
                                  </button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="cmmn_tbl_noData">
                              <ImageComponent
                                imgPic={nodatafound}
                                alt="no markets"
                                styles={pageStyle.home_tab_leftimgnodata}
                              />
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomTab tabAct={4} />
    </div>
  );
};

const pageStyle = {
  prf_bdy_mainwrp: {
    padding: `${moderateScale(20)}px ${moderateScale(20)}px ${moderateScale(
      50
    )}px `,
  },
  prfl_top_cntWrp: {
    padding: `${moderateScale(20)}px ${moderateScale(27)}px`,
    gap: `${moderateScale(11)}px`,
  },
  wllt_top_img: {
    width: `${moderateScale(60)}px`,
    height: `${moderateScale(60)}px`,
  },
  prfl_top_cnt: {
    gap: `${moderateScale(5)}px`,
    marginTop: `${moderateScale(7)}px`,
  },
  prfl_top_cntHead: {
    fontSize: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(4)}px`,
  },
  prfl_top_cntPara: {
    fontSize: `${moderateScale(12)}px`,
    marginBottom: `${moderateScale(0)}px`,
  },
  edit_img: {
    width: `${moderateScale(20)}px`,
    height: `${moderateScale(20)}px`,
  },
  edit_imgnewone: {
    width: `${moderateScale(15)}px`,
    height: `${moderateScale(15)}px`,
  },
  prfl_grop_cntWrp: {
    // padding: `${moderateScale(18)}px ${moderateScale(16)}px`,
    margin: `${moderateScale(24)}px ${moderateScale(0)}px`,
  },
  prfl_grop_cnt: {
    fontSize: `${moderateScale(14)}px`,
    gap: `${moderateScale(7)}px`,
  },
  group_iconImg: {
    width: `${moderateScale(22)}px`,
    height: `${moderateScale(22)}px`,
  },
  prfl_grop_row: {
    gap: `${moderateScale(12)}px`,
    marginTop: `${moderateScale(18)}px`,
  },
  prfl_grop_col: {
    gap: `${moderateScale(15)}px`,
    padding: `${moderateScale(10)}px ${moderateScale(12)}px`,
  },
  group_teamImg: {
    width: `${moderateScale(40)}px`,
    height: `${moderateScale(40)}px`,
  },
  group_teamHead: {
    fontSize: `${moderateScale(14)}px`,
  },
  group_teamIcon: {
    fontSize: `${moderateScale(20)}px`,
  },
  prfl_betHst_wrp: {
    padding: `${moderateScale(16)}px ${moderateScale(16)}px ${moderateScale(
      110
    )}px`,
  },
  home_tab_leftimgnodata: {
    width: `${moderateScale(120)}px`,
    height: `${moderateScale(120)}px`,
  },
  prfl_Hst_topWrp: {
    paddingBottom: `${moderateScale(19)}px`,
    gap: `${moderateScale(7)}px`,
  },
  histry_img: {
    width: `${moderateScale(22)}px`,
    height: `${moderateScale(22)}px`,
  },
  prfl_Hst_topCnt: {
    fontSize: `${moderateScale(14)}px`,
  },
  profl_tab_main: {
    marginTop: `${moderateScale(24)}px`,
  },
  profl_tab_btn: {
    padding: `${moderateScale(10)}px ${moderateScale(0)}px`,
  },
  profl_tab_content: {
    marginTop: `${moderateScale(24)}px`,
  },
  profl_tab_row: {
    gap: `${moderateScale(20)}px`,
  },
  profl_tab_itm: {
    padding: `${moderateScale(16)}px ${moderateScale(16)}px ${moderateScale(
      22
    )}px`,
  },
  prfl_tab_itmHead: {
    fontSize: `${moderateScale(14)}px`,
  },
  prfl_tab_itmBdgWrp: {
    marginTop: `${moderateScale(12)}px`,
    marginBottom: `${moderateScale(17)}px`,
    gap: `${moderateScale(7)}px`,
  },
  prfl_tab_itmBdg: {
    padding: `${moderateScale(5)}px ${moderateScale(10)}px`,
    fontSize: `${moderateScale(11)}px`,
  },
  closeMarketBtn: {
    marginTop: `${moderateScale(10)}px`,
    padding: `${moderateScale(6)}px ${moderateScale(14)}px`,
    fontSize: `${moderateScale(11)}px`,
    background: "#FF383C",
    color: "#fff",
    border: "none",
    borderRadius: `${moderateScale(6)}px`,
    cursor: "pointer",
    opacity: 1,
  },
  prfl_tab_CountWrp: {
    gap: `${moderateScale(10)}px`,
    marginTop: `${moderateScale(0)}px`,
    marginBottom: `${moderateScale(10)}px`,
    padding: `${moderateScale(0)}px ${moderateScale(0)}px ${moderateScale(
      16
    )}px`,
  },
  prfl_tab_CountHed: {
    fontSize: `${moderateScale(10)}px`,
    marginBottom: `${moderateScale(6)}px`,
    gap: `${moderateScale(5)}px`,
  },
  prfl_tab_CountPara: {
    fontSize: `${moderateScale(11)}px`,
  },
  prfl_tab_Countimg: {
    width: `${moderateScale(18)}px`,
    hight: `${moderateScale(18)}px`,
  },
  prfl_tab_plcedOn: {
    fontSize: `${moderateScale(11)}px`,
    gap: `${moderateScale(6)}px`,
  },
  prfl_tab_WinngAmnt: {
    fontSize: `${moderateScale(16)}px`,
    gap: `${moderateScale(6)}px`,
    marginTop: `${moderateScale(0)}px`,
  },
  cmmn_tbl_noTxt: {
    fontSize: `${moderateScale(15)}px`,
  },
};

export default Profile;
