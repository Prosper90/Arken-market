import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <nav className="nav_topbar">
      <div className="landing-header1">
        <Link to="/">
          <img
            src="https://res.cloudinary.com/dqtdd1frp/image/upload/v1766133234/arkenlogo_extljc.webp"
            alt="logo"
            className="logo-img"
          />
        </Link>
      </div>
    </nav>
  );
}

export default Header;
