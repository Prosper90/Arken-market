import React, { useEffect } from "react";
import useState from "react-usestateref";
import { Link, NavLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import { useMediaQuery, useTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Moment from "moment";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import {
  removeAuthToken,
  getAuthToken,
  getSocketToken,
} from "../core/lib/localStorage";
import { removeAuthorization } from "../core/service/axios";
import toast, { Toaster } from "react-hot-toast";
import { useDisconnect } from "@web3modal/ethers/react";
import { postMethod } from "../core/service/common.api";
import apiService from "../core/service/detail";

import Modal from "@mui/joy/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};
const drawerWidth = 240;
function Sidebar() {
  const theme = useTheme();
  const [lastLogin, setLastLogin] = useState("");
  const [loginCheck, setloginCheck] = useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [notifications, setNotification] = React.useState("");
  const [getKYCData, setgetKYCData] = useState("");
  const [profileData, setprofileData] = useState("");
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };
  const [Permissions, setPermissions, Permissionsref] = useState([]);
  const [admindata, setadmindata, admindataref] = useState();
  useEffect(() => {
    LoginAdminDeatils();
  }, [0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center", backgroundColor: "#121418", color: "#fff" }}
    >
      <Typography variant="h6" className="mobile_logo_container">
        <div className="landing-header1">
          <img
            src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
            alt="Logo"
            className="foot_logo_img"
          />
        </div>
      </Typography>
      {/* <Divider /> */}
      <List className="mobile_list_wrap">
        {loginCheck == true ? (
          <ListItem disablePadding>
            <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
              <Link to="/dashboard">
                <span className="land_header_leftmenus side-name">
                  Dashboard
                </span>
              </Link>
            </ListItemButton>
          </ListItem>
        ) : (
          ""
        )}
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/usermanagement">
              <span className="land_header_leftmenus side-name">
                User Management
              </span>
            </Link>
          </ListItemButton>
        </ListItem>{" "}
         <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/currencymanagement">
              <span className="land_header_leftmenus side-name">
Currency
              </span>
            </Link>
          </ListItemButton>
        </ListItem>


         <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/deposit">
              <span className="land_header_leftmenus side-name">
Deposit
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/withdraw">
              <span className="land_header_leftmenus side-name">
Withdraw
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/marketCreaction">
              <span className="land_header_leftmenus side-name">
                Market Creation
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/polymarket-datas">
              <span className="land_header_leftmenus side-name">
                Polymarket Data
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/resolution">
              <span className="land_header_leftmenus side-name">
                Resolution
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/usersStake">
              <span className="land_header_leftmenus side-name">
                TG Group Commission
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/bets-settings">
              <span className="land_header_leftmenus side-name">
                Platform Fee Management
              </span>
            </Link>
          </ListItemButton>
        </ListItem>
       
      
        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/depositfiatHistory">
              <span className="land_header_leftmenus side-name">
                Fiat Deposit Request
              </span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/userdepositList">
              <span className="land_header_leftmenus side-name">
                Fiat Deposit History
              </span>
            </Link>
          </ListItemButton>
        </ListItem> */}
        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/depositmanagement">
              <span className="land_header_leftmenus side-name">
                Crypto Deposit
              </span>
            </Link>
          </ListItemButton>
        </ListItem> */}

        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/fiatwithdraw">
              <span className="land_header_leftmenus side-name">
                Fiat Withdraw
              </span>
            </Link>
          </ListItemButton>
        </ListItem> */}
        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/withdrawmanagement">
              <span className="land_header_leftmenus side-name">
                Crypto Withdraw
              </span>
            </Link>
          </ListItemButton>
        </ListItem> */}

        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/fiatdepositmanagment">
              <span className="land_header_leftmenus side-name">
                Bank Deposit
              </span>
            </Link>
          </ListItemButton>
        </ListItem>

         <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/fiatwithdrawmanagement">
              <span className="land_header_leftmenus side-name">
                Bank Withdraw
              </span>
            </Link>
          </ListItemButton>
        </ListItem> */}


       
        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/usertrade">
              <span className="land_header_leftmenus side-name">
                User Trade
              </span>
            </Link>
          </ListItemButton>
        </ListItem> */}

        {/* <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/profits">
              <span className="land_header_leftmenus side-name">
                Admin Profit
              </span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/reportmanagment">
              <span className="land_header_leftmenus side-name">Suspicious Users</span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/partnerlist">
              <span className="land_header_leftmenus side-name">
                Partner Submissions
              </span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/add-research">
              <span className="land_header_leftmenus side-name">
                Add Research
              </span>
            </Link>
          </ListItemButton>
        </ListItem>


       <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/notes">
              <span className="land_header_leftmenus side-name">
                Announcements
              </span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/subadminmangement">
              <span className="land_header_leftmenus side-name">
                Subadmin Management
              </span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/currencymanagement">
              <span className="land_header_leftmenus side-name">Currency</span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/tradepair">
              <span className="land_header_leftmenus ">Trading Pair</span>
            </Link>
          </ListItemButton>
        </ListItem>

         <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/faq">
              <span className="land_header_leftmenus ">FAQ Management</span>
            </Link>
          </ListItemButton>
        </ListItem>

         <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/cmsmanagement">
              <span className="land_header_leftmenus ">Content Management</span>
            </Link>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/profitmanagement">
              <span className="land_header_leftmenus ">Support Category</span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/profitmanagement">
              <span className="land_header_leftmenus ">Support</span>
            </Link>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
            <Link to="/sitesetting">
              <span className="land_header_leftmenus ">Site Settings</span>
            </Link>
          </ListItemButton>
        </ListItem> */}
        <ListItem className="drawer_logout_btn" disablePadding>
          <ListItemButton
            sx={{ textAlign: "center", color: "#fff" }}
            className="drawer_logout_btn_inner"
          >
            <Link to="/" onClick={logout}>
              <span className="land_header_leftmenus">Logout</span>
            </Link>
          </ListItemButton>
        </ListItem>
        {/* {loginCheck == false ? (
          <>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
                <div
                  className="lan_had_con"
                  variant="outlined"
                  color="neutral"
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="img-con"
                    viewBox="0 0 20 20"
                    id="wallet"
                  >
                    <path d="M16 6H3.5v-.5l11-.88v.88H16V4c0-1.1-.891-1.872-1.979-1.717L3.98 3.717C2.891 3.873 2 4.9 2 6v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-1.5 7.006a1.5 1.5 0 1 1 .001-3.001 1.5 1.5 0 0 1-.001 3.001z"></path>
                  </svg>
                  <span className="con_lan_con">Connect</span>
                </div>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>

              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
                <Link to="/security">
                  <span className="land_header_leftmenus">Security</span>
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
                <Link to="/kyc">
                  <span className="land_header_leftmenus">
                    Identity verification
                  </span>
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
                <Link to="/deposit">
                  <span className="land_header_leftmenus">Deposit</span>
                </Link>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
                <Link to="/withdraw">
                  <span className="land_header_leftmenus">Withdraw</span>
                </Link>
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "center", color: "#fff" }}>
                <Link to="">
                  <div className="land_header_signup">
                    <span className="land-sign-letter">Logout</span>
                  </div>
                </Link>
              </ListItemButton>
            </ListItem>
          </>
        )} */}
      </List>
    </Box>
  );

  const navigate = useNavigate();
  const [address, setAddress, addressref] = useState("");

  const [dropstatus, setdropstatus] = useState(false);

  const dropdowns = async () => {
    console.log(dropstatus, "dropstatus");
    if (dropstatus == true) {
      setdropstatus(false);
    } else {
      setdropstatus(true);
    }
  };

  const { disconnect } = useDisconnect();

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar component="nav">
          <Toolbar className="px-lg-0">
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
                  {loginCheck == true ? (
                    <div className="header_new">
                      <div className="dropdown head_pair_table">
                        <div className="dropdown show">
                          <a
                            class="text-white dropdown-toggle"
                            href="#"
                            role="button"
                            id="dropdownMenuLink"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <h2>
                              {/* <svg xmlns="http://www.w3.org/2000/svg" className='header_add_icons' viewBox="0 0 256.001 256.001" id="MagnifyingGlass"><rect width="256" height="256" fill="none"></rect><circle cx="116" cy="116" r="84" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" class="colorStroke000000 svgStroke"></circle><line x1="175.394" x2="223.994" y1="175.4" y2="224.001" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" class="colorStroke000000 svgStroke"></line></svg> */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="header_add_icons"
                                fill-rule="evenodd"
                                stroke-linejoin="round"
                                stroke-miterlimit="1.414"
                                clip-rule="evenodd"
                                viewBox="0 0 32 32"
                                id="transaction"
                              >
                                <rect width="32" height="32" fill="none"></rect>
                                <path
                                  fill-rule="nonzero"
                                  d="M23.997,28.994l-0.001,0c-5.342,0 -10.685,0.017 -16.028,0c-2.584,-0.024 -4.96,-2.267 -4.968,-4.998l0,-15.998c0.037,-0.769 1.043,-1.286 1.655,-0.756c0.168,0.146 0.284,0.348 0.327,0.567c0.016,0.083 0.014,0.104 0.018,0.189c0,5.345 -0.05,10.69 0,16.034c0.024,1.547 1.363,2.947 2.98,2.962c4.006,0.013 8.011,0 12.017,0c-0.019,-0.024 -0.037,-0.049 -0.055,-0.075c-0.613,-0.855 -0.942,-1.885 -0.945,-2.923l0,-18.998l-14.997,0c0,0 -0.964,-0.22 -0.999,-0.952c-0.025,-0.536 0.443,-1.021 0.999,-1.047l15.997,0c0.537,0.024 0.974,0.45 1,0.999c0,6.678 -0.062,13.357 0,20.034c0.024,1.53 1.341,2.922 2.939,2.962c0.079,-0.009 0.055,0.005 0.235,-0.005c1.502,-0.09 2.82,-1.428 2.825,-2.996l0,-8.996l-3,0c0,0 -0.484,-0.053 -0.733,-0.32c-0.477,-0.515 -0.198,-1.551 0.584,-1.669c0.066,-0.01 0.083,-0.009 0.149,-0.011l4,0c0.024,0.001 0.049,0.002 0.074,0.003c0.229,0.025 0.265,0.05 0.359,0.096c0.337,0.162 0.552,0.523 0.566,0.901c0,3.343 0.011,6.687 0,10.03c-0.024,2.604 -2.305,4.958 -4.997,4.967l-0.001,0Zm-9.999,-5.999l-3.999,0c-0.778,-0.015 -1.301,-1.052 -0.741,-1.671c0.186,-0.206 0.458,-0.323 0.741,-0.329l3.999,0c0.013,0.001 0.027,0.001 0.04,0.001c0.873,0.052 1.316,1.423 0.419,1.887c-0.141,0.073 -0.297,0.109 -0.459,0.112Zm2,-3.999l-7.999,0c-0.229,-0.007 -0.305,-0.037 -0.434,-0.099c-0.613,-0.296 -0.743,-1.292 -0.144,-1.716c0.122,-0.087 0.263,-0.146 0.411,-0.171c0.055,-0.009 0.111,-0.012 0.167,-0.014l7.999,0c0.018,0.001 0.037,0.001 0.056,0.002c0.736,0.062 1.243,1.044 0.689,1.664c-0.188,0.21 -0.379,0.324 -0.745,0.334Zm0,-3.999l-7.999,0c-0.765,-0.022 -1.312,-1.033 -0.745,-1.667c0.187,-0.21 0.379,-0.323 0.745,-0.333l7.999,0c0.018,0 0.037,0.001 0.056,0.001c0.739,0.063 1.227,1.063 0.689,1.665c-0.188,0.21 -0.379,0.323 -0.745,0.334Zm0,-4l-7.999,0c-0.763,-0.021 -1.308,-1.037 -0.745,-1.666c0.187,-0.21 0.379,-0.323 0.745,-0.333l7.999,0c0.018,0 0.037,0.001 0.056,0.001c0.229,0.019 0.302,0.054 0.427,0.123c0.576,0.319 0.682,1.275 0.095,1.691c-0.122,0.086 -0.263,0.145 -0.411,0.17c-0.055,0.009 -0.111,0.013 -0.167,0.014Z"
                                  fill="#ffffff"
                                  class="color000000 svgShape"
                                ></path>
                              </svg>
                            </h2>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

                  <div
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    className="p-0 "
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { xs: "block", lg: "none" } }}
                  >
                    <MenuIcon className="mt-2" />
                  </div>
                </div>
              </div>
            </div>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", lg: "block" } }}
            >
              <div className="inhead_main">
                <div className="inheader-right-menu">
                  <div
                    className="lan_had_con1"
                    variant="outlined"
                    color="neutral"
                    onClick={dropdowns}
                  >
                    <span className="con_lan_con">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inhead_user_icon"
                        enable-background="new 0 0 512 512"
                        viewBox="0 0 512 512"
                        id="user"
                      >
                        <circle
                          cx="256.1"
                          cy="128.6"
                          r="128.6"
                          fill="#ffffff"
                          transform="rotate(-45.001 256.1 128.604)"
                          class="color231f20 svgShape"
                        ></circle>
                        <path
                          fill="#ffffff"
                          d="M403.6,364.5c-9.9-9.9-63.1-61.1-147.5-61.1s-137.7,51.3-147.5,61.1C48.9,424.2,47.5,498.1,47.5,512h417.2
		C464.7,498.1,463.3,424.2,403.6,364.5z"
                          class="color231f20 svgShape"
                        ></path>
                      </svg>{" "}
                      <i class="fa-solid fa-angle-down text-white ml-2 text-sm"></i>{" "}
                    </span>
                    <div
                      className={
                        dropstatus == true
                          ? "dropdown-content"
                          : "dropdown-content d-none"
                      }
                    >
                      <div className="d-flex flex-column gap10">
                        {/* <Link to="/adminprofile">
                          <div className="d-flex gap10 align-items-baseline">
                            <i class="fa-solid fa-user img-con"></i>
                            <span className="">Profile</span>
                          </div>
                        </Link>
                        {(Permissionsref.current.length > 0 &&
                          Permissionsref.current.includes("Dashboard") &&
                          admindataref.current?.type == 1) ||
                        admindataref.current?.type == 0 ? (
                          <Link to="/sitesetting">
                            <div className="d-flex gap10 align-items-baseline">
                              <i class="fa-solid fa-gear img-con"></i>
                              <span className="">Setting</span>
                            </div>
                          </Link>
                        ) : null} */}
                        <Link>
                          <div
                            className="d-flex gap10 align-items-baseline"
                            onClick={() => {
                              handleOpen();
                            }}
                          >
                            <i class="fa-solid fa-arrow-right-from-bracket img-con"></i>
                            <span className="">Logout</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
            </Typography>
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            className="side_drawer"
          >
            {drawer}
          </Drawer>
        </nav>
        <Box component="main" sx={{ p: 3 }}>
          <Toolbar />
        </Box>
        {/*  */}
        <React.Fragment></React.Fragment>
        {/*  */}
      </Box>
    </div>
  );
}

export default Sidebar;
