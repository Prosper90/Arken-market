import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ScrollToTop from './Pages/ScrollToTop'
import GetStarted from './Pages/GetStarted/GetStarted'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Onboarding from './Pages/Onboarding/Onboarding'
import Home from './Pages/Home/Home'
import Profile from './Pages/Profile/Profile'
import  TelegramRedirect  from "./TelegramRedirect";
import KOLCalls from './Pages/KOLCalls/KOLCalls'
import Wallet from './Pages/Wallet/Wallet'
import { HashRouter } from "react-router-dom";
import Deposit from './Pages/Deposit/Deposit'
import {removeAuthToken} from './core/lib/localStorage'
import MarketDetails from './Pages/MarketDetails/MarketDetails'
import Walletconnect from './Pages/Walletconnect/Walletconnect'
import Walletconnectsol from './Pages/WalletconnectSol/Walletconnectsol'
import WalletSuccess from './Pages/success/WalletSuccess'
import PayRedirect from './Pages/PayRedirect/PayRedirect'
import Waletss from "./Pages/Onboarding/wallet"
import CreateMarket from './Pages/CreateMarket/CreateMarket'
import JoinPrivateMarket from './Pages/JoinPrivateMarket/JoinPrivateMarket'
import {MarketProvider} from './context/MarketContext'
import {TelegramUserProvider} from './context/TelegramUserContext'
import {ChainProvider} from './context/ChainContext'
import { Toaster } from "react-hot-toast";
import Redirect from './Pages/Onboarding/redirect'
function App() {
   const [count, setCount] = useState(0)
function RequireAuth({ children }) {
    var data = localStorage.getItem("walletAddress");
    return data ? children : removeAuthToken();
    }


  return (
    <>
     <TelegramUserProvider>
<ChainProvider>
<MarketProvider>
 
          <BrowserRouter>
      <ScrollToTop />
       <TelegramRedirect />
      <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<GetStarted />} />
          <Route path="/onBoarding" element={<Onboarding />} />
          <Route path="/wallets" element={<Waletss />} />
          <Route path="/redirect" element={<Redirect />} />
          {/* <Route path="/markets" element={ <RequireAuth><Home /></RequireAuth>} /> */}
          <Route path="/markets" element={ <Home />} />
          <Route path="/kol-Calls" element={ <KOLCalls />} />
          {/* <Route path="/kol-Calls" element={ <RequireAuth><KOLCalls /></RequireAuth>} /> */}
          <Route path="/Wallet" element={ <Wallet />} />
          {/* <Route path="/Wallet" element={ <RequireAuth><Wallet /></RequireAuth>} /> */}
          <Route path="/profile" element={ <Profile />} />
          {/* <Route path="/profile" element={ <RequireAuth><Profile /></RequireAuth>} /> */}
          {/* <Route path="/market-details" element={ <RequireAuth><MarketDetails /></RequireAuth>} /> */}
          <Route path="/deposit" element={
            //  <RequireAuth>
            <Deposit />
            // </RequireAuth>
            }
             />
          <Route path="/market-details/:id" element={<MarketDetails />} />
          <Route path="/wallet-details" element={<Walletconnect />} />
          <Route path="/wallet-details/:id" element={<Walletconnect />} />
          <Route path="/wallet-detailssol" element={<Walletconnectsol />} />
          <Route path="/wallet-success" element={<WalletSuccess />} />
          <Route path="/pay-redirect" element={<PayRedirect />} />
          <Route path="/create-market" element={<CreateMarket />} />
          <Route path="/join-private-market" element={<JoinPrivateMarket />} />
        </Routes>
     
      </BrowserRouter>
</MarketProvider>
</ChainProvider>
     </TelegramUserProvider>
     
    
    </>
  )
}

export default App
