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

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollingDown(currentScrollY > 100);
    setHeaderClass(currentScrollY > 50 ? "scrolled" : "");
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/About" },
    { name: "Contact Us", path: "/Contact-Us" },
  ];

  const specialOffers = [];

  const handleOfferClick = (offer) => {
    setCurrentOffer(offer);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Lock or unlock body scroll when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Clean up when the component unmounts or isOpen changes
    return () => {
      document.body.style.overflow = "auto";
    };
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

      {/* Check Availability Button */}
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
                <Link
                  to={item.path}
                  onClick={(e) => {
                    handleLinkClick();
                    if (item.name === "Home") {
                      handleHomeClick(e);
                    }
                  }}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
            <div className="special-offers-section">
              {specialOffers.map((offer) => (
                <li key={offer}>
                  <button
                    className="offer-link"
                    onClick={() => handleOfferClick(offer)}
                  >
                    {offer}
                  </button>
                </li>
              ))}
            </div>
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
