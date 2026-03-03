import React from 'react'
import './KOLCalls.css'
import { moderateScale } from '../../utils/Scale'
import ImageComponent from '../../Components/ImageComponent'
import bulb_img from '../../assets/image/bulb_img.webp'
import kol_what_lrnImg from '../../assets/image/kol_what_lrnImg.webp'
import homt_tab_Countimg1 from '../../assets/image/homt_tab_Countimg1.webp'
import homt_tab_Countimg2 from '../../assets/image/homt_tab_Countimg2.webp'
import kol_predct_img from '../../assets/image/kol_predct_img.webp'
import homt_tab_Countimg3 from '../../assets/image/homt_tab_Countimg3.webp'
import kol_act_BtnImg1 from '../../assets/image/kol_act_BtnImg1.webp'
import kol_act_BtnImg2 from '../../assets/image/kol_act_BtnImg2.webp'

import BottomTab from '../BottomTab/BottomTab'
import { IoIosArrowForward } from "react-icons/io";
import { kolCardDetail } from './data'

const KOLCalls = () => {
  return (
    <div className='cmmn_bdy_mainwrp kolpg_bdy_mainwrp' style={pageStyle.kolpg_bdy_mainwrp} >

      <div className=' kolpg_bdy_cntWrp' style={pageStyle.kolpg_bdy_cntWrp}>

        <div className='kol_klPrd_wrp' style={pageStyle.kol_klPrd_wrp} >
          <div className='kol_klPrd_cnt' style={pageStyle.kol_klPrd_cnt}>
            <h5 style={pageStyle.kol_klPrd_cntHed}>KOL Call Predictions</h5>
            <p style={pageStyle.kol_klPrd_cntPara}>Predict whether KOL calls will rug or succeed</p>
          </div>
          <ImageComponent styles={pageStyle.kol_klPrd_img} imgPic={bulb_img} alt="bulb_img" />
        </div>

        <div className='kol_whtlrn_wrp' style={pageStyle.kol_whtlrn_wrp}>
          <ImageComponent styles={pageStyle.kol_whtlrn_img} imgPic={kol_what_lrnImg} alt="kol_what_lrnImg" />
          <h6 style={pageStyle.kol_whtlrn_cnt}>Want to Learn more about KOL</h6>
          <span className='kol_whtlrn_icon'><IoIosArrowForward style={pageStyle.kol_whtlrn_icon} /> </span>
        </div>

        <div className='kol_actvprd_wrp' style={pageStyle.kol_actvprd_wrp}>
          <div className='kol_actv_tpcnt' style={pageStyle.kol_actv_tpcnt}>
            <h4 style={pageStyle.kol_actv_cnt}>Active KOL Predictions</h4>
          </div>
          <div className='kol_actvprd_row' style={pageStyle.kol_actvprd_row}>
            {
              kolCardDetail.map((item, index) => {
                return (
                  <div key={index} className='kol_actvprd_col' style={pageStyle.kol_actvprd_col}>

                    <div className='kol_actv_colTop' style={pageStyle.kol_actv_colTop}>
                      <div className='kol_actv_colTpImgWrp' style={pageStyle.kol_actv_colTpImgWrp}>
                        <ImageComponent styles={pageStyle.kol_actv_colTpImg} imgPic={item.img} alt="kol_actPr_crdImg" />
                      </div>
                      <div className='kol_actv_colTpCnt' style={pageStyle.kol_actv_colTpCnt}>
                        <h5 style={pageStyle.kol_actv_colTpHead}>{item.heading}</h5>
                        <p style={pageStyle.kol_actv_colTpPara}>{item.description}</p>
                      </div>
                    </div>

                    <div className='kol_tab_CountWrp' style={pageStyle.kol_tab_CountWrp}>
                      <div className='kol_tab_Countitm' style={pageStyle.kol_tab_Countitm}>
                        <h6 style={pageStyle.kol_tab_CountHed} className='kol_tab_CountHed'>
                          <ImageComponent styles={pageStyle.kol_tab_Countimg} imgPic={homt_tab_Countimg1} alt="kol_tab_Countimg" />
                          Total Pool
                        </h6>
                        <p style={pageStyle.kol_tab_CountPara} className='kol_tab_CountPara' >{item.subValue1}</p>
                      </div>
                      <div className='kol_tab_Countitm' style={pageStyle.kol_tab_Countitm}>
                        <h6 style={pageStyle.kol_tab_CountHed} className='kol_tab_CountHed'>
                          <ImageComponent styles={pageStyle.kol_tab_Countimg} imgPic={homt_tab_Countimg2} alt="kol_tab_Countimg" />
                          Participants
                        </h6>
                        <p style={pageStyle.kol_tab_CountPara} className='kol_tab_CountPara' >{item.subValue2}</p>
                      </div>
                      <div className='kol_tab_Countitm' style={pageStyle.kol_tab_Countitm}>
                        <h6 style={pageStyle.kol_tab_CountHed} className='kol_tab_CountHed'>
                          <ImageComponent styles={pageStyle.kol_tab_Countimg} imgPic={homt_tab_Countimg3} alt="kol_tab_Countimg" />
                          Time Left
                        </h6>
                        <p style={pageStyle.kol_tab_CountPara} className='kol_tab_CountPara' >{item.subValue3}</p>
                      </div>
                    </div>

                    <div className='kol_predct_wrp' style={pageStyle.kol_predct_wrp}>
                      <ImageComponent styles={pageStyle.kol_predct_img} imgPic={kol_predct_img} alt="kol_actPr_crdImg" />
                      <h6 style={pageStyle.kol_predct_cnt}>
                        Prediction: <span>Next call will be RUG</span>
                      </h6>
                    </div>

                    <div className='kol_act_Btnwrp' style={pageStyle.kol_act_Btnwrp}>
                      <button className='kol_act_Btn kol_act_BtnYes' style={pageStyle.kol_act_Btn}>
                        <ImageComponent styles={pageStyle.kol_act_BtnImg} imgPic={kol_act_BtnImg1} alt="kol_act_BtnImg" />
                        <div className='kol_act_BtnCnt'>
                          <h5 style={pageStyle.kol_act_BtnHead}>Yes Will RUG</h5>
                          <h6 style={pageStyle.kol_act_BtnSubHead}>{item.yesBitValue} Odds</h6>
                        </div>
                      </button>
                      <button className='kol_act_Btn kol_act_BtnNo' style={pageStyle.kol_act_Btn}>
                        <ImageComponent styles={pageStyle.kol_act_BtnImg} imgPic={kol_act_BtnImg2} alt="kol_act_BtnImg" />
                        <div className='kol_act_BtnCnt'>
                          <h5 style={pageStyle.kol_act_BtnHead}>No -Legit call</h5>
                          <h6 style={pageStyle.kol_act_BtnSubHead}>{item.noBitValue} Odds</h6>
                        </div>
                      </button>
                    </div>

                  </div>
                )
              })
            }
          </div>
        </div>

      </div>

      <BottomTab tabAct={2} />
    </div>
  )
}

