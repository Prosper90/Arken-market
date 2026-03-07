import React, { useEffect, useRef, useState } from 'react'
import './home.css'
import { moderateScale } from '../../utils/Scale'
import ImageComponent from '../../Components/ImageComponent'
import BottomTab from '../BottomTab/BottomTab'
import home_tpLogo2 from '../../assets/image/home_tpLogo2.webp'
import trophy_img from '../../assets/image/trophy_img.webp'
import nodatafound from '../../assets/image/nodatafound.webp'
import bulb_img from '../../assets/image/bulb_img.webp'
import marketdefault from '../../assets/image/marketdefault.webp'
import toast from "react-hot-toast";
import others from '../../assets/image/others.webp'
import InfiniteScroll from "react-infinite-scroll-component";

import apiService from "../../core/sevice/detail";
import { postMethod,getMethod } from "../../core/sevice/common.api";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from 'react-router-dom'
import { filterList, homeCardDetail, defaultHomeTabContent, homeTodayNews } from './data'
import { useMarkets } from '../../context/MarketContext'
import { useTelegramUser } from "../../context/TelegramUserContext";
import filterImg from '../../assets/image/filterImg.webp'
import resetImg from '../../assets/image/resetImg.webp'
import { IoSearch } from "react-icons/io5";


const Home = () => {

  // const subHradingTab = [
  //   {
  //     id:1,
  //     tabName:'tab1'
  //   },
  //   {
  //     id:2,
  //     tabName:'tab2'
  //   },
  //   {
  //     id:3,
  //     tabName:'tab3'
  //   },
  //   {
  //     id:4,
  //     tabName:'tab4'
  //   },
  //   {
  //     id:5,
  //     tabName:'tab5'
  //   },
  //   {
  //     id:6,
  //     tabName:'tab6'
  //   },
  //   {
  //     id:7,
  //     tabName:'tab7'
  //   },
  //   {
  //     id:8,
  //     tabName:'tab8'
  //   },
  // ]


  const SUBCATEGORY_MAP = {
  Sports: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "Cricket" },
    { id: 3, tabName: "Football" },
    { id: 4, tabName: "Basketball" },
    { id: 5, tabName: "AmericanFootball" },
    { id: 6, tabName: "Tennis" },
    { id: 7, tabName: "Motorsports" },
    { id: 8, tabName: "Hockey" },
    { id: 9, tabName: "Esports" },
    { id: 10, tabName: "BoxingMMA" },
    { id: 11, tabName: "Golf" },
    { id: 12, tabName: "Rugby" },
  ],

  Crypto: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "BTC" },
    { id: 3, tabName: "ETH" },
    { id: 4, tabName: "SOL" },
    { id: 5, tabName: "XRP" },
    { id: 6, tabName: "DOGE" },
  ],

  Technology: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "AI" },
    { id: 3, tabName: "SpaceX" },
    { id: 4, tabName: "IPO" },
    { id: 5, tabName: "Robotics" },
    { id: 6, tabName: "BigTech" },
    { id: 7, tabName: "MobileApps" },
    { id: 8, tabName: "IPOs" },
    { id: 9, tabName: "Semiconductors" },
    { id: 10, tabName: "Biotech" },
    { id: 11, tabName: "Quantum" },
    { id: 12, tabName: "SocialMedia" },
  ],

  ClimateAndScience: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "NaturalDisasters" },
    { id: 3, tabName: "ClimateChange" },
    { id: 4, tabName: "Space" },
    { id: 5, tabName: "Pandemics" },
    { id: 6, tabName: "Nuclear" },
    { id: 7, tabName: "Weather" },
    { id: 8, tabName: "ScienceResearch" },
  ],

  Finance: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "Stocks" },
    { id: 3, tabName: "Forex" },
    { id: 4, tabName: "Rates" },
    { id: 5, tabName: "Commodities" },
  ],

  Politics: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "USElections" },
    { id: 3, tabName: "WarConflict" },
    { id: 4, tabName: "Government" },
  ],

  WorldEvents: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "Elections" },
    { id: 3, tabName: "WarConflict" },
    { id: 4, tabName: "Protests" },
    { id: 5, tabName: "Sanctions" },
    { id: 6, tabName: "Health" },
    { id: 7, tabName: "ClimateEnergy" },
    { id: 8, tabName: "HumanRights" },
    { id: 9, tabName: "Awards" },
  ],

  Geopolitics: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "MiddleEast" },
    { id: 3, tabName: "Europe" },
    { id: 4, tabName: "AsiaPacific" },
    { id: 5, tabName: "Americas" },
    { id: 6, tabName: "Africa" },
    { id: 7, tabName: "WarSecurity" },
    { id: 8, tabName: "SanctionsDiplomacy" },
    { id: 9, tabName: "Energy" },
    { id: 10, tabName: "Cyber" },
  ],
  PopCulture: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "Music" },
    { id: 3, tabName: "Movies" },
    { id: 4, tabName: "TVShows" },
    { id: 5, tabName: "Celebrities" },
    { id: 6, tabName: "Gaming" },
    { id: 7, tabName: "SocialMedia" },
    { id: 8, tabName: "Awards" },
    { id: 9, tabName: "Legal" },
  ],
  Economy: [
    { id: 1, tabName: "All" },
    { id: 2, tabName: "Inflation" },
    { id: 3, tabName: "GDPGrowth" },
    { id: 4, tabName: "Housing" },
    { id: 5, tabName: "Employment" },
    { id: 6, tabName: "Banking" },
    { id: 7, tabName: "Markets" },
    { id: 8, tabName: "Corporate" },
    { id: 9, tabName: "Recession" },
  ],

  Other: [{ id: 1, tabName: "All" }]
};
    const [mainCategory, setMainCategory] = useState("Sports");


