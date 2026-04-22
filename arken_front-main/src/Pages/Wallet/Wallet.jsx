import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import apiService from '../../core/sevice/detail';
import { postMethod } from '../../core/sevice/common.api';
import { useTelegramUser } from '../../context/TelegramUserContext';
import { useChain } from '../../context/ChainContext';
import BottomTab from '../BottomTab/BottomTab';
import { C } from '../../theme';
import {
  CopyIcon, CheckIcon, SolLogo, ArbLogo, DisconnectIcon,
  WarningIcon, ShieldIcon,
} from '../../Components/Icons';

// ─── Coin definitions ─────────────────────────────────────────────────────────
const UsdcLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#2775CA" />
    <text x="12" y="13.5" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="800" letterSpacing="0.2">USDC</text>
  </svg>
);

// Only USDC withdrawals are supported (USDC SPL on Solana, USDC ERC-20 on Arbitrum)
const COINS = {
  'USDC-SOL':{ name: 'USDC (SPL)',   network: 'Solana SPL Token', Logo: UsdcLogo, color: '#2775CA', chain: 'SOL' },
  'USDC-ARB':{ name: 'USDC (ERC-20)',network: 'Arbitrum One',   Logo: UsdcLogo, color: '#2775CA', chain: 'ARB' },
};