const pageStyle = {
  kolpg_bdy_mainwrp: {
    padding: `${moderateScale(20)}px ${moderateScale(20)}px ${moderateScale(0)}px `,
  },
  kol_klPrd_wrp:{
    padding: `${moderateScale(26)}px ${moderateScale(18)}px ${moderateScale(36)}px `,
    marginTop:`${moderateScale(0)}px`,
  },
  kol_klPrd_cnt:{
    marginRight:`${moderateScale(20)}px`,
  },
  kol_klPrd_cntHed:{
    fontSize:`${moderateScale(17)}px`,
  },
  kol_klPrd_cntPara:{
    fontSize:`${moderateScale(12)}px`,
  },
  kol_klPrd_img:{
    width:`${moderateScale(41)}px`,
    height:`${moderateScale(41)}px`,
    marginRight:`${moderateScale(20)}px`,
  },
  kol_whtlrn_wrp:{
    padding:`${moderateScale(16)}px ${moderateScale(16)}px`,
    marginTop:`${moderateScale(16)}px`,
    gap: `${moderateScale(11)}px`
  },
  kol_whtlrn_img:{
    width:`${moderateScale(24)}px`,
    height:`${moderateScale(24)}px`,
  },
  kol_whtlrn_cnt:{
    fontSize:`${moderateScale(13.5)}px`,
  },
  kol_whtlrn_icon:{
    fontSize:`${moderateScale(20)}px`,
  },
  kol_actvprd_wrp:{
    marginTop:`${moderateScale(22)}px`,
  },
  kol_actv_tpcnt:{
    paddingBottom:`${moderateScale(16)}px`,
  },
  kol_actv_cnt:{
    fontSize:`${moderateScale(16)}px`,
  },
  kol_actvprd_row:{
    marginTop:`${moderateScale(16)}px`,
    gap:`${moderateScale(24)}px`,
    paddingBottom:`${moderateScale(110)}px`,
  },
  kol_actvprd_col:{
    padding:`${moderateScale(16)}px ${moderateScale(16)}px`,
  },
  kol_actv_colTop:{
    gap:`${moderateScale(12)}px`,
  },
  kol_actv_colTpImgWrp:{
    width:`${moderateScale(41)}px`,
    minWidth:`${moderateScale(41)}px`,
    height:`${moderateScale(41)}px`,
  },
  kol_actv_colTpImg:{
    width:`${moderateScale(23)}px`,
    minWidth:`${moderateScale(23)}px`,
    height:`${moderateScale(15)}px`,
  },
  kol_actv_colTpCnt:{
    gap:`${moderateScale(4)}px`,
  },
  kol_actv_colTpHead:{
    fontSize:`${moderateScale(14)}px`,
  },
  kol_actv_colTpPara:{
    fontSize:`${moderateScale(12)}px`,
  },
  kol_tab_CountWrp:{
    gap: `${moderateScale(10)}px`,
    marginTop: `${moderateScale(16)}px`,
  },
  kol_tab_CountHed:{
    fontSize: `${moderateScale(12)}px`,
    marginBottom: `${moderateScale(6)}px`,
    gap: `${moderateScale(5)}px`,
  },
  kol_tab_CountPara:{
    fontSize: `${moderateScale(12)}px`,
  },
  kol_tab_Countimg:{
    width: `${moderateScale(18)}px`,
    hight: `${moderateScale(18)}px`,
  },
  kol_predct_wrp:{
    marginTop: `${moderateScale(21)}px`,
    gap: `${moderateScale(8)}px`,
  },
  kol_predct_img:{
    width: `${moderateScale(20)}px`,
    hight: `${moderateScale(20)}px`,
  },
  kol_predct_cnt:{
    fontSize: `${moderateScale(14)}px`,
  },
  kol_act_Btnwrp:{
    marginTop: `${moderateScale(30)}px`,
    gap: `${moderateScale(15)}px`,
  },
  kol_act_Btn:{
    padding:`${moderateScale(10)}px ${moderateScale(10)}px`,
    gap:`${moderateScale(6)}px`,
  },
  kol_act_BtnImg:{
    width:`${moderateScale(20)}px`,
    height:`${moderateScale(20)}px`,
  },
  kol_act_BtnHead:{
    fontSize:`${moderateScale(12)}px`,
  },
  kol_act_BtnSubHead:{
    fontSize:`${moderateScale(10)}px`,
  },
}

export default KOLCalls