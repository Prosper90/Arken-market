import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTelegramUser } from '../../context/TelegramUserContext';
import apiService from '../../core/sevice/detail';
import { postMethod } from '../../core/sevice/common.api';
import { useDisconnect } from 'wagmi';
import { C } from '../../theme';
import { ArrowIcon, ShieldIcon } from '../../Components/Icons';

const LightningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22 7l-9 9-4-4L2 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 7h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const KolIconSm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 5a7 7 0 0 1 7 7M12 1a11 11 0 0 1 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const GetStarted = () => {
  const Navigation = useNavigate();
  const { setTelegramUser, telegramUser } = useTelegramUser();
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [counts, setCounts] = useState({ markets: 0, volume: 0, users: 0 });
  const { disconnect } = useDisconnect();

  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user) {
    const telegramId = tg.initDataUnsafe.user.id;
    document.cookie = `telegramId=${telegramId}; path=/; max-age=${60 * 60 * 24}`;
  }

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const targets = { markets: 48, volume: 284, users: 12 };
    const duration = 1800;
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        markets: Math.floor(ease * targets.markets),
        volume: Math.floor(ease * targets.volume),
        users: Math.floor(ease * targets.users),
      });
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [loaded]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('clear') === '1') {
      localStorage.clear();
      params.delete('clear');
      params.delete('t');
      const newSearch = params.toString();
      window.history.replaceState({}, '', newSearch ? `?${newSearch}` : window.location.pathname);
    }
    authenticateTelegramUser();
  }, []);

  const authenticateTelegramUser = async () => {
    try {
      setLoadingAuth(true);
      if (!window.Telegram || !window.Telegram.WebApp) {
        console.warn('Not opened inside Telegram WebApp');
        setLoadingAuth(false);
        return;
      }
      const tg = window.Telegram.WebApp;
      tg.ready();
      const initData = tg.initData;
      const resp = await postMethod({ apiUrl: apiService.telegramWebappAuth, payload: { initData } });
      if (resp.success) {
        setTelegramUser(resp.data);
        localStorage.setItem('telegramUser', JSON.stringify(resp.data));
        const savedWallet = localStorage.getItem('walletAddress');
        const savedWalletName = localStorage.getItem('walletName');
        if (savedWallet) {
          const userResp = await postMethod({ apiUrl: apiService.getUserDetails, payload: { telegramId: resp.data.telegramId } });
          const hasCustodialWallet = savedWalletName === 'newwallet' && userResp.success && userResp.data?.custodialWallets?.length > 0;
          const hasExternalWallet = userResp.success && userResp.data?.wallet?.isConnected && userResp.data?.wallet?.walletAddress;
          if (hasCustodialWallet || hasExternalWallet) {
            if (hasCustodialWallet && !hasExternalWallet) {
              const custodialWallets = userResp.data.custodialWallets;
              const activeChain = localStorage.getItem('activeChain') || 'ARB';
              const activeWallet = custodialWallets.find(w => (w.network || '').toUpperCase() === activeChain) || custodialWallets[0];
              if (activeWallet?.address) localStorage.setItem('walletAddress', activeWallet.address);
            }
            Navigation('/markets');
            return;
          } else {
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('walletName');
          }
        }
      } else {
        console.error(resp.message);
        toast.error(resp.message || 'Authentication failed. Please restart the app.');
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleNavigate = () => Navigation('/onBoarding');

  const features = [
    { Icon: TrendIcon, title: 'Trade Predictions', desc: 'Crypto prices, world events & more', color: C.purple, bg: 'rgba(124,58,237,0.12)' },
    { Icon: KolIconSm, title: 'KOL Call Markets', desc: 'Coming Q2 2026', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', soon: true },
    { Icon: LockIcon, title: 'Private Markets', desc: 'Invite-only groups with your people', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { Icon: ShieldIcon, title: 'Smart Contracts', desc: 'Funds secured on-chain, instant payouts', color: C.green, bg: 'rgba(34,197,94,0.12)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)', animation: loaded ? 'orb1 8s ease-in-out infinite' : 'none' }} />
        <div style={{ position: 'absolute', top: -60, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)', animation: loaded ? 'orb2 10s ease-in-out infinite' : 'none' }} />
        <div style={{ position: 'absolute', top: 200, left: '30%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', animation: loaded ? 'orb3 12s ease-in-out infinite' : 'none' }} />
      </div>

      <style>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,30px) scale(1.1)} 66%{transform:translate(-20px,50px) scale(0.95)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.15)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes logoIn { 0%{transform:scale(0.5) rotate(-10deg);opacity:0} 70%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.4)} 50%{box-shadow:0 0 0 16px rgba(124,58,237,0)} }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, padding: '64px 24px 32px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 20px 60px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)', color: '#fff', animation: loaded ? 'logoIn 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards, pulse 3s ease-in-out 1s infinite' : 'none', opacity: 0 }}>
          <LightningIcon />
        </div>

        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8, background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: loaded ? 'fadeUp 0.6s ease 0.3s both' : 'none' }}>
          Arken Markets
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, letterSpacing: 0.3, animation: loaded ? 'fadeUp 0.6s ease 0.45s both' : 'none' }}>
          The prediction layer for Web3
        </div>

        {/* Live stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 32, animation: loaded ? 'fadeUp 0.6s ease 0.6s both' : 'none' }}>
          {[
            { val: counts.markets + '+', label: 'Live Markets', color: C.purpleL },
            { val: '$' + counts.volume + 'K', label: 'Volume', color: '#0ea5e9' },
            { val: counts.users + 'K+', label: 'Users', color: C.green },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 8px', boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: -0.5 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Network badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '6px 14px', marginTop: 16, animation: loaded ? 'fadeUp 0.6s ease 0.75s both' : 'none' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>ARB + SOL — Multichain</span>
        </div>
      </div>

      {/* Features */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', flex: 1 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)', animation: loaded ? 'fadeUp 0.6s ease 0.8s both' : 'none' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < features.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', opacity: f.soon ? 0.7 : 1 }}>
              <div style={{ width: 44, height: 44, background: f.bg, border: `1px solid ${f.color}30`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: f.color, boxShadow: `0 4px 12px ${f.color}20` }}>
                <f.Icon />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{f.title}</div>
                <div style={{ color: f.soon ? '#f59e0b' : 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 }}>{f.desc}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                {f.soon ? (
                  <div style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>SOON</div>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.2)' }}><ArrowIcon /></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'relative', zIndex: 1, padding: '20px 20px 48px', animation: loaded ? 'fadeUp 0.6s ease 1s both' : 'none' }}>
        <button
          onClick={handleNavigate}
          disabled={loadingAuth}
          style={{ width: '100%', border: 'none', borderRadius: 18, padding: '16px 24px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)', color: '#fff', fontWeight: 700, fontSize: 17, cursor: loadingAuth ? 'not-allowed' : 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: 0.2, opacity: loadingAuth ? 0.7 : 1 }}
        >
          {loadingAuth ? 'Loading...' : <><span>Get Started</span> <ArrowIcon /></>}
        </button>
        <div style={{ textAlign: 'center', marginTop: 14, color: 'rgba(255,255,255,0.25)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ShieldIcon /> Verified & Regulated Platform
        </div>
        <p style={{ textAlign: 'center', marginTop: 10, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default GetStarted;
