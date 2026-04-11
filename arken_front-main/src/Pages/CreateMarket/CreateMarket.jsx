import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postMethod } from '../../core/sevice/common.api';
import apiService from '../../core/sevice/detail';
import { useTelegramUser } from '../../context/TelegramUserContext';
import { C } from '../../theme';
import { BackIcon, PlusIcon, ShieldIcon, WarningIcon, CheckIcon, CopyIcon, ProfileIcon } from '../../Components/Icons';

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"/>
  </svg>
);

const PREDEFINED_TAGS = ['Crypto', 'Politics', 'Sports', 'Finance', 'Science', 'Culture', 'Geopolitics', 'Other'];
const OPTION_COLORS = ['#7c3aed', '#0ea5e9', '#f59e0b', '#22c55e', '#ef4444', '#a78bfa', '#f97316', '#3b82f6'];

// Applies a 3% house spread so markets never open flat 50/50.
const spreadSplit = (n, spread = 3) => {
  if (n < 2) return [100];
  const base = parseFloat((100 / n).toFixed(1));
  const half = parseFloat((spread / 2).toFixed(1));
  const probs = Array.from({ length: n }, () => base);
  probs[0] = parseFloat((probs[0] + half).toFixed(1));
  probs[n - 1] = parseFloat((probs[n - 1] - half).toFixed(1));
  const drift = parseFloat((100 - probs.reduce((a, b) => a + b, 0)).toFixed(1));
  if (drift !== 0) probs[n - 1] = parseFloat((probs[n - 1] + drift).toFixed(1));
  return probs;
};

