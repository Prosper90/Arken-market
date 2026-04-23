import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import BottomTab from '../BottomTab/BottomTab';
import apiService from '../../core/sevice/detail';
import { postMethod } from '../../core/sevice/common.api';
import { profileTabContent } from './data';
import { useTelegramUser } from '../../context/TelegramUserContext';
import { useUserSocket } from '../../hooks/useSocket';
import { C } from '../../theme';
import { CopyIcon, CheckIcon } from '../../Components/Icons';
import Buyform from '../Buyform';

const TIERS = [
  { tier: 'Scout', range: '$0-$50K', commission: '15%', color: '#cd7f32', max: 50000 },
  { tier: 'Partner', range: '$50K-$500K', commission: '30%', color: '#9ca3af', max: 500000 },
  { tier: 'Whale', range: '$500K+', commission: '45%', color: '#f59e0b', max: Infinity },
];

const Profile = () => {
  const { telegramUser } = useTelegramUser();
  const navigate = useNavigate();
  const [tabName, setTabName] = useState('Active');
  const [loadingBets, setLoadingBets] = useState(false);
  const [loadingCashout, setLoadingCashout] = useState(false);
  const [cashoutLoadingId, setCashoutLoadingId] = useState(null);
  const [sellLoadingId, setSellLoadingId] = useState(null);
  const [activeBets, setActiveBets] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [completedBets, setCompletedBets] = useState([]);
  const [loadingCompletedBets, setLoadingCompletedBets] = useState(false);
  const [referralInfo, setReferralInfo] = useState(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [myMarkets, setMyMarkets] = useState([]);
  const [loadingMyMarkets, setLoadingMyMarkets] = useState(false);
  const [closingMarketId, setClosingMarketId] = useState(null);
  const [sellModalBet, setSellModalBet] = useState(null); // bet object to sell

  // Email linking state
  const [emailInput, setEmailInput] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailStep, setEmailStep] = useState('input'); // 'input' | 'otp'
  const [emailLoading, setEmailLoading] = useState(false);

  useUserSocket(telegramUser?.telegramId, (data) => {
    setActiveBets(prev => prev.map(p => p._id === data.predictionId ? { ...p, currentPrice: data.currentPrice, unrealizedPnl: data.pnl } : p));
  });

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
      if (!telegramUserID) return;
      const resp = await postMethod({ apiUrl: apiService.activebets, payload: { telegramId: telegramUserID } });
      if (resp.success) setActiveBets(resp.data);
    } catch (error) {
      console.error('Error fetching active bets:', error);
    } finally {
      setLoadingBets(false);
    }
  };

  const handleCashout = async (predictionId) => {
    try {
      setLoadingCashout(true);
      setCashoutLoadingId(predictionId);
      if (!predictionId) return;
      const resp = await postMethod({ apiUrl: apiService.exitPrediction, payload: { predictionId } });
      if (resp.status) {
        toast.success('Cashout successfully');
        getActiveBets();
        getCompletedBets();
      } else {
        console.error(resp.Message || 'Cashout failed');
      }
    } catch (error) {
      console.error('Cashout error:', error);
    } finally {
      setLoadingCashout(false);
      setCashoutLoadingId(null);
    }
  };

  const getCompletedBets = async () => {
    try {
      setLoadingCompletedBets(true);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      const resp = await postMethod({ apiUrl: apiService.completedbets, payload: { telegramId: telegramUserID } });
      if (resp.success) setCompletedBets(resp.data);
    } catch (error) {
      console.error('Error fetching completed bets:', error);
    } finally {
      setLoadingCompletedBets(false);
    }
  };

  const getUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      const resp = await postMethod({ apiUrl: apiService.getUserProfile, payload: { telegramId: telegramUserID } });
      if (resp.success) setUserProfile(resp.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const getReferralInfo = async () => {
    try {
      setLoadingReferral(true);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      const resp = await postMethod({ apiUrl: apiService.getReferralInfo, payload: { telegramId: telegramUserID } });
      if (resp.success) setReferralInfo(resp.data);
    } catch (error) {
      console.error('Error fetching referral info:', error);
    } finally {
      setLoadingReferral(false);
    }
  };

  const handleSellPosition = async (predictionId) => {
    try {
      setSellLoadingId(predictionId);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      const resp = await postMethod({ apiUrl: apiService.sellPosition, payload: { telegramId: telegramUserID, predictionId } });
      if (resp.status || resp.success) {
        toast.success(`Sold! You received $${(resp.payout?.toFixed(4) ?? '0')} USDT`);
        getActiveBets();
        getCompletedBets();
      } else {
        toast.error(resp.message || 'Failed to sell position');
      }
    } catch (error) {
      toast.error('Error selling position');
    } finally {
      setSellLoadingId(null);
    }
  };

  const getMyMarkets = async () => {
    try {
      setLoadingMyMarkets(true);
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      const resp = await postMethod({ apiUrl: apiService.mymarkets, payload: { telegramId: telegramUserID } });
      if (resp.success) setMyMarkets(resp.data);
    } catch (error) {
      console.error('Error fetching my markets:', error);
    } finally {
      setLoadingMyMarkets(false);
    }
  };

  const handleCloseMarket = async (marketId) => {
    try {
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      setClosingMarketId(marketId);
      const resp = await postMethod({ apiUrl: apiService.closeMarket, payload: { telegramId: telegramUserID, marketId } });
      if (resp.success) {
        setMyMarkets(prev => prev.map(m => m._id === marketId ? { ...m, marketStatus: 'closed' } : m));
      }
    } catch (error) {
      console.error('Error closing market:', error);
    } finally {
      setClosingMarketId(null);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleLinkEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) { toast.error('Enter a valid email'); return; }
    try {
      setEmailLoading(true);
      const resp = await postMethod({ apiUrl: apiService.linkEmail, payload: { telegramId: telegramUser?.telegramId, email: emailInput } });
      if (resp.success) { toast.success('OTP sent to your email'); setEmailStep('otp'); }
      else toast.error(resp.message || 'Failed to send OTP');
    } catch { toast.error('Something went wrong'); }
    finally { setEmailLoading(false); }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput || emailOtpInput.length < 4) { toast.error('Enter the OTP from your email'); return; }
    try {
      setEmailLoading(true);
      const resp = await postMethod({ apiUrl: apiService.verifyEmailOtp, payload: { telegramId: telegramUser?.telegramId, email: emailInput, otp: emailOtpInput } });
      if (resp.success) {
        toast.success('Email linked successfully!');
        setEmailStep('input');
        setEmailInput('');
        setEmailOtpInput('');
        getUserProfile();
      } else toast.error(resp.message || 'Invalid OTP');
    } catch { toast.error('Something went wrong'); }
    finally { setEmailLoading(false); }
  };

  // Determine current tier from referral volume
  const refVolume = referralInfo?.totalVolume || 0;
  const currentTier = TIERS[2].max <= refVolume ? TIERS[2] : TIERS[1].max <= refVolume ? TIERS[1] : TIERS[0];
  const nextTier = currentTier === TIERS[0] ? TIERS[1] : currentTier === TIERS[1] ? TIERS[2] : null;

  const tabs = ['Active', 'History', 'Referral', 'My Markets', 'Account'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100 }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(160deg, #16163a, ${C.bg})`, padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${C.purple}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -30, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>😎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>{userProfile?.firstName || 'Player'}</div>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{userProfile?.username ? `@${userProfile.username}` : ''}</div>
          </div>
          <div style={{ background: `${currentTier.color}18`, color: currentTier.color, border: `1px solid ${currentTier.color}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
            {currentTier.tier}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, position: 'relative', zIndex: 1 }}>
          {[
            { l: 'Total Bets', v: loadingProfile ? '...' : userProfile?.totalPredictions || 0 },
            { l: 'Win Rate', v: loadingProfile ? '...' : userProfile?.winRate ? `${Number(userProfile.winRate).toFixed(1)}%` : '0%' },
            { l: 'Winnings', v: loadingProfile ? '...' : `$${userProfile?.totalWinningsUSDT || 0}` },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{s.v}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 2, padding: '0 16px', background: C.surface, borderBottom: `1px solid ${C.border}`, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTabName(t); if (t === 'Active') { getActiveBets(); } else if (t === 'History') { getCompletedBets(); } else if (t === 'My Markets') { getMyMarkets(); } }} style={{ background: 'transparent', color: tabName === t ? C.purpleL : C.muted, border: 'none', borderBottom: `2px solid ${tabName === t ? C.purple : 'transparent'}`, padding: '14px 14px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{t}</button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div style={{ padding: '16px 20px' }}>

        {/* ACTIVE BETS */}
        {tabName === 'Active' && (
          loadingBets ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div className="skl skl-full" style={{ height: 14, marginBottom: 10 }} />
                <div className="skl" style={{ height: 10, width: '60%', marginBottom: 10 }} />
                <div className="skl" style={{ height: 32, width: '100%' }} />
              </div>
            ))
          ) : activeBets.length > 0 ? (
            activeBets.map((item, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 10 }}>{item.question}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ background: `${C.muted}18`, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{item.status}</span>
                  <span style={{ background: item.bitSide?.toLowerCase() === 'yes' ? `${C.green}18` : `${C.red}18`, color: item.bitSide?.toLowerCase() === 'yes' ? C.green : C.red, border: `1px solid ${item.bitSide?.toLowerCase() === 'yes' ? C.green : C.red}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{item.outcomeLabel}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12 }}>
                  <div><span style={{ color: C.muted }}>Bet: </span><span style={{ fontWeight: 700 }}>${item.betAmount || item.amount || 0}</span></div>
                  {item.unrealizedPnl !== undefined && <div><span style={{ color: C.muted }}>P&L: </span><span style={{ fontWeight: 700, color: item.unrealizedPnl >= 0 ? C.green : C.red }}>{item.unrealizedPnl >= 0 ? '+' : ''}${Number(item.unrealizedPnl).toFixed(4)}</span></div>}
                </div>
                {item.type !== 'lp' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/market-details/${item.manualId || item.marketId || item._id}`)}
                      style={{ flex: 1, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      👁 View
                    </button>
                    <button
                      disabled={sellLoadingId === item._id}
                      onClick={() => handleSellPosition(item._id)}
                      style={{ flex: 1, background: 'rgba(255,165,0,0.12)', color: '#FFA500', border: '1px solid rgba(255,165,0,0.3)', borderRadius: 10, padding: '9px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: sellLoadingId === item._id ? 0.6 : 1 }}
                    >
                      {sellLoadingId === item._id ? 'Closing...' : 'Close Bet'}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No Active Bets</div>
              <div style={{ color: C.muted, fontSize: 13 }}>Place a bet to get started</div>
            </div>
          )
        )}

        {/* HISTORY */}
        {tabName === 'History' && (
          loadingCompletedBets ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div className="skl skl-full" style={{ height: 14, marginBottom: 10 }} />
                <div className="skl" style={{ height: 10, width: '50%' }} />
              </div>
            ))
          ) : completedBets.length > 0 ? (
            completedBets.map((item, i) => {
              const isWin = item.outcome === 'win' || item.payout > item.betAmount;
              return (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 10 }}>{item.question}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div><span style={{ color: C.muted }}>Bet: </span><span style={{ fontWeight: 700 }}>${item.betAmount || 0}</span></div>
                      <div><span style={{ color: C.muted }}>Side: </span><span style={{ fontWeight: 700 }}>{item.outcomeLabel || item.bitSide}</span></div>
                    </div>
                    <div style={{ fontWeight: 700, color: isWin ? C.green : C.red }}>{isWin ? '+' : '-'}${Math.abs((item.payout || 0) - (item.betAmount || 0)).toFixed(4)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No History</div>
              <div style={{ color: C.muted, fontSize: 13 }}>Your bet history will appear here</div>
            </div>
          )
        )}

        {/* REFERRAL */}
        {tabName === 'Referral' && (
          loadingReferral ? (
            <div style={{ textAlign: 'center', padding: 20, color: C.muted }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Tier card */}
              <div style={{ background: 'linear-gradient(135deg, #181206, #100e06)', border: `1px solid ${currentTier.color}30`, borderRadius: 18, padding: 18, boxShadow: `0 0 40px ${currentTier.color}10` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>CURRENT TIER</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: currentTier.color }}>{currentTier.tier}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: C.muted, fontSize: 11 }}>COMMISSION</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: C.green }}>{currentTier.commission}</div>
                  </div>
                </div>
                {nextTier && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 6 }}>
                      <span>Progress to {nextTier.tier}</span>
                      <span>${refVolume.toLocaleString()} / ${nextTier.max.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((refVolume / nextTier.max) * 100, 100)}%`, background: `linear-gradient(90deg, ${currentTier.color}, #d97706)`, borderRadius: 99 }} />
                    </div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>Once you reach {nextTier.tier}, you stay permanently — no downgrade</div>
                  </div>
                )}
              </div>

              {/* All tiers */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>ALL TIERS — LIFETIME VOLUME</div>
                {TIERS.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none', opacity: currentTier.tier === t.tier ? 1 : 0.45 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: t.color }}>{t.tier}</div>
                        <div style={{ color: C.muted, fontSize: 12 }}>{t.range} lifetime</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.green }}>{t.commission}</div>
                  </div>
                ))}
              </div>

              {/* Referral code */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, fontWeight: 600, letterSpacing: 1 }}>YOUR REFERRAL CODE</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '12px 16px', border: `1px solid ${C.border}`, marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 1, fontFamily: 'monospace' }}>{referralInfo?.referralCode || '—'}</span>
                  {referralInfo?.referralCode && (
                    <button onClick={() => copyToClipboard(referralInfo.referralCode, 'code')} style={{ background: copySuccess === 'code' ? `${C.green}15` : C.purpleGlow, color: copySuccess === 'code' ? C.green : C.purpleL, border: `1px solid ${copySuccess === 'code' ? C.green + '30' : C.purpleGlow2}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {copySuccess === 'code' ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                    </button>
                  )}
                </div>
                {referralInfo?.referralLink && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, fontSize: 11, color: C.muted, wordBreak: 'break-all', fontFamily: 'monospace' }}>{referralInfo.referralLink}</div>
                    <button onClick={() => copyToClipboard(referralInfo.referralLink, 'link')} style={{ background: C.purpleGlow, color: C.purpleL, border: `1px solid ${C.purpleGlow2}`, borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                      {copySuccess === 'link' ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>

              {/* Earnings + downlines */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>EARNINGS</div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: C.green }}>{Number(referralInfo?.referralEarnings || 0).toFixed(4)} USDC</div>
                </div>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>DOWNLINES</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{referralInfo?.downlineCount || 0}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Share to earn</div>
                </div>
              </div>

              {/* Downline list */}
              {referralInfo?.downlines?.length > 0 && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>DOWNLINES ({referralInfo.downlineCount})</div>
                  {referralInfo.downlines.map((dl, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < referralInfo.downlines.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>User #{dl.referredUserId}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{dl.source} · {new Date(dl.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>+{Number(dl.totalEarned || 0).toFixed(4)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* MY MARKETS */}
        {tabName === 'My Markets' && (
          loadingMyMarkets ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div className="skl skl-full" style={{ height: 14, marginBottom: 10 }} />
                <div className="skl" style={{ height: 10, width: '60%' }} />
              </div>
            ))
          ) : myMarkets.length > 0 ? (
            myMarkets.map((m, i) => {
              const status = m.marketStatus || 'unknown';
              const isActive = status === 'active';
              const statusColor = isActive ? C.green : status === 'resolved' ? C.purpleL : C.muted;
              return (
                <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{status.toUpperCase()}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{m.endDate ? new Date(m.endDate).toLocaleDateString() : ''}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 10 }}>{m.question}</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate(`/market-details/${m._id}`)} style={{ flex: 1, background: C.purpleGlow, color: C.purpleL, border: `1px solid ${C.purpleGlow2}`, borderRadius: 10, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View</button>
                    {isActive && (
                      <button disabled={closingMarketId === m._id} onClick={() => handleCloseMarket(m._id)} style={{ flex: 1, background: `${C.red}10`, color: C.red, border: `1px solid ${C.red}30`, borderRadius: 10, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: closingMarketId === m._id ? 0.6 : 1 }}>
                        {closingMarketId === m._id ? 'Closing...' : 'Close'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No Markets Created</div>
              <button onClick={() => navigate('/create-market')} style={{ marginTop: 8, background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Create Market</button>
            </div>
          )
        )}

        {/* ACCOUNT TAB */}
        {tabName === 'Account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email status */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>EMAIL ACCOUNT</div>

              {userProfile?.email && userProfile?.emailVerified ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 14, color: C.green }}>Email Linked</span>
                    </div>
                    <button
                      onClick={() => { setEmailStep('input'); setEmailInput(userProfile.email || ''); setEmailOtpInput(''); }}
                      style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 10px', fontSize: 12, color: C.muted, cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>
                  <div style={{ background: C.surface, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.sub, fontFamily: 'monospace', border: `1px solid ${C.border}` }}>
                    {userProfile.email}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    Used for account recovery if you lose access to Telegram.
                  </div>
                </div>
              ) : emailStep === 'input' ? (
                <div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
                    Link an email to enable account recovery. A one-time code will be sent to verify.
                  </div>
                  <input
                    type="email" inputMode="email"
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: C.surface, border: `1.5px solid ${emailInput ? C.purple : C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 15, outline: 'none', fontFamily: 'inherit', marginBottom: 10 }}
                  />
                  <button
                    onClick={handleLinkEmail}
                    disabled={emailLoading || !emailInput}
                    style={{ width: '100%', background: emailInput && !emailLoading ? `linear-gradient(135deg, ${C.purple}, #4f46e5)` : C.surface, color: emailInput && !emailLoading ? '#fff' : C.muted, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: emailInput && !emailLoading ? 'pointer' : 'not-allowed', opacity: !emailInput || emailLoading ? 0.5 : 1 }}
                  >
                    {emailLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>OTP sent to <strong style={{ color: C.sub }}>{emailInput}</strong></div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Check your inbox and enter the 6-digit code below.</div>
                  <input
                    type="text" inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={emailOtpInput}
                    onChange={e => setEmailOtpInput(e.target.value.replace(/\D/g, ''))}
                    style={{ width: '100%', boxSizing: 'border-box', background: C.surface, border: `1.5px solid ${emailOtpInput ? C.purple : C.border}`, borderRadius: 12, padding: '14px 14px', color: C.text, fontSize: 22, fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'monospace', letterSpacing: 8, marginBottom: 10 }}
                  />
                  <button
                    onClick={handleVerifyEmailOtp}
                    disabled={emailLoading || emailOtpInput.length < 6}
                    style={{ width: '100%', background: emailOtpInput.length === 6 && !emailLoading ? `linear-gradient(135deg, ${C.green}, #15803d)` : C.surface, color: emailOtpInput.length === 6 && !emailLoading ? '#fff' : C.muted, border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, fontSize: 14, cursor: emailOtpInput.length === 6 && !emailLoading ? 'pointer' : 'not-allowed', opacity: emailOtpInput.length < 6 || emailLoading ? 0.5 : 1, marginBottom: 8 }}
                  >
                    {emailLoading ? 'Verifying...' : 'Verify & Link Email'}
                  </button>
                  <button
                    onClick={() => { setEmailStep('input'); setEmailOtpInput(''); }}
                    style={{ width: '100%', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 0', fontSize: 13, cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <BottomTab />

      {/* Sell Position Modal */}
      <Modal open={!!sellModalBet} onClose={() => setSellModalBet(null)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', outline: 'none', width: '92%', maxWidth: 380 }}>
          {sellModalBet && (
            <Buyform
              market={{ _id: sellModalBet.manualId || sellModalBet.marketId, question: sellModalBet.question, source: 'arken', arkenMarketAddress: sellModalBet.arkenMarketAddress, chancePercents: [sellModalBet.outcomeLabel?.toLowerCase() === 'yes' ? (sellModalBet.odds || 0.5) * 100 : (1 - (sellModalBet.odds || 0.5)) * 100], liquidity: sellModalBet.liquidity }}
              handleBotClose={() => { setSellModalBet(null); getActiveBets(); }}
              selectedOutcome={{ outcome: sellModalBet.outcomeLabel, price: sellModalBet.odds || 0.5 }}
              predictionId={sellModalBet._id}
              betAmount={sellModalBet.betAmount || sellModalBet.amount || 0}
              initialSide="sell"
            />
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Profile;
