import React, { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import SkeletonDashboard from "../pages/SkeletonDashboard";
import { toast } from "react-toastify";
import useState from "react-usestateref";
import Modal from "@mui/joy/Modal";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import { LuCalendarPlus } from "react-icons/lu";
import { FaTools } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { HiUserGroup } from "react-icons/hi2";
import { PiHandWithdrawFill } from "react-icons/pi";

import {
  removeAuthToken,
  getAuthToken,
  getSocketToken,
} from "../core/lib/localStorage";
import { removeAuthorization } from "../core/service/axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};
function Sidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isToastShown, setIsToastShown] = useState(false);
  const [Permissions, setPermissions, Permissionsref] = useState([]);
  const [admindata, setadmindata, admindataref] = useState();
  const [loading, setLoading] = useState(false);
  let toastId = null;
  useEffect(() => {
    LoginAdminDeatils();
  }, [0]);
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem("Voltrix_token");

      if (token) {
        try {
          const datas = {
            apiUrl: apiService.verifyToken,
            payload: { token },
          };

          const response = await postMethod(datas);

          if (response.status === 401 || response.message === "TokenExpired") {
            handleLogout();
          } else {
          }
        } catch (error) {
          handleLogout();
        }
      }
    };
    verifyToken();
  }, []);

  const handleLogout = () => {
    if (!toast.isActive(toastId)) {
      toastId = toast.error("Session expired. Please log in again.");
    }

    sessionStorage.clear();
    localStorage.clear();

    navigate("/");
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const logoutPop = async () => {
    logout();
  };

  const logout = async () => {
    await removeAuthorization();
    await removeAuthToken();
    // localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const LoginAdminDeatils = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("Voltrix_token");

      if (token) {
        const datas = {
          apiUrl: apiService.getAdmin,
          payload: { token },
        };

        const response = await postMethod(datas);
        if (response.data) setPermissions(response.data.Permissions);
        setadmindata(response.data);
      }
    } catch (err) {
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <aside className="asidemeni">
        <Link to="/dashboard" className="sidebar_logo_container">
          <img
            src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
            alt="Logo"
            className="foot_logo_img"
          />
        </Link>
        {loading ? (
          <SkeletonDashboard />
        ) : (
          <>
            <div className="mennu_sidemain">
              <div className="mennu_side">
                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("Dashboard") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/dashboard" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="svg-side"
                          viewBox="0 0 24 24"
                          id="Dashboard"
                        >
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path
                            d="M19 5v2h-4V5h4M9 5v6H5V5h4m10 8v6h-4v-6h4M9 17v2H5v-2h4M21 3h-8v6h8V3zM11 3H3v10h8V3zm10 8h-8v10h8V11zm-10 4H3v6h8v-6z"
                            fill="#ffffff"
                            className="color000000 svgShape"
                          ></path>
                        </svg>
                      </div>
                      <span className="side-name">Dashboard</span>
                    </div>
                  </NavLink>
                ) : null}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("Usermanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/usermanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-users-gear svg-side"></i>
                      </div>
                      <span className="side-name">User Management</span>
                    </div>
                  </NavLink>
                ) : null}

                
                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("kycmanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/kycmanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-users-viewfinder svg-side"></i>
                      </div>
                      <span className="side-name">Kyc Management</span>
                    </div>
                  </NavLink>
                ) : null} */}
                
                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("eventCreaction") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/eventCreaction" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <LuCalendarPlus />
                      </div>
                      <span className="side-name">Event Creation</span>
                    </div>
                  </NavLink>
                ) : null} */}

 {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("currencymangement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/currencymanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-coins svg-side"></i>
                      </div>
                      <span className="side-name">Currency Management</span>
                    </div>
                  </NavLink>
                ) : null}

