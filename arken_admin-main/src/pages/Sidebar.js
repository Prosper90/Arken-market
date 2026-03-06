import React, { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";
import { toast } from "react-toastify";
import useState from "react-usestateref";
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

function Sidebar() {
  const navigate = useNavigate();
  const [Permissions, setPermissions, Permissionsref] = useState([]);
  const [admindata, setadmindata, admindataref] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const logoutPop = async () => {
    logout();
  };

  const logout = async () => {
    await removeAuthorization();
    await removeAuthToken();
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
          <div className="flex flex-col gap-3 p-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-white/10 animate-pulse" />
            ))}
          </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="svg-side" viewBox="0 0 24 24" id="Dashboard">
                          <path fill="none" d="M0 0h24v24H0V0z"></path>
                          <path d="M19 5v2h-4V5h4M9 5v6H5V5h4m10 8v6h-4v-6h4M9 17v2H5v-2h4M21 3h-8v6h8V3zM11 3H3v10h8V3zm10 8h-8v10h8V11zm-10 4H3v6h8v-6z" fill="#ffffff" className="color000000 svgShape"></path>
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

                {(Permissionsref.current.length > 0 &&
                  Permissionsref.current.includes("referralmanagement") &&
                  admindataref.current?.type == 1) ||
                admindataref.current?.type == 0 ? (
                  <NavLink to="/bets-settings" className="navlink_new">
                    <div className="chat-optionside">
                      <div className="menu_items_fex">
                        <i className="fa-solid fa-coins svg-side"></i>
                      </div>
                      <span className="side-name">Platform Fee Management</span>
                    </div>
                  </NavLink>
                ) : null}
              </div>

              <div className="pos-abs">
                <div className="side-lo-div" onClick={handleOpen}>
                  <div className="chat-optionside">
                    <div className="menu_items_fex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="svg-side" viewBox="0 0 24 24" id="logout">
                        <path d="M21.9 10.6c-.1-.1-.1-.2-.2-.3l-2-2c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l.3.3H16c-.6 0-1 .4-1 1s.4 1 1 1h2.6l-.3.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3s.5-.1.7-.3l2-2c.1-.1.2-.2.2-.3.1-.3.1-.5 0-.8z" fill="#ffffff" className="color000000 svgShape"></path>
                        <path d="M17 14c-.6 0-1 .4-1 1v1c0 .6-.4 1-1 1h-1V8.4c0-1.3-.8-2.4-1.9-2.8L10.5 5H15c.6 0 1 .4 1 1v1c0 .6.4 1 1 1s1-.4 1-1V6c0-1.7-1.3-3-3-3H5c-.1 0-.2 0-.3.1-.1 0-.2.1-.2.1l-.1.1c-.1 0-.2.1-.2.2v.1c-.1 0-.2.1-.2.2V18c0 .4.3.8.6.9l6.6 2.5c.2.1.5.1.7.1.4 0 .8-.1 1.1-.4.5-.4.9-1 .9-1.6V19h1c1.7 0 3-1.3 3-3v-1c.1-.5-.3-1-.9-1zM6 17.3V5.4l5.3 2c.4.2.7.6.7 1v11.1l-6-2.2z" fill="#ffffff" className="color000000 svgShape"></path>
                      </svg>
                    </div>
                    <span className="side-name">Logout</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Logout confirmation modal — Tailwind overlay, no MUI */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="popup_modal-delete">
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
              <button className="popup_modal-btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button className="popup_modal-btn-confirm" onClick={logoutPop}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
