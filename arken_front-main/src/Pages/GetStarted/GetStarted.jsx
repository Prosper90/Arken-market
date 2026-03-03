import React, { useEffect, useState } from 'react'
import './getStarted.css'
import { moderateScale } from '../../utils/Scale'
import  getStrt_optLst_img2  from '../../assets/image/getStrt_optLst_img2.webp'
import  getStrt_optLst_img3  from '../../assets/image/getStrt_optLst_img3.webp'
import  getStrt_optLst_img4  from '../../assets/image/getStrt_optLst_img4.webp'
import  getstrt_tickIcon  from '../../assets/image/getstrt_tickIcon.webp'
import  logo2  from '../../assets/image/logo2.webp'
import toast from "react-hot-toast";

import ImageComponent from '../../Components/ImageComponent'
import { GoArrowRight } from "react-icons/go";
import { useTelegramUser } from "../../context/TelegramUserContext";

import { useNavigate } from 'react-router-dom'
import apiService from "../../core/sevice/detail";
import { postMethod,getMethod } from "../../core/sevice/common.api";
import { useDisconnect } from "wagmi";

const GetStarted = () => {

  const Navigation = useNavigate()
const { setTelegramUser,telegramUser} = useTelegramUser();
const [loadingAuth, setLoadingAuth] = useState(false);
const [initDatanew, setinitData] = useState(null);
  const { disconnect } = useDisconnect();


    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const telegramId = tg.initDataUnsafe.user.id;
  
   document.cookie = `telegramId=${telegramId}; path=/; max-age=${60 * 60 * 24}`;
      console.log("Telegram ID stored in cookie:", telegramId);
    }
    

  const getStartedList = [
    {
      id: 1,
      img: 'https://res.cloudinary.com/dqtdd1frp/image/upload/v1765269015/getStrt_optLst_img1_ayhc1r.webp',
      heading: 'Trade Predictions',
      description: 'Make informed predictions on cryptocurrency prices, stock movements, and world events',
    },
    {
      id: 2,
      img: getStrt_optLst_img2,
      heading: 'KOL Call Predictions',
      description: 'Predict the reliability of influencer calls and protect your investments',
    },
    {
      id: 3,
      img: getStrt_optLst_img3,
      heading: 'Community Groups',
      description: 'Join trading groups and earn commission as a group owner',
    },
    {
      id: 4,
      img: getStrt_optLst_img4,
      heading: 'Smart Contract Security',
      description: 'All funds secured by audited blockchain smart contracts with instant payouts',
    },
  ]

// const handleNavigate = () => {
//   Navigation(`/onBoarding?telegramId=${123455}`);
//   localStorage.setItem("telegramUsertelegramId", telegramUser.telegramId);
// };

  const handleNavigate = () => {
    Navigation("/onBoarding")
  }


  useEffect(() => {
  authenticateTelegramUser();
}, []);


//   const authenticateTelegramUser = async () => {
//   try {
//     if (!window.Telegram || !window.Telegram.WebApp) {
//       console.error("Not opened from Telegram");
//       return;
//     }

//     setLoadingAuth(true);

//     const tg = window.Telegram.WebApp;
//     tg.ready();

//     const data = {
//       apiUrl: apiService.telegramWebappAuth,
//       body: {
//         initData: tg.initData
//       }
//     };

//     const resp = await postMethod(data);

//     setLoadingAuth(false);

//     if (resp.success) {
//       setTelegramUser(resp);
//       localStorage.setItem("telegramUser", JSON.stringify(resp));
//     } else {
//       console.error(resp.message);
//     }

//   } catch (error) {
//     setLoadingAuth(false);
//     console.error("Telegram auth error:", error);
//   }
// };




