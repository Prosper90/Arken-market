import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroll-component';

import apiService from '../../core/sevice/detail';
import { postMethod, getMethod } from '../../core/sevice/common.api';
import { useNavigate } from 'react-router-dom';
import { filterList, defaultHomeTabContent, homeTodayNews } from './data';
import { useMarkets } from '../../context/MarketContext';
import { useTelegramUser } from '../../context/TelegramUserContext';
import BottomTab from '../BottomTab/BottomTab';
import { C } from '../../theme';
import { SearchIcon, PlusIcon } from '../../Components/Icons';

const SUBCATEGORY_MAP = {
  Sports: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'Cricket' }, { id: 3, tabName: 'Football' },
    { id: 4, tabName: 'Basketball' }, { id: 5, tabName: 'AmericanFootball' }, { id: 6, tabName: 'Tennis' },
    { id: 7, tabName: 'Motorsports' }, { id: 8, tabName: 'Hockey' }, { id: 9, tabName: 'Esports' },
    { id: 10, tabName: 'BoxingMMA' }, { id: 11, tabName: 'Golf' }, { id: 12, tabName: 'Rugby' },
  ],
  Crypto: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'BTC' }, { id: 3, tabName: 'ETH' },
    { id: 4, tabName: 'SOL' }, { id: 5, tabName: 'XRP' }, { id: 6, tabName: 'DOGE' },
  ],
  Technology: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'AI' }, { id: 3, tabName: 'SpaceX' },
    { id: 4, tabName: 'IPO' }, { id: 5, tabName: 'Robotics' }, { id: 6, tabName: 'BigTech' },
    { id: 7, tabName: 'MobileApps' }, { id: 8, tabName: 'IPOs' }, { id: 9, tabName: 'Semiconductors' },
    { id: 10, tabName: 'Biotech' }, { id: 11, tabName: 'Quantum' }, { id: 12, tabName: 'SocialMedia' },
  ],
  ClimateAndScience: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'NaturalDisasters' }, { id: 3, tabName: 'ClimateChange' },
    { id: 4, tabName: 'Space' }, { id: 5, tabName: 'Pandemics' }, { id: 6, tabName: 'Nuclear' },
    { id: 7, tabName: 'Weather' }, { id: 8, tabName: 'ScienceResearch' },
  ],
  Finance: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'Stocks' }, { id: 3, tabName: 'Forex' },
    { id: 4, tabName: 'Rates' }, { id: 5, tabName: 'Commodities' },
  ],
  Politics: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'USElections' }, { id: 3, tabName: 'WarConflict' },
    { id: 4, tabName: 'Government' },
  ],
  WorldEvents: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'Elections' }, { id: 3, tabName: 'WarConflict' },
    { id: 4, tabName: 'Protests' }, { id: 5, tabName: 'Sanctions' }, { id: 6, tabName: 'Health' },
    { id: 7, tabName: 'ClimateEnergy' }, { id: 8, tabName: 'HumanRights' }, { id: 9, tabName: 'Awards' },
  ],
  Geopolitics: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'MiddleEast' }, { id: 3, tabName: 'Europe' },
    { id: 4, tabName: 'AsiaPacific' }, { id: 5, tabName: 'Americas' }, { id: 6, tabName: 'Africa' },
    { id: 7, tabName: 'WarSecurity' }, { id: 8, tabName: 'SanctionsDiplomacy' }, { id: 9, tabName: 'Energy' },
    { id: 10, tabName: 'Cyber' },
  ],
  PopCulture: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'Music' }, { id: 3, tabName: 'Movies' },
    { id: 4, tabName: 'TVShows' }, { id: 5, tabName: 'Celebrities' }, { id: 6, tabName: 'Gaming' },
    { id: 7, tabName: 'SocialMedia' }, { id: 8, tabName: 'Awards' }, { id: 9, tabName: 'Legal' },
  ],
  Economy: [
    { id: 1, tabName: 'All' }, { id: 2, tabName: 'Inflation' }, { id: 3, tabName: 'GDPGrowth' },
    { id: 4, tabName: 'Housing' }, { id: 5, tabName: 'Employment' }, { id: 6, tabName: 'Banking' },
    { id: 7, tabName: 'Markets' }, { id: 8, tabName: 'Corporate' }, { id: 9, tabName: 'Recession' },
  ],
  Other: [{ id: 1, tabName: 'All' }],
};

