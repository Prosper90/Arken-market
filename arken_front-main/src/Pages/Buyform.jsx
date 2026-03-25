import React, { useState,useEffect  } from "react";
import { moderateScale } from '../utils/Scale'
import { IoMdClose } from "react-icons/io";
import apiService from "../core/sevice/detail";
import { postMethod } from "../core/sevice/common.api";
import mdi_gambling_chip from '../assets/image/mdi_gambling_chip.webp'

import ImageComponent from "../Components/ImageComponent";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTelegramUser } from "../context/TelegramUserContext";


const SellForm = ({ handleBotClose,market,selectedOutcome }) => {

  const {telegramUser } = useTelegramUser();

  const navigate = useNavigate()
  const [currentMarketPrice, setCurrentMarketPrice] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [potentialWin, setPotentialWin] = useState(0);
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const [profit, setProfit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState("");


  useEffect(() => {
    if (!betAmount || !selectedOutcome?.price) {
      setPotentialWin(0);
      setProfit(0);
      return;
    }

    const amount = Number(betAmount);
    const price = Number(selectedOutcome.price);

    if (amount <= 0 || price <= 0) {
      setPotentialWin(0);
      setProfit(0);
      return;
    }

    const shares = amount / price;
    const win = shares;
    const prof = win - amount;

    setPotentialWin(win);
    setProfit(prof);
  }, [betAmount, selectedOutcome]);

  const fetchClobPrice = async (tokenId) => {
    try {
      const resp = await fetch(
        `https://clob.polymarket.com/price?token_id=${tokenId}&side=buy`
      );
      const data = await resp.json();
      const livePrice = Number(data.price);
      setCurrentMarketPrice(livePrice);
      return livePrice;
    } catch (err) {
      console.error("CLOB price error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!window.Telegram?.WebApp) return;
    window.Telegram.WebApp.ready();
  }, []);

  useEffect(() => {
    if (!selectedOutcome?.tokenId) return;
    fetchClobPrice(selectedOutcome.tokenId);
  }, [selectedOutcome?.tokenId]);

  const handleConfirmBet = async () => {
    if (!betAmount || Number(betAmount) <= 0) {
      setAmountError("Please enter a valid bet amount");
      return;
    }
    setAmountError("");

    const payload = {
      ...(token ? { token } : { initData: telegramUser.intData || window.Telegram.WebApp.initData }),
      marketId: market.specifyId ? market.specifyId : null,
      manualId: market.specifyId ? null : market._id,
      conditionId: market.conditionId ? market.conditionId : null,
      outcomeIndex: market.outcomes ? market.outcomes.indexOf(selectedOutcome.outcome) : 0,
      outcomeLabel: selectedOutcome.outcome,
      amount: Number(betAmount),
      odds: Number(currentMarketPrice) || Number(selectedOutcome?.price) || 0.5,
      currency: market?.source === "arken" ? "USDT" : "USDC",
      source: market.source || "manual",
      ...(market?.source === "arken" && {
        arkenMarketAddress: market.arkenMarketAddress,
      }),
      ...(market?.source === "solana" && {
        solanaMarketId: market.solanaMarketId || market._id,
      }),
    };

    try {
      setLoading(true);
      const resp = await postMethod({
        apiUrl: apiService.userbetplace,
        payload,
      });
      if (resp.success) {
        const txHash = resp.data?.evmTxHash || resp.data?.rainTxHash;
        if (txHash) {
          toast.success("Bet placed on-chain!");
        } else {
          toast.success("Your bet has been successfully placed");
        }
        if (token && window.Telegram?.WebApp) {
          setTimeout(() => window.Telegram.WebApp.close(), 1500);
        } else {
          navigate('/profile');
        }
      } else {
        toast.error(resp.message || "Bet placement failed");
      }
    } catch (error) {
      console.error("Bet placement error:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="bot_modal_body sell_modal_bodynew">
      <div className="bot_modal_bodynew sell_modal_bodynew">
        <span className="close_icon" onClick={handleBotClose}>
          <IoMdClose style={pageStyle.close_icon} />
        </span>

        <div className="playmy_betheadtag" style={pageStyle.playmy_betheadtag}>
          <ImageComponent
            styles={pageStyle.home_topUiImg}
            imgPic={mdi_gambling_chip}
            alt="home_tpLogo"
          />
          <h6 className="place_my_bethead" style={pageStyle.place_my_bethead}>
            Place Your Bet
          </h6>
        </div>

        <h4 className="bitcoin_headtag" style={pageStyle.bitcoin_headtag}>
          {market?.question}
        </h4>

        <div className="odds_detailstag" style={pageStyle.odds_detailstag}>
          <div className="yourchoice_change" style={pageStyle.yourchoice_change}>
            <h6
              className="yourchoice_changehead"
              style={pageStyle.yourchoice_changehead}
            >
              Your Choice
            </h6>
            <span
              className="yourchoice_changeyesspan"
              style={pageStyle.yourchoice_changeyesspan}
            >
              <p
                className="yourchoice_changeyespara"
                style={pageStyle.yourchoice_changeyespara}
              >
                {selectedOutcome?.outcome}
              </p>
            </span>
          </div>
        </div>

        <div
          className="input_labelstaginput"
          style={pageStyle.input_labelstaginput}
        >
          <label
            className="input_labelstag_lable"
            style={pageStyle.input_labelstag_lable}
          >
            Bet Amount ($)
          </label>
          <input
            className="bet_amount_cls"
            style={pageStyle.bet_amount_cls}
            placeholder="15.98"
            value={betAmount}
            onChange={(e) => {
              let value = e.target.value;
              if (value.startsWith(" ")) return;
              setBetAmount(value);
              if (value && Number(value) > 0) setAmountError("");
            }}
          />
          {amountError && <p className="error-text">{amountError}</p>}
        </div>

        <div
          className="doted_linecircletag"
          style={pageStyle.doted_linecircletag}
        >
          <div className="yourchoice_change">
            <h6 className="potencial_win_per" style={pageStyle.potencial_win_per}>
              Bet Amount
            </h6>
            <h5 className="potencial_win_value" style={pageStyle.potencial_win_value}>
              ${betAmount ? Number(betAmount).toFixed(2) : "0.00"}
            </h5>
          </div>

          <div className="yourchoice_change">
            <h6 className="potencial_win_per" style={pageStyle.potencial_win_per}>
              Platform Fee (3%)
            </h6>
            <h5 className="potencial_win_value" style={{ ...pageStyle.potencial_win_value, color: "#e05c5c" }}>
              -${betAmount ? (Number(betAmount) * 0.03).toFixed(2) : "0.00"}
            </h5>
          </div>

          <div className="yourchoice_change">
            <h6 className="potencial_win_per" style={{ ...pageStyle.potencial_win_per, fontWeight: "600" }}>
              Net Staked
            </h6>
            <h5 className="potencial_win_value" style={{ ...pageStyle.potencial_win_value, fontWeight: "600" }}>
              ${betAmount ? (Number(betAmount) * 0.97).toFixed(2) : "0.00"}
            </h5>
          </div>

          <div className="yourchoice_change">
            <h6 className="potencial_win_per" style={pageStyle.potencial_win_per}>
              Potential Win
            </h6>
            <h5 className="potencial_win_value" style={pageStyle.potencial_win_value}>
              ${potentialWin.toFixed(2)}
            </h5>
          </div>

          <div className="yourchoice_change">
            <h6 className="potencial_win_per" style={pageStyle.potencial_win_per}>
              Profit
            </h6>
            <h5 className="profit_value" style={pageStyle.profit_value}>
              ${profit.toFixed(2)}
            </h5>
          </div>
        </div>

        <button
          className="confirm_betbtn"
          style={pageStyle.confirm_betbtn}
          onClick={handleConfirmBet}
          disabled={loading}
        >
          {loading ? "Placing Bet..." : "Confirm Bet"}
        </button>

      </div>
    </div>
    </>
  );
};

const pageStyle = {
  home_topUiImg:{
    width: `${moderateScale(20)}px`,
    height: `${moderateScale(20)}px`
  },
  place_my_bethead:{
    fontSize: `${moderateScale(16)}px`,
  },
  potencial_win_per:{
    fontSize: `${moderateScale(14)}px`,
  },
  potencial_win_value:{
    fontSize: `${moderateScale(14)}px`,
  },
  profit_value:{
    fontSize: `${moderateScale(14)}px`,
  },
  input_labelstaginput:{
    marginBottom: `${moderateScale(24)}px`,
    marginTop: `${moderateScale(14)}px`,
    gap:`${moderateScale(8)}px`
  },
  confirm_betbtn:{
    padding: `${moderateScale(10)}px`,
    gap:`${moderateScale(10)}px`,
    fontSize: `${moderateScale(14)}px`,
  },
  input_labelstag:{
    marginTop: `${moderateScale(24)}px`,
    gap:`${moderateScale(8)}px`
  },
  bet_amount_cls:{
    padding: `${moderateScale(14)}px ${moderateScale(12)}px`,
    gap:`${moderateScale(10)}px`,
    fontSize: `${moderateScale(14)}px`,
    height: `${moderateScale(40)}px`
  },
  close_icon:{
    fontSize: `${moderateScale(20)}px`,
  },
  doted_linecircletag:{
    gap:`${moderateScale(12)}px`,
    padding: `${moderateScale(12)}px `,
    marginBottom: `${moderateScale(24)}px`,
  },
  input_labelstag_lable:{
    fontSize: `${moderateScale(14)}px`,
  },
  bitcoin_headtag:{
    fontSize: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(16)}px`,
  },
  playmy_betheadtag:{
    marginBottom: `${moderateScale(24)}px`,
  },
  yourchoice_changehead:{
    fontSize: `${moderateScale(14)}px`,
  },
  odds_valuetext:{
    fontSize: `${moderateScale(14)}px`,
  },
  yourchoice_changeyespara:{
    fontSize: `${moderateScale(14)}px`,
  },
  odds_detailstag:{
    padding:`${moderateScale(12)}px`,
    gap:`${moderateScale(12)}px`
  },
  yourchoice_changeyesspan:{
    padding: `${moderateScale(1)}px ${moderateScale(10)}px`,
    gap:`${moderateScale(10)}px`
  }
}

export default SellForm;
