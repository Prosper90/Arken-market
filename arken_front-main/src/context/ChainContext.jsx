import React, { createContext, useContext, useState } from "react";

const ChainContext = createContext(null);

export const ChainProvider = ({ children }) => {
  const [activeChain, setActiveChain] = useState(() => {
    return localStorage.getItem("activeChain") || "ARB";
  });

  const switchChain = (chain) => {
    setActiveChain(chain);
    localStorage.setItem("activeChain", chain);
  };

  return (
    <ChainContext.Provider value={{ activeChain, switchChain }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChain = () => useContext(ChainContext);
