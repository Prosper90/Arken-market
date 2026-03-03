import { useEffect } from "react";
import { socket } from "../socket";

export function useUserSocket(telegramId, onPnlUpdate) {
  useEffect(() => {
    if (!telegramId) return;

    console.log(" Emitting join_user:", telegramId);
    socket.emit("join_user", telegramId);

    socket.on("pnl_update", (data) => {
      console.log(" pnl_update received:", data);
       if (data.telegramId === telegramId) {
         onPnlUpdate(data);
  }
    });

    return () => {
      socket.off("pnl_update");
    };
  }, [telegramId]);
}
