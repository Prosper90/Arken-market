import React, { useState, useEffect } from 'react';
import { LuBot, LuUser } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postMethod } from '../../core/sevice/common.api';
import apiService from '../../core/sevice/detail';
import { useTelegramUser } from '../../context/TelegramUserContext';
import './CreateMarket.css';

const PREDEFINED_TAGS = ['Crypto', 'Politics', 'Sports', 'Finance', 'Science', 'Culture', 'Geopolitics', 'Other'];

const equalSplit = (n) => {
  const base = Math.floor(100 / n);
  const rem = 100 - base * n;
  return Array.from({ length: n }, (_, i) => (i === 0 ? base + rem : base));
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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [oracleType, setOracleType] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  // New fields
  const [tags, setTags] = useState([]);
  const [initialLiquidity, setInitialLiquidity] = useState('');
  const [probabilities, setProbabilities] = useState([50, 50]);
  const [rawInputs, setRawInputs] = useState(['50', '50']);

  // Keep probabilities in sync when outcomes count changes
  useEffect(() => {
    const equal = equalSplit(outcomes.length);
    setProbabilities(equal);
    setRawInputs(equal.map(String));
  }, [outcomes.length]);

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

    // Distribute remainder across the other slots proportionally
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

    // Compute redistribution inline so rawInputs stays in sync with probabilities
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
    const cleanOutcomes = outcomes.map(o => o.trim()).filter(Boolean);
    if (cleanOutcomes.length < 2) {
      toast.error('Provide at least 2 outcomes');
      return;
    }
    if (!endDate || new Date(endDate) <= new Date()) {
      toast.error('End date must be in the future');
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
      toast.error('Initial liquidity must be at least 1 USDC');
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
          probabilities,
        },
      });

      if (resp && resp.success) {
        if (isPrivate && resp.inviteCode) {
          setSuccessModal({ inviteCode: resp.inviteCode, inviteLink: resp.inviteLink });
        } else {
          toast.success('Market submitted for review!');
          navigate('/markets');
        }
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

  const todayMin = new Date();
  todayMin.setDate(todayMin.getDate() + 1);
  const minDate = todayMin.toISOString().split('T')[0];

  const netLiquidity = initialLiquidity ? Number(initialLiquidity).toFixed(2) : '0.00';
  const totalCost = initialLiquidity ? (Number(initialLiquidity) + 1).toFixed(2) : '1.00';

  return (
    <div className="cm_main">
      {/* Header */}
      <div className="cm_header">
        <button className="cm_backBtn" onClick={() => navigate(-1)}>&#8592;</button>
        <h2 className="cm_title">Create Market</h2>
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
              <label className="cm_subLabel">Initial Liquidity (USDC)</label>
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
              <div className="cm_netValue">{netLiquidity} USDC</div>
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
            <span>+ $1.00 oracle fee</span>
            <span style={{ color: 'rgba(255,255,255,0.75)' }}>Total deducted: <strong>{totalCost} USDC</strong></span>
          </div>
        </div>

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

        {/* Start Date */}
        <div className="cm_field">
          <label className="cm_label">Start Date</label>
          <input
            type="date"
            className="cm_dateInput"
            min={new Date().toISOString().split('T')[0]}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="cm_field">
          <label className="cm_label">Resolution Date</label>
          <input
            type="date"
            className="cm_dateInput"
            min={minDate}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        {/* Oracle Type */}
        <div className="cm_field">
          <label className="cm_label">Resolution Method</label>
          <div className="cm_oracleWrp">
            <div
              className={`cm_oracleCard${oracleType === 'ai' ? ' active' : ''}`}
              onClick={() => setOracleType('ai')}
            >
              <div className="cm_oracleIcon"><LuBot size={24} /></div>
              <div className="cm_oracleName">AI Oracle</div>
              <div className="cm_oracleDesc">Auto-resolve</div>
            </div>
            <div
              className={`cm_oracleCard${oracleType === 'manual' ? ' active' : ''}`}
              onClick={() => setOracleType('manual')}
            >
              <div className="cm_oracleIcon"><LuUser size={24} /></div>
              <div className="cm_oracleName">Manual</div>
              <div className="cm_oracleDesc">Admin resolves</div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          className="cm_submitBtn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Create Market'}
        </button>
      </div>

      {/* Success Modal for private market */}
      {successModal && (
        <div className="cm_modalOverlay">
          <div className="cm_modal">
            <div className="cm_modalIcon">🎉</div>
            <h3 className="cm_modalTitle">Market Created!</h3>
            <p className="cm_modalSub">
              Share this invite code with friends so they can join your private market.
            </p>
            <div className="cm_codeBox">
              <div className="cm_codeLabel">Invite Code</div>
              <div className="cm_code">{successModal.inviteCode}</div>
            </div>
            <button className="cm_copyBtn" onClick={copyInviteCode}>
              📋 Copy Invite Link
            </button>
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
