import React, { createContext, useContext, useState } from "react";

const TelegramUserContext = createContext(null);

export const TelegramUserProvider = ({ children }) => {
  const [telegramUser, setTelegramUser] = useState(null);

  return (
    <TelegramUserContext.Provider value={{ telegramUser, setTelegramUser }}>
      {children}
    </TelegramUserContext.Provider>
  );
};

export const useTelegramUser = () => {
  return useContext(TelegramUserContext);
};
