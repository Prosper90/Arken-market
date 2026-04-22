import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import apiService from '../../core/sevice/detail';
import { postMethod } from '../../core/sevice/common.api';
import { useMarkets } from '../../context/MarketContext';
import { useTelegramUser } from '../../context/TelegramUserContext';
import { C } from '../../theme';
import { BackIcon, PlusIcon } from '../../Components/Icons';

const binanceSymbolMap = {
  BTC: 'btcusdt', ETH: 'ethusdt', SOL: 'solusdt', ADA: 'adausdt', DOT: 'dotusdt',
  BNB: 'bnbusdt', XRP: 'xrpusdt', DOGE: 'dogeusdt', LTC: 'ltcusdt', MATIC: 'maticusdt',
  AVAX: 'avaxusdt', SHIB: 'shibusdt', TRX: 'trxusdt', FTM: 'ftmusdt', LINK: 'linkusdt',
  AAVE: 'aaveusdt', ALGO: 'algousdt', XLM: 'xlmusdt', VET: 'vetusdt', ATOM: 'atomusdt',
  NEAR: 'nearusdt', EOS: 'eosusdt', FIL: 'filusdt',
};


const ProbabilityChart = ({ yesNow, isMulti }) => {
  const [chartTab, setChartTab] = useState('1W');
  const [chartTooltip, setChartTooltip] = useState(null);

  const chartData = {
    '1D': { yes: [50,51,53,52,55,57,56,58,60,61,62,64,63,65,66,67,yesNow], labels: ['00:00','01:30','03:00','04:30','06:00','07:30','09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30','21:00','22:30','Now'] },
    '1W': { yes: [45,47,46,49,50,52,51,54,55,57,56,59,60,62,63,65,yesNow], labels: ['Mon 0h','Mon 12h','Tue 0h','Tue 12h','Wed 0h','Wed 12h','Thu 0h','Thu 12h','Fri 0h','Fri 12h','Sat 0h','Sat 12h','Sun 0h','Sun 12h','Mon 0h','Mon 12h','Now'] },
    '1M': { yes: [35,38,36,40,42,41,45,44,47,48,50,52,51,55,57,60,yesNow], labels: ['Mar 1','Mar 3','Mar 5','Mar 7','Mar 9','Mar 11','Mar 13','Mar 15','Mar 17','Mar 19','Mar 21','Mar 23','Mar 25','Mar 27','Mar 29','Mar 31','Now'] },
    'ALL': { yes: [51,48,50,45,44,47,50,52,55,54,57,58,60,62,64,66,yesNow], labels: ['Oct 1','Oct 15','Nov 1','Nov 15','Dec 1','Dec 15','Jan 1','Jan 15','Feb 1','Feb 15','Mar 1','Mar 15','Apr 1','Apr 15','May 1','May 15','Now'] },
  };

  const data = chartData[chartTab];
  const pts = data.yes;
  const noPts = pts.map(v => 100 - v);
  const W = 300, H = 100, padL = 22, padR = 8, padT = 8, padB = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const toX = i => padL + (i / (pts.length - 1)) * chartW;
  const toY = v => padT + (1 - v / 100) * chartH;
  const buildPath = arr => arr.map((v, i) => {
    const x = toX(i), y = toY(v);
    if (i === 0) return `M${x},${y}`;
    const px = toX(i - 1), py = toY(arr[i - 1]), cx = (px + x) / 2;
    return `C${cx},${py} ${cx},${y} ${x},${y}`;
  }).join(' ');

  const yesPath = buildPath(pts);
  const noPath = buildPath(noPts);
  const lastX = toX(pts.length - 1);
  const lastYesY = toY(pts[pts.length - 1]);
  const lastNoY = toY(noPts[noPts.length - 1]);
  const yesAreaD = yesPath + ` L${lastX},${padT + chartH} L${padL},${padT + chartH} Z`;
  const currentYes = pts[pts.length - 1];
  const change = currentYes - pts[0];
  const tip = chartTooltip;

  const handleMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const relX = (clientX - rect.left) / rect.width * W;
    const idx = Math.max(0, Math.min(pts.length - 1, Math.round(((relX - padL) / chartW) * (pts.length - 1))));
    setChartTooltip({ idx });
  };

  const tipIdx = tip ? tip.idx : null;
  const displayYes = tipIdx !== null ? pts[tipIdx] : currentYes;
  const displayLabel = tipIdx !== null ? data.labels[tipIdx] : 'Now';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1 }}>PROBABILITY HISTORY</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 3 }}>
            <span style={{ fontWeight: 800, fontSize: 22, color: C.green }}>{displayYes}%</span>
            {tipIdx === null && <span style={{ fontSize: 12, fontWeight: 600, color: change >= 0 ? C.green : C.red }}>{change >= 0 ? '+' : ''}{change}% ({chartTab})</span>}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{displayLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['1D', '1W', '1M', 'ALL'].map(t => {
            const active = chartTab === t;
            return <button key={t} onClick={() => { setChartTab(t); setChartTooltip(null); }} style={{ background: active ? C.purple : 'transparent', color: active ? '#fff' : C.muted, border: `1px solid ${active ? C.purple : C.border}`, borderRadius: 6, padding: '4px 9px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>{t}</button>;
          })}
        </div>
      </div>

      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', cursor: 'crosshair' }} onMouseMove={handleMove} onTouchMove={handleMove} onMouseLeave={() => setChartTooltip(null)} onTouchEnd={() => setChartTooltip(null)}>
        <defs>
          <linearGradient id="yGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.green} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={C.green} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25, 50, 75].map(v => (
          <g key={v}>
            <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke={C.border} strokeWidth="0.5" strokeDasharray="3,3"/>
            <text x={padL - 3} y={toY(v) + 3} fill={C.muted} fontSize="7" textAnchor="end">{v}%</text>
          </g>
        ))}
        <path d={yesAreaD} fill="url(#yGrad2)"/>
        {!isMulti && <path d={noPath} fill="none" stroke={C.red} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.75"/>}
        <path d={yesPath} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"/>
        {tipIdx !== null ? (
          <g>
            <line x1={toX(tipIdx)} y1={padT} x2={toX(tipIdx)} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <circle cx={toX(tipIdx)} cy={toY(pts[tipIdx])} r="4" fill={C.green} stroke={C.bg} strokeWidth="2"/>
            <rect x={Math.min(toX(tipIdx) - 18, W - padR - 36)} y={toY(pts[tipIdx]) - 20} width="36" height="14" rx="4" fill="#15803d"/>
            <text x={Math.min(toX(tipIdx), W - padR - 18)} y={toY(pts[tipIdx]) - 9} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">YES {pts[tipIdx]}%</text>
            {!isMulti && (
              <>
                <circle cx={toX(tipIdx)} cy={toY(noPts[tipIdx])} r="3.5" fill={C.red} stroke={C.bg} strokeWidth="2"/>
                <rect x={Math.min(toX(tipIdx) - 16, W - padR - 32)} y={toY(noPts[tipIdx]) + 6} width="32" height="13" rx="4" fill="#b91c1c"/>
                <text x={Math.min(toX(tipIdx), W - padR - 16)} y={toY(noPts[tipIdx]) + 16} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">NO {noPts[tipIdx]}%</text>
              </>
            )}
          </g>
        ) : (
          <>
            <circle cx={lastX} cy={lastYesY} r="4" fill={C.green} stroke={C.bg} strokeWidth="2"/>
            {!isMulti && <circle cx={lastX} cy={lastNoY} r="3.5" fill={C.red} stroke={C.bg} strokeWidth="2"/>}
          </>
        )}
      </svg>

      <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 2, background: C.green, borderRadius: 2 }}/>
          <span style={{ fontSize: 11, color: C.muted }}>YES <span style={{ color: C.green, fontWeight: 700 }}>{currentYes}%</span></span>
        </div>
        {!isMulti && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 2, background: C.red, borderRadius: 2 }}/>
            <span style={{ fontSize: 11, color: C.muted }}>NO <span style={{ color: C.red, fontWeight: 700 }}>{100 - currentYes}%</span></span>
          </div>
        )}
      </div>
    </div>
  );
};

const MarketDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const { telegramUser } = useTelegramUser();
  const telegramId = typeof telegramUser === 'object' ? telegramUser?.telegramId : telegramUser;
  const [groupId, setGroupId] = useState(null);
  const [stats, setStats] = useState([]);
  const { markets, setMarkets } = useMarkets();
  const [loadingStats, setLoadingStats] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [market, setMarket] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastUpdateRef = useRef(0);
  const socketRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [lpAmount, setLpAmount] = useState('');
  const [lpLoading, setLpLoading] = useState(false);
  const [showLpForm, setShowLpForm] = useState(false);

  // UMA resolution state
  const [proposedAnswer, setProposedAnswer] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposeLoading, setProposeLoading] = useState(false);

  // User's existing position in this market (for sell tab)
  const [userPosition, setUserPosition] = useState(null);

  // Bottom swap sheet
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapSide, setSwapSide] = useState('buy');   // 'buy' | 'sell'
  const [swapOutcome, setSwapOutcome] = useState('yes'); // 'yes' | 'no'
  const [swapAmt, setSwapAmt] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  const openSwapSheet = (outcome, side = 'buy') => {
    setSwapOutcome(outcome);
    setSwapSide(side);
    setSwapAmt('');
    setSwapOpen(true);
  };

  const item = location.state?.item;

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!market?.endDate) return;
    const updateTimer = () => {
      const diff = new Date(market.endDate) - new Date();
      if (diff <= 0) { setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateTimer();
    const t = setInterval(updateTimer, 1000);
    return () => clearInterval(t);
  }, [market]);

  const fetchMarketById = async () => {
    try {
      setLoading(true);
      setLoadingStats(true);
      const resp = await postMethod({ apiUrl: apiService.getmergedmarketsid, payload: { id } });
      if (!resp?.success || !resp?.data) { setMarket(null); return; }
      const localMarket = resp.data;
      setMarket(localMarket);
      setMarkets([localMarket]);
      setStats([localMarket]);
      if (localMarket?.source === 'arken' && localMarket?.arkenMarketAddress) {
        import('../../services/arkenService').then(({ getArkenMarketPrices }) => {
          getArkenMarketPrices(localMarket.arkenMarketAddress).then(({ yesPrice }) => {
            setCurrentPrice(`${(yesPrice * 100).toFixed(1)}%`);
          }).catch(() => {});
        });
      }
      if (localMarket?.category === 'Crypto' && localMarket?.currency) {
        const pair = binanceSymbolMap[localMarket.currency.toUpperCase()];
        if (!pair) { setCurrentPrice(null); return; }
        if (socketRef.current) socketRef.current.close();
        socketRef.current = new WebSocket(`wss://stream.binance.com/ws/${pair}@ticker`);
        socketRef.current.onmessage = event => {
          const now = Date.now();
          if (now - lastUpdateRef.current < 1000) return;
          lastUpdateRef.current = now;
          const wsData = JSON.parse(event.data);
          setCurrentPrice(`$${Number(wsData.c).toLocaleString()}`);
        };
        socketRef.current.onerror = err => console.error('WS error', err);
      } else {
        setCurrentPrice(null);
      }
    } catch (error) {
      console.error('Error fetching market:', error);
      setMarket(null);
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (id) fetchMarketById();
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
        toast.success('Liquidity added!');
        setLpAmount('');
        setShowLpForm(false);
      } else {
        toast.error(resp?.message || 'Failed to add liquidity');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLpLoading(false);
    }
  };

  const handleDirectBuy = async () => {
    const amt = parseFloat(swapAmt);
    if (!amt || amt <= 0) return toast.error('Enter an amount');
    const token = params.get('token');
    const outcomes = market.outcomes || ['Yes', 'No'];
    const idx = isMulti
      ? outcomes.findIndex(o => o.toLowerCase() === swapOutcome)
      : swapOutcome === 'yes' ? 0 : 1;
    const outcomeLabel = outcomes[idx] ?? outcomes[0];
    const yesP = market?.chancePercents?.[0] ? market.chancePercents[0] / 100 : 0.5;
    const odds = swapOutcome === 'yes' ? yesP : 1 - yesP;
    const payload = {
      ...(token ? { token } : { initData: telegramUser?.intData || window.Telegram?.WebApp?.initData }),
      marketId: market.specifyId || null,
      manualId: market.specifyId ? null : market._id,
      conditionId: market.conditionId || null,
      outcomeIndex: idx,
      outcomeLabel,
      amount: amt,
      odds,
      currency: market?.source === 'arken' ? 'USDT' : 'USDC',
      source: market.source || 'manual',
      ...(market?.source === 'arken' && { arkenMarketAddress: market.arkenMarketAddress }),
      ...(market?.source === 'solana' && { solanaMarketId: market.solanaMarketId || market._id }),
    };
    setBuyLoading(true);
    try {
      const resp = await postMethod({ apiUrl: apiService.userbetplace, payload });
      if (resp?.success) {
        toast.success('Bet placed successfully!');
        setSwapOpen(false);
        setSwapAmt('');
        fetchMarketById();
      } else {
        toast.error(resp?.message || 'Bet placement failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleDirectSell = async () => {
    if (!userPosition?._id) return toast.error('No open position found');
    if (!telegramId) return toast.error('Not authenticated');
    const positionSize = userPosition?.amount || userPosition?.betAmount || 0;
    const enteredAmt = parseFloat(swapAmt) || 0;
    // Convert dollar amount → sell percentage (capped 1–100)
    const pct = positionSize > 0
      ? Math.min(100, Math.max(1, Math.round((enteredAmt / positionSize) * 100)))
      : 100;
    setSellLoading(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.sellPosition,
        payload: { telegramId, predictionId: userPosition._id, sellPercentage: pct },
      });
      if (resp?.status || resp?.success) {
        const payout = resp.payout ? `$${Number(resp.payout).toFixed(4)}` : '';
        toast.success(resp.isFullSell
          ? `Position sold!${payout ? ` Received ${payout}` : ''}`
          : `${pct}% sold!${payout ? ` Received ${payout}` : ''}`
        );
        setSwapOpen(false);
        setSwapAmt('');
        setUserPosition(null);
        fetchMarketById();
      } else {
        toast.error(resp?.message || 'Failed to sell position');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSellLoading(false);
    }
  };

  const handleProposeResolution = async () => {
    if (!proposedAnswer) return;
    if (!telegramId) { toast.error('User not identified'); return; }
    setProposeLoading(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.submitUMAAssertion,
        payload: { marketId: market._id, proposedOutcome: proposedAnswer, telegramId },
      });
      if (resp?.success) {
        toast.success('Resolution proposed! Bond locked. Challenge window open.');
        setShowProposeModal(false);
        fetchMarketById();
      } else {
        toast.error(resp?.message || 'Failed to submit proposal');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProposeLoading(false);
    }
  };

  useEffect(() => {
    if (!window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    tg.ready();
    setGroupId(tg.initDataUnsafe?.chat?.id || null);
  }, []);

  // Once market + telegramId are known, find the user's active position in this market
  useEffect(() => {
    if (!market || !telegramId) return;
    postMethod({ apiUrl: apiService.activebets, payload: { telegramId } })
      .then(resp => {
        if (resp.success && Array.isArray(resp.data)) {
          const marketIdStr = market._id?.toString();
          const pos = resp.data.find(b =>
            String(b.manualId) === marketIdStr || String(b.marketId) === marketIdStr
          );
          setUserPosition(pos || null);
        }
      })
      .catch(() => {});
  }, [market, telegramId]);

  if (loading || loadingStats) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, padding: '20px 20px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div className="skl" style={{ width: 38, height: 38, borderRadius: 10 }} />
          <div className="skl skl-text-lg" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skl skl-full" style={{ height: i === 0 ? 160 : 80, borderRadius: 16, marginBottom: 12 }} />
        ))}
      </div>
    );
  }

  if (!market) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 36 }}>🔍</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Market not found</div>
        <button onClick={() => navigate('/markets')} style={{ background: C.purple, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Back to Markets</button>
      </div>
    );
  }

  const status = market?.marketStatus || (market?.active ? 'active' : 'closed');
  const isActive = status === 'active';
  const yesPercent = market?.chancePercents?.[0] || 50;
  const noPercent = 100 - yesPercent;
  const isMulti = market?.type === 'multi' || (market?.outcomes?.length > 2);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, position: 'relative' }}>
      <div style={{ padding: `20px 20px ${swapOpen ? 460 : 100}px` }}>

        {/* Back header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate('/markets')} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.sub, flexShrink: 0 }}>
            <BackIcon />
          </button>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>Market</span>
        </div>

        {/* Main market card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ background: `${C.purple}18`, color: C.purpleL, border: `1px solid ${C.purple}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{market.category}</span>
            <span style={{ background: `${isActive ? C.green : C.muted}18`, color: isActive ? C.green : C.muted, border: `1px solid ${isActive ? C.green : C.muted}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{status.toUpperCase()}</span>
            {market.source === 'arken' && <span style={{ background: '#3b82f618', color: '#60a5fa', border: '1px solid #3b82f630', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>EVM</span>}
            {market.source === 'solana' && <span style={{ background: '#9945ff18', color: '#b97aff', border: '1px solid #9945ff30', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>SOL</span>}
            {market.source && market.source !== 'arken' && market.source !== 'solana' && <span style={{ background: `${C.purpleGlow}`, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{market.source.toUpperCase()}</span>}
            {isMulti && <span style={{ background: '#f59e0b18', color: '#f59e0b', border: '1px solid #f59e0b30', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>Multi</span>}
          </div>

          {/* Title */}
          <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.45, marginBottom: 16, letterSpacing: -0.3 }}>
            {market.question || 'Market'}
          </div>

          {/* Probability chart */}
          <ProbabilityChart yesNow={yesPercent} isMulti={isMulti} />

          {/* Outcome bars */}
          {isMulti && market.options?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 10 }}>
              {market.options.map((o, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.color || C.purpleL, flexShrink: 0 }}/>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{o.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: o.color || C.purpleL }}>{o.prob ?? o.percent ?? 0}%</span>
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${o.prob ?? o.percent ?? 0}%`, background: o.color || C.purple, borderRadius: 99, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>YES {yesPercent}%</span>
                <span style={{ color: C.red, fontSize: 13, fontWeight: 700 }}>NO {noPercent}%</span>
              </div>
              <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${yesPercent}%`, background: `linear-gradient(90deg, ${C.green}, #16a34a)`, borderRadius: 99 }} />
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
            {[
              { l: 'Liquidity', v: `$${market.liquidity || 0}` },
              { l: 'Ends', v: market.endDate ? new Date(market.endDate).toLocaleDateString() : 'N/A' },
              { l: 'Countdown', v: `${timeLeft.hours}h ${timeLeft.minutes}m` },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ color: C.muted, fontSize: 11 }}>{s.l}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 3 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Live price badge */}
          {currentPrice && (
            <div style={{ marginTop: 12, background: C.purpleGlow, border: `1px solid ${C.purpleGlow2}`, borderRadius: 10, padding: '8px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: C.muted }}>Live {market.currency} Price</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.purpleL }}>{currentPrice}</span>
            </div>
          )}
        </div>

        {/* BUY BUTTONS */}
        {!isActive ? (
          <div style={{ textAlign: 'center', padding: 14, marginBottom: 14, background: '#2a1a1a', borderRadius: 12, color: '#e05c5c', fontSize: 14 }}>
            {status === 'resolved' ? 'This market has been resolved.' : status === 'pending' ? 'This market is pending approval.' : 'This market is closed for betting.'}
          </div>
        ) : isMulti && market.outcomes?.length > 0 ? (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>BUY SHARES</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {market.outcomes.slice(0, 4).map((outcome, index) => {
                const price = market.outcomePrices?.[index];
                const displayPrice = price ? `${parseFloat(price * 100).toFixed(0)}¢` : '';
                return (
                  <button key={index} onClick={() => openSwapSheet(outcome.toLowerCase(), 'buy')} style={{ background: `${C.purple}15`, border: `1.5px solid ${C.purple}40`, borderRadius: 14, padding: '12px 10px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.purpleL }}>{outcome}</div>
                    {displayPrice && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{displayPrice} per share</div>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {(market.outcomes || ['Yes', 'No']).slice(0, 2).map((outcome, index) => {
              const price = market.outcomePrices?.[index];
              const displayPrice = price ? `${parseFloat(price * 100).toFixed(0)}¢` : '';
              const isYes = index === 0;
              return (
                <button key={index} onClick={() => openSwapSheet(index === 0 ? 'yes' : 'no', 'buy')} style={{ background: isYes ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  Buy {outcome} {displayPrice}
                </button>
              );
            })}
          </div>
        )}

        {/* ADD LIQUIDITY — arken and solana sources */}
        {(market?.source === 'arken' || market?.source === 'solana') && isActive && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showLpForm ? 12 : 0 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 2 }}>POOL LIQUIDITY</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>${market.liquidity || 0}</div>
              </div>
              <button onClick={() => setShowLpForm(p => !p)} style={{ background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlusIcon /> {showLpForm ? 'Hide' : 'Add Liquidity'}
              </button>
            </div>
            {showLpForm && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                  {market.source === 'solana' ? 'Earn LP fees by adding USDC to this market\'s pool.' : 'Earn LP fees by adding USDT to this market\'s pool.'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" min={1} placeholder={`Amount (${market.source === 'solana' ? 'USDC' : 'USDT'})`} value={lpAmount} onChange={e => setLpAmount(e.target.value)} style={{ flex: 1, background: C.surface, border: `1.5px solid ${lpAmount ? C.purple : C.border}`, borderRadius: 10, padding: '10px 12px', color: C.text, fontSize: 16, outline: 'none', fontFamily: 'inherit' }} />
                  <button disabled={lpLoading} onClick={handleAddLiquidity} style={{ background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: lpLoading ? 'not-allowed' : 'pointer', opacity: lpLoading ? 0.6 : 1 }}>
                    {lpLoading ? '...' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESOLUTION SECTION — shows for all market types once expired */}
        {(() => {
          const isExpired = market.endDate && new Date() > new Date(market.endDate);
          const umaStatus = market.umaStatus || 'none';
          const resolutionState =
            market.marketStatus === 'resolved' || umaStatus === 'accepted' ? 'resolved' :
            umaStatus === 'challenged' || umaStatus === 'disputed' ? 'disputed' :
            umaStatus === 'submitted' ? 'proposed' :
            isExpired ? 'expired' : 'active';

          if (resolutionState === 'active') return null;

          const challengeEnd = market.umaChallengePeriodEnd ? new Date(market.umaChallengePeriodEnd) : null;
          const challengeMinsLeft = challengeEnd ? Math.max(0, Math.floor((challengeEnd - new Date()) / 60000)) : 0;
          const challengeHoursLeft = Math.floor(challengeMinsLeft / 60);
          const umaDisputeUrl = market.umaAssertionId
            ? `https://oracle.uma.xyz/?assertionId=${market.umaAssertionId}`
            : 'https://oracle.uma.xyz';

          return (
            <div style={{ marginBottom: 14 }}>
              {resolutionState === 'expired' && market.oracleType === 'manual' && (
                <div style={{ background: C.card, border: `1px solid #f59e0b40`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>Market Expired — Awaiting Manual Resolution</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    This market has ended and will be resolved by the market creator or admin.
                  </div>
                </div>
              )}

              {resolutionState === 'expired' && market.oracleType === 'ai' && (
                <div style={{ background: C.card, border: `1px solid ${C.purpleGlow2}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.purpleL, boxShadow: `0 0 8px ${C.purpleL}` }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.purpleL }}>AI Resolution In Progress</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    Our AI oracle is analysing the outcome. Resolution will appear here automatically within 30 minutes.
                  </div>
                </div>
              )}

              {resolutionState === 'expired' && (market.oracleType === 'uma' || (!market.oracleType || market.oracleType === 'polymarket')) && (
                <div style={{ background: 'linear-gradient(135deg, #0d0d20, #111128)', border: `1px solid ${C.purpleGlow2}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>Market Expired — Awaiting Resolution</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
                    This market has ended. Anyone can propose the correct resolution and earn a reward. Funds are locked until resolved.
                  </div>
                  {market.bondAmountUsdc > 0 && (
                    <div style={{ background: C.surface, borderRadius: 12, padding: '12px 14px', marginBottom: 14, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600 }}>BOND REQUIRED</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: C.green }}>{market.bondAmountUsdc.toFixed(4)} WETH</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Returned to you if no dispute arises</div>
                    </div>
                  )}
                  <button onClick={() => setShowProposeModal(true)} style={{ width: '100%', background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    Propose Resolution
                  </button>
                </div>
              )}

              {resolutionState === 'proposed' && (
                <div style={{ background: C.card, border: '1px solid #f59e0b30', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>Resolution Proposed</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '12px 14px', marginBottom: 10, border: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>PROPOSED ANSWER</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: C.green }}>{market.umaVerdict || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>CHALLENGE WINDOW</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#f59e0b' }}>
                        {challengeHoursLeft > 0 ? `${challengeHoursLeft}h ${challengeMinsLeft % 60}m` : `${challengeMinsLeft}m`} remaining
                      </div>
                    </div>
                  </div>
                  <div style={{ background: '#f59e0b08', border: '1px solid #f59e0b25', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f59e0b', marginBottom: 10, lineHeight: 1.6 }}>
                    If you believe this resolution is incorrect, you can dispute it on the UMA Oracle platform before the challenge window closes.
                  </div>
                  <a href={umaDisputeUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b40', borderRadius: 12, padding: '11px 0', fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none' }}>
                    Dispute on UMA Oracle ↗
                  </a>
                </div>
              )}

              {resolutionState === 'disputed' && (
                <div style={{ background: C.card, border: `1px solid ${C.red}30`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.red, boxShadow: `0 0 8px ${C.red}` }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.red }}>Resolution Disputed</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.6 }}>
                    UMA token holders are voting on the correct resolution. Funds remain locked. Estimated 3–7 days.
                  </div>
                  <a href={umaDisputeUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', boxSizing: 'border-box', background: C.surface, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 0', fontWeight: 600, fontSize: 13, textAlign: 'center', textDecoration: 'none' }}>
                    View on UMA Oracle ↗
                  </a>
                </div>
              )}

              {resolutionState === 'resolved' && (
                <div style={{ background: C.card, border: `1px solid ${C.green}30`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>Resolved — Claim Your Winnings</div>
                  </div>
                  <div style={{ background: C.surface, borderRadius: 10, padding: '12px 14px', textAlign: 'center', border: `1px solid ${C.border}`, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Final Answer</div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: C.green, marginTop: 4 }}>{market.umaVerdict || '—'}</div>
                  </div>
                  {market.umaSettledTxHash && (
                    <a
                      href={`https://${(process.env.VITE_ARB_RPC_URL || '').includes('sepolia') ? 'sepolia.' : ''}etherscan.io/tx/${market.umaSettledTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block', textAlign: 'center', fontSize: 12, color: C.purpleL, textDecoration: 'none', padding: '8px 0', border: `1px solid ${C.border}`, borderRadius: 10, background: C.surface }}
                    >
                      View settlement on-chain ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* PROPOSE MODAL */}
        {showProposeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', zIndex: 200, maxWidth: 420, margin: '0 auto' }}>
            <div style={{ width: '100%', background: C.surface, borderRadius: '20px 20px 0 0', padding: 24, border: `1px solid ${C.border}`, borderBottom: 'none' }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Propose Resolution</div>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
                {market.bondAmountUsdc > 0
                  ? `Select the correct outcome. A ${market.bondAmountUsdc.toFixed(4)} WETH bond will be locked during the challenge window and returned if no dispute occurs.`
                  : 'Select the correct outcome. No bond required in this environment.'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {(market.outcomes || ['Yes', 'No']).map(ans => {
                  const active = proposedAnswer === ans;
                  const col = ans.toLowerCase() === 'yes' || ans === market.outcomes?.[0] ? C.green : C.red;
                  return (
                    <button key={ans} onClick={() => setProposedAnswer(ans)} style={{ padding: '16px 0', borderRadius: 14, border: `2px solid ${active ? col : C.border}`, background: active ? `${col}15` : C.card, color: active ? col : C.muted, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
                      {ans}
                    </button>
                  );
                })}
              </div>
              <div style={{ background: '#f59e0b08', border: '1px solid #f59e0b25', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#f59e0b', lineHeight: 1.6 }}>
                {market.bondAmountUsdc > 0
                  ? `${market.bondAmountUsdc.toFixed(4)} WETH bond locked for the challenge window. Forfeited if UMA token holders vote against you.`
                  : 'No bond required in testnet mode. On mainnet, a WETH bond will be required.'}
              </div>
              <button disabled={!proposedAnswer || proposeLoading} onClick={handleProposeResolution} style={{ width: '100%', background: proposedAnswer && !proposeLoading ? `linear-gradient(135deg, ${C.purple}, #4f46e5)` : C.border, color: proposedAnswer && !proposeLoading ? '#fff' : C.muted, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: proposedAnswer && !proposeLoading ? 'pointer' : 'not-allowed' }}>
                {proposeLoading ? 'Submitting...' : 'Submit Proposal + Lock Bond'}
              </button>
              <button onClick={() => { setShowProposeModal(false); setProposedAnswer(''); }} style={{ width: '100%', marginTop: 10, background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* YOUR POSITION */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>YOUR POSITION</div>
          {userPosition ? (
            isMulti ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{userPosition.outcome || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Outcome</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.purpleL }}>${(userPosition.betAmount || userPosition.amount || 0).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Staked</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: `${C.green}10`, border: `1px solid ${C.green}20`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: C.muted, fontSize: 11 }}>YES Shares</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: C.green, marginTop: 4 }}>
                    {userPosition.outcomeIndex === 0 ? (userPosition.betAmount || userPosition.amount || 0).toFixed(2) : '0'}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>USDC value</div>
                </div>
                <div style={{ background: `${C.red}10`, border: `1px solid ${C.red}20`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: C.muted, fontSize: 11 }}>NO Shares</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: C.red, marginTop: 4 }}>
                    {userPosition.outcomeIndex === 1 ? (userPosition.betAmount || userPosition.amount || 0).toFixed(2) : '0'}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>USDC value</div>
                </div>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0', color: C.muted, fontSize: 13 }}>
              No position yet. Buy an outcome above!
            </div>
          )}
        </div>

        {/* About */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14, fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 6 }}>About</div>
          {market.description || 'This market resolves based on the stated resolution criteria.'}
          {market.criteriaResolutionSource && (
            <div style={{ marginTop: 8, color: C.muted, fontSize: 12 }}>Resolution: {market.criteriaResolutionSource}</div>
          )}
        </div>

        {/* Market details grid */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>Details</div>
          {[
            { l: 'Created', v: market.startDate ? new Date(market.startDate).toLocaleString() : 'N/A' },
            { l: 'Ends', v: market.endDate ? new Date(market.endDate).toLocaleString() : 'N/A' },
            { l: 'Oracle', v: market.oracleType ? market.oracleType.toUpperCase() : 'MANUAL' },
            { l: 'Source', v: market.source ? market.source.toUpperCase() : 'N/A' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: 12, color: C.muted }}>{row.l}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>{row.v}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', color: C.muted, fontSize: 11, lineHeight: 1.6, padding: '0 10px' }}>
          By participating, you acknowledge the inherent risks of prediction markets and cryptocurrency volatility.
        </div>
      </div>

      {/* BOTTOM SWAP SHEET — active markets only */}
      {isActive && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 420, zIndex: 60 }}>

          {/* Toggle bar */}
          <button
            onClick={() => setSwapOpen(p => !p)}
            style={{ width: '100%', background: C.surface, border: 'none', borderTop: `1px solid ${C.border}`, padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: C.purpleL, fontWeight: 600, fontSize: 14 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: swapOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
              <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {swapSide === 'buy' ? 'Buy Shares' : 'Sell Shares'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: swapOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
              <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Sheet panel */}
          {swapOpen && (
            <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, overflowY: 'auto', maxHeight: 440 }}>

              {/* Buy / Sell tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${C.border}` }}>
                {['buy', 'sell'].map(s => {
                  const active = swapSide === s;
                  const col = s === 'buy' ? C.green : C.red;
                  const disabled = s === 'sell' && !userPosition;
                  return (
                    <button key={s} onClick={() => !disabled && setSwapSide(s)} style={{ padding: '12px 0', background: active ? `${col}12` : 'transparent', border: 'none', borderBottom: active ? `2px solid ${col}` : '2px solid transparent', color: active ? col : (disabled ? C.border : C.muted), fontWeight: 700, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>
                      {s === 'buy' ? 'Buy' : 'Sell'}
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: 16 }}>

                {/* YES / NO selector — binary only */}
                {!isMulti && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {['yes', 'no'].map(o => {
                      const active = swapOutcome === o;
                      const col = o === 'yes' ? C.green : C.red;
                      const price = o === 'yes' ? yesPercent : noPercent;
                      return (
                        <button key={o} onClick={() => setSwapOutcome(o)} style={{ padding: '12px 10px', borderRadius: 12, border: `2px solid ${active ? col : C.border}`, background: active ? `${col}12` : C.card, cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: active ? col : C.text }}>{o.toUpperCase()}</div>
                          <div style={{ fontSize: 12, color: active ? col : C.muted, marginTop: 2 }}>{price}c per share</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Multi-market outcome selector */}
                {isMulti && market.outcomes?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {market.outcomes.slice(0, 4).map((o, i) => {
                      const active = swapOutcome === o.toLowerCase();
                      return (
                        <button key={i} onClick={() => setSwapOutcome(o.toLowerCase())} style={{ padding: '10px 8px', borderRadius: 12, border: `2px solid ${active ? C.purpleL : C.border}`, background: active ? `${C.purple}15` : C.card, cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: active ? C.purpleL : C.text }}>{o}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* AMM swap box */}
                <div style={{ background: C.card, borderRadius: 16, padding: 14, border: `1px solid ${C.border}`, marginBottom: 12 }}>

                  {/* Input row */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{swapSide === 'buy' ? 'YOU PAY' : 'YOU SELL'}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{swapSide === 'buy' ? 'USDC' : swapOutcome.toUpperCase() + ' shares'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '10px 14px', border: `1.5px solid ${swapAmt ? C.purple : C.border}` }}>
                      <input
                        type="text" inputMode="decimal"
                        value={swapAmt}
                        onChange={e => setSwapAmt(e.target.value)}
                        placeholder="0.00"
                        style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: 20, fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
                      />
                      <div style={{ background: C.card, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: C.text, flexShrink: 0 }}>
                        {swapSide === 'buy' ? 'USDC' : swapOutcome.toUpperCase()}
                      </div>
                    </div>
                    {/* Quick amounts */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {['10', '25', '50', '100'].map(v => (
                        <button key={v} onClick={() => setSwapAmt(v)} style={{ flex: 1, background: swapAmt === v ? C.purpleGlow2 : C.surface, border: `1px solid ${swapAmt === v ? C.purple : C.border}`, borderRadius: 8, padding: '5px 0', color: swapAmt === v ? C.purpleL : C.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>${v}</button>
                      ))}
                    </div>
                  </div>

                  {/* Swap arrow */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 14 }}>
                      {swapSide === 'buy' ? '↓' : '↑'}
                    </div>
                  </div>

                  {/* Output row */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>YOU RECEIVE</span>
                      <span style={{ fontSize: 11, color: C.muted }}>AMM estimate</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}` }}>
                      {(() => {
                        const amt = parseFloat(swapAmt) || 0;
                        const price = swapOutcome === 'yes' ? yesPercent / 100 : noPercent / 100;
                        const out = amt > 0
                          ? swapSide === 'buy'
                            ? (amt / price).toFixed(2)
                            : (amt * price).toFixed(2)
                          : '0.00';
                        const outCol = swapSide === 'buy' ? (swapOutcome === 'yes' ? C.green : C.red) : C.purpleL;
                        const outLabel = swapSide === 'buy' ? swapOutcome.toUpperCase() + ' shares' : 'USDC';
                        return (
                          <>
                            <div style={{ flex: 1, fontSize: 20, fontWeight: 700, color: outCol }}>{out}</div>
                            <div style={{ background: `${outCol}15`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: outCol, flexShrink: 0 }}>{outLabel}</div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* AMM stats */}
                <div style={{ background: C.card, borderRadius: 12, padding: '10px 14px', border: `1px solid ${C.border}`, marginBottom: 12 }}>
                  {[
                    { l: 'Current Price', v: `${swapOutcome === 'yes' ? yesPercent : noPercent}c per share` },
                    { l: 'Price Impact', v: swapAmt && parseFloat(swapAmt) > 0 ? `~${(parseFloat(swapAmt) / (market.liquidity || 1000) * 100).toFixed(2)}%` : '0.00%', warn: swapAmt && parseFloat(swapAmt) > 50 },
                    { l: 'Pool Liquidity', v: `$${market.liquidity || 0}` },
                    { l: 'Slippage', v: '0.5%' },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                      <span style={{ color: C.muted, fontSize: 12 }}>{r.l}</span>
                      <span style={{ color: r.warn ? '#f59e0b' : C.text, fontWeight: 600, fontSize: 12 }}>{r.v}</span>
                    </div>
                  ))}
                </div>

                {/* High impact warning */}
                {swapAmt && parseFloat(swapAmt) > 50 && (
                  <div style={{ background: '#f59e0b08', border: '1px solid #f59e0b25', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#f59e0b', lineHeight: 1.5 }}>
                    High price impact! Large trades move the AMM price significantly.
                  </div>
                )}

                {/* Confirm button — executes buy or sell directly, no second modal */}
                <button
                  disabled={buyLoading || sellLoading || !swapAmt || parseFloat(swapAmt) <= 0 || (swapSide === 'sell' && !userPosition)}
                  onClick={() => {
                    if (swapSide === 'sell') handleDirectSell();
                    else handleDirectBuy();
                  }}
                  style={{
                    width: '100%',
                    background: (buyLoading || sellLoading || !swapAmt || parseFloat(swapAmt) <= 0 || (swapSide === 'sell' && !userPosition)) ? C.border
                      : swapSide === 'buy'
                        ? swapOutcome === 'yes' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #b91c1c)'
                        : `linear-gradient(135deg, ${C.purple}, #4f46e5)`,
                    color: (buyLoading || sellLoading || !swapAmt || parseFloat(swapAmt) <= 0 || (swapSide === 'sell' && !userPosition)) ? C.muted : '#fff',
                    border: 'none',
                    borderRadius: 14,
                    padding: '13px 0',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: (buyLoading || sellLoading || !swapAmt || parseFloat(swapAmt) <= 0 || (swapSide === 'sell' && !userPosition)) ? 'not-allowed' : 'pointer',
                    opacity: (buyLoading || sellLoading || !swapAmt || parseFloat(swapAmt) <= 0 || (swapSide === 'sell' && !userPosition)) ? 0.5 : 1,
                  }}
                >
                  {buyLoading ? 'Placing Bet...'
                    : sellLoading ? 'Selling...'
                    : swapSide === 'buy' ? `Buy ${swapOutcome.toUpperCase()} Shares`
                    : userPosition ? `Sell ${swapOutcome.toUpperCase()} Shares`
                    : 'No Position to Sell'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: C.muted }}>
                  Powered by AMM — prices move with pool liquidity
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MarketDetails;
