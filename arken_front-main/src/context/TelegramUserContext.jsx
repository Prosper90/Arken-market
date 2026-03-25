import React, { createContext, useContext, useState } from "react";

const TelegramUserContext = createContext(null);

export const TelegramUserProvider = ({ children }) => {
  const [telegramUser, setTelegramUser] = useState(() => {
    try {
      const stored = localStorage.getItem("telegramUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAndPersistTelegramUser = (user) => {
    setTelegramUser(user);
    if (user) {
      localStorage.setItem("telegramUser", JSON.stringify(user));
    }
  };

  return (
    <TelegramUserContext.Provider value={{ telegramUser, setTelegramUser: setAndPersistTelegramUser }}>
      {children}
    </TelegramUserContext.Provider>
  );
};

export const useTelegramUser = () => {
  return useContext(TelegramUserContext);
};