const toDatetimeLocal = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CreateMarket = () => {
  const navigate = useNavigate();
  const { telegramUser } = useTelegramUser();
  const telegramId =
    telegramUser?.telegramId ||
    telegramUser?.id ||
    window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
    null;

  // Core fields
  const [question, setQuestion] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [outcomes, setOutcomes] = useState(['Yes', 'No']);
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState(toDatetimeLocal(new Date()));
  const [oracleType, setOracleType] = useState('uma'); // public markets default to UMA
  const [chain, setChain] = useState('EVM');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [tags, setTags] = useState([]);
  const [initialLiquidity, setInitialLiquidity] = useState('');
  const [creatorOutcomeIndex, setCreatorOutcomeIndex] = useState(0);
  const [probabilities, setProbabilities] = useState([51.5, 48.5]);
  const [rawInputs, setRawInputs] = useState(['51.5', '48.5']);

  // New UI state
  const [marketType, setMarketType] = useState('binary');
  const [yesProb, setYesProb] = useState(51);
  const [multiOptions, setMultiOptions] = useState([
    { id: 1, label: '', prob: 51 },
    { id: 2, label: '', prob: 49 },
  ]);
  const [criteriaYes, setCriteriaYes] = useState('');
  const [criteriaNo, setCriteriaNo] = useState('');
  const [dataSources, setDataSources] = useState([]);
  const [aiState, setAiState] = useState('idle');
  const [aiResult, setAiResult] = useState(null);

  // Sync probabilities when binary outcomes change
  useEffect(() => {
    if (marketType === 'binary') {
      setProbabilities([yesProb, 100 - yesProb]);
      setRawInputs([String(yesProb), String(100 - yesProb)]);
    }
  }, [yesProb, marketType]);

  // Reset outcomes when switching market type
  useEffect(() => {
    if (marketType === 'binary') {
      setOutcomes(['Yes', 'No']);
      setProbabilities([51, 49]);
      setRawInputs(['51', '49']);
      setYesProb(51);
    } else {
      setOutcomes(multiOptions.map(o => o.label || ''));
      const probs = multiOptions.map(o => o.prob);
      setProbabilities(probs);
      setRawInputs(probs.map(String));
    }
    setCreatorOutcomeIndex(0);
  }, [marketType]);

  // Public markets use UMA oracle; private markets default to manual
  useEffect(() => {
    setOracleType(isPrivate ? 'manual' : 'uma');
  }, [isPrivate]);

  // ── Multi-option handlers ──────────────────────────────────────────────────
  const addMultiOption = () => {
    if (multiOptions.length >= 8) return;
    setMultiOptions(prev => {
      const n = prev.length + 1;
      const even = Math.floor(100 / n);
      const rem = 100 - even * n;
      return [...prev, { id: Date.now(), label: '', prob: even }].map((o, i) => ({
        ...o, prob: i === 0 ? even + rem : even,
      }));
    });
  };

  const removeMultiOption = (id) => {
    if (multiOptions.length <= 2) return;
    setMultiOptions(prev => {
      const filtered = prev.filter(o => o.id !== id);
      const n = filtered.length;
      const even = Math.floor(100 / n);
      const rem = 100 - even * n;
      return filtered.map((o, i) => ({ ...o, prob: i === 0 ? even + rem : even }));
    });
  };

  const updateMultiLabel = (id, val) => {
    setMultiOptions(prev => prev.map(o => o.id === id ? { ...o, label: val } : o));
  };

  const updateMultiProb = (id, rawVal) => {
    const val = Math.max(1, Math.min(97, parseInt(rawVal) || 1));
    setMultiOptions(prev => {
      const others = prev.filter(o => o.id !== id);
      const remaining = 100 - val;
      const perOther = Math.floor(remaining / others.length);
      const rem = remaining - perOther * others.length;
      return prev.map(o => {
        if (o.id === id) return { ...o, prob: val };
        const idx = others.findIndex(x => x.id === o.id);
        return { ...o, prob: idx === 0 ? perOther + rem : perOther };
      });
    });
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const toggleTag = (tag) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // ── Probabilities (binary raw input) ──────────────────────────────────────
  const handleProbInput = (idx, val) => {
    const next = [...rawInputs];
    next[idx] = val;
    setRawInputs(next);
  };

  const commitProbability = (idx) => {
    const parsed = parseInt(rawInputs[idx], 10);
    const val = isNaN(parsed) ? probabilities[idx] : Math.min(99, Math.max(1, parsed));
    const newProbs = [...probabilities];
    newProbs[idx] = val;
    const rest = 100 - val;
    const others = newProbs.length - 1;
    const base = Math.floor(rest / others);
    const rem = rest - base * others;
    let firstOther = true;
    for (let i = 0; i < newProbs.length; i++) {
      if (i === idx) continue;
      newProbs[i] = firstOther ? base + rem : base;
      firstOther = false;
    }
    setProbabilities(newProbs);
    setRawInputs(newProbs.map(String));
  };

  // ── AI moderation ─────────────────────────────────────────────────────────
  const runAI = async () => {
    if (!canSubmit) return;
    setAiState('loading');
    setAiResult(null);
    await new Promise(r => setTimeout(r, 2000));

    const q = question.toLowerCase().trim();
    const words = q.split(/\s+/);
    const checks = { resolvable: false, clear: false, legal: true, quality: false };

    const hasTimeframe = /\b(202[5-9]|203\d|january|february|march|april|may|june|july|august|september|october|november|december|q[1-4]|this week|this month|this year|by end|end of|before|after|within)\b/.test(q);
    const hasVerifiableOutcome = /\b(price|market cap|volume|rate|percentage|usd|\$|billion|million|reach|hit|exceed|drop|fall|rise|win|lose|beat|pass|surpass|launch|list|delist|ban|approve|reject|elect|sign|fail)\b/.test(q);
    checks.resolvable = hasTimeframe && hasVerifiableOutcome;

    const isProperQuestion = question.trim().endsWith('?');
    const notTooShort = question.length >= 20;
    const notTooVague = words.length >= 5;
    checks.clear = isProperQuestion && notTooShort && notTooVague;

    const illegalTerms = /\b(kill|murder|attack|bomb|hack|steal|fraud|scam|illegal|weapon|drug|sex|nude|naked|terrorist|violence|abuse|exploit)\b/;
    checks.legal = !illegalTerms.test(q);

    const isPersonalTrivial = /\b(my (cat|dog|pet|friend|mom|dad|sister|brother|wife|husband|girlfriend|boyfriend)|eat today|sleep|wake up|go to|come home|call me|text me)\b/.test(q);
    const isTooGeneric = /^will (it|this|that|he|she|they|we|i) /.test(q) && words.length < 7;
    const hasCryptoOrFinance = /\b(bitcoin|btc|eth|ethereum|sol|solana|crypto|token|coin|market|stock|price|fed|rate|election|president|world cup|championship)\b/.test(q);
    const hasReliableCategory = tags.some(t => ['Crypto', 'Politics', 'Finance', 'Sports'].includes(t));
    checks.quality = !isPersonalTrivial && !isTooGeneric && (hasCryptoOrFinance || hasReliableCategory);

    let score = 20;
    if (checks.resolvable) score += 30;
    if (checks.clear) score += 20;
    if (checks.legal) score += 10;
    if (checks.quality) score += 25;
    if (tags.length > 1) score += 5;
    score = Math.min(100, Math.max(0, score));

    const verdict = score >= 70 ? 'approved' : score >= 50 ? 'review' : 'rejected';
    let reason = '';
    if (!checks.legal) {
      reason = 'Market violates content policy and cannot be listed on Arken.';
    } else if (!checks.quality) {
      reason = isPersonalTrivial ? 'Personal or trivial questions are not suitable for prediction markets.' : 'Market lacks real-world significance. Use Crypto, Finance, Politics, or Sports topics.';
    } else if (!checks.resolvable) {
      reason = 'Market needs a specific timeframe and verifiable outcome to be resolvable.';
    } else if (!checks.clear) {
      reason = 'Question structure is unclear. Use at least 5 words and end with a question mark.';
    } else if (verdict === 'approved') {
      reason = 'Market is clear, verifiable, and meets Arken quality standards.';
    } else {
      reason = 'Market passes basic checks but needs human review before going live.';
    }

    setAiResult({ score, verdict, reason, checks });
    setAiState('done');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!question || question.length < 10 || question.length > 150) {
      toast.error('Question must be 10–150 characters');
      return;
    }
    if (!question.trim().endsWith('?')) {
      toast.error('Question must end with "?" — e.g. "Will BTC reach $100k?"');
      return;
    }

    let cleanOutcomes, finalProbs;
    if (marketType === 'binary') {
      cleanOutcomes = ['Yes', 'No'];
      finalProbs = [yesProb, 100 - yesProb];
    } else {
      cleanOutcomes = multiOptions.map(o => o.label.trim()).filter(Boolean);
      if (cleanOutcomes.length < 2) {
        toast.error('Provide at least 2 labelled outcomes');
        return;
      }
      finalProbs = multiOptions.filter(o => o.label.trim()).map(o => o.prob);
    }

    if (!endDate || new Date(endDate) <= new Date()) {
      toast.error('Resolution date must be in the future');
      return;
    }
    if (endDate && startDate && new Date(startDate) >= new Date(endDate)) {
      toast.error('Start date must be before resolution date');
      return;
    }
    if (tags.length === 0) {
      toast.error('Select at least 1 tag');
      return;
    }
    if (!initialLiquidity || Number(initialLiquidity) < 1) {
      toast.error(`Initial liquidity must be at least 1 ${chain === 'EVM' ? 'USDT' : 'USDC'}`);
      return;
    }
    if (!telegramId) {
      toast.error('Please open this app from Telegram');
      return;
    }

    setLoading(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.createUserMarket,
        payload: {
          question,
          outcomes: cleanOutcomes,
          endDate,
          startDate,
          isPrivate,
          oracleType,
          telegramId,
          tags,
          initialLiquidity: Number(initialLiquidity),
          creatorOutcomeIndex,
          probabilities: finalProbs,
          chain,
          criteriaYes,
          criteriaNo,
          dataSources,
          marketType,
        },
      });

      if (resp && resp.success) {
        setSuccessModal({
          inviteCode: resp.inviteCode || null,
          inviteLink: resp.inviteLink || null,
          marketAddress: resp.marketAddress || null,
          isPrivate: !!resp.inviteCode,
          chain,
        });
      } else {
        toast.error(resp?.message || 'Failed to create market');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    const text = successModal?.inviteLink || successModal?.inviteCode;
    if (text) navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const visibility = isPrivate ? 'Private' : 'Public';
  const resolution = oracleType === 'uma' ? 'UMA Oracle' : 'Manual';
  const currency = chain === 'EVM' ? 'USDT' : 'USDC';
  const netLiq = initialLiquidity ? Number(initialLiquidity).toFixed(2) : '0.00';
  const totalCost = initialLiquidity
    ? (Number(initialLiquidity) + (oracleType === 'uma' ? 1 : 0)).toFixed(2)
    : oracleType === 'uma' ? '1.00' : '0.00';

  const multiTotal = multiOptions.reduce((s, o) => s + (o.prob || 0), 0);

  const canSubmit = question.length > 10 && tags.length > 0 && initialLiquidity &&
    criteriaYes && endDate && endDate.includes('T') &&
    (marketType === 'binary' || multiOptions.filter(o => o.label.trim().length > 0).length >= 2);

  const aiApproved = aiState === 'done' && aiResult && (aiResult.verdict === 'approved' || aiResult.verdict === 'review');
  const aiRejected = aiState === 'done' && aiResult && aiResult.verdict === 'rejected';
  const canFinalSubmit = canSubmit && (isPrivate || aiApproved);

  const scoreColor = aiResult ? (aiResult.score >= 70 ? C.green : aiResult.score >= 50 ? '#f59e0b' : C.red) : C.muted;
  const scoreLabel = aiResult ? (aiResult.verdict === 'approved' ? 'Auto Approved' : aiResult.verdict === 'review' ? 'Needs Review' : 'Rejected') : '';

  const minStart = toDatetimeLocal(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // ── Card helper styles ────────────────────────────────────────────────────
  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 };
  const label11 = { fontSize: 11, color: C.muted, marginBottom: 10, fontWeight: 600, letterSpacing: 1 };
  const inputStyle = (active) => ({
    width: '100%', background: C.surface,
    border: `1.5px solid ${active ? C.purple : C.border}`,
    borderRadius: 10, padding: '10px 12px', color: C.text,
    fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  });
  const textareaStyle = (active) => ({
    ...inputStyle(active), resize: 'none', lineHeight: 1.5,
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: C.text, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
          <BackIcon />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, flex: 1 }}>Create Market</span>
        <select
          value={chain}
          onChange={e => setChain(e.target.value)}
          style={{ background: C.card, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 8px', fontSize: 12, cursor: 'pointer', outline: 'none' }}
        >
          <option value="EVM">⬡ EVM (ARB)</option>
          <option value="SOL">◎ Solana</option>
        </select>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* QUESTION */}
        <div style={card}>
          <div style={label11}>QUESTION</div>
          <textarea
            value={question}
            onChange={e => { setQuestion(e.target.value); setAiState('idle'); setAiResult(null); }}
            placeholder="Will Bitcoin reach $200K by end of 2026?"
            maxLength={150}
            rows={3}
            style={{ ...textareaStyle(!!question), minHeight: 80 }}
          />
          <div style={{ textAlign: 'right', color: C.muted, fontSize: 11, marginTop: 4 }}>{question.length}/150</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            Genuine question ending with "?" · Reviewed before going live
          </div>
        </div>

        {/* MARKET TYPE */}
        <div style={card}>
          <div style={label11}>MARKET TYPE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { val: 'binary', title: 'YES / NO', desc: 'Simple binary outcome', ex: 'Will BTC hit $200K?' },
              { val: 'multi', title: 'Multi-Option', desc: 'Multiple outcomes', ex: 'Who wins the World Cup?' },
            ].map(t => {
              const active = marketType === t.val;
              return (
                <button key={t.val} onClick={() => setMarketType(t.val)} style={{ padding: '14px 12px', borderRadius: 14, border: `2px solid ${active ? C.purple : C.border}`, background: active ? C.purpleGlow : C.surface, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: active ? C.purpleL : C.text, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>{t.desc}</div>
                  <div style={{ fontSize: 10, color: active ? C.purpleL : C.muted, fontStyle: 'italic', opacity: 0.7 }}>{t.ex}</div>
                </button>
              );
            })}
          </div>

          {/* Binary: YES/NO probability slider */}
          {marketType === 'binary' && (
            <div>
              <div style={{ ...label11, marginBottom: 8 }}>INITIAL PROBABILITY</div>
              <input
                type="range" min={1} max={99} value={yesProb}
                onChange={e => setYesProb(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: C.purple, marginBottom: 10 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: `${C.green}12`, border: `1px solid ${C.green}25`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ color: C.muted, fontSize: 11 }}>YES</div>
                  <div style={{ color: C.green, fontWeight: 800, fontSize: 20 }}>{yesProb}%</div>
                </div>
                <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}25`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ color: C.muted, fontSize: 11 }}>NO</div>
                  <div style={{ color: C.red, fontWeight: 800, fontSize: 20 }}>{100 - yesProb}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-option */}
          {marketType === 'multi' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ ...label11, marginBottom: 0 }}>OUTCOMES (MIN 2, MAX 8)</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: multiTotal === 100 ? C.green : C.red }}>
                  Total: {multiTotal}% {multiTotal === 100 ? '✓' : '(must = 100%)'}
                </div>
              </div>

              {/* Live prob bar */}
              <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: 'hidden', marginBottom: 14, display: 'flex' }}>
                {multiOptions.map((opt, i) => (
                  <div key={opt.id} style={{ height: '100%', width: `${opt.prob}%`, background: OPTION_COLORS[i], transition: 'width 0.2s ease' }} />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {multiOptions.map((opt, i) => {
                  const col = OPTION_COLORS[i];
                  return (
                    <div key={opt.id} style={{ background: C.surface, borderRadius: 12, border: `1.5px solid ${opt.label ? col + '50' : C.border}`, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${col}25`, border: `1px solid ${col}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700, color: col }}>{i + 1}</div>
                        <input
                          value={opt.label}
                          onChange={e => updateMultiLabel(opt.id, e.target.value)}
                          placeholder={`Option ${i + 1}${i === 0 ? ' e.g. India' : i === 1 ? ' e.g. Australia' : ''}`}
                          style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: 15, outline: 'none', minWidth: 0 }}
                        />
                        {multiOptions.length > 2 && (
                          <button onClick={() => removeMultiOption(opt.id)} style={{ background: `${C.red}15`, color: C.red, border: 'none', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 700 }}>-</button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="range" min={1} max={97} value={opt.prob}
                          onChange={e => updateMultiProb(opt.id, e.target.value)}
                          style={{ flex: 1, accentColor: col, height: 4, cursor: 'pointer' }}
                        />
                        <div style={{ background: `${col}20`, border: `1px solid ${col}40`, borderRadius: 8, padding: '3px 10px', flexShrink: 0 }}>
                          <span style={{ color: col, fontWeight: 800, fontSize: 14 }}>{opt.prob}</span>
                          <span style={{ color: col, fontSize: 11 }}>%</span>
                        </div>
                      </div>
                      <div style={{ height: 3, background: C.border, borderRadius: 99, overflow: 'hidden', marginTop: 6 }}>
                        <div style={{ height: '100%', width: `${opt.prob}%`, background: col, borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {multiOptions.length < 8 && (
                <button onClick={addMultiOption} style={{ width: '100%', background: C.purpleGlow, color: C.purpleL, border: `1px solid ${C.purpleGlow2}`, borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <PlusIcon /> Add Option ({multiOptions.length}/8)
                </button>
              )}
              <div style={{ marginTop: 10, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                Set initial odds per outcome. Total must equal 100%. Editing one option auto-adjusts others.
              </div>
            </div>
          )}
        </div>

        {/* VISIBILITY */}
        <div style={card}>
          <div style={label11}>VISIBILITY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: isPrivate ? 14 : 0 }}>
            {[{ val: false, label: 'Public', desc: 'Anyone can join' }, { val: true, label: 'Private', desc: 'Invite code only' }].map(v => {
              const active = isPrivate === v.val;
              return (
                <button key={v.label} onClick={() => setIsPrivate(v.val)} style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${active ? C.purple : C.border}`, background: active ? C.purpleGlow : C.surface, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ color: active ? C.purpleL : C.muted, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    {v.val === false ? <GlobeIcon /> : <LockIcon />}
                  </div>
                  <div style={{ color: active ? C.purpleL : C.text, fontWeight: 700, fontSize: 14 }}>{v.label}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{v.desc}</div>
                </button>
              );
            })}
          </div>
          {isPrivate && (
            <div style={{ background: C.purpleGlow, border: `1px solid ${C.purpleGlow2}`, borderRadius: 14, padding: 16 }}>
              <div style={{ ...label11, marginBottom: 10 }}>AUTO-GENERATED INVITE CODE</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: 4, color: C.purpleL, fontFamily: 'monospace' }}>ARKEN••</span>
                <span style={{ fontSize: 12, color: C.muted }}>Generated on deploy</span>
              </div>
              <div style={{ color: C.muted, fontSize: 12 }}>Only people with this code can join your private market</div>
            </div>
          )}
        </div>

        {/* TAGS */}
        <div style={card}>
          <div style={label11}>TAGS (MIN 1)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {PREDEFINED_TAGS.map(tag => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? C.purple : C.border}`, background: active ? C.purpleGlow : C.surface, color: active ? C.purpleL : C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* INITIAL LIQUIDITY */}
        <div style={card}>
          <div style={label11}>INITIAL LIQUIDITY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Amount ({currency})</div>
              <input
                type="number" min={1} placeholder="e.g. 100"
                value={initialLiquidity}
                onChange={e => setInitialLiquidity(e.target.value)}
                style={inputStyle(!!initialLiquidity)}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Going into market</div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', color: C.purpleL, fontSize: 14, fontWeight: 700 }}>
                {netLiq} {currency}
              </div>
            </div>
          </div>
          <div style={{ color: C.muted, fontSize: 12 }}>
            {oracleType === 'uma' ? (
              <span>+ $1.00 oracle fee &nbsp; Total: <span style={{ color: C.text, fontWeight: 600 }}>{totalCost} {currency}</span></span>
            ) : (
              <span>No oracle fee &nbsp; Total: <span style={{ color: C.text, fontWeight: 600 }}>{netLiq} {currency}</span></span>
            )}
          </div>
        </div>

        {/* CREATOR INITIAL POSITION */}
        {initialLiquidity && Number(initialLiquidity) >= 1 && (
          <div style={card}>
            <div style={label11}>YOUR INITIAL POSITION</div>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
              Which outcome are you backing with your {Number(initialLiquidity).toFixed(2)} {currency}?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(marketType === 'binary' ? ['Yes', 'No'] : multiOptions.map(o => o.label || `Option ${multiOptions.indexOf(o) + 1}`)).map((label, idx) => {
                const active = creatorOutcomeIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCreatorOutcomeIndex(idx)}
                    style={{ padding: '8px 16px', borderRadius: 10, border: `2px solid ${active ? C.purple : C.border}`, background: active ? C.purpleGlow : C.surface, color: active ? C.purpleL : C.text, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RESOLUTION METHOD */}
        <div style={card}>
          <div style={label11}>RESOLUTION METHOD</div>
          {!isPrivate ? (
            <div>
              <div style={{ background: 'linear-gradient(135deg, #0d1a2e, #0a1520)', border: '1px solid #3b82f630', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#3b82f615', border: '1px solid #3b82f630', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#3b82f6' }}>
                  <ShieldIcon />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#60a5fa' }}>UMA Oracle</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>On-chain automatic resolution via Chainlink data feeds</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}30`, borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 700 }}>Required</span>
                </div>
              </div>
              <div style={{ marginTop: 10, background: C.purpleGlow, border: `1px solid ${C.purpleGlow2}`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                Public markets require UMA Oracle for trustless, decentralized resolution.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { val: 'manual', label: 'Manual', sub: 'You resolve it', desc: 'Best for friend groups' },
                  { val: 'uma', label: 'UMA Oracle', sub: 'On-chain auto', desc: 'More trustless' },
                ].map(r => {
                  const active = oracleType === r.val;
                  return (
                    <button key={r.val} onClick={() => setOracleType(r.val)} style={{ padding: '14px 10px', borderRadius: 14, border: `2px solid ${active ? C.purple : C.border}`, background: active ? C.purpleGlow : C.surface, cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ color: active ? C.purpleL : C.muted, display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        {r.val === 'manual' ? <ProfileIcon /> : <ShieldIcon />}
                      </div>
                      <div style={{ color: active ? C.purpleL : C.text, fontWeight: 700, fontSize: 14 }}>{r.label}</div>
                      <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{r.sub}</div>
                      <div style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{r.desc}</div>
                    </button>
                  );
                })}
              </div>
              {oracleType === 'manual' && (
                <div style={{ marginTop: 10, background: '#f59e0b08', border: '1px solid #f59e0b25', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#f59e0b', lineHeight: 1.6 }}>
                  You will manually resolve this market. Only available for private markets.
                </div>
              )}
            </div>
          )}
        </div>

        {/* RESOLUTION CRITERIA */}
        <div style={card}>
          <div style={label11}>RESOLUTION CRITERIA</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
            Define exactly when this market resolves YES or NO. Be specific — this is binding on-chain.
          </div>

          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>RESOLVES YES IF</div>
          <textarea
            value={criteriaYes}
            onChange={e => setCriteriaYes(e.target.value)}
            placeholder="e.g. Bitcoin closing price >= $150,000 USD on Coinbase at 11:59 PM UTC on the end date"
            rows={3}
            style={{ ...textareaStyle(!!criteriaYes), border: `1.5px solid ${criteriaYes ? C.green : C.border}`, marginBottom: 12 }}
          />

          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>RESOLVES NO IF</div>
          <textarea
            value={criteriaNo}
            onChange={e => setCriteriaNo(e.target.value)}
            placeholder="e.g. Price does not reach $150,000 by the end date, or market expires"
            rows={2}
            style={{ ...textareaStyle(!!criteriaNo), border: `1.5px solid ${criteriaNo ? C.red + '80' : C.border}`, marginBottom: 16 }}
          />

          {/* End date + time — split inputs, better on mobile */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600 }}>END DATE & TIME (UTC)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={endDate ? endDate.split('T')[0] : ''}
                onChange={e => {
                  const t = endDate && endDate.includes('T') ? endDate.split('T')[1] : '23:59';
                  setEndDate(e.target.value ? `${e.target.value}T${t}` : '');
                }}
                style={{ flex: 1, minWidth: 0, background: C.surface, border: `1.5px solid ${endDate ? C.purple : C.border}`, borderRadius: 10, padding: '11px 10px', color: endDate ? C.text : C.muted, fontSize: 14, outline: 'none', colorScheme: 'dark' }}
              />
              <input
                type="time"
                value={endDate && endDate.includes('T') ? endDate.split('T')[1] : '23:59'}
                onChange={e => {
                  const d = endDate ? endDate.split('T')[0] : '';
                  if (d) setEndDate(`${d}T${e.target.value}`);
                }}
                style={{ width: 100, flexShrink: 0, background: C.surface, border: `1.5px solid ${endDate ? C.purple : C.border}`, borderRadius: 10, padding: '11px 8px', color: C.text, fontSize: 14, outline: 'none', colorScheme: 'dark' }}
              />
            </div>
            {endDate && endDate.includes('T') && (
              <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>
                Resolves: {endDate.split('T')[0]} at {endDate.split('T')[1]} UTC
              </div>
            )}
          </div>

          {/* Data sources */}
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 600 }}>DATA SOURCES</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>Select primary + fallback sources.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {[
                { id: 'chainlink', label: 'Chainlink', desc: 'Oracle' },
                { id: 'coingecko', label: 'CoinGecko', desc: 'Price' },
                { id: 'coinbase', label: 'Coinbase', desc: 'Price' },
                { id: 'binance', label: 'Binance', desc: 'Price' },
                { id: 'pyth', label: 'Pyth', desc: 'Oracle' },
                { id: 'ap', label: 'AP News', desc: 'News' },
                { id: 'reuters', label: 'Reuters', desc: 'News' },
                { id: 'admin', label: 'Admin', desc: 'Manual' },
              ].map(s => {
                const active = dataSources.includes(s.id);
                const idx = dataSources.indexOf(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setDataSources(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 20, border: `1.5px solid ${active ? C.purple : C.border}`, background: active ? C.purpleGlow : C.surface, cursor: 'pointer' }}
                  >
                    {active && <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.purple, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</span>}
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? C.purpleL : C.sub }}>{s.label}</span>
                    <span style={{ fontSize: 10, color: C.muted }}>{s.desc}</span>
                  </button>
                );
              })}
            </div>
            {dataSources.length > 0 && (
              <div style={{ marginTop: 10, background: C.surface, borderRadius: 10, padding: '8px 12px', fontSize: 12, color: C.sub, border: `1px solid ${C.border}` }}>
                Primary: <span style={{ color: C.purpleL, fontWeight: 600 }}>{dataSources[0]}</span>
                {dataSources.length > 1 && <span> | Fallback: <span style={{ color: C.muted }}>{dataSources.slice(1).join(' > ')}</span></span>}
              </div>
            )}
          </div>
        </div>

        {/* AI MODERATION */}
        <div style={{ background: 'linear-gradient(135deg, #0d0d20, #111128)', border: `1px solid ${C.purpleGlow2}`, borderRadius: 18, padding: 18, boxShadow: '0 0 32px rgba(124,58,237,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LightningIcon />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>AI Market Review</div>
              <div style={{ color: C.muted, fontSize: 12 }}>Powered by Claude — instant quality check</div>
            </div>
          </div>

          {aiState === 'idle' && (
            <button onClick={runAI} disabled={!canSubmit} style={{ width: '100%', background: canSubmit ? `linear-gradient(135deg, ${C.purple}, #4f46e5)` : C.card, color: canSubmit ? '#fff' : C.muted, border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ShieldIcon /> Run AI Review
            </button>
          )}

          {aiState === 'loading' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ color: C.purpleL, fontSize: 13, marginBottom: 8 }}>Analyzing your market...</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}

          {aiState === 'done' && aiResult && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `conic-gradient(${scoreColor} ${aiResult.score * 3.6}deg, ${C.border} 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0d0d20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor }}>{aiResult.score}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: scoreColor }}>{scoreLabel}</div>
                  <div style={{ color: C.sub, fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>{aiResult.reason}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Resolvable', key: 'resolvable' },
                  { label: 'Clear Question', key: 'clear' },
                  { label: 'Legal', key: 'legal' },
                  { label: 'Quality', key: 'quality' },
                ].map(c => {
                  const pass = aiResult.checks && aiResult.checks[c.key];
                  return (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${pass ? C.green : C.red}0d`, border: `1px solid ${pass ? C.green : C.red}25`, borderRadius: 10, padding: '8px 12px' }}>
                      <span style={{ color: pass ? C.green : C.red, flexShrink: 0 }}>{pass ? <CheckIcon /> : <WarningIcon />}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: pass ? C.green : C.red }}>{c.label}</span>
                    </div>
                  );
                })}
              </div>

              <button onClick={runAI} style={{ width: '100%', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Re-analyze
              </button>
            </div>
          )}
        </div>

        {/* Warnings / gates */}
        {isPrivate && oracleType === 'manual' && (
          <div style={{ background: '#f59e0b08', border: '1.5px solid #f59e0b40', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10 }}>
            <div style={{ flexShrink: 0, color: '#f59e0b', marginTop: 1 }}><WarningIcon /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b', marginBottom: 4 }}>Manual Resolution Market</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>This market will be resolved manually by the creator. Participants should trust you before joining.</div>
            </div>
          </div>
        )}

        {!isPrivate && canSubmit && aiState === 'idle' && (
          <div style={{ background: C.purpleGlow, border: `1px solid ${C.purpleGlow2}`, borderRadius: 14, padding: '12px 16px', fontSize: 13, color: C.sub, textAlign: 'center' }}>
            Public markets require AI review before submission. Run the review above first.
          </div>
        )}

        {!isPrivate && aiRejected && (
          <div style={{ background: `${C.red}08`, border: `1.5px solid ${C.red}30`, borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 10 }}>
            <div style={{ flexShrink: 0, color: C.red, marginTop: 1 }}><WarningIcon /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.red, marginBottom: 4 }}>Market Blocked by AI</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>This market did not pass quality review and cannot be listed publicly. Edit your question and re-analyze.</div>
            </div>
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={loading ? undefined : (!isPrivate && aiState === 'idle' && canSubmit ? runAI : handleSubmit)}
          disabled={loading || (!isPrivate && (aiState === 'loading' || aiRejected || (!canSubmit && aiState === 'idle')))}
          style={{
            width: '100%', border: 'none', borderRadius: 16, padding: '16px 24px',
            background: aiRejected ? `linear-gradient(135deg, ${C.red}, #dc2626)` : `linear-gradient(135deg, ${C.purple}, #4f46e5)`,
            color: '#fff', fontWeight: 700, fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: (loading || (!isPrivate && !canFinalSubmit && aiState !== 'idle')) ? 0.6 : 1,
            boxShadow: `0 8px 32px rgba(124,58,237,0.4)`,
          }}
        >
          {loading ? 'Deploying...' :
           aiRejected ? 'Rejected — Edit & Re-analyze' :
           !isPrivate && aiState === 'idle' && canSubmit ? 'Run AI Review First' :
           aiState === 'loading' ? 'Analyzing...' :
           isPrivate ? 'Submit Private Market' :
           'Submit Market'}
        </button>

        <div style={{ height: 20 }} />
      </div>

      {/* SUCCESS MODAL */}
      {successModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Market Live!</h3>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              {successModal.isPrivate
                ? 'Your market is deployed on-chain. Share the invite code with friends to join.'
                : 'Your market is deployed on-chain and is now live.'}
            </p>

            {successModal.marketAddress && (() => {
              const addr = successModal.marketAddress;
              const short = addr.length > 16 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
              const explorerUrl = successModal.chain === 'SOL'
                ? `https://solscan.io/account/${addr}`
                : `https://arbiscan.io/address/${addr}`;
              return (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 12, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>CONTRACT ADDRESS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.purpleL, fontSize: 14, fontFamily: 'monospace', textDecoration: 'underline', flex: 1 }}>
                      {short}
                    </a>
                    <button onClick={() => navigator.clipboard.writeText(addr)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted }}>
                      <CopyIcon />
                    </button>
                  </div>
                </div>
              );
            })()}

            {successModal.isPrivate && (
              <>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 12, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 600 }}>INVITE CODE</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: C.purpleL, fontFamily: 'monospace', letterSpacing: 3 }}>{successModal.inviteCode}</div>
                </div>
                <button
                  onClick={copyInviteCode}
                  style={{ width: '100%', background: C.purpleGlow, color: C.purpleL, border: `1px solid ${C.purpleGlow2}`, borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
                >
                  <CopyIcon /> Copy Invite Link
                </button>
              </>
            )}

            <button
              onClick={() => { setSuccessModal(null); navigate('/markets'); }}
              style={{ width: '100%', background: `linear-gradient(135deg, ${C.purple}, #4f46e5)`, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Go to Markets
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
};

export default CreateMarket;
