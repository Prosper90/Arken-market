import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import User from "./pages/Usermanagemnet";
import ForgotPassword from "./pages/ForgotPassword";
import TFA from "./pages/Tfa";
import ReferralRewardmanagment from "./pages/ReferralRewardmanagment";
import PolymarketDatas from "./pages/NewPages/PolymarketDatas";
import Resolution from "./pages/NewPages/Resolution";
import UsersStake from "./pages/NewPages/UsersStake";
import Settings from "./pages/NewPages/Settings";
import WithdrawNew from "./pages/NewPages/WithdrawNew";
import DepositNew from "./pages/NewPages/DepositNew";
import MarketCreaction from "./pages/NewPages/MarketCreaction";
import EventCreaction from "./pages/NewPages/EventCreation";
import AIResolutions from "./pages/NewPages/AIResolutions";
import UMAResolutions from "./pages/NewPages/UMAResolutions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./newPage.css";
import { removeAuthToken } from "../src/core/lib/localStorage";

function App() {
  function RequireAuth({ children }) {
    var data = sessionStorage.getItem("Voltrix_token");
    return data ? children : removeAuthToken();
  }

  return (
    <>
      <BrowserRouter basename="/">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/verify-2fa" element={<TFA />} />

          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/usermanagement" element={<RequireAuth><User /></RequireAuth>} />
          <Route path="/bets-settings" element={<RequireAuth><ReferralRewardmanagment /></RequireAuth>} />
          <Route path="/deposit" element={<RequireAuth><DepositNew /></RequireAuth>} />
          <Route path="/withdraw" element={<RequireAuth><WithdrawNew /></RequireAuth>} />
          <Route path="/marketCreaction" element={<RequireAuth><MarketCreaction /></RequireAuth>} />
          <Route path="/polymarket-datas" element={<RequireAuth><PolymarketDatas /></RequireAuth>} />
          <Route path="/eventCreaction" element={<RequireAuth><EventCreaction /></RequireAuth>} />
          <Route path="/resolution" element={<RequireAuth><Resolution /></RequireAuth>} />
          <Route path="/aiResolutions" element={<RequireAuth><AIResolutions /></RequireAuth>} />
          <Route path="/umaResolutions" element={<RequireAuth><UMAResolutions /></RequireAuth>} />
          <Route path="/usersStake" element={<RequireAuth><UsersStake /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
