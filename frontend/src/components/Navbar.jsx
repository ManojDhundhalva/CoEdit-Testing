import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

import { Button, MenuItem, Menu, IconButton } from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [showNavbar, setShowNavbar] = useState(true);
  const { LogOut } = useAuth();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.pageYOffset;
    setShowNavbar(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  }, [prevScrollPos]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const navbarStyle = {
    position: "fixed",
    width: "100%",
    top: showNavbar ? "0" : "-80px",
    zIndex: 100,
    transition: "top 0.3s",
    backdropFilter: "blur(10px)",
  };

  const buttonStyles = {
    fontWeight: "bold",
    transition: "all 0.3s ease",
    border: "2px solid transparent",
    "&:hover": {
      borderBottom: "2px solid #134611",
      borderTopRightRadius: "5px",
      borderTopLeftRadius: "5px",
    },
  };

  const linkStyles = {
    fontFamily: "Quicksand",
    color: "#134611",
  };

  return (
    <nav className="navbar navbar-expand-lg p-1" style={navbarStyle}>
      <div className="container-fluid">
        <Link
          className="navbar-brand"
          to="/"
          style={{
            fontWeight: "bold",
            fontSize: "xx-large",
            fontFamily: "Quicksand",
          }}
        >
          <i className="fa-regular fa-newspaper"></i>
          Editor
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <MenuIcon />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <Button disableRipple variant="text" sx={buttonStyles}>
              <Link className="nav-link active" to="/" style={linkStyles}>
                Home
              </Link>
            </Button>
            <Button disableRipple variant="text" sx={buttonStyles}>
              <Link
                className="nav-link active"
                to="/project"
                style={linkStyles}
              >
                project
              </Link>
            </Button>
            <Button disableRipple variant="text" sx={buttonStyles}>
              <Link className="nav-link active" to="/editor" style={linkStyles}>
                Editor
              </Link>
            </Button>
            <Button disableRipple variant="text" sx={buttonStyles}>
              <Link
                className="nav-link active"
                to="/aboutus"
                style={linkStyles}
              >
                About Us
              </Link>
            </Button>
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircleOutlinedIcon fontSize="large" sx={linkStyles} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={handleMenuClose}
                  sx={{ fontWeight: "bold", color: "#134611" }}
                >
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </MenuItem>
                <MenuItem
                  sx={{ fontWeight: "bold", color: "#134611" }}
                  onClick={() => {
                    handleMenuClose();
                    LogOut();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