// const subHradingTab = SUBCATEGORY_MAP[mainCategory] || SUBCATEGORY_MAP.Other;
const [subTitleId, setSubTitleId] = useState(1);
const [subTitleName, setSubTitleName] = useState("All");
const [subHradingTab, setSubHradingTab] = useState([]);

    const navigation = useNavigate()
const [search, setSearch] = useState("");
const searchTimeoutRef = useRef(null);
    const percentage = 50;
    const [filterShow, setFilterShow] = useState(false)
    const [filterSelected, setFilterSelected] = useState(false)
const [cursor, setCursor] = useState(null);
const [homeTabContent, setHomeTabContent] = useState(defaultHomeTabContent);
const [hasMore, setHasMore] = useState(true);
    const [tabActive, setTabActive] = useState(1)
    const [tabName, setTabName] = useState('All')
    const [homeCardData, setHomeCardData] = useState([])
    const loaderRef = useRef(null);

    const [totalWinnings, setTotalWinnings] = useState({
  totalWinningsUSDT: 0,
  currencyBreakdown: {},
  totalWinningBets: 0,
});

const [loading, setLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

      const [activeIndex, setActiveIndex] = useState(0);
      const [stats, setStats] = useState([]);
const [loadingStats, setLoadingStats] = useState(false);
const { setMarkets,markets } = useMarkets();
const cursorRef = useRef(null);
const [isSearching, setIsSearching] = useState(false);

const [category, setCategory] = useState("All"); 

const loaderRef2 = useRef(null);

// const tabFilter = (tab, data) => {
//   if (!Array.isArray(data)) return;

//   if (tab === "All") {
//     setHomeCardData(data);

//   } else if (tab === "Crypto") {
//     setHomeCardData(
//       data.filter(m => m.category === 'Crypto')
//     );

//   } else if (tab === "Manual") {
//     setHomeCardData(
//       data.filter(m => m.source === "manual")
//     );

//   } else {
//     setHomeCardData(
//       data.filter(m => m.currency === null)
//     );
//   }
// };




useEffect(() => {
  if (tabName === "All") {
    setSubHradingTab([]); 
    setSubTitleId(1);
    setSubTitleName("All");
    return;
  }

  const tabs = SUBCATEGORY_MAP[tabName] || [];

  setSubHradingTab(tabs);
  setSubTitleId(1);
  setSubTitleName("All");

}, [tabName]);

useEffect(() => {
  cursorRef.current = cursor;
}, [cursor]);

  const {telegramUser } = useTelegramUser();

const fetchTotalWinnings = async () => {
  try {

    console.log('inside function===')
    setLoading(true);

    // const payload = {
    //   initData: 'query_id=AAHfJJ5WAAAAAN8knlakRn1m&user=%7B%22id%22%3A1453204703%2C%22first_name%22%3A%22Jeyaraj%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Jeyofficial%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FLEX4sSv6eI7bWrXHqgk2VXBa78VUphxnBHOBs81CNUE.svg%22%7D&auth_date=1768389356&signature=TrDc0r7nZGDVbJ8mRewxCg8LA-n8O17MM9-FVsGMHJqtQMX8jt5ws9mjx3nvP5RZJNoTagN0QI6JPgvhsf_5DQ&hash=fbe00adf8aac171c3c4af68a57303c3d1bcc31b347652400bd133ecbb0711e57',
    // };
    const payload = {
      initData: telegramUser.intData|| window.Telegram?.WebApp?.initData,
    };

    if (!payload.initData) {
      toast.error("Telegram init data not available");
      return;
    }

    const resp = await postMethod({
      apiUrl: apiService.getUserTotalWinnings,
      payload,
    });

    if (resp.success) {
      console.log("Total winnings:", resp.data);
      setTotalWinnings(resp.data);
    } else {
      toast.error(resp.message || "Failed to load winnings");
    }
  } catch (error) {
    console.error("Total winnings error:", error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

const onTabChange = (tab, item) => {
  setCategory(tab);
  setMarkets([]);
  setStats([]);
  setCursor(null);
  cursorRef.current = null;
  setHasMore(true);

  setHomeTabContent((prev) => {
    if (tab === "Manual" || tab === "All" || tab === "Crypto") {
      setTabActive(
        defaultHomeTabContent.find(t => t.tabTitle === tab)?.id || 1
      );
      setTabName(tab);
      return defaultHomeTabContent;
    }

    let updated = prev.filter(t => t.tabTitle !== "Manual");
    let existingTab = updated.find(t => t.tabTitle === tab);

    if (!existingTab) {
      const newTab = { id: Date.now(), tabTitle: tab };

      if (updated.length >= 3) {
        updated = [updated[0], updated[1], newTab];
      } else {
        updated.push(newTab);
      }

      existingTab = newTab;
    }

    setTabActive(existingTab.id);
    setTabName(existingTab.tabTitle);

    return updated;
  });

  getMarketsStats(false, tab);
};



// useEffect(() => {
//   if (stats?.length > 0) {
//     tabFilter(tabName, stats);
//   }
// }, [tabName, stats]);

    const getEndsIn = (endDate) => {
  const diff = new Date(endDate) - new Date();
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  return `${hrs} hrs`;
};

    
useEffect(() => {
  getMarketsStats(false);
  
}, []);
useEffect(() => {
  fetchTotalWinnings();
  
}, []);

useEffect(() => {
  if (!loaderRef2.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (
        entry.isIntersecting &&
        hasMore &&
        !loadingStats
      ) {
        getMarketsStats(true);
      }
    },
    { threshold: 0.2 }
  );

  observer.observe(loaderRef2.current);

  return () => observer.disconnect();
}, [hasMore, loadingStats]);

const getMarketsStats = async (isLoadMore = false, selectedCategory = category,selectedSubcategory = subTitleName,searchText = search) => {
  try {
    if (isLoadMore && !hasMore) return;

    setLoadingStats(true);

    const data = {
      apiUrl: apiService.getmergedmarkets,
      payload: {
        limit: 10,
        cursor: isLoadMore ? cursorRef.current : null,
        category: selectedCategory === "All" ? null : selectedCategory,
        subcategory: selectedSubcategory === "All" ? null : selectedSubcategory,
        search: searchText || null,
        telegramId: telegramUser?.telegramId || null,
      },
    };

    const resp = await postMethod(data);

    if (resp.success) {
      if (isLoadMore) {
        setMarkets((prev) => [...prev, ...resp.data]);
        setStats((prev) => [...prev, ...resp.data]);
      } else {
        setMarkets(resp.data);
        setStats(resp.data);
      }

      setCursor(resp.nextCursor);
      cursorRef.current = resp.nextCursor;
      setHasMore(resp.hasMore);
    }
  } catch (error) {
    console.error("Error fetching markets:", error);
  } finally {
    setLoadingStats(false);
  }
};



useEffect(() => {
  setSubTitleId(1);
  setSubTitleName("All");
  cursorRef.current = null;

  getMarketsStats(false, tabName, "All");
}, [tabName]);

 const fetchHomeTodayNews = async () => {
    try {
      setLoading(true);

    const data = {
      apiUrl: apiService.getHomeTodayNews,
    };

      const resp = await getMethod(data);

      setLoading(false);

      if (resp.success) {
        setNews(resp.data);
      } else {
        setNews([
          { id: 1, description: "Total bets today: $0 · 0 predictions placed" },
          { id: 2, description: "Today’s Top Winner: -- +$0" },
          { id: 3, description: "Today’s Top Winner: -- +$0" },
        ]);
      }
    } catch (err) {
      setLoading(false);
      setNews([
        { id: 1, description: "Total bets today: $0 · 0 predictions placed" },
        { id: 2, description: "Today’s Top Winner: -- +$0" },
        { id: 3, description: "Today’s Top Winner: -- +$0" },
      ]);
      console.error("Error fetching home today news:", err);
    }
  };

  useEffect(() => {
    fetchHomeTodayNews();
  }, []);

    useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % homeTodayNews.length); 
    }, 3000);


    return () => {
      clearInterval(interval);
    };
  }, []);


  const handleJoinPrivateMarket = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) { toast.error('Enter an invite code'); return; }
    const tid = telegramUser?.telegramId;
    if (!tid) { toast.error('Telegram ID not found'); return; }
    setJoinLoading(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.joinPrivateMarket,
        payload: { inviteCode: code, telegramId: tid },
      });
      if (resp && resp.success) {
        setJoinCode('');
        if (resp.alreadyJoined) {
          toast.success('Already joined — refreshing...');
          getMarketsStats(false, tabName, subTitleName);
        } else {
          navigation('/join-private-market', { state: { market: resp.market, telegramId: tid } });
        }
      } else {
        toast.error(resp?.message || 'Invalid invite code');
      }
    } catch (e) {
      toast.error('Something went wrong');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleResetFilters = () => {
  setTabActive(defaultHomeTabContent[0].id); 
  setTabName(defaultHomeTabContent[0].tabTitle);

  setCategory(defaultHomeTabContent[0].tabTitle);

  setMarkets([]);
  setStats([]);
  setCursor(null);
  cursorRef.current = null;
  setHasMore(true);

  setHomeTabContent(defaultHomeTabContent);

  getMarketsStats(false, defaultHomeTabContent[0].tabTitle);
};


  return (
      <div className='cmmn_bdy_mainwrp home_bdy_mainwrp' style={pageStyle.cmmn_bdy_mainwrp} >
        <div className='home_topUi1' style={pageStyle.home_topUi1} >
            <div className='home_topUicnt' style={pageStyle.home_topUicnt}>
                <ImageComponent styles={pageStyle.home_topUiImg} imgPic={home_tpLogo2} alt="home_tpLogo" />
                Arken
            </div>
            <div style={{ paddingTop: '30px' }}>
              <button
                onClick={() => navigation('/create-market')}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '5px 11px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                ➕ Create
              </button>
            </div>
        </div>
          <div className='home_wrp_main' style={pageStyle.home_wrp_main}>

            <div className='home_tltwin_main' style={pageStyle.home_tltwin_main}>
                <ImageComponent styles={pageStyle.trophy_img} imgPic={trophy_img} alt="trophy_img" />
              <div className="home_tltwin_cnt">
  <p style={pageStyle.home_tltwin_cntHed}>Total Winnings</p>

  {loading ? (
    <div className="skl skl-number-md" />
  ) : (
    <h6 style={pageStyle.home_tltwin_cntPara}>
      $ {totalWinnings.totalWinningsUSDT}
    </h6>
  )}
</div>
                <span className='home_tltwin_cntSpan' style={pageStyle.home_tltwin_cntSpan} onClick={() => {navigation("/Wallet")}}  >
                    Wallet 
                    <IoIosArrowForward style={pageStyle.home_tltwin_aricon}   /> 
                </span>
            </div>

            <div className='hm_klPrd_wrp' style={pageStyle.hm_klPrd_wrp}  >
                <div className='hm_klPrd_cnt' style={pageStyle.hm_klPrd_cnt}>
                    <h5 style={pageStyle.hm_klPrd_cntHed}>Group Predictions</h5>
                    <p style={pageStyle.hm_klPrd_cntPara}>Predict whether Group calls will rug or succeed</p>
                </div>
                <ImageComponent styles={pageStyle.hm_klPrd_img} imgPic={bulb_img} alt="bulb_img" />
                {/* <IoIosArrowForward style={pageStyle.hm_klPrd_icon} />  */}
            </div>

            {/* Join Private Market */}
            <div style={{
              margin: '12px 16px',
              background: 'rgba(138,99,255,0.08)',
              border: '1px solid rgba(138,99,255,0.25)',
              borderRadius: '14px',
              padding: '14px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginBottom: '10px' }}>
                🔒 Join Private Market
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    padding: '10px 12px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  }}
                  placeholder="INVITE CODE"
                  value={joinCode}
                  maxLength={7}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                />
                <button
                  onClick={handleJoinPrivateMarket}
                  disabled={joinLoading}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: joinLoading ? 'not-allowed' : 'pointer',
                    opacity: joinLoading ? 0.6 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {joinLoading ? '...' : 'Join'}
                </button>
              </div>
            </div>

            {/* <div className='hm_homeCarsl_wrp' style={pageStyle.hm_homeCarsl_wrp}>
                <div className='hm_homeCarsl' style={pageStyle.hm_homeCarsl}>
                    <p style={pageStyle.hm_homeCarsl_cnt}>Total bets today: $1.24M · 42,813 predictions placed</p>
                </div>
            </div> */}

              <div className='hm_homeCarsl_wrp'  style={pageStyle.hm_homeCarsl_wrp}>
                      {
                          news?.map((item, index) => {
                              return (
                                <div className='hm_homeCarsl' style={{
                                    padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
                                    transform: `translateX(-${activeIndex * 100}%)`
                                }}>
                                  <p key={index}
                                        style={{
                                            fontSize: `${moderateScale(12)}px`,
                                            // transform: `translateX(-${activeIndex * 100}%)`
                                        }}
                                      className={`${activeIndex === index ? 'activeImg' : ''}`}
                                  >
                                      {item.description}
                                  </p>

                                  <ul className='hm_homeCarsl_ind' style={pageStyle.hm_homeCarsl_ind}>
                                    {
                                        homeTodayNews.map((item,index) => {
                                            return(
                                                <li
                                                style={pageStyle.indicatorLine}
                                                className={`${activeIndex === index ? 'activeIndicator' : ''}`}
                                                >
                                                    {index + 1}
                                                </li>
                                            )
                                        })
                                    }
                                  </ul>
                                  </div>
                              )
                          })
                      }
              </div>

            <div className='home_tab_main' style={pageStyle.home_tab_main} >
             <div className='searchInput'>
  <span><IoSearch /></span>
 <input
  placeholder='Search'
  value={search}
 onChange={(e) => {
  let value = e.target.value;
  if (value.length === 1 && value.startsWith(" ")) {
    return;
  }

  setSearch(value);

  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  searchTimeoutRef.current = setTimeout(() => {
    if (value.length >= 3) {
      setIsSearching(true);  

      setCursor(null);
      cursorRef.current = null;
      setHasMore(true);

      getMarketsStats(false, category, subTitleName, value);
    } else if (value.length === 0) {
      setIsSearching(false);  

      setCursor(null);
      cursorRef.current = null;
      setHasMore(true);

      getMarketsStats(false, category, subTitleName, null);
    }
  }, 500);
}}

/>
</div>

          <div className='home_tab_inside' style={pageStyle.home_tab_inside}>

            {!isSearching && (  <div className='home_tab_insideWrp'>
              <ul className="nav mb-3 home_tab_wrp" style={pageStyle.home_tab_wrp}>
              {homeTabContent.map((item, i) => {
                const moveAll = tabActive === homeTabContent.length;

                return (
                  <li
                    key={i}
                    className={moveAll ? "move-all-left" : ""}
                    onClick={() => {
                      // setTabActive(item.id);
                      // setTabName(item.tabTitle);
                      onTabChange(item.tabTitle,item)
                    }}
                  >
                    <button
                      className={`${tabActive == item.id ? "active" : ""} home_tab_btn`}
                      style={pageStyle.home_tab_btn}
                    >
                      {item.tabTitle}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div onClick={() => {setFilterShow(!filterShow)}} style={pageStyle.filterImgWrp}>
              <ImageComponent styles={pageStyle.filterImg} imgPic={filterImg} alt="filterImg" />
            </div>
            </div>)}
          

   {tabName !== "All" && !isSearching && (
  <div className='subHradingTabWrp'>
    {subHradingTab.map((item) => (
      <div
        key={item.id}
        className={`subHradingTabItm ${item.id == subTitleId ? 'subHradingTabItmAct' : ''}`}
        onClick={() => {
          setSubTitleId(item.id);
          setSubTitleName(item.tabName);
          getMarketsStats(false, tabName, item.tabName);
        }}
        style={pageStyle.subHradingTabItm}
      >
        <span className='subHradingTabTlt' style={pageStyle.subHradingTabTlt}>
          {item.tabName}
        </span>
      </div>
    ))}
  </div>
)}

          </div>


 <div className="tab-content home_tab_content" style={pageStyle.home_tab_content}>
  <div className='home_tab_row' style={pageStyle.home_tab_row}>

    {loadingStats ? (
      Array.from({ length: 6 }).map((_, index) => (
        <div  key={index} className='home_tab_itm' style={pageStyle.home_tab_itm}>

          <div className='home_tab_TpSpan' style={pageStyle.home_tab_TpSpan}>
            <span className='skeleton skeleton-badge'></span>
            <span className='skeleton skeleton-badge'></span>
          </div>

          <div className='image_and_header' style={pageStyle.image_and_header}>
            <div className='skeleton skeleton-image'></div>
            <div className='skeleton skeleton-title'></div>
          </div>

          <div className='homt_tab_CountWrp' style={pageStyle.homt_tab_CountWrp}>
            <div className='homt_tab_Countitm' style={pageStyle.homt_tab_Countitm}>
              <div className='skeleton skeleton-text'></div>
            </div>

            <div className='homt_tab_Countitm' style={pageStyle.homt_tab_Countitm}>
              <div className='skeleton skeleton-text'></div>
            </div>

            <div className='skeleton skeleton-circle'></div>
          </div>

          <div className='skeleton skeleton-button'></div>
        </div>
      ))
    ) : stats?.length > 0 ? (

      stats.filter(item => item.marketStatus !== 'pending').map((item, index) => {
        const percentage = item.chancePercents?.[0] || 0;
        const statusLabel = item.marketStatus
          ? item.marketStatus.charAt(0).toUpperCase() + item.marketStatus.slice(1)
          : item.active ? "Active" : "Closed";

        return (
          <div key={index} className='home_tab_itm' style={pageStyle.home_tab_itm}>
            <div className='home_tab_TpSpan' style={pageStyle.home_tab_TpSpan}>
              <span
                className={item.category === 'Crypto' ? 'cryptoBadge' : 'stockBadge'}
                style={pageStyle.home_tab_span}
              >
                {item.category}
              </span>
              <span style={pageStyle.home_tab_span}>
                {statusLabel}
              </span>
            </div>

          <div className='image_and_header' style={pageStyle.image_and_header}>
  <ImageComponent
    imgPic={
      item.image
        ? item.image
        : item.category === 'Crypto'
        ? marketdefault
        : others
    }
    alt="market"
    styles={pageStyle.home_tab_leftimg}
  />
  <h5 className='home_tab_head' style={pageStyle.home_tab_head}>
    {item.question}
  </h5>
</div>

            <div className='homt_tab_CountWrp' style={pageStyle.homt_tab_CountWrp}>
              <div className='homt_tab_Countitm' style={pageStyle.homt_tab_Countitm}>
                <h6 className='homt_tab_CountHed' style={pageStyle.homt_tab_CountHed}>
                  Liquidity
                </h6>
                <p className='homt_tab_CountPara' style={pageStyle.homt_tab_CountPara}>
                  ${item.liquidity}
                </p>
              </div>

              <div className='homt_tab_Countitm' style={pageStyle.homt_tab_Countitm}>
                <h6 className='homt_tab_CountHed' style={pageStyle.homt_tab_CountHed}>
                  Ends in
                </h6>
                <p className='homt_tab_CountPara' style={pageStyle.homt_tab_CountPara}>
                  {getEndsIn(item.endDate)}
                </p>
              </div>

              <div>
                <div className='chance_circle_div'>
                  <div className='chance_circle_divinside' style={pageStyle.chance_circle_divinside}>
                    <div className='chance_circle_outerbox' style={pageStyle.chance_circle_outerbox}></div>

                    <div
                      className="chance_circle_outerone"
                      style={{
                        ...pageStyle.chance_circle_outerone,
                        clipPath: `inset(0 ${100 - percentage}% 0 0)`
                      }}
                    ></div>

                    <div className='chance_circle_outertwo' style={pageStyle.chance_circle_outertwo}>
                      {percentage}%
                    </div>
                  </div>
                </div>

                <div className='chance_circle_outerthree' style={pageStyle.chance_circle_outerthree}>
                  Chances
                </div>
              </div>
            </div>

            <button
         onClick={() => {
  navigation(`/market-details/${item._id}`, {
    state: { item },
  });

}}
              className='home_tab_goBtn'
              style={pageStyle.home_tab_goBtn}
            >
              Go
            </button>
          </div>
        );
      })

    ) : (
      <div className='cmmn_tbl_noData'>
         <ImageComponent
                imgPic={nodatafound}
                alt="market"
                styles={pageStyle.home_tab_leftimgnodata}
              />
        {/* <h6 className='cmmn_tbl_noTxt'>No Data</h6> */}
      </div>
    )}

              <div ref={loaderRef2} style={{ height: 40 }}>
                {/* {loading && <p>Loading...</p>} */}
              </div>

  </div>
</div>

</div>


          </div>
          <BottomTab tabAct={1} />

          {/* filter ui */}

      {
        filterShow ? (
          <div className='flterBtmSheetBavkdrop' onClick={() => { setFilterShow(false) }}>
            <div className={`flterBtmSheet `} style={pageStyle.flterBtmSheet}>
              <div className='flterBtmSheetIns' style={pageStyle.flterBtmSheetIns}>

                {/* line */}
                <div style={pageStyle.flterBtmline} className='flterBtmline'>
                  <span></span>
                </div>

                {/* filter & reset */}
                <div style={pageStyle.filteRstWrp} className='filteRstWrp'>
                  <span style={pageStyle.filteRstItm} className='filteRstItm'  >
                    <ImageComponent imgPic={filterImg} alt={'filterImg'} styles={pageStyle.filteRstImg1} />
                    Filter
                  </span>
                  <span style={pageStyle.filteRstItm2} className='filteRstItm2' onClick={handleResetFilters}>
                    <ImageComponent imgPic={resetImg} alt={'filterImg'} styles={pageStyle.filteRstImg2} />
                    Reset
                  </span>
                </div>

                {/* list itm */}
                <ul style={pageStyle.filterItmWrp} className='filterItmWrp'>
                  {
                    filterList.map((item, index) => {
                      return (
                        <li key={index} onClick={() => { setFilterSelected(item.id); onTabChange(item.tabTitle) }} style={pageStyle.filterItm} className={`filterItm ${item.id == filterSelected ? 'filterActive' : ''}`}>
                          <img style={pageStyle.filterItmImg} src={new URL(item.img, import.meta.url)} alt={'filterImg'} />
                          <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{item.tabTitle}</span>
                        </li>
                      )
                    })
                  }
                </ul>

                {/* list itm */}
                {/* <ul style={pageStyle.filterItmWrp} className='filterItmWrp'>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg1,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Politics'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg2,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Sports'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg3,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Crypto'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg4,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Finance'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg5,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Geopolitics'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg6,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Earning'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg7,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Tech'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg8,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Culture'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg9,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'World'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg10,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Climate & Science'}</span>
            </li>
            <li style={pageStyle.filterItm} className='filterItm'>
              <img style={pageStyle.filterItmImg} src={new URL(filterImg11,import.meta.url)} alt={'filterImg'} />  
              <span style={pageStyle.filterItmTxt} className='filterItmTxt'>{'Election'}</span>
            </li>
          </ul> */}

              </div>
            </div>
          </div>
        ) : null
      }


      </div>
  )
}

const pageStyle = {
    obrd_back_wrp:{
        marginBottom: `${moderateScale(15)}px`,
    },
    image_and_header:{
        marginTop: `${moderateScale(16)}px`,
        gap: `${moderateScale(8)}px`,
    },
    chance_circle_outertwo:{
        marginTop: `${moderateScale(4)}px`,
        fontSize: `${moderateScale(12)}px`,
    },
    chance_circle_outerthree:{
        
        fontSize: `${moderateScale(10)}px`,
    },
    home_topUi1:{
        // height: `${moderateScale(180)}px`,
        height: `160px`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '12px 16px 0',
    },
    home_topUiImg:{
        width: `${moderateScale(24)}px`,
        height: `${moderateScale(24)}px`,
    },
    home_tab_leftimgnodata:{
        width: `${moderateScale(120)}px`,
        height: `${moderateScale(120)}px`,
    },
    chance_circle_outerbox:{
        width: `${moderateScale(50)}px`,
        height: `${moderateScale(30)}px`,
    },
    chance_circle_divinside:{
        width: `${moderateScale(53)}px`,
        height: `${moderateScale(30)}px`,
    },
    chance_circle_outerone:{
        width: `${moderateScale(50)}px`,
        height: `${moderateScale(30)}px`,
    },
    home_tab_leftimg:{
        width: `${moderateScale(38)}px`,
        height: `${moderateScale(38)}px`,
        borderRadius:`${moderateScale(50)}%`
    },
    home_wrp_main:{
        // height: `calc(${'100'}% - (${moderateScale(180)}px) + 60px)`,
        height: `calc(${'100'}% - (160px) + 60px)`,
        padding: `${moderateScale(0)}px ${moderateScale(20)}px ${moderateScale(110)}px `,
    },
    home_topUicnt:{
        gap: `${moderateScale(11)}px`,
        fontSize: `${moderateScale(30)}px`,
    },
    home_tltwin_main:{
        padding: `${moderateScale(16)}px ${moderateScale(14)}px `,
        gap: `${moderateScale(22)}px`,
        marginTop: `${moderateScale(20)}px`,
    },
    trophy_img:{
        width: `${moderateScale(29)}px`,
        height: `${moderateScale(29)}px`,
    },
    home_tltwin_cntHed:{
        fontSize: `${moderateScale(12)}px`,
        marginBottom: `${moderateScale(5)}px`,
    },
    home_tltwin_cntPara:{
        fontSize: `${moderateScale(14)}px`,
    },
    home_tltwin_cntSpan:{
        fontSize: `${moderateScale(14)}px`,
    },
    home_tltwin_aricon:{
        fontSize: `${moderateScale(20)}px`,
    },
    hm_klPrd_wrp:{
        padding: `${moderateScale(26)}px ${moderateScale(18)}px ${moderateScale(36)}px `,
        marginTop:`${moderateScale(20)}px`,
    },
    hm_klPrd_cnt:{
        marginRight:`${moderateScale(20)}px`,
    },
    hm_klPrd_cntHed:{
        fontSize:`${moderateScale(17)}px`,
    },
    hm_klPrd_cntPara:{
        fontSize:`${moderateScale(12)}px`,
    },
    hm_klPrd_img:{
        width:`${moderateScale(41)}px`,
        height:`${moderateScale(41)}px`,
        marginRight:`${moderateScale(20)}px`,
    },
    hm_klPrd_icon:{
        fontSize:`${moderateScale(30)}px`,
    },
    home_tab_main:{
        // marginTop:`${moderateScale(25)}px`,
    },
    home_tab_wrp:{
        gap:`${moderateScale(16)}px`,
    },
    home_tab_btn:{
        padding: `${moderateScale(6)}px ${moderateScale(15)}px`,
        fontSize:`${moderateScale(15)}px`,
    },
    home_tab_content:{
        marginTop: `${moderateScale(24)}px`,
    },
    home_tab_row:{
        gap: `${moderateScale(24)}px`,
    },
    home_tab_itm:{
        padding: `${moderateScale(16)}px ${moderateScale(16)}px ${moderateScale(24)}px`,
    },
    home_tab_TpSpan:{
        gap: `${moderateScale(8)}px`,
    },
    home_tab_span:{
        fontSize: `${moderateScale(12)}px`,
        padding: `${moderateScale(5)}px ${moderateScale(10)}px`,
    },
    home_tab_head:{
        fontSize: `${moderateScale(14)}px`,
        // marginBottom: `${moderateScale(8)}px`,
        // marginTop: `${moderateScale(10)}px`,
    },
    home_tab_para:{
        fontSize: `${moderateScale(12)}px`,
    },
    home_tab_goBtn:{
        fontSize: `${moderateScale(14)}px`,
        marginTop: `${moderateScale(26)}px`,
        padding: `${moderateScale(10)}px ${moderateScale(10)}px`,
    },
    homt_tab_CountWrp:{
        gap: `${moderateScale(10)}px`,
        marginTop: `${moderateScale(16)}px`,
        padding: `${moderateScale(0)}px ${moderateScale(10)}px`,
    },
    homt_tab_CountHed:{
        fontSize: `${moderateScale(12)}px`,
        marginBottom: `${moderateScale(6)}px`,
        gap: `${moderateScale(5)}px`,
    },
    homt_tab_CountPara:{
        fontSize: `${moderateScale(12)}px`,
    },
    homt_tab_Countimg:{
        width: `${moderateScale(18)}px`,
        hight: `${moderateScale(18)}px`,
    },
    hm_homeCarsl_wrp:{
        marginTop: `${moderateScale(16)}px `,
        marginBottom: `${moderateScale(16)}px `,
    },
    hm_homeCarsl:{
        // padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
    },
    hm_homeCarsl_cnt:{
        // fontSize: `${moderateScale(12)}px`,
        // transform: `translateX(-${activeIndex * 100}%)`
    },
    hm_homeCarsl_ind:{
        gap: `${moderateScale(8)}px`,
    },
    indicatorLine:{
        width: `${moderateScale(20)}px`,
        minWidth: `${moderateScale(20)}px`,
        height: `${moderateScale(5)}px`,
        minHeight: `${moderateScale(5)}px`,
    },
    filterImgWrp:{
        // width: `${moderateScale(40)}px`,
        // height: `${moderateScale(40)}px`,
        padding: `${moderateScale(0)}px ${moderateScale(20)}px`,
        paddingRight:0,
        paddingLeft:`${moderateScale(10)}px`,
    },
    filterImg:{
      width: `${moderateScale(32)}px`,
      height: `${moderateScale(32)}px`,
      
    },
    home_tab_inside:{
      paddingTop:`${moderateScale(15)}px`,
      paddingBottom:`${moderateScale(15)}px`,
      zIndex: 100,
    },
    flterBtmSheet:{
      padding: `${moderateScale(18)}px ${moderateScale(0)}px`,
      // paddingBottom: `${moderateScale(120)}px`,
    },
    filteRstWrp:{
      marginTop:`${moderateScale(13)}px`,
      marginBottom:`${moderateScale(26)}px`,
      padding: `${moderateScale(0)}px ${moderateScale(18)}px`,
    },
    filteRstItm:{
      fontSize: `${moderateScale(15)}px`,
      gap: `${moderateScale(8)}px`,
    },
    filteRstImg1:{
      width: `${moderateScale(22)}px`,
      height: `${moderateScale(22)}px`,
    },
    filteRstItm2:{
      fontSize: `${moderateScale(15)}px`,
      gap: `${moderateScale(8)}px`,
    },
    filteRstImg2:{
      width: `${moderateScale(22)}px`,
      height: `${moderateScale(22)}px`,
    },
    filterItmWrp:{
      
    },
    filterItm:{
      padding:`${moderateScale(16)}px ${moderateScale(24)}px`,
    },
    filterItmImg: {
      width: `${moderateScale(24)}px`,
      height: `${moderateScale(24)}px`,
      marginRight: `${moderateScale(8)}px`,
      filter: 'brightness(0) saturate(100%) invert(100%) sepia(10%) saturate(7444%) hue-rotate(234deg) brightness(120%) contrast(116%)',
    },
    filterItmTxt:{
      fontSize: `${moderateScale(14)}px`,
    },
    subHradingTabItm:{
      padding: `${moderateScale(8)}px ${moderateScale(14)}px`,
    },
    subHradingTabTlt:{
      fontSize: `${moderateScale(16)}px`,
    },
    
}

export default Home