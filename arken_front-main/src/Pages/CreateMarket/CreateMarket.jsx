import React, { useState, useEffect } from 'react';
import { LuShieldCheck, LuUser } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postMethod } from '../../core/sevice/common.api';
import apiService from '../../core/sevice/detail';
import { useTelegramUser } from '../../context/TelegramUserContext';
import './CreateMarket.css';

const PREDEFINED_TAGS = ['Crypto', 'Politics', 'Sports', 'Finance', 'Science', 'Culture', 'Geopolitics', 'Other'];

// Applies a 3% house spread so markets never open flat 50/50.
// Binary: [51.5, 48.5]. N>2: first gets +1.5, last gets -1.5, middle equal.
const spreadSplit = (n, spread = 3) => {
  if (n < 2) return [100];
  const base = parseFloat((100 / n).toFixed(1));
  const half = parseFloat((spread / 2).toFixed(1));
  const probs = Array.from({ length: n }, () => base);
  probs[0] = parseFloat((probs[0] + half).toFixed(1));
  probs[n - 1] = parseFloat((probs[n - 1] - half).toFixed(1));
  // correct any floating-point drift so total stays exactly 100
  const drift = parseFloat((100 - probs.reduce((a, b) => a + b, 0)).toFixed(1));
  if (drift !== 0) probs[n - 1] = parseFloat((probs[n - 1] + drift).toFixed(1));
  return probs;
};

