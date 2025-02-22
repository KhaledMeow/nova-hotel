import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/images/logo.jpg";
import "../styles/Header.css";
import SpecialOfferPopup from "./SpecialOfferPopup";

const navVariants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: { opacity: 1, x: 0 },
};

const Header = () => {
  const [scrollingDown, setScrollingDown] = useState(false);
  const [headerClass, setHeaderClass] = useState("");
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollingDown(currentScrollY > 100);
    setHeaderClass(currentScrollY > 50 ? "scrolled" : "");
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/About" },
    isLoggedIn 
      ? { name: "Logout", path: "/logout" }
      : { name: "Login", path: "/login" }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    handleLinkClick();
    window.location.reload();
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => document.body.style.overflow = "auto";
  }, [isOpen]);

  return (
    <motion.nav
      className={`header-nav ${scrollingDown ? "hide" : ""} ${headerClass}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
      transition={{ duration: 0.5 }}
    >
      <img src={logo} alt="Hotel Logo" className="header-logo" />

      <Link to="/Calendar" className="availability-button">
        Check Availability
      </Link>

      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✖" : "☰"}
      </button>

      <ul className={`header-links ${isOpen ? "open" : ""}`}>
        {isOpen && (
          <>
            <img src={logo} alt="Hotel Logo" className="menu-logo" />
            {navItems.map((item) => (
              <li key={item.name}>
                {item.name === 'Logout' ? (
                  <button 
                    className="nav-link-button" 
                    onClick={handleLogout}
                  >
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => {
                      handleLinkClick();
                      if (item.name === "Home") window.scrollTo(0, 0);
                    }}
                  >
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </>
        )}
      </ul>

      {currentOffer && (
        <SpecialOfferPopup
          offer={currentOffer}
          onClose={() => setCurrentOffer(null)}
        />
      )}
    </motion.nav>
  );
};

export default Header;