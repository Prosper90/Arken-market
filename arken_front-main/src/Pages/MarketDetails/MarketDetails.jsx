import React, { useState,useEffect, useRef  } from 'react'
import './MarketDetails.css'
import { moderateScale } from '../../utils/Scale'
import ImageComponent from '../../Components/ImageComponent'
import marketdefault from '../../assets/image/marketdefault.webp'
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import others from '../../assets/image/others.webp'
import total_pool from '../../assets/image/total_pool.webp'
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { RiShieldCheckFill } from "react-icons/ri";
import Box from "@mui/material/Box";
import apiService from "../../core/sevice/detail";
import { useLocation } from "react-router-dom";

import { postMethod,getMethod } from "../../core/sevice/common.api";
import homt_tab_Countimg1 from '../../assets/image/homt_tab_Countimg1.webp'
import carbon_time from '../../assets/image/carbon_time.webp'
import solar_calendar_linear from '../../assets/image/solar_calendar_linear.webp'
import Modal from "@mui/material/Modal";
import { useParams,useSearchParams  } from "react-router-dom";
import { CiClock2 } from "react-icons/ci";
import { GoArrowRight } from "react-icons/go";
import { IoAlertCircleOutline, IoCalendarOutline } from 'react-icons/io5';
import { TbUsers } from 'react-icons/tb';
import { IoIosTimer } from 'react-icons/io';
import Buyform from "../Buyform";
import { useMarkets } from '../../context/MarketContext';


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};


const binanceSymbolMap = {
  BTC: "btcusdt",
  ETH: "ethusdt",
  SOL: "solusdt",
  ADA: "adausdt",
  DOT: "dotusdt",
  BNB: "bnbusdt",
  XRP: "xrpusdt",
  DOGE: "dogeusdt",
  LTC: "ltcusdt",
  MATIC: "maticusdt",
  AVAX: "avaxusdt",
  SHIB: "shibusdt",
  TRX: "trxusdt",
  FTM: "ftmusdt",
  LINK: "linkusdt",
  AAVE: "aaveusdt",
  ALGO: "algousdt",
  XLM: "xlmusdt",
  VET: "vetusdt",
  ATOM: "atomusdt",
  NEAR: "nearusdt",
  EOS: "eosusdt",
  FIL: "filusdt",
};