{(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("deposit") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/deposit" className="navlink_new">
                    <div className="chat-optionside">
                    <div className="menu_items_fex">
                        <i className="fa-solid fa-money-bill-trend-up svg-side"></i>
                      </div>
                      <span className="side-name">Deposit</span>
                    </div>
                  </NavLink>
                ) : null}

                {(Permissionsref.current.length > 0 &&
                    Permissionsref.current.includes("withdraw") &&
                    admindataref.current?.type == 1) ||
                    admindataref.current?.type == 0 ? (
                    <NavLink to="/withdraw" className="navlink_new">
                      <div className="chat-optionside">
                        <div className="menu_items_fex side_bar_newIcn">
                          <PiHandWithdrawFill />
                        </div>
                        <span className="side-name">Withdraw</span>
                      </div>
                    </NavLink>
                  ) : null}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("marketCreaction") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/marketCreaction" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <LuCalendarPlus />
                      </div>
                      <span className="side-name">Market Creation</span>
                    </div>
                  </NavLink>
                ) : null}
                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("polymarket-datas") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/polymarket-datas" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <LuCalendarPlus />
                      </div>
                      <span className="side-name">Polymarket Data</span>
                    </div>
                  </NavLink>
                ) : null}


                
                
                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("resolution") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/resolution" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <TbTargetArrow />
                      </div>
                      <span className="side-name">Resolution</span>
                    </div>
                  </NavLink>
                ) : null}

                {admindataref.current?.type == 0 ? (
                  <NavLink to="/aiResolutions" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <FaTools />
                      </div>
                      <span className="side-name">AI Resolutions</span>
                    </div>
                  </NavLink>
                ) : null}

                {admindataref.current?.type == 0 ? (
                  <NavLink to="/umaResolutions" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <FaTools />
                      </div>
                      <span className="side-name">UMA Resolutions</span>
                    </div>
                  </NavLink>
                ) : null}
                
                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("usersStake") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/usersStake" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex side_bar_newIcn">
                        <HiUserGroup />
                      </div>
                      <span className="side-name">TG Group Commission</span>
                    </div>
                  </NavLink>
                ) : null}

                
                
                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("settings") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/settings" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-gear svg-side"></i>
                      </div>
                      <span className="side-name">Settings</span>
                    </div>
                  </NavLink>
                ) : null}
                 */}

                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("walletmanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/walletmanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-wallet svg-side"></i>
                      </div>
                      <span className="side-name">Wallet Management</span>
                    </div>
                  </NavLink>
                ) : null} */}

                {/* {admindataref.current?.type == 0 ? (
                  <NavLink to="/adminwallet" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-user-tie svg-side"></i>
                      </div>
                      <span className="side-name"> Admin Wallet </span>
                    </div>
                  </NavLink>
                ) : (
                  ""
                )} */}

                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("cryptoDeposit") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/depositmanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-money-bill-trend-up svg-side"></i>
                      </div>
                      <span className="side-name">Crypto Deposit</span>
                    </div>
                  </NavLink>
                ) : null} */}
                {/* <NavLink to="/fiatwithdraw" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-money-bill-trend-up svg-side"></i>
                </div>
                <span className="side-name">Fiat Withdraw</span>
              </div>
            </NavLink> */}
                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("cryptoWithdraw") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/withdrawmanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-building-columns svg-side"></i>
                      </div>
                      <span className="side-name">Crypto Withdraw </span>
                    </div>
                  </NavLink>
                ) : null} */}
                
                 {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("fiatdepositmanagment") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/fiatdepositmanagment" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-money-bill-trend-up svg-side"></i>
                      </div>
                      <span className="side-name">Bank Deposit </span>
                    </div>
                  </NavLink>
                ) : null}
                 {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("fiatwithdrawmanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/fiatwithdrawmanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-building-columns svg-side"></i>
                      </div>
                      <span className="side-name">Bank Withdraw </span>
                    </div>
                  </NavLink>
                ) : null}


                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("userTrade") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/usertrade" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-regular fa-address-book svg-side"></i>
                      </div>
                      <span className="side-name">User Trade</span>
                    </div>
                  </NavLink>
                ) : null}

                 {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("profitmanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/profits" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-dollar-sign svg-side"></i>
                      </div>
                      <span className="side-name">Admin Profit History</span>
                    </div>
                  </NavLink>
                ) : null} */}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("referralmanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink
                    to="/bets-settings"
                    className="navlink_new"
                  >
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-coins svg-side"></i>
                      </div>
                      <span className="side-name">
                        Platform Fee Management{" "}
                      </span>
                    </div>
                  </NavLink>
                ) : null}

                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("reportmanagment") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/reportmanagment" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-user-tie svg-side"></i>
                      </div>
                      <span className="side-name">Suspicious Users</span>
                    </div>
                  </NavLink>
                ) : null}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("partnerlist") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/partnerlist" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-handshake svg-side"></i>
                      </div>
                      <span className="side-name">Partner Submissions</span>
                    </div>
                  </NavLink>
                ) : null}

                 {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("add-research") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/add-research" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-magnifying-glass-plus svg-side"></i>
                      </div>
                      <span className="side-name">Add Research</span>
                    </div>
                  </NavLink>
                ) : null}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("notes") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/notes" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-volume-high svg-side"></i>
                      </div>
                      <span className="side-name">Announcements</span>
                    </div>
                  </NavLink>
                ) : null}

                {admindataref.current?.type == 0 ? (
                  <NavLink to="/subadminmangement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-user svg-side"></i>
                      </div>
                      <span className="side-name">Subadmin Management</span>
                    </div>
                  </NavLink>
                ) : null} */}

                   

               {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("tradePairmangement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/tradepair" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-right-left svg-side"></i>
                      </div>
                      <span className="side-name">Trading Pair</span>
                    </div>
                  </NavLink>
                ) : null} */}

               


                {/* <NavLink to="/P2Porders" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-link svg-side"></i>
                </div>
                <span className="side-name">P2P Orders</span>
              </div>
            </NavLink>

            <NavLink to="/P2Pdispute" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-triangle-exclamation svg-side"></i>
                </div>
                <span className="side-name">P2P Dispute</span>
              </div>
            </NavLink> */}


                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("FaqMangement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/faq" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-wallet svg-side"></i>
                      </div>
                      <span className="side-name">FAQ Management</span>
                    </div>
                  </NavLink>
                ) : null}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("Cmsmangement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/cmsmanagement" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-wallet svg-side"></i>
                      </div>
                      <span className="side-name">Content Management</span>
                    </div>
                  </NavLink>
                ) : null} */}
                {/* <NavLink to="/swaping" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-shuffle svg-side"></i>
                </div>
                <span className="side-name">Swaping</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/stakeManagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">

                  <i className="fa-solid fa-coins svg-side"></i>
                </div>
                <span className="side-name">Stake Management</span>
              </div>
            </NavLink>
            <NavLink to="/StakeSetting" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">

                  <i className="fa-solid fa-coins svg-side"></i>
                </div>
                <span className="side-name">Stake Settings</span>
              </div>
            </NavLink> */}
                {/* <NavLink to="/userstakeHistory" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-coins svg-side"></i>
                </div>
                <span className="side-name">Staking History</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/launchpadmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-coins svg-side"></i>
                </div>
                <span className="side-name">Launchpad Management</span>
              </div>
            </NavLink> */}

               

                {/* <NavLink to="/referralmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-users-line svg-side"></i>
                </div>
                <span className="side-name">Referral Management</span>
              </div>
            </NavLink> */}

            
                
                

                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes(
                    "supportCatagorymanagement"
                  ) &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/supportcategory" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-headset svg-side"></i>
                      </div>
                      <span className="side-name">Support Category</span>
                    </div>
                  </NavLink>
                ) : null}

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("supportmangement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/support" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-ticket svg-side"></i>
                      </div>
                      <span className="side-name">Support</span>
                    </div>
                  </NavLink>
                ) : (
                  ""
                )} */}

                {/* {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("siteSetting") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/sitesetting" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-gear svg-side"></i>
                      </div>
                      <span className="side-name">Site Settings</span>
                    </div>
                  </NavLink>
                ) : (
                  ""
                )} */}

                {/* <NavLink to="/referralmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-solid fa-users-line svg-side"></i>
                </div>
                <span className="side-name">Referral Management</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/adminwallet" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-solid fa-user-tie svg-side"></i>
                </div>
                <span className="side-name"> Admin Wallet </span>
              </div>
            </NavLink>
            <NavLink to="/adminwallettransaction" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-solid fa-comments-dollar svg-side"></i>
                </div>
                <span className="side-name"> Wallet Transaction </span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/profitmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-solid fa-sack-dollar svg-side"></i>
                </div>
                <span className="side-name">Fees</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/rewardmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-solid fa-gifts  svg-side"></i>

                </div>
                <span className="side-name">Reward Management</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/airdropmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-brands fa-dropbox svg-side"></i>
                </div>
                <span className="side-name">Airdrop Management</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/emailtemplate" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i class="fa-solid fa-envelope-open-text svg-side"></i>
                </div>
                <span className="side-name">Email Templates</span>
              </div>
            </NavLink> */}
              </div>
              <div className="pos-abs">
                <div
                  className="side-lo-div"
                  onClick={() => {
                    handleOpen();
                  }}
                >
                  <div className="chat-optionside">
                    <div className="menu_items_fex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg-side"
                        viewBox="0 0 24 24"
                        id="logout"
                      >
                        <path
                          d="M21.9 10.6c-.1-.1-.1-.2-.2-.3l-2-2c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l.3.3H16c-.6 0-1 .4-1 1s.4 1 1 1h2.6l-.3.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l2-2c.1-.1.2-.2.2-.3.1-.3.1-.5 0-.8z"
                          fill="#ffffff"
                          className="color000000 svgShape"
                        ></path>
                        <path
                          d="M17 14c-.6 0-1 .4-1 1v1c0 .6-.4 1-1 1h-1V8.4c0-1.3-.8-2.4-1.9-2.8L10.5 5H15c.6 0 1 .4 1 1v1c0 .6.4 1 1 1s1-.4 1-1V6c0-1.7-1.3-3-3-3H5c-.1 0-.2 0-.3.1-.1 0-.2.1-.2.1l-.1.1c-.1 0-.2.1-.2.2v.1c-.1 0-.2.1-.2.2V18c0 .4.3.8.6.9l6.6 2.5c.2.1.5.1.7.1.4 0 .8-.1 1.1-.4.5-.4.9-1 .9-1.6V19h1c1.7 0 3-1.3 3-3v-1c.1-.5-.3-1-.9-1zM6 17.3V5.4l5.3 2c.4.2.7.6.7 1v11.1l-6-2.2z"
                          fill="#ffffff"
                          className="color000000 svgShape"
                        ></path>
                      </svg>
                    </div>
                    <span className="side-name">Logout</span>
                  </div>
                </div>

                {/* <NavLink to="/referralmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-users-line svg-side"></i>
                </div>
                <span className="side-name">Referral Management</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/adminwallet" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-user-tie svg-side"></i>
                </div>
                <span className="side-name"> Admin Wallet </span>
              </div>
            </NavLink>
            <NavLink to="/adminwallettransaction" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-comments-dollar svg-side"></i>
                </div>
                <span className="side-name"> Wallet Transaction </span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/profitmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-sack-dollar svg-side"></i>
                </div>
                <span className="side-name">Fees</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/rewardmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-gifts  svg-side"></i>

                </div>
                <span className="side-name">Reward Management</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/airdropmanagement" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-brands fa-dropbox svg-side"></i>
                </div>
                <span className="side-name">Airdrop Management</span>
              </div>
            </NavLink> */}

                {/* <NavLink to="/emailtemplate" className="navlink_new">
              <div className="chat-optionside">
                <div className="menu_items_fex">
                  <i className="fa-solid fa-envelope-open-text svg-side"></i>
                </div>
                <span className="side-name">Email Templates</span>
              </div>
            </NavLink> */}
              </div>
            </div>
          </>
        )}
      </aside>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style} className="popup_modal-delete">
            <div className="popup_modal-title">
              <span>
                <span className="popup_modal-title-icon">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </span>
                Confirm Logout
              </span>
            </div>
            <div className="popup_modal-content">
              <p>Are you sure you want to logout?</p>
            </div>
            <div className="popup_modal-btn-wrap">
              <button
                className="popup_modal-btn-cancel"
                onClick={() => handleClose()}
              >
                Cancel
              </button>
              <button
                className="popup_modal-btn-confirm"
                onClick={() => logoutPop()}
              >
                Yes
              </button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

export default Sidebar;