const authenticateTelegramUser = async () => {
  try {
    setLoadingAuth(true);

    if (!window.Telegram || !window.Telegram.WebApp) {
      console.warn("Not opened inside Telegram WebApp");
      setLoadingAuth(false);
      return;
    }

    const tg = window.Telegram.WebApp;
    tg.ready();

    const initData = tg.initData;
    setinitData(initData)

    const resp = await postMethod({
      apiUrl: apiService.telegramWebappAuth,
      payload: { initData },
    });

    if (resp.success) {
      setTelegramUser(resp.data);
      localStorage.setItem("telegramUser", JSON.stringify(resp.data));
      console.log("Telegram user authenticated:", resp.data);
      // If wallet already connected, skip onboarding entirely
      const savedWallet = localStorage.getItem("walletAddress");
      if (savedWallet) {
        Navigation("/markets");
        return;
      }
    } else {
      console.error(resp.message);
    }
  } catch (error) {
    console.error("Telegram auth error:", error);
  } finally {
    setLoadingAuth(false);
  }
};


  return (
    <div className='cmmn_bdy_mainwrp' style={pageStyle.cmmn_bdy_mainwrp} >
      <div className='getStrt_wrp_main' style={pageStyle.getStrt_wrp_main}>
        <div className='getStrt_header' style={pageStyle.getStrt_HdrMain} >
          <img style={pageStyle.getStrt_HdrImg} src={new URL(logo2, import.meta.url)} alt='' />
          <h2 style={pageStyle.getStrt_HdrText} >Welcome to Prediction Trading</h2>
        </div>

        <div className='getStrt_bdy_wrp' style={pageStyle.getStrt_bdy_wrp}>
          <div className='getStrt_countWrp' style={pageStyle.getStrt_countWrp} >
            <div className='getStrt_countItm'>
              <h6 style={pageStyle.getStrt_counthHead}>24/7</h6>
              <p style={pageStyle.getStrt_counthPara}>Available</p>
            </div>
            <div className='getStrt_countItm'>
              <h6 style={pageStyle.getStrt_counthHead}>100%</h6>
              <p style={pageStyle.getStrt_counthPara}>Secure</p>
            </div>
            <div className='getStrt_countItm'>
              <h6 style={pageStyle.getStrt_counthHead}>$5M+</h6>
              <p style={pageStyle.getStrt_counthPara}>Paid Out</p>
            </div>
            <div className='getStrt_countItm'>
              <h6 style={pageStyle.getStrt_counthHead}>10K+</h6>
              <p style={pageStyle.getStrt_counthPara}>Active Users</p>
            </div>
          </div>

          <div className='getStrt_optLst_Wrp' style={pageStyle.getStrt_optLst_Wrp} >
            {
              getStartedList.map((item, index) => {
                return (
                  <div key={index} className='getStrt_optLst_itm' style={pageStyle.getStrt_optLst_itm}>
                    <div className='gst_optlst_imgWrp' style={pageStyle.gst_optlst_imgWrp}>
                      <ImageComponent styles={pageStyle.getStrt_optLst_img} imgPic={item.img} alt="getStrt_optLst_img" />
                    </div>
                    <div className='getStrt_optLst_cnt'>
                      <h6 style={pageStyle.gst_optlst_head}>{item.heading}</h6>
                      <p style={pageStyle.gst_optlst_para} >{item.description}</p>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>

        <div className='getstrt_tickIconWrp' style={pageStyle.getstrt_tickIconWrp}>
          <ImageComponent styles={pageStyle.getstrt_tickIcon} imgPic={getstrt_tickIcon} alt="getStrt_optLst_img" />
          <p style={pageStyle.getstrt_tickpara} >Verified & Regulated Platform</p>
        </div>

        <button className='getStrt_btn' onClick={handleNavigate} style={pageStyle.getStrt_btn} >Get Started <GoArrowRight style={pageStyle.getStrt_btnIcon} /> </button>
        <p className='getStrt_btmPara' style={pageStyle.getStrt_btmPara} >By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  )
}

const pageStyle = {
  // cmmn_bdy_mainwrp:{
  //   paddinBottom:`${moderateScale(50)}px`,
  // },
  getStrt_HdrMain: {
    gap: `${moderateScale(16)}px`,
  },
  getStrt_HdrImg: {
    width: `${moderateScale(60)}px`,
    height: `${moderateScale(60)}px`
  },
  getStrt_HdrText: {
    fontSize: `${moderateScale(18)}px`
  },
  getStrt_bdy_wrp: {
    marginTop: `${moderateScale(45)}px`,
    gap: `${moderateScale(30)}px`,
  },
  getStrt_countWrp: {
    padding: `${moderateScale(20)}px ${moderateScale(15)}px`,
  },
  getStrt_counthHead: {
    fontSize: `${moderateScale(16)}px`
  },
  getStrt_counthPara: {
    fontSize: `${moderateScale(11)}px`
  },
  getStrt_optLst_Wrp: {
    padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
    gap: `${moderateScale(16)}px`,
  },
  getStrt_optLst_itm: {
    gap: `${moderateScale(16)}px`,
  },
  gst_optlst_imgWrp: {
    width: `${moderateScale(35)}px`,
    minWidth: `${moderateScale(35)}px`,
    height: `${moderateScale(35)}px`,
    borderRadius: `${moderateScale(8)}px`,
  },
  getStrt_optLst_img: {
    width: `${moderateScale(21)}px`,
    height: `${moderateScale(21)}px`,
  },
  gst_optlst_head: {
    fontSize: `${moderateScale(14)}px`,
    marginBottom: `${moderateScale(4)}px`,
  },
  gst_optlst_para: {
    fontSize: `${moderateScale(12)}px`,
  },
  getstrt_tickIconWrp: {
    marginTop: `${moderateScale(47)}px`,
    gap: `${moderateScale(7)}px`,
  },
  getstrt_tickIcon: {
    width: `${moderateScale(17)}px`,
    minWidth: `${moderateScale(17)}px`,
    height: `${moderateScale(17)}px`,
  },
  getstrt_tickpara: {
    fontSize: `${moderateScale(12)}px`,
  },
  getStrt_btn: {
    fontSize: `${moderateScale(14)}px`,
    marginTop: `${moderateScale(17)}px`,
    marginBottom: `${moderateScale(8)}px`,
    gap: `${moderateScale(10)}px`,
    padding: `${moderateScale(15)}px ${moderateScale(10)}px`,
  },
  getStrt_btnIcon: {
    fontSize: `${moderateScale(20)}px`,
  },
  getStrt_btnIcon: {
    fontSize: `${moderateScale(20)}px`,
  },
  getStrt_btmPara: {
    fontSize: `${moderateScale(10)}px`,
    // paddingBottom: `${moderateScale(40)}px`,
  },
}

export default GetStarted