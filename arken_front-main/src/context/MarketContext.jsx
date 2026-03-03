import React, { createContext, useState, useContext } from "react";

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [markets, setMarkets] = useState([]);

  return (
    <MarketContext.Provider value={{ markets, setMarkets }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarkets = () => useContext(MarketContext);