const Home = () => {
  const [mainCategory, setMainCategory] = useState('Sports');
  const [subTitleId, setSubTitleId] = useState(1);
  const [subTitleName, setSubTitleName] = useState('All');
  const [subHradingTab, setSubHradingTab] = useState([]);
  const navigation = useNavigate();
  const [search, setSearch] = useState('');
  const searchTimeoutRef = useRef(null);
  const [filterShow, setFilterShow] = useState(false);
  const [filterSelected, setFilterSelected] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [homeTabContent, setHomeTabContent] = useState(defaultHomeTabContent);
  const [hasMore, setHasMore] = useState(true);
  const [tabActive, setTabActive] = useState(1);
  const [tabName, setTabName] = useState('All');
  const [homeCardData, setHomeCardData] = useState([]);
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
  const { setMarkets, markets } = useMarkets();
  const cursorRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [category, setCategory] = useState('All');
  const loaderRef2 = useRef(null);

  const { telegramUser } = useTelegramUser();

  useEffect(() => {
    if (tabName === 'All') {
      setSubHradingTab([]);
      setSubTitleId(1);
      setSubTitleName('All');
      return;
    }
    const tabs = SUBCATEGORY_MAP[tabName] || [];
    setSubHradingTab(tabs);
    setSubTitleId(1);
    setSubTitleName('All');
  }, [tabName]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  // Fire-and-forget deposit sweep on every app entry
  useEffect(() => {
    const telegramId = telegramUser?.telegramId || localStorage.getItem('telegramId');
    if (!telegramId) return;
    postMethod({ apiUrl: apiService.sweepDeposits, payload: { telegramId } })
      .then(r => { if (r.newDeposits > 0) console.log(`[sweep] credited ${r.newDeposits} new deposit(s)`); })
      .catch(() => {});
  }, [telegramUser?.telegramId]);

  const fetchTotalWinnings = async () => {
    try {
      setLoading(true);
      const payload = { initData: telegramUser?.intData || window.Telegram?.WebApp?.initData };
      if (!payload.initData) { toast.error('Telegram init data not available'); return; }
      const resp = await postMethod({ apiUrl: apiService.getUserTotalWinnings, payload });
      if (resp.success) {
        setTotalWinnings(resp.data);
      } else {
        toast.error(resp.message || 'Failed to load winnings');
      }
    } catch (error) {
      console.error('Total winnings error:', error);
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
      if (tab === 'Arken' || tab === 'All' || tab === 'Crypto') {
        setTabActive(defaultHomeTabContent.find(t => t.tabTitle === tab)?.id || 1);
        setTabName(tab);
        return defaultHomeTabContent;
      }
      let updated = prev.filter(t => t.tabTitle !== 'Arken');
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

  const getEndsIn = (endDate) => {
    const diff = new Date(endDate) - new Date();
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    return `${hrs}h`;
  };

  useEffect(() => { getMarketsStats(false); }, []);
  useEffect(() => { fetchTotalWinnings(); }, []);

  useEffect(() => {
    if (!loaderRef2.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingStats) {
          getMarketsStats(true);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(loaderRef2.current);
    return () => observer.disconnect();
  }, [hasMore, loadingStats]);

  const getMarketsStats = async (isLoadMore = false, selectedCategory = category, selectedSubcategory = subTitleName, searchText = search) => {
    try {
      if (isLoadMore && !hasMore) return;
      setLoadingStats(true);
      const data = {
        apiUrl: apiService.getmergedmarkets,
        payload: {
          limit: 10,
          cursor: isLoadMore ? cursorRef.current : null,
          category: (selectedCategory === 'All' || selectedCategory === 'Arken') ? null : selectedCategory,
          source: selectedCategory === 'Arken' ? 'arken' : null,
          subcategory: selectedSubcategory === 'All' ? null : selectedSubcategory,
          search: searchText || null,
          telegramId: telegramUser?.telegramId || null,
        },
      };
      const resp = await postMethod(data);
      if (resp.success) {
        if (isLoadMore) {
          setMarkets(prev => [...prev, ...resp.data]);
          setStats(prev => [...prev, ...resp.data]);
        } else {
          setMarkets(resp.data);
          setStats(resp.data);
        }
        setCursor(resp.nextCursor);
        cursorRef.current = resp.nextCursor;
        setHasMore(resp.hasMore);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    setSubTitleId(1);
    setSubTitleName('All');
    cursorRef.current = null;
    getMarketsStats(false, tabName, 'All');
  }, [tabName]);

  const fetchHomeTodayNews = async () => {
    try {
      const resp = await getMethod({ apiUrl: apiService.getHomeTodayNews });
      if (resp.success) {
        setNews(resp.data);
      } else {
        setNews([
          { id: 1, description: 'Total bets today: $0 · 0 predictions placed' },
          { id: 2, description: "Today's Top Winner: -- +$0" },
        ]);
      }
    } catch (err) {
      setNews([
        { id: 1, description: 'Total bets today: $0 · 0 predictions placed' },
        { id: 2, description: "Today's Top Winner: -- +$0" },
      ]);
    }
  };

  useEffect(() => { fetchHomeTodayNews(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % (news.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [news.length]);

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

  const mergedList = (stats || []).filter(item => item.marketStatus !== 'pending');

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: C.bg, WebkitOverflowScrolling: 'touch' }}>

      {/* HEADER */}
      <div style={{ padding: '16px 20px 0', background: C.surface }}>

        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Arken</div>
          <button
            onClick={() => navigation('/create-market')}
            style={{ background: `linear-gradient(135deg, ${C.purple}, #6d28d9)`, color: '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusIcon /> Create
          </button>
        </div>

        {/* Total winnings card */}
        <div style={{ background: 'linear-gradient(135deg, #141428, #0f0f1f)', border: `1px solid ${C.purpleGlow2}`, borderRadius: 16, padding: '12px 16px', marginBottom: 12, boxShadow: `0 0 40px ${C.purpleGlow}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: C.purpleL, fontSize: 18 }}>🏆</div>
              <div>
                <div style={{ color: C.muted, fontSize: 12 }}>Total Winnings</div>
                {loading ? (
                  <div className="skl skl-number-md" style={{ marginTop: 4 }} />
                ) : (
                  <div style={{ fontWeight: 800, fontSize: 18 }}>${totalWinnings.totalWinningsUSDT}</div>
                )}
              </div>
            </div>
            <button onClick={() => navigation('/Wallet')} style={{ color: C.purpleL, background: 'transparent', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Wallet →
            </button>
          </div>
        </div>

        {/* Group Predictions banner */}
        <div style={{ background: `linear-gradient(135deg, ${C.purple}cc, #4f46e5bb)`, borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Group Predictions</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>Predict whether group calls will rug or succeed</div>
          </div>
          <div style={{ fontSize: 20, opacity: 0.8 }}>📡</div>
        </div>

        {/* News ticker */}
        {news.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 14px', marginBottom: 12, overflow: 'hidden', height: 34 }}>
            <div style={{ color: C.sub, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {news[activeIndex % news.length]?.description}
            </div>
          </div>
        )}

        {/* Join Private Market */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, fontWeight: 600 }}>🔒 Join Private Market</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={joinCode}
              maxLength={7}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="INVITE CODE"
              style={{ flex: 1, background: C.surface, border: `1.5px solid ${joinCode ? C.purple : C.border}`, borderRadius: 10, padding: '9px 12px', color: C.text, fontSize: 16, outline: 'none', letterSpacing: 2, fontFamily: 'inherit' }}
            />
            <button
              onClick={handleJoinPrivateMarket}
              disabled={joinLoading}
              style={{ background: joinCode ? `linear-gradient(135deg, ${C.purple}, #6d28d9)` : C.surface, color: joinCode ? '#fff' : C.muted, border: `1px solid ${joinCode ? C.purple : C.border}`, borderRadius: 10, padding: '9px 16px', fontWeight: 600, cursor: joinLoading ? 'not-allowed' : 'pointer', fontSize: 13, opacity: joinLoading ? 0.6 : 1 }}>
              {joinLoading ? '...' : 'Join'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '9px 14px', marginBottom: 10 }}>
          <span style={{ color: C.muted, flexShrink: 0 }}><SearchIcon /></span>
          <input
            value={search}
            onChange={e => {
              let value = e.target.value;
              if (value.length === 1 && value.startsWith(' ')) return;
              setSearch(value);
              if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
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
            placeholder="Search markets..."
            style={{ background: 'transparent', border: 'none', color: C.text, fontSize: 16, outline: 'none', flex: 1, WebkitAppearance: 'none' }}
          />
          {search ? (
            <button onClick={() => { setSearch(''); setIsSearching(false); getMarketsStats(false, category, subTitleName, null); }} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 }}>✕</button>
          ) : null}
        </div>
      </div>

      {/* STICKY CATEGORY TABS */}
      <div style={{ position: 'sticky', top: 0, background: C.surface, borderBottom: `1px solid ${C.border}`, zIndex: 20 }}>

        {!isSearching && (
          <>
            {/* Main tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 20px 8px', alignItems: 'center' }}>
              {homeTabContent.map(item => {
                const active = tabActive === item.id;
                return (
                  <button key={item.id} onClick={() => onTabChange(item.tabTitle, item)} style={{ background: active ? C.purple : C.card, color: active ? '#fff' : C.muted, border: `1px solid ${active ? C.purple : C.border}`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.tabTitle}
                  </button>
                );
              })}
              {/* Filter button */}
              <button onClick={() => setFilterShow(!filterShow)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '6px 12px', fontSize: 12, color: C.muted, cursor: 'pointer', flexShrink: 0, marginLeft: 'auto' }}>
                ⚙ Filter
              </button>
            </div>

            {/* Subcategory tabs */}
            {subHradingTab.length > 0 && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 20px 10px' }}>
                {subHradingTab.map(item => {
                  const active = item.id === subTitleId;
                  return (
                    <button key={item.id} onClick={() => { setSubTitleId(item.id); setSubTitleName(item.tabName); getMarketsStats(false, tabName, item.tabName); }} style={{ background: active ? C.purpleGlow2 : 'transparent', color: active ? C.purpleL : C.muted, border: `1px solid ${active ? C.purple : C.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {item.tabName}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* MARKET LIST */}
      <div style={{ padding: '12px 20px 100px' }}>
        {loadingStats && stats.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div className="skl skeleton-badge" />
                <div className="skl skeleton-badge" />
              </div>
              <div className="skl skl-full" style={{ height: 16, marginBottom: 8 }} />
              <div className="skl skl-full" style={{ height: 14, width: '70%', marginBottom: 14 }} />
              <div className="skl skl-full" style={{ height: 5, marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="skl skl-number-sm" />
                <div className="skl skl-number-sm" />
              </div>
            </div>
          ))
        ) : mergedList.length > 0 ? (
          mergedList.map((item, index) => {
            const yesPercent = item.chancePercents?.[0] || 50;
            const noPercent = 100 - yesPercent;
            const statusLabel = item.marketStatus
              ? item.marketStatus.charAt(0).toUpperCase() + item.marketStatus.slice(1)
              : item.active ? 'Active' : 'Closed';
            const statusColor = item.marketStatus === 'active' || item.active ? C.green : C.muted;
            const isMulti = item.type === 'multi' || (item.options && item.options.length > 2);

            return (
              <div
                key={index}
                onClick={() => navigation(`/market-details/${item._id}`, { state: { item } })}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 10, cursor: 'pointer' }}
              >
                {/* Badges + end date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: `${C.purple}18`, color: C.purpleL, border: `1px solid ${C.purple}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {item.category}
                    </span>
                    <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                      {statusLabel}
                    </span>
                    {isMulti && (
                      <span style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b30', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Multi</span>
                    )}
                    {item.source === 'arken' && (
                      <span style={{ background: '#3b82f618', color: '#60a5fa', border: '1px solid #3b82f630', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>EVM</span>
                    )}
                    {item.source === 'solana' && (
                      <span style={{ background: '#9945ff18', color: '#b97aff', border: '1px solid #9945ff30', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>SOL</span>
                    )}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {getEndsIn(item.endDate)}
                  </div>
                </div>

                {/* Title */}
                <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.45, marginBottom: 14, letterSpacing: -0.2 }}>
                  {item.question}
                </div>

                {/* Progress */}
                {isMulti && item.options?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {item.options.slice(0, 4).map((o, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>{o.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.purpleL }}>{o.prob ?? o.percent ?? 0}%</span>
                        </div>
                        <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${o.prob ?? o.percent ?? 0}%`, background: C.purple, borderRadius: 99, opacity: 0.8 }} />
                        </div>
                      </div>
                    ))}
                    {item.options.length > 4 && (
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>+ {item.options.length - 4} more outcomes</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>YES {yesPercent}%</span>
                      <span style={{ color: C.red, fontSize: 12, fontWeight: 700 }}>NO {noPercent}%</span>
                    </div>
                    <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${yesPercent}%`, background: `linear-gradient(90deg, ${C.green}, #16a34a)`, borderRadius: 99 }} />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Liquidity: <span style={{ color: C.sub, fontWeight: 600 }}>${item.liquidity}</span></span>
                </div>
              </div>
            );
          })
        ) : !loadingStats ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No markets found</div>
            <div style={{ color: C.muted, fontSize: 13 }}>Try a different category or search term</div>
          </div>
        ) : null}

        {/* Infinite scroll sentinel */}
        <div ref={loaderRef2} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loadingStats && stats.length > 0 && (
            <div style={{ color: C.muted, fontSize: 12 }}>Loading more...</div>
          )}
        </div>
      </div>

      <BottomTab />

      {/* FILTER BOTTOM SHEET */}
      {filterShow && (
        <div
          onClick={() => setFilterShow(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90, display: 'flex', alignItems: 'flex-end', maxWidth: 420, margin: '0 auto' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', background: C.surface, borderRadius: '20px 20px 0 0', padding: '18px 0 120px', border: `1px solid ${C.border}`, borderBottom: 'none', maxHeight: '70vh', overflowY: 'auto' }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: C.border }} />
            </div>

            {/* Filter / Reset row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6 }}>⚙ Filter</span>
              <button onClick={handleResetFilters} style={{ fontSize: 13, color: C.purpleL, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>↺ Reset</button>
            </div>

            {/* Filter list */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filterList.map((item, index) => (
                <li
                  key={index}
                  onClick={() => { setFilterSelected(item.id); onTabChange(item.tabTitle); setFilterShow(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', cursor: 'pointer', background: item.id === filterSelected ? C.purpleGlow : 'transparent', borderLeft: item.id === filterSelected ? `3px solid ${C.purple}` : '3px solid transparent' }}
                >
                  <img
                    src={new URL(item.img, import.meta.url)}
                    alt={item.tabTitle}
                    style={{ width: 24, height: 24, filter: 'brightness(0) saturate(100%) invert(100%) sepia(10%) saturate(7444%) hue-rotate(234deg) brightness(120%) contrast(116%)' }}
                  />
                  <span style={{ fontSize: 14, color: item.id === filterSelected ? C.purpleL : C.text, fontWeight: item.id === filterSelected ? 700 : 400 }}>{item.tabTitle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
