import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../core/sevice/detail';
import { postMethod } from '../core/sevice/common.api';
import { useTelegramUser } from '../context/TelegramUserContext';
import { C } from '../theme';
import { WarningIcon } from '../Components/Icons';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Buyform — inline swap panel for buying and selling market shares.
 *
 * Props:
 *   market          — market object
 *   handleBotClose  — close/dismiss handler
 *   selectedOutcome — { outcome, price, tokenId }
 *   predictionId    — (optional) enables Sell tab; the prediction _id to sell
 *   betAmount       — (optional) original bet amount in USDC, used for sell estimate
 *   initialSide     — (optional) 'buy' | 'sell', defaults to 'buy' (or 'sell' if predictionId given)
 */
const Buyform = ({ market, handleBotClose, selectedOutcome, predictionId, betAmount: initialBetAmount, initialSide }) => {
  const { telegramUser } = useTelegramUser();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const initOutcome = selectedOutcome?.outcome?.toLowerCase() === 'no' ? 'no' : 'yes';
  const defaultSide = initialSide || (predictionId ? 'sell' : 'buy');

  const [swapSide, setSwapSide] = useState(defaultSide);
  const [swapOutcome, setSwapOutcome] = useState(initOutcome);
  const [swapAmt, setSwapAmt] = useState('');
  const [sellPct, setSellPct] = useState(100);
  const [loading, setLoading] = useState(false);

  const isBinary = !market?.options || market.options.length === 0;

  // Prices from market
  const yesPrice = market?.chancePercents?.[0] ? market.chancePercents[0] / 100 : 0.5;
  const noPrice = 1 - yesPrice;
  const currentPrice = swapOutcome === 'yes' ? yesPrice : noPrice;

  // Buy estimates
  const parsedAmt = parseFloat(swapAmt) || 0;
  const sharesOut = parsedAmt > 0 && currentPrice > 0
    ? (parsedAmt / currentPrice).toFixed(2)
    : '0.00';
  const fee = parsedAmt > 0 ? (parsedAmt * 0.02).toFixed(2) : '0.00';
  const netStaked = parsedAmt > 0 ? (parsedAmt * 0.98).toFixed(2) : '0.00';
  const liquidity = market?.liquidity || 100;
  const priceImpact = parsedAmt > 0 ? Math.min(50, (parsedAmt / liquidity * 100)).toFixed(2) : '0.00';
  const highImpact = parsedAmt > 0 && parseFloat(priceImpact) > 5;

  // Sell estimates
  const positionSize = Number(initialBetAmount) || 0;
  const sellEstimate = positionSize > 0
    ? (positionSize * (sellPct / 100) * currentPrice * 0.98).toFixed(2)
    : '0.00';

  const handleBuy = async () => {
    if (!parsedAmt || parsedAmt <= 0) { toast.error('Enter an amount'); return; }

    const outcomeLabel = isBinary
      ? (swapOutcome === 'yes' ? 'Yes' : 'No')
      : (selectedOutcome?.outcome || swapOutcome);

    const payload = {
      ...(token ? { token } : { initData: telegramUser?.intData || window.Telegram?.WebApp?.initData }),
      marketId: market.specifyId || null,
      manualId: market.specifyId ? null : market._id,
      conditionId: market.conditionId || null,
      outcomeIndex: isBinary ? (swapOutcome === 'yes' ? 0 : 1) : (market.outcomes?.indexOf(outcomeLabel) ?? 0),
      outcomeLabel,
      amount: parsedAmt,
      odds: currentPrice,
      currency: market?.source === 'arken' ? 'USDT' : 'USDC',
      source: market.source || 'manual',
      ...(market?.source === 'arken' && { arkenMarketAddress: market.arkenMarketAddress }),
      ...(market?.source === 'solana' && { solanaMarketId: market.solanaMarketId || market._id }),
    };

    try {
      setLoading(true);
      const resp = await postMethod({ apiUrl: apiService.userbetplace, payload });
      if (resp.success) {
        toast.success(resp.data?.evmTxHash ? 'Bet placed on-chain!' : 'Bet placed successfully');
        if (token && window.Telegram?.WebApp) {
          setTimeout(() => window.Telegram.WebApp.close(), 1500);
        } else {
          handleBotClose();
          navigate('/profile');
        }
      } else {
        toast.error(resp.message || 'Bet placement failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    if (!predictionId) return;
    const telegramId = telegramUser?.telegramId;
    if (!telegramId) { toast.error('Not authenticated'); return; }

    try {
      setLoading(true);
      const resp = await postMethod({
        apiUrl: apiService.sellPosition,
        payload: { telegramId, predictionId, sellPercentage: sellPct },
      });
      if (resp.status || resp.success) {
        const msg = resp.isFullSell
          ? `Sold! Received $${(resp.payout?.toFixed(4) ?? '0')} USDT`
          : `Sold ${sellPct}%! Received $${(resp.payout?.toFixed(4) ?? '0')} USDT`;
        toast.success(msg);
        handleBotClose();
      } else {
        toast.error(resp.message || 'Failed to sell position');
      }
    } catch {
      toast.error('Error selling position');
    } finally {
      setLoading(false);
    }
  };

  const outcomeColor = swapOutcome === 'yes' ? C.green : C.red;
  const outcomeLabel = isBinary
    ? swapOutcome.toUpperCase()
    : (selectedOutcome?.outcome || swapOutcome.toUpperCase());

  return (
    <div style={{ background: C.surface, borderRadius: 20, overflow: 'hidden', maxWidth: 380, width: '100%' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: C.text, lineHeight: 1.4 }}>
          {market?.question}
        </div>
        <button onClick={handleBotClose} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 4, flexShrink: 0, marginTop: 1 }}>
          <CloseIcon />
        </button>
      </div>

      {/* Buy / Sell toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${C.border}` }}>
        {['buy', 'sell'].map(s => {
          const active = swapSide === s;
          const col = s === 'buy' ? C.green : C.red;
          const disabled = s === 'sell' && !predictionId;
          return (
            <button
              key={s}
              onClick={() => !disabled && setSwapSide(s)}
              style={{ padding: '12px 0', background: active ? `${col}12` : 'transparent', border: 'none', borderBottom: active ? `2px solid ${col}` : '2px solid transparent', color: active ? col : (disabled ? C.border : C.muted), fontWeight: 700, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1 }}
            >
              {s === 'buy' ? 'Buy' : 'Sell'}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 16, overflowY: 'auto', maxHeight: 460 }}>

        {/* YES / NO outcome selector (binary only) */}
        {isBinary && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {['yes', 'no'].map(o => {
              const active = swapOutcome === o;
              const col = o === 'yes' ? C.green : C.red;
              const price = o === 'yes' ? yesPrice : noPrice;
              return (
                <button key={o} onClick={() => setSwapOutcome(o)} style={{ padding: '12px 10px', borderRadius: 12, border: `2px solid ${active ? col : C.border}`, background: active ? `${col}12` : C.card, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: active ? col : C.text }}>{o.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: active ? col : C.muted, marginTop: 2 }}>{(price * 100).toFixed(0)}¢ per share</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Multi-option: show selected outcome */}
        {!isBinary && selectedOutcome && (
          <div style={{ background: C.card, borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: C.muted, fontSize: 12 }}>Outcome</span>
            <span style={{ fontWeight: 700, color: C.purpleL }}>{selectedOutcome.outcome}</span>
          </div>
        )}

        {/* ── BUY ── */}
        {swapSide === 'buy' && (
          <>
            <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>

              {/* Input — YOU PAY */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>YOU PAY</span>
                  <span style={{ fontSize: 11, color: C.muted }}>USDC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '12px 14px', border: `1.5px solid ${swapAmt ? C.purple : C.border}` }}>
                  <input
                    type="text" inputMode="decimal"
                    value={swapAmt}
                    onChange={e => setSwapAmt(e.target.value)}
                    placeholder="0.00"
                    style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: 20, fontWeight: 700, outline: 'none', minWidth: 0 }}
                  />
                  <div style={{ background: C.surface, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: C.text, flexShrink: 0, border: `1px solid ${C.border}` }}>USDC</div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['10', '25', '50', '100'].map(v => (
                    <button key={v} onClick={() => setSwapAmt(v)} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 0', color: C.sub, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>${v}</button>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
                  <ArrowDownIcon />
                </div>
              </div>

              {/* Output — YOU RECEIVE */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>YOU RECEIVE</span>
                  <span style={{ fontSize: 11, color: C.muted }}>AMM Price</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1, fontSize: 20, fontWeight: 700, color: outcomeColor }}>{sharesOut}</div>
                  <div style={{ background: `${outcomeColor}15`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: outcomeColor, flexShrink: 0 }}>
                    {outcomeLabel} Shares
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ background: C.card, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.border}`, marginBottom: 12 }}>
              {[
                { l: 'Current Price', v: `${(currentPrice * 100).toFixed(0)}¢ per share` },
                { l: 'Platform Fee (2%)', v: `-$${fee}`, col: C.red },
                { l: 'Net Staked', v: `$${netStaked}` },
                { l: 'Price Impact', v: `~${priceImpact}%`, col: highImpact ? '#f59e0b' : C.green },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ color: C.muted, fontSize: 12 }}>{r.l}</span>
                  <span style={{ color: r.col || C.text, fontWeight: 600, fontSize: 12 }}>{r.v}</span>
                </div>
              ))}
            </div>

            {highImpact && (
              <div style={{ background: '#f59e0b08', border: '1px solid #f59e0b25', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#f59e0b', display: 'flex', gap: 8, alignItems: 'center' }}>
                <WarningIcon /> High price impact — this trade will move the AMM price significantly.
              </div>
            )}

            <button
              onClick={handleBuy}
              disabled={loading || !parsedAmt}
              style={{ width: '100%', background: !parsedAmt ? C.card : swapOutcome === 'yes' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #dc2626, #b91c1c)', color: !parsedAmt ? C.muted : '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: (!parsedAmt || loading) ? 'not-allowed' : 'pointer', opacity: (!parsedAmt || loading) ? 0.5 : 1 }}
            >
              {loading ? 'Placing Bet...' : `Buy ${outcomeLabel} Shares`}
            </button>
          </>
        )}

        {/* ── SELL ── */}
        {swapSide === 'sell' && (
          <>
            {!predictionId ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: C.muted, fontSize: 13, lineHeight: 1.8 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                No open position found.<br />Buy shares first to enable selling.
              </div>
            ) : (
              <>
                <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, marginBottom: 12 }}>

                  {/* Sell percentage selector */}
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 10 }}>SELL PERCENTAGE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setSellPct(pct)}
                        style={{ padding: '10px 0', borderRadius: 10, border: `2px solid ${sellPct === pct ? C.red : C.border}`, background: sellPct === pct ? `${C.red}12` : C.surface, color: sellPct === pct ? C.red : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                      >
                        {pct === 100 ? 'MAX' : `${pct}%`}
                      </button>
                    ))}
                  </div>

                  {/* Custom slider */}
                  <input
                    type="range" min={1} max={100} value={sellPct}
                    onChange={e => setSellPct(Number(e.target.value))}
                    style={{ width: '100%', accentColor: C.red, marginBottom: 8 }}
                  />
                  <div style={{ textAlign: 'center', fontSize: 13, color: C.muted, marginBottom: 4 }}>
                    Selling <span style={{ color: C.red, fontWeight: 800 }}>{sellPct}%</span> of position
                  </div>

                  {/* Arrow */}
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
                      <ArrowDownIcon />
                    </div>
                  </div>

                  {/* Estimated payout */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>ESTIMATED PAYOUT</span>
                      <span style={{ fontSize: 11, color: C.muted }}>after 2% fee</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: C.surface, borderRadius: 12, padding: '12px 14px', border: `1px solid ${C.border}` }}>
                      <div style={{ flex: 1, fontSize: 20, fontWeight: 700, color: C.purpleL }}>~{sellEstimate}</div>
                      <div style={{ background: `${C.purple}15`, borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: C.purpleL, flexShrink: 0 }}>USDC</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f59e0b08', border: '1px solid #f59e0b25', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#f59e0b', lineHeight: 1.6 }}>
                  Actual payout depends on the current pool price at execution time.
                </div>

                <button
                  onClick={handleSell}
                  disabled={loading}
                  style={{ width: '100%', background: loading ? C.card : `linear-gradient(135deg, ${C.red}, #b91c1c)`, color: loading ? C.muted : '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? 'Selling...' : `Sell ${sellPct === 100 ? 'Full Position' : `${sellPct}%`}`}
                </button>
              </>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: C.muted }}>
          Powered by AMM — prices move with pool liquidity
        </div>
      </div>
    </div>
  );
};

export default Buyform;
