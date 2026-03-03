import React, { useState, useEffect } from "react";
import { moderateScale } from "../../utils/Scale";
import ImageComponent from "../../Components/ImageComponent";
import BottomTab from "../BottomTab/BottomTab";
import wllt_top_img from "../../assets/image/wllt_top_img.webp";
import wllt_img from "../../assets/image/wllt_img.webp";
import obrd_middl_wllImg1 from "../../assets/image/obrd_middl_wllImg1.webp";
import copy_img from "../../assets/image/copy_img.webp";
import totl_img from "../../assets/image/totl_img.webp";
import trophy_img from "../../assets/image/trophy_img.webp";
import percentage_img from "../../assets/image/percentage_img.webp";
import clock_img from "../../assets/image/clock_img.webp";
import security_img from "../../assets/image/security_img.webp";
import bsc_img from "../../assets/image/bsc_img.webp";
import ethereum_img from "../../assets/image/ethereum_img.webp";
import polygon_img from "../../assets/image/polygon_img.webp";
import arbitrum_img from "../../assets/image/arbitrum_img.webp";
import apiService from "../../core/sevice/detail";
import { postMethod, getMethod } from "../../core/sevice/common.api";
import supptNetwrk_img from "../../assets/image/supptNetwrk_img.webp";
import "./wallet.css";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { IoArrowUpCircleOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTelegramUser } from "../../context/TelegramUserContext";
import walletIMG from "../../assets/image/wllt_img.webp";

