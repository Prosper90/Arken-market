import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Currency from "./pages/Currencymanagement";
import Wallet from "./pages/Walletmanagement";
import AdminWallet from "./pages/AdminWallet";
import WalletTransaction from "./pages/WalletTransaction";
import User from "./pages/Usermanagemnet";
import KYC from "./pages/Kycmanagement";
import Faq from "./pages/faq";
import Deposit from "./pages/Depositmanagement";
import Withdraw from "./pages/Withdrawmanagement";
import Partnerlist from "./pages/PartnerSubmissions";
import CMS from "./pages/CMSmanagement";
import Email from "./pages/Emailmanagement";
import Researchadd from "./pages/Researchadd";
import Profit from "./pages/Profitmanagement";
import ReferralRewardmanagment from "./pages/ReferralRewardmanagment";
import Fiatdepositmanagment from "./pages/Fiatdepositmanagment";
import Profile from "./pages/Profile";
import SiteSettings from "./pages/Sitesettings";
import PolymarketDatas from "./pages/NewPages/PolymarketDatas";
import Fiatdeposit from "./pages/Fiatdeposit";
import Tradepair from "./pages/tradepair";
import Profits from "./pages/profits";
import DepositfiatHistory from "./pages/DepositfiatHistory";
import SupportCategory from "./pages/SupportCategory";
import Support from "./pages/Support";
import EmailTemplate from "./pages/Emailmanagement";
import RewardManagement from "./pages/RewardManagement";
import ReferralManagement from "./pages/ReferralManagement";
import UserTrade from "./pages/UserTrade";
import Swaping from "./pages/Swaping";
import CmsManagement from "./pages/CMSmanagement";
import ForgotPassword from "./pages/ForgotPassword";
import AirdropManagement from "./pages/AirdropManagement";
import InternalTransfer from "./pages/InternalTransfer";
import Launchpad from "./pages/launchpad";
import Stakemanage from "./pages/stakeManagement";
import Fiatwithdraw from "./pages/Fiatwithdraw";
import TFA from "./pages/Tfa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { removeAuthToken } from "../src/core/lib/localStorage";
import Userstakehistory from "./pages/userStatkeHistory";
import UserdepositList from "./pages/userdepositList";
import StakeSetting from "./pages/stakeSettings";
import P2Porders from "./pages/P2Porders";
import P2Pdispute from "./pages/P2Pdispute";
import Subadminmanagement from "./pages/subadminmanagement";
import Notes from "./pages/notes";
import HighRiskWalletAdmin from "./pages/HighRiskWalletAdmin";
import SkeletonDashboard from "./pages/SkeletonDashboard";
import FiatWithdrawmanagement from "./pages/fiatWithdrawmanagement"
import Resolution from "./pages/NewPages/Resolution";
import UsersStake from "./pages/NewPages/UsersStake";
import Settings from "./pages/NewPages/Settings";
import "./newPage.css";
import WithdrawNew from "./pages/NewPages/WithdrawNew";
import DepositNew from "./pages/NewPages/DepositNew";
import MarketCreaction from "./pages/NewPages/MarketCreaction";
import EventCreaction from "./pages/NewPages/EventCreation";
import AIResolutions from "./pages/NewPages/AIResolutions";
import UMAResolutions from "./pages/NewPages/UMAResolutions";

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
          <Route path="/skeleton" element={<SkeletonDashboard />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/currencymanagement"
            element={
              <RequireAuth>
                <Currency />
              </RequireAuth>
            }
          />
          <Route
            path="/launchpadmanagement"
            element={
              <RequireAuth>
                <Launchpad />
              </RequireAuth>
            }
          />
          <Route
            path="/fiatWithdrawmanagement"
            element={
              <RequireAuth>
                <FiatWithdrawmanagement/>
              </RequireAuth>
            }
          />
          
          <Route
            path="/notes"
            element={
              <RequireAuth>
                <Notes />
              </RequireAuth>
            }
          />

          <Route
            path="/StakeSetting"
            element={
              <RequireAuth>
                <StakeSetting />
              </RequireAuth>
            }
          />
          <Route
            path="/fiatdepositmanagment"
            element={
              <RequireAuth>
                <Fiatdepositmanagment />
              </RequireAuth>
            }
          />
          <Route
            path="/P2Porders"
            element={
              <RequireAuth>
                <P2Porders />
              </RequireAuth>
            }
          />
          <Route
            path="/P2Pdispute"
            element={
              <RequireAuth>
                <P2Pdispute />
              </RequireAuth>
            }
          />
          <Route
            path="/stakeManagement"
            element={
              <RequireAuth>
                <Stakemanage />
              </RequireAuth>
            }
          />
          <Route
            path="/userstakeHistory"
            element={
              <RequireAuth>
                <Userstakehistory />
              </RequireAuth>
            }
          />

          <Route
            path="/walletmanagement"
            element={
              <RequireAuth>
                <Wallet />
              </RequireAuth>
            }
          />
          <Route
            path="/adminwallet"
            element={
              <RequireAuth>
                <AdminWallet />
              </RequireAuth>
            }
          />
          <Route
            path="/bets-settings"
            element={
              <RequireAuth>
                <ReferralRewardmanagment />
              </RequireAuth>
            }
          />
          <Route
            path="/adminwallettransaction"
            element={
              <RequireAuth>
                <WalletTransaction />
              </RequireAuth>
            }
          />
          <Route
            path="/usermanagement"
            element={
              <RequireAuth>
                <User />
              </RequireAuth>
            }
          />
          <Route
            path="/kycmanagement"
            element={
              <RequireAuth>
                <KYC />
              </RequireAuth>
            }
          />
          <Route
            path="/depositmanagement"
            element={
              <RequireAuth>
                <Deposit />
              </RequireAuth>
            }
          />
          <Route
            path="/userdepositList"
            element={
              <RequireAuth>
                <UserdepositList />
              </RequireAuth>
            }
          />

          <Route
            path="/withdrawmanagement"
            element={
              <RequireAuth>
                <Withdraw />
              </RequireAuth>
            }
          />
          <Route
            path="/fiatwithdraw"
            element={
              <RequireAuth>
                <Fiatwithdraw />
              </RequireAuth>
            }
          />
          <Route
            path="/cmsmanagement"
            element={
              <RequireAuth>
                <CMS />
              </RequireAuth>
            }
          />
          <Route
            path="/emailmanagement"
            element={
              <RequireAuth>
                <Email />
              </RequireAuth>
            }
          />
          <Route
            path="/profitmanagement"
            element={
              <RequireAuth>
                <Profit />
              </RequireAuth>
            }
          />
          <Route
            path="/adminprofile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/sitesetting"
            element={
              <RequireAuth>
                <SiteSettings />
              </RequireAuth>
            }
          />
          <Route
            path="/fiatdeposit"
            element={
              <RequireAuth>
                <Fiatdeposit />
              </RequireAuth>
            }
          />
          <Route path="/verify-2fa" element={<TFA />} />
          <Route
            path="/tradepair"
            element={
              <RequireAuth>
                <Tradepair />
              </RequireAuth>
            }
          />
          <Route
            path="/profits"
            element={
              <RequireAuth>
                <Profits />
              </RequireAuth>
            }
          />
          <Route
            path="/supportcategory"
            element={
              <RequireAuth>
                <SupportCategory />
              </RequireAuth>
            }
          />
          <Route
            path="/support"
            element={
              <RequireAuth>
                <Support />
              </RequireAuth>
            }
          />
          <Route
            path="/emailtemplate"
            element={
              <RequireAuth>
                <EmailTemplate />
              </RequireAuth>
            }
          />
          <Route
            path="/cmsmanagement"
            element={
              <RequireAuth>
                <CmsManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/subadminmangement"
            element={
              <RequireAuth>
                <Subadminmanagement />
              </RequireAuth>
            }
          />

          <Route
            path="/rewardmanagement"
            element={
              <RequireAuth>
                <RewardManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/depositfiatHistory"
            element={
              <RequireAuth>
                <DepositfiatHistory />
              </RequireAuth>
            }
          />
          <Route
            path="/referralmanagement"
            element={
              <RequireAuth>
                <ReferralManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/partnerlist"
            element={
              <RequireAuth>
                <Partnerlist />
              </RequireAuth>
            }
          />
          <Route
            path="/add-research"
            element={
              <RequireAuth>
                <Researchadd />
              </RequireAuth>
            }
          />
          <Route
            path="/reportmanagment"
            element={
              <RequireAuth>
                <HighRiskWalletAdmin />
              </RequireAuth>
            }
          />
          <Route
            path="/airdropmanagement"
            element={
              <RequireAuth>
                <AirdropManagement />
              </RequireAuth>
            }
          />
          <Route
            path="/usertrade"
            element={
              <RequireAuth>
                <UserTrade />
              </RequireAuth>
            }
          />
          <Route
            path="/faq"
            element={
              <RequireAuth>
                <Faq />
              </RequireAuth>
            }
          />

          <Route
            path="/swaping"
            element={
              <RequireAuth>
                <Swaping />
              </RequireAuth>
            }
          />
          <Route
            path="/internaltransfer"
            element={
              <RequireAuth>
                <InternalTransfer />
              </RequireAuth>
            }
          />
          <Route
            path="/marketCreaction"
            element={
              <RequireAuth>
                <MarketCreaction />
              </RequireAuth>
            }
          />
          <Route
            path="/polymarket-datas"
            element={
              <RequireAuth>
                <PolymarketDatas />
              </RequireAuth>
            }
          />


           <Route
            path="/eventCreaction"
            element={
              <RequireAuth>
                <EventCreaction />
              </RequireAuth>
            }
          />


          <Route
            path="/resolution"
            element={
              <RequireAuth>
                <Resolution />
              </RequireAuth>
            }
          />
          <Route
            path="/usersStake"
            element={
              <RequireAuth>
                <UsersStake />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/deposit"
            element={
              <RequireAuth>
                <DepositNew />
              </RequireAuth>
            }
          />
          <Route
            path="/withdraw"
            element={
              <RequireAuth>
                <WithdrawNew />
              </RequireAuth>
            }
          />
          <Route
            path="/aiResolutions"
            element={
              <RequireAuth>
                <AIResolutions />
              </RequireAuth>
            }
          />
          <Route
            path="/umaResolutions"
            element={
              <RequireAuth>
                <UMAResolutions />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
