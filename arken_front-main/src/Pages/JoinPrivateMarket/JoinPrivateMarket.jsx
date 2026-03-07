import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { postMethod } from "../../core/sevice/common.api";
import apiService from "../../core/sevice/v1/index";

const JoinPrivateMarket = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const market = state?.market;
  const telegramId = state?.telegramId;

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!market) {
    navigate("/markets");
    return null;
  }

  const outcomes = market.outcomes || [];
  const chancePercents = market.chancePercents || [];

  const handleConfirm = async () => {
    if (selectedIndex === null) { toast.error("Pick an outcome first"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid stake amount"); return; }

    setLoading(true);
    try {
      const resp = await postMethod({
        apiUrl: apiService.confirmJoinPrivateMarket,
        payload: {
          telegramId,
          marketId: market._id,
          outcomeIndex: selectedIndex,
          outcomeLabel: outcomes[selectedIndex],
          amount: amt,
        },
      });

      if (resp?.success) {
        toast.success("You've joined the market!");
        navigate("/markets");
      } else {
        toast.error(resp?.message || "Failed to join");
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmmn_bdy_mainwrp" style={{ padding: "20px", maxWidth: "480px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/markets")}
        style={{ background: "none", border: "none", color: "#a855f7", fontSize: "14px", cursor: "pointer", marginBottom: "16px" }}
      >
        ← Back
      </button>

      <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
        Join Private Market
      </h2>

      <div style={{ background: "#1a1a2e", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
        <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.5" }}>{market.question}</p>
        {market.endDate && (
          <p style={{ color: "#888", fontSize: "12px", marginTop: "8px" }}>
            Ends: {new Date(market.endDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <p style={{ color: "#a855f7", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
        Pick your outcome to place your stake:
      </p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {outcomes.map((label, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "14px 10px",
              borderRadius: "10px",
              border: selectedIndex === i ? "2px solid #a855f7" : "2px solid #333",
              background: selectedIndex === i ? "rgba(168,85,247,0.15)" : "#1a1a2e",
              color: selectedIndex === i ? "#a855f7" : "#ccc",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {label}
            {chancePercents[i] !== undefined && (
              <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                {chancePercents[i]}%
              </div>
            )}
          </button>
        ))}
      </div>

      <p style={{ color: "#ccc", fontSize: "13px", marginBottom: "8px" }}>Stake amount (USDC)</p>
      <input
        type="number"
        min="1"
        placeholder="e.g. 10"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: "10px",
          border: "1px solid #333",
          background: "#1a1a2e",
          color: "#fff",
          fontSize: "15px",
          marginBottom: "24px",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "12px",
          border: "none",
          background: loading ? "#555" : "linear-gradient(135deg, #7c3aed, #a855f7)",
          color: "#fff",
          fontWeight: "700",
          fontSize: "15px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Joining..." : "Confirm & Join"}
      </button>

      <p style={{ color: "#666", fontSize: "11px", textAlign: "center", marginTop: "12px" }}>
        A platform fee applies. If you leave this page without confirming, you won't be added to the market.
      </p>
    </div>
  );
};

export default JoinPrivateMarket;
