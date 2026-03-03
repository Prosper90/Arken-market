import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function TelegramRedirect() {
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    const startParam = tg.initDataUnsafe?.start_param;
    console.log("Telegram start_param:", startParam);

    if (!startParam) return;

    // Simple string routes — handle before trying base64 decode
    if (startParam === "wallet" || startParam === "deposit") {
      navigate("/Wallet", { replace: true });
      return;
    }

    // Base64-encoded JSON payload (market deep links)
    try {
      const decoded = JSON.parse(atob(startParam));
      const { marketId, token } = decoded;

      if (!marketId || !token) return;

      localStorage.setItem("user_token", token);
      sessionStorage.setItem("user_token", token);

      navigate(`/market-details/${marketId}?token=${token}`, {
        replace: true,
      });
    } catch (err) {
      console.error("Invalid Telegram startapp payload", err);
    }
  }, [navigate]);

  return null;
}

export default TelegramRedirect;