const MarketDetails = () => {


    const navigate = useNavigate()
  const { id } = useParams();
  console.log("ID FROM ROUTE:", id);

  const [params] = useSearchParams();
const [telegramId, setTelegramId] = useState(null);
const [groupId, setGroupId] = useState(null);
      const [stats, setStats] = useState([]);
  const { markets,setMarkets } = useMarkets();
  const [loadingStats, setLoadingStats] = useState(false);
    const [onboardStep, setOnboardStep] = useState(1);
  const [isBotStatusActive, setIsBotStatusActive] = useState(false);
  const [showMore, setShowMore] = useState(false);
    const [market, setMarket] = useState(null);
     const [currentPrice, setCurrentPrice] = useState(null);
    const [selectedOutcome, setSelectedOutcome] = useState(null);
      const [loading, setLoading] = useState(true);
const lastUpdateRef = useRef(0);
 const socketRef = useRef(null);
 const location = useLocation();

 const item = location.state?.item;


      const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [lpAmount, setLpAmount] = useState('');
  const [lpLoading, setLpLoading] = useState(false);
  const [showLpForm, setShowLpForm] = useState(false);

//  useEffect(() => {
//     if (!item) return; 

//     setLoading(true);
//     setLoadingStats(true);

//     setMarket(item);
//     setMarkets([item]);
//     setStats([item]);

//     if (item.category === "Crypto" && item.currency) {
//       const pair = binanceSymbolMap[item.currency.toUpperCase()];

//       if (!pair) {
//         setCurrentPrice(null);
//         setLoading(false);
//         setLoadingStats(false);
//         return;
//       }

//       if (socketRef.current) {
//         socketRef.current.close();
//       }

//       socketRef.current = new WebSocket(
//         `wss://stream.binance.com/ws/${pair}@ticker`
//       );

//       socketRef.current.onopen = () => console.log("Binance WS connected");

//       socketRef.current.onmessage = (event) => {
//         const now = Date.now();
//         if (now - lastUpdateRef.current < 1000) return; 
//         lastUpdateRef.current = now;

//         const data = JSON.parse(event.data);
//         const price = Number(data.c);
//         setCurrentPrice(`$${price.toLocaleString()}`);
//       };

//       socketRef.current.onerror = (err) =>
//         console.error("Binance WS error", err);
//       socketRef.current.onclose = () => console.log("Binance WS closed");
//     } else {
//       setCurrentPrice(null);
//     }

//     setLoading(false);
//     setLoadingStats(false);
//   }, [item]);

// useEffect(() => {
//   if (!item && id) {
//     fetchMarketById(id);
//   }
// }, [id, item])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

// const isTelegramWebApp = !!window.Telegram?.WebApp;

// if (!isTelegramWebApp) {
//   toast.error("Please open this page via Telegram Mini App");
//     window.location.href = "/";
//   return;
// }

// const walletAddress = localStorage.getItem("walletAddress");

// if (!walletAddress) {
//   alert("❌ Please connect your wallet to place a bet");
//   window.location.href = "/onBoarding";
//   return;
// }

  useEffect(() => {
  if (!market?.endDate) return; 

  const updateTimer = () => {
    const now = new Date();
    const end = new Date(market.endDate);
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      clearInterval(timerInterval); 
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft({ hours, minutes, seconds });
  };

  updateTimer(); 
  const timerInterval = setInterval(updateTimer, 1000); 

  return () => clearInterval(timerInterval); 
}, [market]); 


  
// useEffect(() => {
//   if (!id || !Array.isArray(markets) || markets.length === 0) return;

//   const localMarket = markets.find(m => m._id === id || m.slug === id);
//   setMarket(localMarket || null);
//   setLoading(false);

//   if (localMarket?.category === "Crypto" && localMarket?.currency) {
//     const symbolToIdMap = {
//       BTC: "bitcoin",
//       ETH: "ethereum",
//       SOL: "solana",
//       ADA: "cardano",
//       DOT: "polkadot",
//       BNB: "binancecoin",
//       XRP: "ripple",
//       DOGE: "dogecoin",
//       LTC: "litecoin",
//       MATIC: "matic-network",
//       AVAX: "avalanche-2",
//       SHIB: "shiba-inu",
//       TRX: "tron",
//       FTM: "fantom",
//       LINK: "chainlink",
//       AAVE: "aave",
//       ALGO: "algorand",
//       XLM: "stellar",
//       VET: "vechain",
//       ATOM: "cosmos",
//       NEAR: "near",
//       EOS: "eos",
//       FIL: "filecoin",
//     };

//     const coinId = symbolToIdMap[localMarket.currency.toUpperCase()];
//     if (!coinId) {
//       setCurrentPrice(null);
//       return;
//     }

//     const fetchPrice = async () => {
//       try {
//         const response = await fetch(
//           `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
//         );
//         const data = await response.json();
//         const price = data[coinId]?.usd;
//         if (price) {
//           setCurrentPrice(`$${price.toLocaleString()}`);
//         } else {
//           setCurrentPrice(null);
//         }
//       } catch (error) {
//         console.error("Error fetching crypto price:", error);
//         setCurrentPrice(null);
//       }
//     };

//     fetchPrice();
//   } else {
//     setCurrentPrice(null);
//   }
// }, [id, markets]);



// const fetchMarketById = async () => {
//   try {
//     setLoading(true);
//     setLoadingStats(true);

//     const data = {
//       apiUrl: apiService.getmergedmarkets,
//     };

//     const resp = await getMethod(data);

//     setLoadingStats(false);

//     if (resp.success) {
//       const localMarket = resp.data.find(m => m._id === id || m.slug === id) || null;

//       setMarket(localMarket);
//       setMarkets(resp.data); 
//       setStats(resp.data);  

//       if (localMarket?.category === "Crypto" && localMarket?.currency) {
//         const symbolToIdMap = {
//           BTC: "bitcoin",
//           ETH: "ethereum",
//           SOL: "solana",
//           ADA: "cardano",
//           DOT: "polkadot",
//           BNB: "binancecoin",
//           XRP: "ripple",
//           DOGE: "dogecoin",
//           LTC: "litecoin",
//           MATIC: "matic-network",
//           AVAX: "avalanche-2",
//           SHIB: "shiba-inu",
//           TRX: "tron",
//           FTM: "fantom",
//           LINK: "chainlink",
//           AAVE: "aave",
//           ALGO: "algorand",
//           XLM: "stellar",
//           VET: "vechain",
//           ATOM: "cosmos",
//           NEAR: "near",
//           EOS: "eos",
//           FIL: "filecoin",
//         };

//         const coinId = symbolToIdMap[localMarket.currency.toUpperCase()];
//         if (!coinId) {
//           setCurrentPrice(null);
//           return;
//         }

//         const response = await fetch(
//           `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
//         );
//         const priceData = await response.json();
//         const price = priceData[coinId]?.usd;
//         setCurrentPrice(price ? `$${price.toLocaleString()}` : null);
//       } else {
//         setCurrentPrice(null);
//       }
//     } else {
//       console.error(resp.message);
//       setMarket(null);
//       setCurrentPrice(null);
//     }
//   } catch (error) {
//     console.error("Error fetching market:", error);
//     setLoading(false);
//     setLoadingStats(false);
//     setMarket(null);
//     setCurrentPrice(null);
//   } finally {
//     setLoading(false);
//   }
// };

// useEffect(() => {
//   if (id) {
//     fetchMarketById();
//   }
// }, [id]);


  const fetchMarketById = async () => {
  // --- Standard market: fetch from backend ---
  try {
    setLoading(true);
    setLoadingStats(true);

    const payload = { id };

    const data = {
      apiUrl: apiService.getmergedmarketsid,
      payload,
    };

    const resp = await postMethod(data);

    if (!resp?.success || !resp?.data) {
      setMarket(null);
      setCurrentPrice(null);
      return;
    }

    const localMarket = resp.data;

    setMarket(localMarket);
    setMarkets([localMarket]);
    setStats([localMarket]);

    // Fetch live on-chain prices for Arken EVM markets
    if (localMarket?.source === "arken" && localMarket?.arkenMarketAddress) {
      import("../../services/arkenService").then(({ getArkenMarketPrices }) => {
        getArkenMarketPrices(localMarket.arkenMarketAddress).then(({ yesPrice }) => {
          setCurrentPrice(`${(yesPrice * 100).toFixed(1)}%`);
        }).catch(() => {});
      });
    }

    if (localMarket?.category === "Crypto" && localMarket?.currency) {
      const pair = binanceSymbolMap[localMarket.currency.toUpperCase()];

      if (!pair) {
        setCurrentPrice(null);
        return;
      }

      if (socketRef.current) {
        socketRef.current.close();
      }

      socketRef.current = new WebSocket(
        `wss://stream.binance.com/ws/${pair}@ticker`
      );

      socketRef.current.onopen = () =>
        console.log("Binance WS connected");

      socketRef.current.onmessage = (event) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) return;

        lastUpdateRef.current = now;

        const wsData = JSON.parse(event.data);
        const price = Number(wsData.c);
        setCurrentPrice(`$${price.toLocaleString()}`);
      };

      socketRef.current.onerror = (err) =>
        console.error("Binance WS error", err);

      socketRef.current.onclose = () =>
        console.log("Binance WS closed");
    } else {
      setCurrentPrice(null);
    }
  } catch (error) {
    console.error("Error fetching market:", error);
    setMarket(null);
    setCurrentPrice(null);
  } finally {
    setLoading(false);
    setLoadingStats(false);
  }
};

  useEffect(() => {
    if (id) {
      fetchMarketById();
    }
  }, [id]);

