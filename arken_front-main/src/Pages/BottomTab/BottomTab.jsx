import React, { useState } from 'react'
import "./bottomTab.css"
import ImageComponent from '../../Components/ImageComponent'
import bttm_tab_img1 from '../../assets/image/bttm_tab_img1.webp'
import bttm_tab_img2 from '../../assets/image/bttm_tab_img2.webp'
import bttm_tab_img3 from '../../assets/image/bttm_tab_img3.webp'
import bttm_tab_img4 from '../../assets/image/bttm_tab_img4.webp'
import { moderateScale } from '../../utils/Scale'
import { useNavigate } from 'react-router-dom'

const BottomTab = ({tabAct}) => {
        const [tabActive, setTabActive] = useState(tabAct ? tabAct : 1)
        const navigation = useNavigate()

        const bottomTabData = [
            {
                id:1,
                img:bttm_tab_img1,
                tabTitle:'Markets',
                tabName:'Markets',
                link:'markets'
            },
            {
                id:2,
                img:bttm_tab_img2,
                tabTitle:'Deposit',
                tabName:'Deposit',
                link:'deposit'
            },
            {
                id:3,
                img:bttm_tab_img3,
                tabTitle:'Wallet',
                tabName:'Wallet',
                link:'wallet',
            },
            {
                id:4,
                img:bttm_tab_img4,
                tabTitle:'Profile',
                tabName:'Profile',
                link:'profile',
            },
        ]
    
  return (
    <div className='bttm_tab_main' style={pageStyle.bttm_tab_main} >
          
          <ul className="nav mb-3 bttm_tab_wrp" id="pills-tab" role="tablist">
              {
                  bottomTabData.map((item, i) => {
                      return (
                          <li key={i}
                              onClick={() => {
                                  setTabActive(item.id);
                                  navigation(`/${item.link}`)
                              }} role="presentation">
                              <button
                                  className={`${tabActive == item.id ? 'active' : ''} bttm_tab_btn`}
                                  id={`pills-${item.tabTitle}-tab`}
                                  data-bs-toggle="pill"
                                  data-bs-target={`#pills-${item.tabTitle}`}
                                  type="button" role="tab" aria-controls={`pills-${item.tabTitle}`}
                                  aria-selected="true"
                              >
                                  <ImageComponent styles={pageStyle.bttm_tab_img} imgPic={item.img} alt="onbrd_dtlSw_img" />
                                  <p style={pageStyle.bttm_tab_name} >{item.tabName}</p>
                              </button>
                          </li>
                      )
                  })
              }
          </ul>
    </div>
  )
}

const pageStyle = {
    bttm_tab_main:{
         padding: `${moderateScale(13)}px ${moderateScale(25)}px`
    },
    bttm_tab_img:{
        width: `${moderateScale(28)}px`,
        height: `${moderateScale(28)}px`,
    },
    bttm_tab_name:{
        fontSize: `${moderateScale(13)}px`,
        marginLeft: `${moderateScale(5)}px`,
    },
}

export default BottomTab