const CoinRow = ({ coinKey, selected, onSelect }) => {
  const coin = COINS[coinKey];
  const isSelected = selected === coinKey;
  return (
    <button
      onClick={() => onSelect(isSelected ? null : coinKey)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: isSelected ? `${C.purple}12` : C.surface,
        border: `1.5px solid ${isSelected ? C.purple : C.border}`,
        borderRadius: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${coin.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <coin.Logo />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{coin.name}</div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{coin.network}</div>
      </div>
      {isSelected && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Wallet = () => {
  const navigate = useNavigate();
  const { telegramUser } = useTelegramUser();
  const { activeChain, switchChain } = useChain();

  const [walletName, setWalletName]       = useState(localStorage.getItem('walletName'));
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('walletAddress'));
  const [custodialWallets, setCustodialWallets] = useState([]);
  const [userWallet, setUserWallet]       = useState({ isConnected: false, walletAddress: '', walletName: '', uniqueId: '' });
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [usdtBalance, setUsdtBalance]     = useState(0);
  const [solBalance, setSolBalance]        = useState(0);
  const [evmBalance, setEvmBalance]        = useState(0);
  const [copied, setCopied]               = useState('');

  const [depositHistory, setDepositHistory]   = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [historyLoading, setHistoryLoading]   = useState(false);

  // Deposit / withdraw inline state
  const [tab, setTab]                     = useState('deposit');
  const [selectedCoin, setSelectedCoin]   = useState(null);
  const [withdrawAmt, setWithdrawAmt]     = useState('');
  const [withdrawAddr, setWithdrawAddr]   = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);

  useEffect(() => {
    getUserDetails();
    getBalance();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const tid = telegramUser?.telegramId || localStorage.getItem('telegramId');
    if (!tid) return;
    setHistoryLoading(true);
    try {
      const [depResp, wdResp] = await Promise.all([
        postMethod({ apiUrl: apiService.get_deposit_list, payload: { telegramId: tid } }),
        postMethod({ apiUrl: apiService.get_withdraw_list, payload: { telegramId: tid } }),
      ]);
      if (depResp?.success) setDepositHistory(depResp.data || []);
      if (wdResp?.success)  setWithdrawHistory(wdResp.data  || []);
    } catch (e) {
      console.error('fetchHistory error:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const copy = (text, key = 'main') => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied!');
    setTimeout(() => setCopied(''), 2000);
  };

  const truncateAddress = (address) => {
    if (!address) return '0x015f9711....8f78';
    return `${address.slice(0, 8)}....${address.slice(-4)}`;
  };

  const getUserDetails = async () => {
    try {
      if (!telegramUser?.telegramId) return;
      const resp = await postMethod({ apiUrl: apiService.getUserDetails, payload: { telegramId: telegramUser.telegramId } });
      if (resp.success && resp.data) {
        setUserWallet({
          isConnected: resp.data.wallet?.isConnected || false,
          walletAddress: resp.data.wallet?.walletAddress || '',
          walletName: resp.data.wallet?.walletName || '',
          uniqueId: resp.data.uniqueId || '',
        });
        if (Array.isArray(resp.data.custodialWallets) && resp.data.custodialWallets.length > 0) {
          setCustodialWallets(resp.data.custodialWallets);
        }
        if (resp.data.wallet?.isConnected) {
          setWalletAddress(resp.data.wallet.walletAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    if (userWallet?.isConnected && userWallet.walletName) {
      setWalletAddress(localStorage.getItem('walletAddress'));
    } else {
      const stored = localStorage.getItem('walletName');
      if (stored) {
        setWalletName(stored);
        setWalletAddress(localStorage.getItem('walletAddress'));
      }
    }
  }, [userWallet]);

  const getBalance = async () => {
    try {
      const telegramUserID = telegramUser?.telegramId;
      if (!telegramUserID) return;
      setLoadingBalance(true);
      const resp = await postMethod({ apiUrl: apiService.get_user_balance, payload: { telegramId: telegramUserID } });
      if (resp.success) {
        setUsdtBalance(resp.totalUsdt);
        setSolBalance(resp.solBalance || 0);
        setEvmBalance(resp.evmBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const name = (userWallet.walletName || localStorage.getItem('walletName') || '').toLowerCase();
      if (name === 'phantom' || name === 'solflare') {
        await postMethod({ apiUrl: apiService.disconnect_wallet, payload: { uniqueId: userWallet.uniqueId } }).catch(() => {});
      }
      Object.keys(localStorage).filter(k => k.startsWith('@appkit/')).forEach(k => localStorage.removeItem(k));
      ['walletconnect', 'wc@2:client', 'wagmi.recentConnectorId', 'wagmi.connected', 'WALLETCONNECT_DEEPLINK_CHOICE', 'walletDetails']
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('walletAddress', '');
      localStorage.setItem('walletName', '');
      setWalletAddress('');
      setWalletName('');
      setUserWallet({ isConnected: false, walletAddress: '', walletName: '', uniqueId: '' });
      toast.success('Wallet disconnected');
      navigate('/onBoarding');
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmt || !withdrawAddr) return;
    try {
      setWithdrawLoading(true);
      const coin = COINS[selectedCoin];
      const resp = await postMethod({
        apiUrl: apiService.withdraw,
        payload: {
          telegramId: telegramUser?.telegramId,
          amount: Number(withdrawAmt),
          toAddress: withdrawAddr,
          network: coin?.chain || 'SOL',
          currency: selectedCoin,
        },
      });
      if (resp.success || resp.status) {
        toast.success('Withdrawal submitted!');
        setWithdrawAmt('');
        setWithdrawAddr('');
      } else {
        toast.error(resp.message || 'Withdrawal failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Resolve deposit address for selected coin based on custodial wallets
  const getDepositAddress = (coinKey) => {
    const coin = COINS[coinKey];
    if (!coin) return null;
    const cw = custodialWallets.find(w => w.network === coin.chain);
    return cw?.address || walletAddress || null;
  };

  const activeWalletAddress = custodialWallets.find(w => w.network === activeChain)?.address || walletAddress;
  const displayName = walletName === 'newwallet' ? 'Own Wallet' : walletName ? walletName.charAt(0).toUpperCase() + walletName.slice(1) : 'Wallet';
  const coin = selectedCoin ? COINS[selectedCoin] : null;
  const depositAddress = selectedCoin ? getDepositAddress(selectedCoin) : null;
  const coinLabel = selectedCoin === 'USDC-SOL' || selectedCoin === 'USDC-ARB' ? 'USDC' : selectedCoin;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 100 }}>

      {/* HEADER HERO */}
      <div style={{ background: `linear-gradient(180deg, #0d0e1f, ${C.bg})`, padding: '24px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h5 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Wallet</h5>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Manage your funds and transactions</p>

          {/* Balance card */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 18 }}>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Total Balance</div>
            {loadingBalance ? (
              <div className="skl skl-number-lg" style={{ marginBottom: 4 }} />
            ) : (
              <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: -1 }}>${usdtBalance ? usdtBalance.toFixed(2) : '0.00'}</div>
            )}
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>USDC · Solana + Arbitrum</div>
          </div>

          {/* Disconnect button */}
          <button
            onClick={() => setShowDisconnect(true)}
            style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 12, border: `1px solid ${C.red}40`, background: `${C.red}10`, color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <DisconnectIcon /> Disconnect / Switch Wallet
          </button>
        </div>
      </div>

      {/* Deposit / Withdraw tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        {['deposit', 'withdraw'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedCoin(null); }}
            style={{ padding: 14, background: 'transparent', border: 'none', borderBottom: tab === t ? `2px solid ${C.purple}` : '2px solid transparent', color: tab === t ? C.purpleL : C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {t === 'deposit' ? '↓ Deposit' : '↑ Withdraw'}
          </button>
        ))}
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Coin selector */}
        <div>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>SELECT ASSET & NETWORK</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.keys(COINS).map(k => (
              <CoinRow key={k} coinKey={k} selected={selectedCoin} onSelect={setSelectedCoin} />
            ))}
          </div>
        </div>

        {/* ── DEPOSIT PANEL ── */}
        {tab === 'deposit' && selectedCoin && coin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: `${C.green}0e`, border: `1px solid ${C.green}20`, borderRadius: 12, padding: '12px 16px', fontSize: 13, color: C.green, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldIcon /> Balance credited automatically within 5–10 minutes
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 12, letterSpacing: 1 }}>DEPOSIT ADDRESS</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${coin.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <coin.Logo />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{coin.name}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{coin.network}</div>
                  </div>
                </div>
                <button
                  onClick={() => depositAddress && copy(depositAddress, selectedCoin)}
                  disabled={!depositAddress}
                  style={{ background: copied === selectedCoin ? `${C.green}15` : C.purpleGlow, color: copied === selectedCoin ? C.green : C.purpleL, border: `1px solid ${copied === selectedCoin ? C.green + '30' : C.purpleGlow2}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: depositAddress ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 5, opacity: depositAddress ? 1 : 0.4 }}
                >
                  {copied === selectedCoin ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
              <div style={{ background: C.surface, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.sub, wordBreak: 'break-all', border: `1px solid ${C.border}`, fontFamily: 'monospace', lineHeight: 1.6 }}>
                {depositAddress || 'No wallet address found. Please reconnect.'}
              </div>
            </div>

            <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}20`, borderRadius: 12, padding: '12px 16px', fontSize: 12, color: C.red, display: 'flex', gap: 8 }}>
              <WarningIcon />
              <span>Only send <strong>{coin.name}</strong> to this address. Wrong assets = permanent loss.</span>
            </div>

            {(selectedCoin === 'USDC-ARB' || selectedCoin === 'USDC-SOL') && (
              <div style={{ background: '#f59e0b08', border: '1px solid #f59e0b30', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#f59e0b', display: 'flex', gap: 8, lineHeight: 1.6 }}>
                <WarningIcon />
                <span>
                  You also need a small amount of <strong>{selectedCoin === 'USDC-ARB' ? 'ETH' : 'SOL'}</strong> in this wallet to pay network (gas) fees.{' '}
                  USDC and {selectedCoin === 'USDC-ARB' ? 'ETH' : 'SOL'} are separate tokens — depositing USDC alone is not enough to send transactions.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── WITHDRAW PANEL ── */}
        {tab === 'withdraw' && selectedCoin && coin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px' }}>
              <span style={{ color: C.muted, fontSize: 13 }}>Available</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>
                {selectedCoin === 'USDC-SOL' ? solBalance.toFixed(2) : evmBalance.toFixed(2)} {coinLabel}
              </span>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 10, letterSpacing: 1 }}>AMOUNT</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surface, border: `1.5px solid ${withdrawAmt ? C.purple : C.border}`, borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ color: C.muted, fontWeight: 600, fontSize: 16 }}>$</span>
                <input
                  type="text" inputMode="decimal"
                  value={withdrawAmt}
                  onChange={e => setWithdrawAmt(e.target.value)}
                  placeholder="0.00"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: 20, fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
                />
                <span style={{ color: C.muted, fontSize: 13, fontWeight: 600 }}>{coinLabel}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {['25', '50', '100', 'MAX'].map(v => (
                  <button
                    key={v}
                    onClick={() => { const chainBal = selectedCoin === 'USDC-SOL' ? solBalance : evmBalance; setWithdrawAmt(v === 'MAX' ? String(chainBal.toFixed(2)) : v); }}
                    style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 0', color: C.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {v === 'MAX' ? 'Max' : `$${v}`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 10, letterSpacing: 1 }}>WITHDRAW TO</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={withdrawAddr}
                  onChange={e => setWithdrawAddr(e.target.value)}
                  placeholder="Paste wallet address..."
                  style={{ flex: 1, background: C.surface, border: `1.5px solid ${withdrawAddr ? C.purple : C.border}`, borderRadius: 10, padding: '11px 14px', color: C.text, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => navigator.clipboard.readText().then(t => setWithdrawAddr(t))}
                  style={{ background: C.purpleGlow, color: C.purpleL, border: `1px solid ${C.purpleGlow2}`, borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Paste
                </button>
              </div>
            </div>

            <div style={{ background: `${C.red}08`, border: `1px solid ${C.red}20`, borderRadius: 12, padding: '12px 16px', fontSize: 12, color: C.red, display: 'flex', gap: 8 }}>
              <WarningIcon />
              <span>Make sure the address supports {coin.network}.</span>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmt || !withdrawAddr || withdrawLoading}
              style={{ width: '100%', background: (!withdrawAmt || !withdrawAddr) ? C.card : `linear-gradient(135deg, ${C.purple}, #4f46e5)`, color: (!withdrawAmt || !withdrawAddr) ? C.muted : '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: (!withdrawAmt || !withdrawAddr || withdrawLoading) ? 'not-allowed' : 'pointer', opacity: (!withdrawAmt || !withdrawAddr || withdrawLoading) ? 0.5 : 1 }}
            >
              {withdrawLoading ? 'Submitting...' : `Withdraw ${coinLabel || ''}`}
            </button>
          </div>
        )}

        {!selectedCoin && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: C.muted, fontSize: 14 }}>
            Select an asset above to {tab}
          </div>
        )}

        {/* Connected wallet — hidden per client request */}

        {/* Supported networks — with per-chain balances */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>SUPPORTED NETWORKS</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { Logo: ArbLogo, name: 'Arbitrum One', color: '#28A0F0', balance: evmBalance },
              { Logo: SolLogo, name: 'Solana',       color: '#9945FF', balance: solBalance },
            ].map((n, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: C.surface, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: `${n.color}18` }}><n.Logo /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n.name}</div>
                  <div style={{ fontSize: 11, color: n.color, marginTop: 2 }}>Active</div>
                </div>
                {loadingBalance
                  ? <div className="skl" style={{ height: 14, width: 40, borderRadius: 4 }} />
                  : <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>${n.balance.toFixed(2)}</div>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Transaction history — switches with active tab */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 14 }}>
            {tab === 'deposit' ? 'DEPOSIT HISTORY' : 'WITHDRAWAL HISTORY'}
          </div>

          {historyLoading ? (
            [0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <div className="skl" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skl" style={{ height: 13, width: '50%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="skl" style={{ height: 11, width: '35%', borderRadius: 4 }} />
                </div>
                <div className="skl" style={{ height: 13, width: 50, borderRadius: 4 }} />
              </div>
            ))
          ) : tab === 'deposit' ? (
            depositHistory.length === 0
              ? <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: '20px 0' }}>No deposits yet</div>
              : depositHistory.slice(0, 20).map((d, i) => {
                  const isLast = i === Math.min(depositHistory.length, 20) - 1;
                  const statusColor = d.status === 'COMPLETE' ? C.green : d.status === 'CANCEL' ? C.red : '#f59e0b';
                  const date = new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
                  return (
                    <div key={d._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>↓</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>+${Number(d.Amount || 0).toFixed(2)} <span style={{ color: C.muted, fontWeight: 400 }}>{d.currencySymbol}</span></div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span>{date}</span>
                          {d.txHash && <span style={{ fontFamily: 'monospace' }}>· {d.txHash.slice(0, 8)}…</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>
                        {d.status}
                      </div>
                    </div>
                  );
                })
          ) : (
            withdrawHistory.length === 0
              ? <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: '20px 0' }}>No withdrawals yet</div>
              : withdrawHistory.slice(0, 20).map((w, i) => {
                  const isLast = i === Math.min(withdrawHistory.length, 20) - 1;
                  const statusMap = { 0: ['Pending', '#f59e0b'], 1: ['Processing', '#f59e0b'], 2: ['Complete', C.green], 3: ['Cancelled', C.red], 4: ['Failed', C.red] };
                  const [label, color] = statusMap[w.status] || ['Unknown', C.muted];
                  const date = new Date(w.created_at || w.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
                  return (
                    <div key={w._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: isLast ? 'none' : `1px solid ${C.border}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.red}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>↑</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>-${Number(w.amount || 0).toFixed(2)} <span style={{ color: C.muted, fontWeight: 400 }}>{w.currency_symbol}</span></div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span>{date}</span>
                          {w.txn_id && <span style={{ fontFamily: 'monospace' }}>· {w.txn_id.slice(0, 8)}…</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color, background: `${color}15`, padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>
                        {label}
                      </div>
                    </div>
                  );
                })
          )}
        </div>
      </div>

      {/* Disconnect confirm modal */}
      {showDisconnect && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '0 20px' }}>
          <div style={{ width: '100%', maxWidth: 380, background: C.surface, borderRadius: 20, padding: 24, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Disconnect Wallet?</div>
            <div style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>You will need to reconnect to trade or withdraw funds.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleDisconnect} style={{ width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Disconnect
              </button>
              <button onClick={() => setShowDisconnect(false)} style={{ width: '100%', background: C.card, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomTab />
    </div>
  );
};

export default Wallet;
