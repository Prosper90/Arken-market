import React from "react";
import useState from "react-usestateref";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
const drawerWidth = 240;

function Header(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center", backgroundColor: "#121418", color: "#fff" }}
    >
      <Typography variant="h6" sx={{ my: 2 }}>
        <div className="landing-header1">
          <img
            src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
            // src="https://res.cloudinary.com/dmjw7pe6k/image/upload/v1761220991/capitalexc-logo_f7cuu5.png"
            alt="logo"
            className="logo-img"
          />
        </div>
      </Typography>
      <Divider />
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
      {/* {loading == true ? (
      <>
        <div className=" container d-flex justity-content-center align-items-center">
          <BeatLoader loading={loading} size={15} color={"rgb(118, 31, 227)"} margin={2} />
        </div>
      </>
    ) : ( */}
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar component="nav">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { xs: "block", lg: "none" } }}
              className="px-0 mx-0"
            >
              <div className="drawer-head">
                <div className="landing-header1">
                  <Link to="/">
                    <img
                    src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
                      alt="logo"
                      className="logo-img"
                    />
                  </Link>
                </div>

                <div className="header-right-menu">
                  <MenuIcon />
                </div>
              </div>
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", lg: "block" } }}
            >
              <div className="landing-header1 two">
                <Link to="/">
                  <img
                   src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
                    alt="logo"
                    className="logo-img"
                  />
                </Link>
              </div>
            </Typography>
            <Box sx={{ display: { xs: "none", sm: "block" } }}></Box>
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
        <Box component="main" sx={{ p: 3 }}>
          <Toolbar />
        </Box>
      </Box>
    </div>
  );
}

Header.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Header;