// Returns a datetime-local string (YYYY-MM-DDTHH:MM) for a given Date
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

  const [question, setQuestion] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [outcomes, setOutcomes] = useState(['Yes', 'No']);
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState(toDatetimeLocal(new Date()));
  const [oracleType, setOracleType] = useState('manual');
  const [chain, setChain] = useState('EVM');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  // New fields
  const [tags, setTags] = useState([]);
  const [initialLiquidity, setInitialLiquidity] = useState('');
  const [creatorOutcomeIndex, setCreatorOutcomeIndex] = useState(0);
  const [probabilities, setProbabilities] = useState([51.5, 48.5]);
  const [rawInputs, setRawInputs] = useState(['51.5', '48.5']);

  // Keep probabilities in sync when outcomes count changes
  useEffect(() => {
    const equal = spreadSplit(outcomes.length);
    setProbabilities(equal);
    setRawInputs(equal.map(String));
    // Clamp creatorOutcomeIndex if outcomes shrink
    setCreatorOutcomeIndex(prev => Math.min(prev, outcomes.length - 1));
  }, [outcomes.length]);

  // Always default to manual when visibility changes (AI removed)
  useEffect(() => {
    setOracleType('manual');
  }, [isPrivate]);

  // ── Outcomes ──────────────────────────────────────────────────────────────
  const addOutcome = () => {
    if (outcomes.length < 5) setOutcomes([...outcomes, '']);
  };

  const removeOutcome = (idx) => {
    if (outcomes.length > 2) setOutcomes(outcomes.filter((_, i) => i !== idx));
  };

  const updateOutcome = (idx, val) => {
    const updated = [...outcomes];
    updated[idx] = val;
    setOutcomes(updated);
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const toggleTag = (tag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // ── Probabilities ─────────────────────────────────────────────────────────
  const updateProbability = (idx, raw) => {
    const val = Math.min(99, Math.max(1, parseInt(raw, 10) || 1));
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
  };

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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!question || question.length < 10 || question.length > 150) {
      toast.error('Question must be 10–150 characters');
      return;
    }
    if (!question.trim().endsWith('?')) {
      toast.error('Question must end with a "?" — e.g. "Will BTC reach $100k?"');
      return;
    }
    const cleanOutcomes = outcomes.map(o => o.trim()).filter(Boolean);
    if (cleanOutcomes.length < 2) {
      toast.error('Provide at least 2 outcomes');
      return;
    }
    if (!endDate || new Date(endDate) <= new Date()) {
      toast.error('Resolution date must be in the future');
      return;
    }
    if (endDate && startDate && new Date(startDate) >= new Date(endDate)) {
      toast.error('Start date/time must be before resolution date/time');
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
          probabilities,
          chain,
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
    if (successModal?.inviteLink) {
      navigator.clipboard.writeText(successModal.inviteLink).then(() => toast.success('Invite link copied!'));
    } else if (successModal?.inviteCode) {
      navigator.clipboard.writeText(successModal.inviteCode).then(() => toast.success('Invite code copied!'));
    }
  };

  // Min for start: now (browser enforces future naturally)
  const minStart = toDatetimeLocal(new Date());
  // Min for resolution: at least 1 day from now
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minEnd = toDatetimeLocal(tomorrow);

  const currency = chain === 'EVM' ? 'USDT' : 'USDC';
  const netLiquidity = initialLiquidity ? Number(initialLiquidity).toFixed(2) : '0.00';
  const totalCost = initialLiquidity
    ? (Number(initialLiquidity) + (oracleType === 'uma' ? 1 : 0)).toFixed(2)
    : oracleType === 'uma' ? '1.00' : '0.00';

  return (
    <div className="cm_main">
      {/* Header */}
      <div className="cm_header">
        <button className="cm_backBtn" onClick={() => navigate(-1)}>&#8592;</button>
        <h2 className="cm_title">Create Market</h2>
        <select
          value={chain}
          onChange={e => setChain(e.target.value)}
          style={{
            marginLeft: 'auto',
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 12,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="EVM">⬡ EVM (ARB)</option>
          <option value="SOL">◎ Solana</option>
        </select>
      </div>

      <div className="cm_form">
        {/* Question */}
        <div className="cm_field">
          <label className="cm_label">Question</label>
          <textarea
            className="cm_textarea"
            rows={3}
            maxLength={150}
            placeholder="Will Bitcoin reach $100k by end of 2025?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
          <span className={`cm_charCount${question.length > 130 ? ' warn' : ''}`}>
            {question.length}/150
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, display: 'block' }}>
            Must be a genuine question ending with "?" · Reviewed by admin before going live
          </span>
        </div>

        {/* Visibility */}
        <div className="cm_field">
          <label className="cm_label">Visibility</label>
          <div className="cm_toggleWrp">
            <button
              className={`cm_toggleBtn${!isPrivate ? ' active' : ''}`}
              onClick={() => setIsPrivate(false)}
            >
              🌐 Public
            </button>
            <button
              className={`cm_toggleBtn${isPrivate ? ' active' : ''}`}
              onClick={() => setIsPrivate(true)}
            >
              🔒 Private
            </button>
          </div>
          {isPrivate && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              An invite code will be generated. Share it with friends to join.
            </span>
          )}
        </div>

        {/* Outcomes */}
        <div className="cm_field">
          <label className="cm_label">Outcomes ({outcomes.length}/5)</label>
          <div className="cm_outcomesWrp">
            {outcomes.map((o, idx) => (
              <div key={idx} className="cm_outcomeRow">
                <input
                  className="cm_outcomeInput"
                  placeholder={idx < 2 ? `Outcome ${idx + 1} (fixed)` : `Outcome ${idx + 1}`}
                  value={o}
                  onChange={e => updateOutcome(idx, e.target.value)}
                />
                {idx >= 2 && (
                  <button className="cm_removeBtn" onClick={() => removeOutcome(idx)}>&#215;</button>
                )}
              </div>
            ))}
            {outcomes.length < 5 && (
              <button className="cm_addOutcomeBtn" onClick={addOutcome}>
                + Add Outcome
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="cm_field">
          <label className="cm_label">Tags (min 1)</label>
          <div className="cm_tagsWrp">
            {PREDEFINED_TAGS.map(tag => (
              <button
                key={tag}
                className={`cm_tagChip${tags.includes(tag) ? ' active' : ''}`}
                onClick={() => toggleTag(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Liquidity */}
        <div className="cm_field">
          <label className="cm_label">Liquidity</label>
          <div className="cm_liquidityRow">
            <div className="cm_liquidityInput">
              <label className="cm_subLabel">Initial Liquidity ({currency})</label>
              <input
                type="number"
                className="cm_numInput"
                min={1}
                placeholder="e.g. 100"
                value={initialLiquidity}
                onChange={e => setInitialLiquidity(e.target.value)}
              />
            </div>
            <div className="cm_liquidityNet">
              <label className="cm_subLabel">Liquidity going into market</label>
              <div className="cm_netValue">{netLiquidity} {currency}</div>
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
            {oracleType === 'uma' && <span>+ $1.00 UMA oracle fee</span>}
            <span style={{ color: 'rgba(255,255,255,0.75)', marginLeft: 'auto' }}>Total deducted: <strong>{totalCost} {currency}</strong></span>
          </div>
        </div>

        {/* Creator Initial Position */}
        {initialLiquidity && Number(initialLiquidity) >= 1 && (
          <div className="cm_field">
            <label className="cm_label">Your Initial Position</label>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
              Which outcome are you backing with your {Number(initialLiquidity).toFixed(2)} {currency}?
            </p>
            <div className="cm_outcomesWrp">
              {outcomes.map((o, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`cm_toggleBtn${creatorOutcomeIndex === idx ? ' active' : ''}`}
                  style={{ marginBottom: 6, textAlign: 'left' }}
                  onClick={() => setCreatorOutcomeIndex(idx)}
                >
                  {o || `Outcome ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Probabilities */}
        <div className="cm_field">
          <label className="cm_label">Initial Probabilities</label>
          <div className="cm_probBar">
            {outcomes.map((o, idx) => (
              <div
                key={idx}
                className="cm_probSegment"
                style={{ width: `${probabilities[idx] || 0}%` }}
                title={`${o || `Outcome ${idx + 1}`}: ${probabilities[idx]}%`}
              />
            ))}
          </div>
          <div className="cm_probList">
            {outcomes.map((o, idx) => (
              <div key={idx} className="cm_probRow">
                <span className="cm_probLabel">{o || `Outcome ${idx + 1}`}</span>
                <div className="cm_probInputWrp">
                  <input
                    type="number"
                    className="cm_probInput"
                    min={1}
                    max={99}
                    value={rawInputs[idx] ?? ''}
                    onChange={e => handleProbInput(idx, e.target.value)}
                    onBlur={() => commitProbability(idx)}
                  />
                  <span className="cm_probPct">%</span>
                </div>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            Total: {probabilities.reduce((a, b) => a + b, 0)}% (auto-balanced)
          </span>
        </div>

        {/* Start Date & Time */}
        <div className="cm_field">
          <label className="cm_label">Start Date & Time</label>
          <input
            type="datetime-local"
            className="cm_dateInput"
            min={minStart}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {/* Resolution Date & Time */}
        <div className="cm_field">
          <label className="cm_label">Resolution Date & Time</label>
          <input
            type="datetime-local"
            className="cm_dateInput"
            min={minEnd}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        {/* Oracle Type */}
        <div className="cm_field">
          <label className="cm_label">Resolution Method</label>
          <div className="cm_oracleWrp">
            <div
              className={`cm_oracleCard${oracleType === 'manual' ? ' active' : ''}`}
              onClick={() => setOracleType('manual')}
            >
              <div className="cm_oracleIcon"><LuUser size={24} /></div>
              <div className="cm_oracleName">Manual</div>
              <div className="cm_oracleDesc">Admin resolves</div>
            </div>
            <div
              className={`cm_oracleCard${oracleType === 'uma' ? ' active' : ''}`}
              onClick={() => setOracleType('uma')}
            >
              <div className="cm_oracleIcon"><LuShieldCheck size={24} /></div>
              <div className="cm_oracleName">UMA Oracle</div>
              <div className="cm_oracleDesc">On-chain verify</div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          className="cm_submitBtn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Deploying...' : 'Create Market'}
        </button>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div className="cm_modalOverlay">
          <div className="cm_modal">
            <div className="cm_modalIcon">🎉</div>
            <h3 className="cm_modalTitle">Market Live!</h3>
            <p className="cm_modalSub">
              {successModal.isPrivate
                ? 'Your market is deployed on-chain. Share this invite code with friends to join.'
                : 'Your market is deployed on-chain and is now live.'}
            </p>
            {successModal.marketAddress && (() => {
              const addr = successModal.marketAddress;
              const short = addr.length > 16 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
              const explorerUrl = successModal.chain === 'SOL'
                ? `https://solscan.io/account/${addr}`
                : `https://arbiscan.io/address/${addr}`;
              return (
                <div className="cm_codeBox" style={{ marginBottom: 8 }}>
                  <div className="cm_codeLabel">Contract Address</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cm_code"
                      style={{ fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {short}
                    </a>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14 }}
                      title="Copy address"
                      onClick={() => navigator.clipboard.writeText(addr)}
                    >
                      📋
                    </button>
                  </div>
                </div>
              );
            })()}
            {successModal.isPrivate && (
              <>
                <div className="cm_codeBox">
                  <div className="cm_codeLabel">Invite Code</div>
                  <div className="cm_code">{successModal.inviteCode}</div>
                </div>
                <button className="cm_copyBtn" onClick={copyInviteCode}>
                  📋 Copy Invite Link
                </button>
              </>
            )}
            <button
              className="cm_modalCloseBtn"
              onClick={() => {
                setSuccessModal(null);
                navigate('/markets');
              }}
            >
              Go to Markets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMarket;