const Wallet = () => {
  const navigate = useNavigate();
  const [walletLogo, setWalletLogo] = useState(
    new URL("./../assets/wallet_connect.webp", import.meta.url)
  );
  const [walletName, setWalletName] = useState(localStorage.getItem('walletName'));
  // alert(`localStorage.getItem('walletAddress'):${localStorage.getItem('walletAddress')}`)
  // alert(`localStorage.getItem('walletName'):${localStorage.getItem('walletName')}`)
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('walletAddress'));
  const [activeBets, setActiveBets] = useState([]);
  const { telegramUser } = useTelegramUser();
 const [userWallet, setUserWallet] = useState({
  isConnected: false,
  walletAddress: "",
  walletName: "",
  uniqueId: "",
});
  const [userProfile, setUserProfile] = useState(null);
  const [loadingBets, setLoadingBets] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [LoadingBalance, setLoadingBalance] = useState(false);
  const [UsdtBalance, setUsdtBalance] = useState(0);

  const getUserProfile = async () => {
    try {
      setLoadingProfile(true);

      const telegramUserID = telegramUser.telegramId;
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

  useEffect(() => {
    getUserProfile();
    getActiveBets();
    getUserDetails()
  }, []);

  const showsuccessToast = (message) => {
    toast.dismiss();
    toast.success(message);
  };

  const copy = (text) => {
    toast.success("Wallet ID copied");
    navigator.clipboard.writeText(text);
  };

  const getUserDetails = async () => {
    try {
      if (!telegramUser?.telegramId) return;
  
      const resp = await postMethod({
        apiUrl: apiService.getUserDetails,
        payload: { telegramId: telegramUser.telegramId },
      });
  
      if (resp.success && resp.data) {
        setUserWallet({
          isConnected: resp.data.wallet?.isConnected || false,
          walletAddress: resp.data.wallet?.walletAddress || "",
          walletName: resp.data.wallet?.walletName || "",
          uniqueId: resp.data.uniqueId || "",
        });
        if(resp.data.wallet?.isConnected == true){
          setWalletAddress(resp.data.wallet?.walletAddress )
        }
      } else {
        console.error(resp.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

 useEffect(() => {
  if (userWallet?.isConnected && userWallet.walletName) {
    // setWalletName(userWallet.walletName);
    setWalletAddress(localStorage.getItem("walletAddress"));
    let logoUrl;
    switch (userWallet.walletName) {
      case "metamask":
        logoUrl = new URL("../../assets/image/metamask.png", import.meta.url);
        break;
      case "coinbase":
        logoUrl = new URL("../../assets/image/coinbase.png", import.meta.url);
        break;
      case "trustwallet":
        logoUrl = new URL("../../assets/image/trustwallet.png", import.meta.url);
        break;
      case "walletconnect":
        logoUrl = new URL("../../assets/image/wallet_connect.webp", import.meta.url);
        break;
      case "Phantom":
        logoUrl = new URL("../../assets/image/phantom.webp", import.meta.url);
        break;
      case "Solflare":
        logoUrl = new URL("../../assets/image/solsfare.webp", import.meta.url);
        break;
      default:
        logoUrl = null;
    }
    if (logoUrl) setWalletLogo(logoUrl);
    return; 
  }

  const walletAddress = localStorage.getItem("walletAddress");

  const connectedWallet = localStorage.getItem("walletName");

  if (connectedWallet) {
    setWalletName(connectedWallet);
    setWalletAddress(walletAddress);
    let logoUrl;
    switch (connectedWallet) {
      case "metamask":
        logoUrl = new URL("../../assets/image/metamask.png", import.meta.url);
        break;
      case "coinbase":
        logoUrl = new URL("../../assets/image/coinbase.png", import.meta.url);
        break;
      case "trustwallet":
        logoUrl = new URL("../../assets/image/trustwallet.png", import.meta.url);
        break;
      case "walletconnect":
        logoUrl = new URL("../../assets/image/wallet_connect.webp", import.meta.url);
        break;
      case "phantom":
        logoUrl = new URL("../../assets/image/phantom.webp", import.meta.url);
        break;
      case "solflare":
        logoUrl = new URL("../../assets/image/solsfare.webp", import.meta.url);
        break;
      default:
        logoUrl = null;
    }

    if (logoUrl) setWalletLogo(logoUrl);
  }

    getBalance();

}, [userWallet]);


  const truncateAddress = (address) => {
    if (!address) return "0x015f9711a....18f78";
    return `${address.slice(0, 8)}....${address.slice(-4)}`;
  };

  useEffect(() => {
    getBalance();
  }, [0]);

  const getActiveBets = async () => {
    try {
      setLoadingBets(true);
      const telegramUserID = telegramUser.telegramId;
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

  const getBalance = async () => {
    try {
       const telegramUserID = telegramUser?.telegramId;
      // const telegramUserID = Number("1453204703");
      if (!telegramUserID) {
        console.error("Telegram user not found");
        setLoadingBalance(false);
        return;
      }
      
      const data = {
        apiUrl: apiService.get_user_balance,
        payload: { telegramId: telegramUserID },
      };

      const resp = await postMethod(data);

      setLoadingBalance(false);

      if (resp.success) {
        setUsdtBalance(resp.totalUsdt)
        console.log("Active bets fetched:", resp.data);
      } else {
        console.error(resp.message || "Failed to fetch active bets");
      }
    } catch (error) {
      console.error("Error fetching Wallet balance:", error);
    }
  };

  return (
    <div
      className="cmmn_bdy_mainwrp wllt_bdy_mainwrp"
      style={pageStyle.wllt_bdy_mainwrp}
    >
      <div className="wllt_bdy_cntWrp" style={pageStyle.wllt_bdy_cntWrp}>
        <div className="wllt_top_cntWrp" style={pageStyle.wllt_top_cntWrp}>
          <div className="wllt_top_cnt" style={pageStyle.wllt_top_cnt}>
            <h5 style={pageStyle.wllt_top_cntHead}>Wallet</h5>
            <p style={pageStyle.wllt_top_cntPara}>
              Manage your funds and transactions
            </p>
          </div>
          <ImageComponent
            styles={pageStyle.wllt_top_img}
            imgPic={wllt_top_img}
            alt="wllt_top_img"
          />
        </div>

        <div className="wllt_balnc_cntWrp" style={pageStyle.wllt_balnc_cntWrp}>
          <h6 className="wllt_balnc_cntTp" style={pageStyle.wllt_balnc_cntTp}>
            <ImageComponent
              styles={pageStyle.wllt_img}
              imgPic={wllt_img}
              alt="wllt_img"
            />
            Available Balance
          </h6>
            {LoadingBalance ? (
    <div className="skl skl-number-md" />
  ) : (
    <h3 className="wllt_balnc_amt" style={pageStyle.wllt_balnc_amt}>
      $ {UsdtBalance?UsdtBalance.toFixed(6):0}
    </h3>
  )}
          <div
            className="wllt_balnc_BtnWrp"
            style={pageStyle.wllt_balnc_BtnWrp}
          >
            <button
              className="wllt_balnc_Btn wllt_balnc_BtnDep"
              style={pageStyle.wllt_balnc_Btn}
              onClick={() => navigate("/deposit?tab=deposit")}
            >
              <span>
                <IoArrowDownCircleOutline style={pageStyle.wllt_balnc_BtnArw} />
              </span>
              Deposit
            </button>
            <button
              className="wllt_balnc_Btn wllt_balnc_BtnWdr"
              style={pageStyle.wllt_balnc_Btn}
              onClick={() => navigate("/deposit?tab=withdraw")}
            >
              <span>
                <IoArrowUpCircleOutline style={pageStyle.wllt_balnc_BtnArw} />
              </span>
              Withdraw
            </button>
          </div>

          <div
            className="wllt_balnc_cnntWlltWrp"
            style={pageStyle.wllt_balnc_cnntWlltWrp}
          >
            <h6 style={pageStyle.wllt_balnc_cnntHead}>Connected Wallet</h6>
            <span
              style={pageStyle.wllt_balnc_cnntBadge}
              className="wllt_balnc_cnntBadge"
            >
              {walletName =="newwallet" ?(<ImageComponent
                  styles={pageStyle.wllt_balnc_img}
                  imgPic={ new URL("../../assets/image/wllt_img.webp", import.meta.url)}
                  alt="wallet_logo"
                />):(
                <ImageComponent
                  styles={pageStyle.wllt_balnc_img}
                  imgPic={walletLogo}
                  alt="wallet_logo"
                />
              )
              }
              {walletName 
                ?walletName =="newwallet"?"Own Wallet": walletName.charAt(0).toUpperCase() + walletName.slice(1)
                : "MetaMask"}
            </span>

            <div className="wallet_id_Wrp" style={pageStyle.wallet_id_Wrp}>
              <div className="wallet_id" style={pageStyle.wallet_id}>
                <span>{truncateAddress(walletAddress)}</span>
              </div>
              <span
                className="wallet_id_Icon"
                style={pageStyle.wallet_id_Icon}
                onClick={() => copy(walletAddress)}
              >
                <ImageComponent
                  styles={pageStyle.copy_img}
                  imgPic={copy_img}
                  alt="copy_img"
                />
              </span>
            </div>
          </div>
        </div>

        <div className="wllt_winPec_Wrp" style={pageStyle.wllt_winPec_Wrp}>
          <div className="wllt_winPec_Itm" style={pageStyle.wllt_winPec_Itm}>
            <h6 style={pageStyle.wllt_win_ItmHead}>
              <ImageComponent
                styles={pageStyle.wllt_win_ItmImg}
                imgPic={totl_img}
                alt="totl_img"
              />
              <span>Total Bets</span>
            </h6>

            {loadingProfile ? (
    <div className="skl skl-number-sm" />
  ) : (
    <h4 style={pageStyle.wllt_win_ItmValue}>
              {userProfile && userProfile.totalPredictions
                ? userProfile.totalPredictions
                : 0}
            </h4>
  )}

           
          </div>
          <div className="wllt_winPec_Itm" style={pageStyle.wllt_winPec_Itm}>
            <h6 style={pageStyle.wllt_win_ItmHead}>
              <ImageComponent
                styles={pageStyle.wllt_win_ItmImg}
                imgPic={trophy_img}
                alt="trophy_img"
              />
              <span>Total Winnings</span>
            </h6>
             {loadingProfile ? (
    <div className="skl skl-number-sm" />
  ) : (
     <h4 style={pageStyle.wllt_win_ItmValue}>
              {userProfile && userProfile.totalWins ? userProfile.totalWins : 0}
            </h4>
  )}
           
          </div>
          <div className="wllt_winPec_Itm" style={pageStyle.wllt_winPec_Itm}>
            <h6 style={pageStyle.wllt_win_ItmHead}>
              <ImageComponent
                styles={pageStyle.wllt_win_ItmImg}
                imgPic={percentage_img}
                alt="percentage_img"
              />
              <span>Win Rate</span>
            </h6>
             {loadingProfile ? (
    <div className="skl skl-number-sm" />
  ) : (
     <h4 style={pageStyle.wllt_win_ItmValue}>
              {userProfile && userProfile.winRate
                ? `${Number(userProfile.winRate).toFixed(2)}%`
                : "0%"}
            </h4>
  )}
           
          </div>
          <div className="wllt_winPec_Itm" style={pageStyle.wllt_winPec_Itm}>
            <h6 style={pageStyle.wllt_win_ItmHead}>
              <ImageComponent
                styles={pageStyle.wllt_win_ItmImg}
                imgPic={clock_img}
                alt="clock_img"
              />
              <span>Active Bets</span>
            </h6>
            {loadingProfile ? (
    <div className="skl skl-number-sm" />
  ) : (
     <h4 style={pageStyle.wllt_win_ItmValue}>
              {activeBets && activeBets.length ? activeBets.length : "0"}
            </h4>
  )}
           
          </div>
        </div>

        <div className="wllt_sectNots_wrp" style={pageStyle.wllt_sectNots_wrp}>
          <ImageComponent
            styles={pageStyle.wllt_sectNots_img}
            imgPic={security_img}
            alt="security_img"
          />
          <h6 style={pageStyle.wllt_sectNots_cnt}>Security Noticies</h6>
          <span className="wllt_sectNots_icon">
            <IoIosArrowForward style={pageStyle.wllt_sectNots_icon} />{" "}
          </span>
        </div>

        <div className="wllt_supp_wrp" style={pageStyle.wllt_supp_wrp}>
          <h6 className="wllt_supp_top" style={pageStyle.wllt_supp_top}>
            <ImageComponent
              styles={pageStyle.wllt_supp_img}
              imgPic={supptNetwrk_img}
              alt="supptNetwrk_img"
            />
            <span style={pageStyle.wllt_supp_cnt}>Supported Networks</span>
          </h6>
          <div className="wllt_supp_row" style={pageStyle.wllt_supp_row}>
            <div className="wllt_supp_col" style={pageStyle.wllt_supp_col}>
              <ImageComponent
                styles={pageStyle.wllt_supp_colimg}
                imgPic={ethereum_img}
                alt="ethereum_img"
              />
              <h6 style={pageStyle.wllt_supp_colCnt}>Ethereum</h6>
            </div>
            <div className="wllt_supp_col" style={pageStyle.wllt_supp_col}>
              <ImageComponent
                styles={pageStyle.wllt_supp_colimg}
                imgPic={polygon_img}
                alt="polygon_img"
              />
              <h6 style={pageStyle.wllt_supp_colCnt}>Polygon</h6>
            </div>
            <div className="wllt_supp_col" style={pageStyle.wllt_supp_col}>
              <ImageComponent
                styles={pageStyle.wllt_supp_colimg}
                imgPic={arbitrum_img}
                alt="arbitrum_img"
              />
              <h6 style={pageStyle.wllt_supp_colCnt}>Arbitrum</h6>
            </div>
            <div className="wllt_supp_col" style={pageStyle.wllt_supp_col}>
              <ImageComponent
                styles={pageStyle.wllt_supp_colimg}
                imgPic={bsc_img}
                alt="bsc_img"
              />
              <h6 style={pageStyle.wllt_supp_colCnt}>BSC</h6>
            </div>
          </div>
        </div>
      </div>

      <BottomTab tabAct={3} />
    </div>
  );
};

const pageStyle = {
  wllt_bdy_mainwrp: {
    padding: `${moderateScale(20)}px ${moderateScale(20)}px ${moderateScale(
      110
    )}px `,
  },
  wllt_top_cntWrp: {
    padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
  },
  wllt_top_img: {
    width: `${moderateScale(41)}px`,
    height: `${moderateScale(41)}px`,
  },
  wllt_top_cnt: {
    gap: `${moderateScale(4)}px`,
  },
  wllt_top_cntHead: {
    fontSize: `${moderateScale(18)}px`,
  },
  wllt_top_cntPara: {
    fontSize: `${moderateScale(12)}px`,
  },
  wllt_balnc_cntWrp: {
    padding: `${moderateScale(22)}px ${moderateScale(20)}px ${moderateScale(
      24
    )}px`,
    margin: `${moderateScale(24)}px ${moderateScale(0)}px ${moderateScale(
      32
    )}px`,
  },
  wllt_balnc_cntTp: {
    fontSize: `${moderateScale(15)}px`,
    gap: `${moderateScale(5)}px`,
    marginBottom: `${moderateScale(15)}px`,
  },
  wllt_img: {
    width: `${moderateScale(28)}px`,
    height: `${moderateScale(28)}px`,
  },
  wllt_balnc_amt: {
    fontSize: `${moderateScale(32)}px`,
  },
  wllt_balnc_BtnWrp: {
    marginTop: `${moderateScale(35)}px`,
    gap: `${moderateScale(16)}px`,
    paddingBottom: `${moderateScale(22)}px`,
    marginBottom: `${moderateScale(24)}px`,
  },
  wllt_balnc_Btn: {
    padding: `${moderateScale(10)}px ${moderateScale(10)}px `,
    fontSize: `${moderateScale(14)}px`,
    gap: `${moderateScale(7)}px`,
  },
  wllt_balnc_BtnArw: {
    fontSize: `${moderateScale(17)}px`,
  },
  wllt_balnc_cnntWlltWrp: {
    padding: `${moderateScale(12)}px ${moderateScale(12)}px ${moderateScale(
      24
    )}px`,
  },
  wllt_balnc_cnntHead: {
    fontSize: `${moderateScale(15)}px`,
    marginBottom: `${moderateScale(12)}px`,
  },
  wllt_balnc_cnntBadge: {
    fontSize: `${moderateScale(12)}px`,
    gap: `${moderateScale(5)}px`,
    padding: `${moderateScale(3)}px ${moderateScale(6)}px`,
  },
  wllt_balnc_img: {
    width: `${moderateScale(20)}px`,
    height: `${moderateScale(20)}px`,
  },
  wallet_id_Wrp: {
    marginTop: `${moderateScale(13)}px`,
    gap: `${moderateScale(10)}px`,
  },
  wallet_id: {
    padding: `${moderateScale(10)}px ${moderateScale(12)}px`,
    fontSize: `${moderateScale(14)}px`,
  },
  wallet_id_Icon: {
    padding: `${moderateScale(8)}px ${moderateScale(8)}px`,
    width: `${moderateScale(40)}px`,
    height: `${moderateScale(40)}px`,
  },
  copy_img: {
    width: `${moderateScale(24)}px`,
    height: `${moderateScale(24)}px`,
  },
  wllt_winPec_Wrp: {
    gap: `${moderateScale(20)}px`,
    margin: `${moderateScale(32)}px ${moderateScale(0)}px ${moderateScale(
      32
    )}px`,
  },
  wllt_winPec_Itm: {
    gap: `${moderateScale(20)}px`,
    padding: `${moderateScale(20)}px ${moderateScale(15)}px ${moderateScale(
      28
    )}px`,
    // width: `calc(${moderateScale(50)}% - (${moderateScale(20)}px / 2) )`,
    width: `calc(50% - (${moderateScale(20)}px / 2) )`,
  },
  wllt_win_ItmHead: {
    fontSize: `${moderateScale(14)}px`,
    gap: `${moderateScale(8)}px`,
  },
  wllt_win_ItmImg: {
    width: `${moderateScale(17)}px`,
    height: `${moderateScale(17)}px`,
  },
  wllt_win_ItmValue: {
    fontSize: `${moderateScale(20)}px`,
  },
  wllt_sectNots_wrp: {
    padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
    marginTop: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(32)}px`,
    gap: `${moderateScale(11)}px`,
  },
  wllt_sectNots_img: {
    width: `${moderateScale(24)}px`,
    height: `${moderateScale(24)}px`,
  },
  wllt_sectNots_cnt: {
    fontSize: `${moderateScale(15)}px`,
  },
  wllt_sectNots_icon: {
    fontSize: `${moderateScale(20)}px`,
  },
  wllt_supp_wrp: {
    gap: `${moderateScale(20)}px`,
    padding: `${moderateScale(16)}px ${moderateScale(16)}px ${moderateScale(
      24
    )}px`,
  },
  wllt_supp_top: {
    fontSize: `${moderateScale(15)}px`,
    gap: `${moderateScale(10)}px`,
  },
  wllt_supp_img: {
    width: `${moderateScale(26)}px`,
    height: `${moderateScale(26)}px`,
  },
  wllt_supp_row: {
    gap: `${moderateScale(15)}px`,
  },
  wllt_supp_col: {
    gap: `${moderateScale(10)}px`,
    width: `calc(25% - (${moderateScale(15)}px / 4))`,
  },
  wllt_supp_colimg: {
    width: `${moderateScale(35)}px`,
    height: `${moderateScale(35)}px`,
  },
  wllt_supp_colCnt: {
    fontSize: `${moderateScale(13)}px`,
  },
};

export default Wallet;