const handleAddLiquidity = async () => {
  if (!telegramId) return toast.error('Open this app from Telegram');
  if (!lpAmount || Number(lpAmount) < 1) return toast.error('Minimum liquidity is $1');
  setLpLoading(true);
  try {
    const resp = await postMethod({
      apiUrl: apiService.addMarketLiquidity,
      payload: { telegramId, marketId: market._id, amount: Number(lpAmount) },
    });
    if (resp?.status || resp?.success) {
      toast.success('Liquidity added! It will appear on-chain shortly.');
      setLpAmount('');
    } else {
      toast.error(resp?.message || 'Failed to add liquidity');
    }
  } catch {
    toast.error('Something went wrong');
  } finally {
    setLpLoading(false);
  }
};

const handleOutcomeClick = (outcome, price, index) => {
  const tokenId = market.outcomeTokenIds?.[outcome];
  setSelectedOutcome({
    outcome,
    price,
    index,
    tokenId,
    side: "buy",
  });

  handleBotStatusOpen();
};


    const handleonboardStep = (step) => {
        if (onboardStep < 3) {
            setOnboardStep(step)
        }
    }

    const handleStepReduce = () => {
            navigate("/markets")
    }

    const handleNavigate = () => {
        navigate("/onBoarding")
    }


     const handleBotStatusClose = () => {
    setIsBotStatusActive(false);
  };

  const handleBotStatusOpen = () => {
    setIsBotStatusActive(true);
  };
  

  useEffect(() => {
    if (!window.Telegram?.WebApp) {
      console.log("Not running inside Telegram");
      return;
    }

    const tg = window.Telegram.WebApp;
    tg.ready();

    setTelegramId(tg.initDataUnsafe?.user?.id || null);
    setGroupId(tg.initDataUnsafe?.chat?.id || null);
  }, []);


  useEffect(() => {
    if (!telegramId) return;
    console.log("Fetch data with:", { telegramId, groupId });
  }, [telegramId, groupId]);


  if (loading === true || loadingStats === true) {
    return (
      <div className='skeleton_main_marketdetailsdiv' style={pageStyle.main_marketdetailsdiv}>
        <div className='skeleton_cmmn_bdy_mainwrp mrkt_dtl_wrp' style={pageStyle.mrkt_dtl_wrp}>
          <div className='skeleton_obrd_wrp_mainmb' style={pageStyle.obrd_back_wrp}></div>
          <div className='skeleton_crypto_manualdiv' style={{ ...pageStyle.crypto_manualdiv, height: 80, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8,marginBottom:'10px' }}></div>
          <div className='skeleton_image_and_headernew' style={{ height: 150, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8 }}></div>
          <div className='skeleton_price_detailssec' style={{ height: 60, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8, marginTop: 10 }}></div>
          <div className='skeleton_about_detailssecmainhead' style={{ height: 100, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8, marginTop: 10 }}></div>
          <div className='skeleton_about_detailssecmainhead' style={{ height: 100, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8, marginTop: 10 }}></div>
          <div className='skeleton_crypto_manualdiv' style={{ ...pageStyle.crypto_manualdiv, height: 80, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8,marginBottom:'10px',marginTop:'10px' }}></div>
          <div className='skeleton_crypto_manualdiv' style={{ ...pageStyle.crypto_manualdiv, height: 80, backgroundColor: 'rgba(255, 255, 255, 30%)', borderRadius: 8,marginBottom:'10px',marginTop:'10px' }}></div>
        
        </div>
      </div>
    );
  }

  return (
    <div className='main_marketdetailsdiv' style={pageStyle.main_marketdetailsdiv}>
      <div className='cmmn_bdy_mainwrp mrkt_dtl_wrp' style={pageStyle.mrkt_dtl_wrp} >
        <div className='obrd_wrp_mainmb'>
          <div className='obrd_back_wrp ' style={pageStyle.obrd_back_wrp} >
            <span style={pageStyle.obrd_back_txt} onClick={() => { handleStepReduce() }}>
              <MdOutlineArrowBackIosNew style={pageStyle.obrd_back_txt2} /> Back
            </span>
            <span><IoAlertCircleOutline style={pageStyle.alert_Span} /></span>
          </div>
        </div>

        {/* {currentPrice && ( */}
        <div className='crypto_manualdiv' style={pageStyle.crypto_manualdiv}>
  <div className='crypto_manualinsidediv' style={pageStyle.crypto_manualinsidediv}>
    <span className='crypto_manualinsidefirstspan' style={pageStyle.crypto_manualinsidefirstspan}>
      <h6 className='crypto_manualinsidefirstsix' style={pageStyle.crypto_manualinsidefirstsix}>
        {market?.category === 'Crypto' ? "Crypto" : "Other"}
      </h6>
    </span>
    <span className='crypto_manualinsidesecspan' style={pageStyle.crypto_manualinsidesecspan}>
      <h6 className='crypto_manualinsidesecsix' style={pageStyle.crypto_manualinsidesecsix}>
        {market?.source === 'poly' ? "POLY" : market?.source === 'arken' ? "ARKEN" : market?.source === 'solana' ? "SOLANA" : "Other"}
      </h6>
    </span>
    <span className='crypto_manualinsidesecspan' style={pageStyle.crypto_manualinsidesecspan}>
      <h6 className='crypto_manualinsidesecsix' style={pageStyle.crypto_manualinsidesecsix}>
        {market?.oracleType ? market.oracleType.toUpperCase() : "MANUAL"}
      </h6>
    </span>
    <span
      className='crypto_manualinsidesecspan'
      style={{
        ...pageStyle.crypto_manualinsidesecspan,
        backgroundColor:
          (market?.marketStatus || (market?.active ? 'active' : 'closed')) === 'active' ? '#1a4a1a' :
          (market?.marketStatus || (market?.active ? 'active' : 'closed')) === 'resolved' ? '#1a1a4a' : '#4a1a1a',
      }}
    >
      <h6 className='crypto_manualinsidesecsix' style={pageStyle.crypto_manualinsidesecsix}>
        {(market?.marketStatus || (market?.active ? 'ACTIVE' : 'CLOSED')).toUpperCase()}
      </h6>
    </span>
  </div>
</div>

        {/* )} */}

        <div className='both_andtagleftmain' style={pageStyle.both_andtagleftmain}>
          <div className='image_and_headernew' style={pageStyle.image_and_headernew}>
          <ImageComponent
  imgPic={
    market?.image
      ? market.image
      : market?.category === 'Crypto'
      ? marketdefault
      : others
  }
  alt="market_img"
  styles={pageStyle.home_tab_leftimg}
/>
            <h5 className='home_tab_headonenew' style={pageStyle.home_tab_headonenew}>
              <span>{market?.question || "Bitcoin Up or Down"}</span> {market?.startDate ? new Date(market.startDate).toLocaleString() : "December 12, 11:30PM-11:45PM ET"}
            </h5>
          </div>

           <div className='hrs_calculationmaintag' style={pageStyle.hrs_calculationmaintag}>
      <div className='hrs_calculationhead'>
        <h6 className='hrs_calculationheadone' style={pageStyle.hrs_calculationheadone}>{timeLeft.hours}</h6>
        <h6 className='hrs_calculationheadtwo' style={pageStyle.hrs_calculationheadtwo}>HRS</h6>
      </div>
      <div className='hrs_calculationhead'>
        <h6 className='hrs_calculationheadone' style={pageStyle.hrs_calculationheadone}>{timeLeft.minutes}</h6>
        <h6 className='hrs_calculationheadtwo' style={pageStyle.hrs_calculationheadtwo}>MIN</h6>
      </div>
      <div className='hrs_calculationhead'>
        <h6 className='hrs_calculationheadone' style={pageStyle.hrs_calculationheadone}>{timeLeft.seconds}</h6>
        <h6 className='hrs_calculationheadtwo' style={pageStyle.hrs_calculationheadtwo}>SEC</h6>
      </div>
    </div>
        </div>

        {market?.category === "Crypto" && currentPrice && (
          <div style={pageStyle.price_detailssec} className='price_detailssec'>
            <div className='price_detailsinside' style={pageStyle.price_detailsinside}>
              <div className='pool_userlistdiv' style={pageStyle.pool_userlistdiv}>
                <h6 style={pageStyle.pool_userlistdivCnt}>Current price ({market?.currency})</h6>
              </div>
              <h4 style={pageStyle.timer_leftsix}>{currentPrice}</h4>
            </div>
          </div>
        )}

        <div className='backgrdset_foryesnoneone' style={pageStyle.backgrdset_foryesnoneone}>
          <div className='yesno_details'>
            <h6 style={pageStyle.yesno_detailsyesnewone} className='yesno_detailsyesnewone'>% Chances</h6>
            <h6 style={pageStyle.yesno_detailsnoone} className='yesno_detailsnoone'>{market?.chancePercents?.[0] || 50}%</h6>
          </div>
          <div className='curnt_fund_prgsLine'>
            <span className='curnt_fund_prgsLinespan' style={pageStyle.curnt_fund_prgsLinespan}></span>
          </div>
        </div>

        <div className='about_detailssecmainhead' style={pageStyle.about_detailssecmainhead}>
          <h6 className='about_detailssechead' style={pageStyle.about_detailssechead}>About</h6>
          <p className='about_detailssecpara' style={pageStyle.about_detailssecpara}>{market?.description || "This market will resolve to 'Up' if the price increases."}</p>

          <div className='market_detailsundertab' style={pageStyle.market_detailsundertab}>
            <div className='homt_tab_Countitmnewone' style={pageStyle.homt_tab_Countitmnewone}>
              <h6 style={pageStyle.homt_tab_CountHednewoneneone} className='homt_tab_CountHednewone'>
                <ImageComponent styles={pageStyle.homt_tab_Countimgnewoneliq} imgPic={homt_tab_Countimg1} alt="homt_tab_Countimg" />
                Liquidity
              </h6>
              <p style={pageStyle.homt_tab_CountParaneoene} className='homt_tab_CountParaneoene'>{market?.liquidity || 0}</p>
            </div>
           <div className='homt_tab_Countitmnewone' style={pageStyle.homt_tab_Countitmnewone}>
  <h6 style={pageStyle.homt_tab_CountHednewoneneone} className='homt_tab_CountHednewone'>
    <ImageComponent styles={pageStyle.homt_tab_Countimgnewoneliq} imgPic={carbon_time} alt="homt_tab_Countimg" />
    Ends in
  </h6>
  <p style={pageStyle.homt_tab_CountParaneoene} className='homt_tab_CountParaneoene'>
    {market?.endDate ? new Date(market.endDate).toLocaleString() : "N/A"}
  </p>
</div>

            <div className='homt_tab_Countitmnewone' style={pageStyle.homt_tab_Countitmnewone}>
              <h6 style={pageStyle.homt_tab_CountHednewoneneone} className='homt_tab_CountHednewone'>
                <ImageComponent styles={pageStyle.homt_tab_Countimgnewoneliq} imgPic={solar_calendar_linear} alt="homt_tab_Countimg" />
                Created At
              </h6>
              <p style={pageStyle.homt_tab_CountParaneoene} className='homt_tab_CountParaneoene'>{market?.startDate ? new Date(market.startDate).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        </div>

      <div className='bottom_section_main' style={pageStyle.bottom_section_main}>
  <div className='bottom_section' style={pageStyle.bottom_section}>
    {(() => {
      const status = market?.marketStatus || (market?.active ? 'active' : 'closed');
      const isActive = status === 'active';
      return (
        <>
          {!isActive && (
            <div style={{ textAlign: 'center', padding: '12px', marginBottom: '10px', backgroundColor: '#2a1a1a', borderRadius: '8px', color: '#e05c5c', fontSize: '14px' }}>
              {status === 'resolved' ? 'This market has been resolved.' : status === 'pending' ? 'This market is pending approval.' : 'This market is closed for betting.'}
            </div>
          )}
          <div className='btn_yesandno'>
            {market?.outcomes?.map((outcome, index) => {
              const price = market.outcomePrices?.[index];
              const displayPrice = price ? `${parseFloat(price * 100).toFixed(0)}¢` : "";
              return (
                <div
                  key={index}
                  className={index === 0 ? 'btn_yesandnobtn1' : 'btn_yesandnobtn2'}
                  style={{
                    ...(index === 0 ? pageStyle.btn_yesandnobtn1 : pageStyle.btn_yesandnobtn2),
                    ...(isActive ? {} : { opacity: 0.4, cursor: 'not-allowed', pointerEvents: 'none' }),
                  }}
                  onClick={() => isActive && handleOutcomeClick(outcome, price, index)}
                >
                  <h5 style={pageStyle.btn_yesandnobtnfive} className='btn_yesandnobtnfive'>
                    {`Buy ${outcome} ${displayPrice}`}
                  </h5>
                </div>
              );
            })}
          </div>
          {market?.source === 'arken' && isActive && (
            <div
              style={pageStyle.btn_lp}
              onClick={() => setShowLpForm(prev => !prev)}
            >
              <h5 style={pageStyle.btn_yesandnobtnfive} className='btn_yesandnobtnfive'>
                {showLpForm ? 'Hide Liquidity Form' : 'Add Liquidity'}
              </h5>
            </div>
          )}
          {market?.source === 'arken' && isActive && showLpForm && (
            <div style={{ ...pageStyle.lp_section, marginTop: `${moderateScale(12)}px` }}>
              <h6 style={pageStyle.lp_title}>Add Liquidity</h6>
              <p style={pageStyle.lp_desc}>
                Earn LP fees by adding USDT to this market's pool. Your funds are split equally across all outcomes.
              </p>
              <div style={pageStyle.lp_row}>
                <input
                  type="number"
                  min={1}
                  placeholder="Amount (USDT)"
                  value={lpAmount}
                  onChange={e => setLpAmount(e.target.value)}
                  style={pageStyle.lp_input}
                />
                <button
                  style={{ ...pageStyle.lp_btn, opacity: lpLoading ? 0.6 : 1 }}
                  disabled={lpLoading}
                  onClick={handleAddLiquidity}
                >
                  {lpLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </>
      );
    })()}
    <p className='disclainmer_details' style={pageStyle.disclainmer_details}>
      Disclaimer: By participating, you acknowledge and accept the inherent risks of prediction markets and cryptocurrency volatility
    </p>
  </div>
</div>


        <Modal
          open={isBotStatusActive}
          onClose={handleBotStatusClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className="bot_modal_box bot_modal_boxnew" style={pageStyle.bot_modal_box}>
            <Buyform market={market} handleBotClose={handleBotStatusClose} selectedOutcome={selectedOutcome}/>
          </Box>
        </Modal>
      </div>
    </div>
  );

   
}

const pageStyle = {
  mrkt_dtl_wrp:{
        padding: `${moderateScale(20)}px ${moderateScale(20)}px ${moderateScale(110)}px `,
    },
    obrd_back_wrp:{
        marginBottom: `${moderateScale(16)}px`,
    },
    homt_tab_Countitmnewone:{
        marginBottom: `${moderateScale(10)}px`,
    },
    both_andtagleftmain:{
        marginTop: `${moderateScale(24)}px`,
    },
    about_detailssecmainhead:{
        marginBottom: `${moderateScale(24)}px`,
    },
    backgrdset_foryesnoneone:{
        gap:`${moderateScale(16)}px`,
         marginBottom: `${moderateScale(23)}px`,
      padding: `${moderateScale(12)}px ${moderateScale(12)}px ${moderateScale(24)}px`,

    },
    main_marketdetailsdiv:{
      paddingBottom: `${moderateScale(30)}px`,

    },
    market_detailsundertab:{
        marginTop: `${moderateScale(20)}px`,
        gap:`${moderateScale(3)}px`
    },
    hrs_calculationmaintag:{
        gap:`${moderateScale(8)}px`
    },
    homt_tab_CountHednewoneneone:{
        gap:`${moderateScale(7)}px`
    },
    bot_modal_box:{
      width: `${moderateScale(345)}px`,
    height: `${moderateScale(567)}px`,
      padding: `${moderateScale(16)}px ${moderateScale(16)}px ${moderateScale(24)}px`,
    },
    home_tab_leftimg:{
      width: `${moderateScale(50)}px`,
    height: `${moderateScale(50)}px`,
    borderRadius:`${moderateScale(50)}%`,
    },
    homt_tab_Countimgnewoneliq:{
      width: `${moderateScale(20)}px`,
    height: `${moderateScale(20)}px`,
    },
    price_detailsinside:{
        // margin: `${moderateScale(12)}px ${moderateScale(0)}px ${moderateScale(12)}px ${moderateScale(0)}px` ,
    gap:`${moderateScale(8)}px`
        
    },
    
    obrd_back_txt:{
        fontSize: `${moderateScale(16)}px`,
    },
    hrs_calculationheadtwo:{
        fontSize: `${moderateScale(12)}px`,
    },
    home_tab_headonenew:{
        fontSize: `${moderateScale(14)}px`,
        maxWidth: `${moderateScale(136)}px`
    },
    about_detailssechead:{
        fontSize: `${moderateScale(14)}px`,
    },
    image_and_headernew:{
            gap:`${moderateScale(16)}px`,
            marginBottom:`${moderateScale(16)}px`

    },
    hrs_calculationheadone:{
        fontSize: `${moderateScale(16)}px`,
    },
    crypto_manualinsidesecsix:{
        fontSize: `${moderateScale(12)}px`,
    },
    crypto_manualinsidefirstsix:{
        fontSize: `${moderateScale(12)}px`,
    },
    homt_tab_CountParaneoene:{
        fontSize: `${moderateScale(12)}px`,
    },
    yesno_detailsyesnewone:{
        fontSize: `${moderateScale(12)}px`,
    },
    yesno_detailsnoone:{
        fontSize: `${moderateScale(16)}px`,
    },
    btn_yesandnobtnfive:{
        fontSize: `${moderateScale(14)}px`,
    },
    bottom_section:{
        padding: `${moderateScale(28)}px ${moderateScale(20)}px ${moderateScale(23)}px`,
       
    },
    yesno_detailsyes:{
        fontSize: `${moderateScale(16)}px`,
    },
    yesno_detailsno:{
        fontSize: `${moderateScale(16)}px`,
    },
    timer_leftsix:{
        fontSize: `${moderateScale(13.9)}px`,
    },
    about_detailssecpara:{
        fontSize: `${moderateScale(12)}px`,
    },
    disclainmer_details:{
        fontSize: `${moderateScale(12)}px`,
         margin: `${moderateScale(17)}px ${moderateScale(0)}px ${moderateScale(0)}px ${moderateScale(0)}px` ,
    },
    obrd_back_txt2:{
        fontSize: `${moderateScale(20)}px`,
    },
    alert_Span:{
        fontSize: `${moderateScale(20)}px`,
    },
    curnt_fund_prgsLinespan:{
        width: `${moderateScale(75)}%`,
    height: `${moderateScale(11)}px`,
    },
   
    crypto_manualdiv:{
      padding: `${moderateScale(16)}px ${moderateScale(0)}px ${moderateScale(0)}px`,
    },
    btn_yesandnobtn1:{
      padding: `${moderateScale(10)}px `,
    },
    btn_yesandnobtn2:{
      padding: `${moderateScale(10)}px `,
    },
    backgrdset_foryesno:{
      padding: `${moderateScale(12)}px ${moderateScale(12)}px ${moderateScale(24)}px`,
      gap:`${moderateScale(16)}px`
    },
    price_detailssec:{
        padding: `${moderateScale(16)}px`,
              marginTop: `${moderateScale(24)}px`,
        marginBottom: `${moderateScale(16)}px`,

    },
    crypto_manualinsidediv:{
    gap:`${moderateScale(7)}px`
    },
     total_poolimg: {
    width: `${moderateScale(21)}px`,
    height: `${moderateScale(21)}px`,
  },
    pool_userlistdiv:{
    gap:`${moderateScale(5)}px`
    },
    crypto_manualinsidesecspan:{
   gap:`${moderateScale(4)}px`,
    padding:`${moderateScale(6)}px ${moderateScale(10)}px`
    },
    crypto_manualinsidefirstspan:{
    gap:`${moderateScale(4)}px`,
    padding:`${moderateScale(6)}px ${moderateScale(10)}px`
    },
    pool_userlistdivCnt:{
    fontSize:`${moderateScale(13.9)}px`
    },
    btc_marketdetails:{
    fontSize:`${moderateScale(16)}px`,
    } ,
    btc_marketdetailspaara:{
    fontSize:`${moderateScale(14)}px`,
    },
    btn_lp: {
      marginTop: `${moderateScale(10)}px`,
      padding: `${moderateScale(10)}px`,
      borderRadius: `${moderateScale(8)}px`,
      background: 'rgba(74,222,128,0.1)',
      border: '1px solid rgba(74,222,128,0.35)',
      textAlign: 'center',
      cursor: 'pointer',
      color: 'rgba(74,222,128,1)',
    },
    lp_section: {
      background: 'rgba(74,222,128,0.06)',
      border: '1px solid rgba(74,222,128,0.2)',
      borderRadius: `${moderateScale(10)}px`,
      padding: `${moderateScale(14)}px`,
      marginBottom: `${moderateScale(16)}px`,
    },
    lp_title: {
      fontSize: `${moderateScale(13)}px`,
      color: 'rgba(74,222,128,0.9)',
      marginBottom: `${moderateScale(6)}px`,
      fontWeight: 600,
    },
    lp_desc: {
      fontSize: `${moderateScale(11)}px`,
      color: 'rgba(255,255,255,0.45)',
      marginBottom: `${moderateScale(10)}px`,
    },
    lp_row: {
      display: 'flex',
      gap: `${moderateScale(8)}px`,
      alignItems: 'center',
    },
    lp_input: {
      flex: 1,
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: `${moderateScale(8)}px`,
      padding: `${moderateScale(8)}px ${moderateScale(10)}px`,
      color: '#fff',
      fontSize: `${moderateScale(13)}px`,
      outline: 'none',
    },
    lp_btn: {
      background: 'rgba(74,222,128,0.15)',
      border: '1px solid rgba(74,222,128,0.4)',
      borderRadius: `${moderateScale(8)}px`,
      color: 'rgba(74,222,128,1)',
      fontSize: `${moderateScale(13)}px`,
      fontWeight: 600,
      padding: `${moderateScale(8)}px ${moderateScale(16)}px`,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },
}

export default MarketDetails