import React, { useEffect } from "react";
import useState from "react-usestateref";
import { Link, useNavigate } from "react-router-dom";
import {
  removeAuthToken,
} from "../core/lib/localStorage";
import { removeAuthorization } from "../core/service/axios";
import toast, { Toaster } from "react-hot-toast";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";

function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [Permissions, setPermissions, Permissionsref] = useState([]);
  const [admindata, setadmindata, admindataref] = useState();
  const [open, setOpen] = useState(false);
  const [dropstatus, setdropstatus] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    LoginAdminDeatils();
  }, [0]);

  const logoutPop = async () => logout();

  const logout = async () => {
    await removeAuthorization();
    await removeAuthToken();
    sessionStorage.clear();
    navigate("/");
  };

  const LoginAdminDeatils = async () => {
    try {
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
    }
  };

  const dropdowns = () => setdropstatus((prev) => !prev);

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 4000 }}
      />

      {/* Top nav bar */}
      <nav className="nav_topbar">
        {/* Mobile: logo + hamburger — hidden on desktop via CSS (.drawer-head) */}
        <div className="drawer-head">
          <div className="header-res-menu">
            <div className="landing-header1">
              <Link to="/">
                <img
                  src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
                  alt="logo"
                  className="logo-img"
                />
              </Link>
            </div>
          </div>
          <div className="header-right-menu">
            <div className="header_res_flx">
              <div
                className="p-0 cursor-pointer"
                onClick={handleDrawerToggle}
                aria-label="open drawer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mt-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: user icon + dropdown */}
        <div className="inhead_main">
          <div className="inheader-right-menu">
            <div
              className="lan_had_con1"
              onClick={dropdowns}
            >
              <span className="con_lan_con">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inhead_user_icon"
                  viewBox="0 0 512 512"
                  id="user"
                >
                  <circle
                    cx="256.1"
                    cy="128.6"
                    r="128.6"
                    fill="#ffffff"
                    transform="rotate(-45.001 256.1 128.604)"
                  ></circle>
                  <path
                    fill="#ffffff"
                    d="M403.6,364.5c-9.9-9.9-63.1-61.1-147.5-61.1s-137.7,51.3-147.5,61.1C48.9,424.2,47.5,498.1,47.5,512h417.2C464.7,498.1,463.3,424.2,403.6,364.5z"
                  ></path>
                </svg>{" "}
                <i className="fa-solid fa-angle-down text-white ml-2 text-sm"></i>
              </span>
              <div
                className={
                  dropstatus ? "dropdown-content" : "dropdown-content d-none"
                }
              >
                <div className="d-flex flex-column gap10">
                  <Link
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpen();
                    }}
                  >
                    <div className="d-flex gap10 align-items-baseline">
                      <i className="fa-solid fa-arrow-right-from-bracket img-con"></i>
                      <span>Logout</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleDrawerToggle}
          />
          {/* Drawer panel */}
          <div className="absolute left-0 top-0 h-full w-60 bg-[#121418] text-white flex flex-col overflow-y-auto side_drawer">
            <div className="mobile_logo_container text-center py-4">
              <div className="landing-header1">
                <img
                  src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
                  alt="Logo"
                  className="foot_logo_img"
                />
              </div>
            </div>
            <div className="mobile_list_wrap flex flex-col">
              {[
                { to: "/dashboard", label: "Dashboard" },
                { to: "/usermanagement", label: "User Management" },
                { to: "/deposit", label: "Deposit" },
                { to: "/withdraw", label: "Withdraw" },
                { to: "/marketCreaction", label: "Market Creation" },
                { to: "/polymarket-datas", label: "Polymarket Data" },
                { to: "/resolution", label: "Resolution" },
                { to: "/usersStake", label: "TG Group Commission" },
                { to: "/bets-settings", label: "Platform Fee Management" },
              ].map(({ to, label }) => (
                <div key={to} onClick={handleDrawerToggle}>
                  <Link to={to}>
                    <span className="land_header_leftmenus side-name block px-4 py-3 text-center">
                      {label}
                    </span>
                  </Link>
                </div>
              ))}
              <div className="drawer_logout_btn">
                <div
                  className="drawer_logout_btn_inner"
                  onClick={logout}
                >
                  <span className="land_header_leftmenus">Logout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
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
    </div>
  );
}

export default Sidebar;
