import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Sidebar_2 from "../Nav_bar";
import Moment from "moment";
import { toast } from "react-toastify";
import { postMethod } from "../../core/service/common.api";
import apiService from "../../core/service/detail";

const IS_TESTNET = (process.env.REACT_APP_ARB_RPC_URL || "").includes("sepolia") ||
  (process.env.REACT_APP_ENV || "") === "testnet";
const ARBISCAN_BASE = IS_TESTNET ? "https://sepolia.arbiscan.io" : "https://arbiscan.io";

const truncate = (str, start = 6, end = 4) =>
  str ? `${str.slice(0, start)}…${str.slice(-end)}` : "—";

const UMAResolutions = () => {
  const [markets, setMarkets] = useState([]);
  const [loader, setLoader] = useState(false);
  const [actionLoader, setActionLoader] = useState(false);
  const [assertionModal, setAssertionModal] = useState(null);
  const [proposedOutcome, setProposedOutcome] = useState("");
  // { marketId, assertionId, txHash, arbiscanLink, challengeEnd }
  const [assertionResult, setAssertionResult] = useState(null);

  const fetchUMAMarkets = async () => {
    setLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_list,
        payload: { page: 1, limit: 50 },
      });
      if (resp.status && resp.data) {
        setMarkets(resp.data.filter((m) => m.oracleType === "uma"));
      } else {
        setMarkets([]);
      }
    } catch (e) {
      toast.error("Failed to load UMA markets");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchUMAMarkets();
  }, []);

  const handleSubmitAssertion = async () => {
    if (!proposedOutcome) { toast.error("Select a proposed outcome"); return; }
    setActionLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.submitUMAAssertion,
        payload: {
          marketId: assertionModal._id,
          proposedOutcome,
        },
      });
      if (resp.status || resp.success) {
        toast.success("Assertion submitted on-chain. 2-hour challenge period started.");
        setAssertionModal(null);
        setProposedOutcome("");
        setAssertionResult({
          marketId: assertionModal._id,
          assertionId: resp.assertionId,
          txHash: resp.txHash,
          arbiscanLink: resp.arbiscanLink,
          challengeEnd: resp.challengeEnd,
        });
        fetchUMAMarkets();
      } else {
        toast.error(resp.message || "Failed to submit assertion");
      }
    } catch (e) {
      toast.error("Error submitting assertion");
    } finally {
      setActionLoader(false);
    }
  };

  const handleMarkDisputed = async (market) => {
    setActionLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_update,
        payload: { id: market._id, umaStatus: "disputed" },
      });
      if (resp.status) {
        toast.success("Market flagged for manual review");
        fetchUMAMarkets();
      } else {
        toast.error(resp.message || "Failed to mark disputed");
      }
    } catch (e) {
      toast.error("Error marking as disputed");
    } finally {
      setActionLoader(false);
    }
  };

  const isChallengeExpired = (market) => {
    if (!market.umaChallengePeriodEnd) return false;
    return new Date() > new Date(market.umaChallengePeriodEnd);
  };

  const umaStatusBadge = (status) => {
    const map = {
      none:       { cls: "badge_grey",   label: "None" },
      submitted:  { cls: "badge_yellow", label: "Submitted" },
      challenged: { cls: "badge_red",    label: "Challenged" },
      accepted:   { cls: "badge_green",  label: "Accepted" },
      disputed:   { cls: "badge_purple", label: "Disputed" },
    };
    const s = map[status] || map.none;
    return <span className={`badge_status ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-xl-2 col-lg-3 d-none d-lg-block px-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <>
          <div className="col-xl-10 col-lg-9 col-12 px-0">
            <div className="pos_sticky">
              <Sidebar_2 />
            </div>

            <div className="px-4 transaction_padding_top">
              <div className="px-2 my-4 transaction_padding_top tops">

                {/* Page header */}
                <div className="headerss">
                  <span className="dash-head">⛓️ UMA Resolutions</span>
                  <div className="usr_mng_rgt">
                    <button
                      className="btn_add"
                      onClick={fetchUMAMarkets}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span>Refresh</span>
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>
                  </div>
                </div>

                {/* Info banner — how UMA works (no warning about pending integration) */}
                <div
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#fbbf24",
                  }}
                >
                  <strong>How UMA works:</strong> A decentralised dispute system — you submit a proposed
                  outcome with a USDC bond. If nobody challenges it within <strong>2 hours</strong>, the
                  cron auto-settles it on-chain and resolves the market. If challenged, DeFi token-holders
                  vote to settle — winner keeps both bonds.{" "}
                  <strong>Submit Assertion</strong> sends a real transaction to Arbitrum.
                  The settlement cron runs every 15 minutes.
                </div>

                {/* Last assertion result banner */}
                {assertionResult && (
                  <div
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      marginBottom: 20,
                      fontSize: 13,
                      color: "#86efac",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <span>
                      ✅ Assertion submitted —{" "}
                      <strong>ID:</strong> {truncate(assertionResult.assertionId, 10, 6)}{" "}
                      {assertionResult.arbiscanLink && (
                        <a
                          href={assertionResult.arbiscanLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#4ade80", textDecoration: "underline" }}
                        >
                          View on Arbiscan ↗
                        </a>
                      )}
                    </span>
                    <button
                      style={{ background: "transparent", border: "none", color: "#86efac", cursor: "pointer", fontSize: 16 }}
                      onClick={() => setAssertionResult(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Table */}
                <div className="my-4 trans-table">
                  <div className="table-responsive">
                    {loader ? (
                      <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
                        Loading UMA markets...
                      </div>
                    ) : (
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Question</th>
                            <th>Proposed Outcome</th>
                            <th>Assertion ID</th>
                            <th>UMA Status</th>
                            <th>Challenge Ends</th>
                            <th>Market End</th>
                            <th>Market Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {markets.length > 0 ? (
                            markets.map((m, i) => (
                              <tr key={m._id}>
                                <td>
                                  <span className="plus_14_ff">{i + 1}</span>
                                </td>
                                <td style={{ maxWidth: 260 }}>
                                  <span className="plus_14_ff" style={{ whiteSpace: "normal" }}>
                                    {m.question}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff" style={{ fontWeight: 700 }}>
                                    {m.umaVerdict || "—"}
                                  </span>
                                </td>
                                <td>
                                  {m.umaAssertionId ? (
                                    <a
                                      href={`${ARBISCAN_BASE}/tx/${m.umaSettledTxHash || ""}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#a78bfa", fontSize: 12 }}
                                      title={m.umaAssertionId}
                                    >
                                      {truncate(m.umaAssertionId)}
                                    </a>
                                  ) : (
                                    <span className="plus_14_ff" style={{ color: "#666" }}>—</span>
                                  )}
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {umaStatusBadge(m.umaStatus || "none")}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {m.umaChallengePeriodEnd
                                      ? Moment(m.umaChallengePeriodEnd).format("DD MMM, HH:mm")
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {m.endDate
                                      ? Moment(m.endDate).format("DD MMM YYYY")
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="plus_14_ff"
                                    style={{
                                      color: m.marketStatus === "resolved" ? "#22c55e" : "#f59e0b",
                                    }}
                                  >
                                    {m.marketStatus || "active"}
                                  </span>
                                </td>
                                <td className="cmmn_action_btn">
                                  {/* Submit Assertion — calls real OOv3 on-chain */}
                                  {(!m.umaStatus || m.umaStatus === "none") && (
                                    <button
                                      className="btn btn-sm btn-primary me-2"
                                      disabled={actionLoader}
                                      onClick={() => { setAssertionModal(m); setProposedOutcome(""); }}
                                      title="Submit proposed outcome on-chain and start 2h challenge period"
                                    >
                                      📤 Submit Assertion
                                    </button>
                                  )}

                                  {/* Challenge period still active — cron will settle automatically */}
                                  {m.umaStatus === "submitted" && !isChallengeExpired(m) && (
                                    <span className="plus_14_ff" style={{ color: "#f59e0b", fontSize: 12 }}>
                                      ⏳ Challenge period active
                                      <br />
                                      <span style={{ fontSize: 11, color: "#888" }}>
                                        Cron settles automatically
                                      </span>
                                    </span>
                                  )}

                                  {/* Challenge expired — cron hasn't run yet, allow manual dispute flag */}
                                  {m.umaStatus === "submitted" && isChallengeExpired(m) && (
                                    <>
                                      <span className="plus_14_ff" style={{ color: "#22c55e", fontSize: 12 }}>
                                        ⌛ Awaiting cron settlement
                                      </span>
                                      <button
                                        className="btn btn-sm btn-danger ms-2"
                                        disabled={actionLoader}
                                        onClick={() => handleMarkDisputed(m)}
                                        title="Mark as disputed for manual review"
                                      >
                                        🚫 Dispute
                                      </button>
                                    </>
                                  )}

                                  {m.umaStatus === "accepted" && (
                                    <span className="plus_14_ff" style={{ color: "#22c55e" }}>
                                      ✅ Resolved
                                      {m.umaSettledTxHash && (
                                        <>
                                          {" "}—{" "}
                                          <a
                                            href={`${ARBISCAN_BASE}/tx/${m.umaSettledTxHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "#4ade80", fontSize: 11 }}
                                          >
                                            Settlement tx ↗
                                          </a>
                                        </>
                                      )}
                                    </span>
                                  )}

                                  {m.umaStatus === "disputed" && (
                                    <span className="plus_14_ff" style={{ color: "#a855f7" }}>
                                      Under Review
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9}>
                                <div className="empty_data my-4">
                                  <span className="plus_14_ff">No UMA markets found</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      </div>

      {/* Submit Assertion Modal */}
      {assertionModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.box}>
            <div style={modalStyles.header}>
              <h5 style={{ margin: 0 }}>📤 Submit On-Chain Assertion</h5>
              <button style={modalStyles.closeBtn} onClick={() => setAssertionModal(null)}>✕</button>
            </div>

            <p style={modalStyles.question}>{assertionModal.question}</p>

            <p style={{ fontSize: 13, color: "#ccc", marginBottom: 10 }}>
              Select the proposed outcome. This will send a <strong>real transaction</strong> to Arbitrum,
              locking a USDC bond. A <strong>{Number(process.env.REACT_APP_UMA_LIVENESS_PERIOD || 7200) / 60}-minute
              challenge period</strong> starts immediately.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {(assertionModal.outcomes || []).map((o) => (
                <label
                  key={o}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${proposedOutcome === o ? "#f59e0b" : "rgba(255,255,255,0.1)"}`,
                    background: proposedOutcome === o ? "rgba(245,158,11,0.10)" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    value={o}
                    checked={proposedOutcome === o}
                    onChange={() => setProposedOutcome(o)}
                    style={{ accentColor: "#f59e0b" }}
                  />
                  <span style={{ color: "#fff", fontSize: 14 }}>{o}</span>
                </label>
              ))}
            </div>

            <div
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 16,
                fontSize: 12,
                color: "#fbbf24",
              }}
            >
              ⚠️ This submits a real on-chain assertion. The backend wallet will sign and broadcast
              the transaction on Arbitrum. After the challenge window expires, the 15-minute cron
              will call <code>settleAssertion()</code> automatically.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-warning"
                style={{ flex: 1 }}
                disabled={actionLoader || !proposedOutcome}
                onClick={handleSubmitAssertion}
              >
                {actionLoader ? "Submitting tx..." : "Submit On-Chain & Start Timer"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setAssertionModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  box: {
    background: "#1a1a2e",
    borderRadius: 16,
    padding: 28,
    width: 520,
    maxWidth: "90vw",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: "pointer",
    fontSize: 16,
  },
  question: {
    fontSize: 14,
    color: "#e2e8f0",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
    lineHeight: 1.5,
  },
};

export default UMAResolutions;
