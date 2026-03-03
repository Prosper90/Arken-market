import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Sidebar_2 from "../Nav_bar";
import Moment from "moment";
import { toast } from "react-toastify";
import { postMethod } from "../../core/service/common.api";
import apiService from "../../core/service/detail";

const AIResolutions = () => {
  const [markets, setMarkets] = useState([]);
  const [loader, setLoader] = useState(false);
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideOutcome, setOverrideOutcome] = useState("");
  const [actionLoader, setActionLoader] = useState(false);

  const fetchAIMarkets = async () => {
    setLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_list,
        payload: { page: 1, limit: 100 },
      });
      if (resp.status && resp.data) {
        setMarkets(
          resp.data.filter((m) => m.oracleType === "ai")
        );
      } else {
        setMarkets([]);
      }
    } catch (e) {
      toast.error("Failed to load AI markets");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchAIMarkets();
  }, []);

  const handleConfirm = async (market) => {
    setActionLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_update,
        payload: { id: market._id, marketStatus: "resolved", active: false, closed: true },
      });
      if (resp.status) {
        toast.success("Market confirmed and resolved");
        fetchAIMarkets();
      } else {
        toast.error(resp.message || "Failed to confirm");
      }
    } catch (e) {
      toast.error("Error confirming market");
    } finally {
      setActionLoader(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideOutcome) { toast.error("Select an outcome"); return; }
    setActionLoader(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.market_update,
        payload: {
          id: overrideModal._id,
          "aiResolution.verdict": overrideOutcome,
          "ethosValidation.status": "overridden",
          "ethosValidation.overriddenTo": overrideOutcome,
          "ethosValidation.resolvedAt": new Date(),
          marketStatus: "resolved",
          active: false,
          closed: true,
        },
      });
      if (resp.status) {
        toast.success("Verdict overridden");
        setOverrideModal(null);
        setOverrideOutcome("");
        fetchAIMarkets();
      } else {
        toast.error(resp.message || "Failed to override");
      }
    } catch (e) {
      toast.error("Error overriding verdict");
    } finally {
      setActionLoader(false);
    }
  };

  const disputeBadge = (status) => {
    if (status === "disputed")
      return <span className="badge_status badge_red">Disputed</span>;
    if (status === "validated")
      return <span className="badge_status badge_green">Validated</span>;
    return <span className="badge_status badge_grey">None</span>;
  };

  const verdictBadge = (verdict) => {
    if (!verdict) return <span className="badge_status badge_grey">Pending</span>;
    return <span className="badge_status badge_blue">{verdict}</span>;
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
                  <span className="dash-head">🤖 AI Resolutions</span>
                  <div className="usr_mng_rgt">
                    <button
                      className="btn_add"
                      onClick={fetchAIMarkets}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span>Refresh</span>
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>
                  </div>
                </div>

                {/* Info banner */}
                <div
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#a5b4fc",
                  }}
                >
                  <strong>How it works:</strong> When a market's end date passes, the AI cron calls{" "}
                  <strong>Delphi</strong> (fact fetch) → <strong>Lex</strong> (verdict) and stores the
                  result. A 24-hour dispute window opens. If nobody disputes, the market auto-resolves.
                  If disputed, <strong>Ethos</strong> (human validators) review it — you can override
                  the verdict here.
                </div>

                {/* Table */}
                <div className="my-4 trans-table">
                  <div className="table-responsive">
                    {loader ? (
                      <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
                        Loading AI markets...
                      </div>
                    ) : (
                      <table className="w_100">
                        <thead className="trans-head">
                          <tr>
                            <th>S.No</th>
                            <th>Question</th>
                            <th>Oracle</th>
                            <th>Lex Verdict</th>
                            <th>Confidence</th>
                            <th>Dispute</th>
                            <th>Dispute Deadline</th>
                            <th>Status</th>
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
                                  <span className="plus_14_ff">AI (Olympus)</span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {verdictBadge(m.aiResolution?.verdict)}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {m.aiResolution?.confidence != null
                                      ? `${Math.round(m.aiResolution.confidence * 100)}%`
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {disputeBadge(m.disputeStatus)}
                                  </span>
                                </td>
                                <td>
                                  <span className="plus_14_ff">
                                    {m.disputeDeadline
                                      ? Moment(m.disputeDeadline).format("DD MMM, HH:mm")
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="plus_14_ff"
                                    style={{ color: m.marketStatus === "resolved" ? "#22c55e" : "#f59e0b" }}
                                  >
                                    {m.marketStatus || "active"}
                                  </span>
                                </td>
                                <td className="cmmn_action_btn">
                                  {m.marketStatus !== "resolved" ? (
                                    <>
                                      <button
                                        className="btn btn-sm btn-success me-2"
                                        disabled={actionLoader}
                                        onClick={() => handleConfirm(m)}
                                        title="Accept Lex verdict and resolve"
                                      >
                                        ✅ Confirm
                                      </button>
                                      <button
                                        className="btn btn-sm btn-warning"
                                        onClick={() => { setOverrideModal(m); setOverrideOutcome(""); }}
                                        title="Override with correct outcome"
                                      >
                                        ✏️ Override
                                      </button>
                                    </>
                                  ) : (
                                    <span className="plus_14_ff" style={{ color: "#22c55e" }}>
                                      Resolved
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9}>
                                <div className="empty_data my-4">
                                  <span className="plus_14_ff">No AI markets found</span>
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

      {/* Override Modal */}
      {overrideModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.box}>
            <div style={modalStyles.header}>
              <h5 style={{ margin: 0 }}>✏️ Override Verdict</h5>
              <button style={modalStyles.closeBtn} onClick={() => setOverrideModal(null)}>✕</button>
            </div>

            <p style={modalStyles.question}>{overrideModal.question}</p>

            <div style={modalStyles.currentRow}>
              <span style={{ color: "#aaa", fontSize: 13 }}>Current Lex verdict:</span>
              <span style={{ color: "#a78bfa", fontWeight: 700, marginLeft: 8 }}>
                {overrideModal.aiResolution?.verdict || "None"}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "#ccc", marginBottom: 10 }}>
              Select the correct outcome:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {(overrideModal.outcomes || []).map((o) => (
                <label
                  key={o}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${overrideOutcome === o ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
                    background: overrideOutcome === o ? "rgba(124,58,237,0.12)" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    value={o}
                    checked={overrideOutcome === o}
                    onChange={() => setOverrideOutcome(o)}
                    style={{ accentColor: "#7c3aed" }}
                  />
                  <span style={{ color: "#fff", fontSize: 14 }}>{o}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-warning"
                style={{ flex: 1 }}
                disabled={actionLoader || !overrideOutcome}
                onClick={handleOverride}
              >
                {actionLoader ? "Saving..." : "Save Override & Resolve"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setOverrideModal(null)}
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
    width: 480,
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
  currentRow: {
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
  },
};

export default AIResolutions;
