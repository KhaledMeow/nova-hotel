import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import backgroundImage from "./assets/images/background-home1.jpg";
import CalendarComponent from "./components/CalendarComponent";
import ContactUsPage from "./pages/ComplaintPage";
import RoomList from "./components/RoomList";
import Booking from "./components/Booking";
import AboutPage from "./pages/AboutPage";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from './components/Register';
import HAC from "./pages/HAC";
import "./assets/styles/main.css";
import ChatBotComponent from "./components/ChatBotComponent";
import DealsPopup from "./components/DealsPopup";

const App = () => {
  const [showDealsMessage, setShowDealsMessage] = useState(false);

  useEffect(() => {
    const dealsTimer = setTimeout(() => {
      setShowDealsMessage(true);
    }, 2500);

    return () => clearTimeout(dealsTimer);
  }, []);

  return (
    <Router>
      <div
        className="App"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <Header />
        <Routes>
          <Route path="/" element={<HAC />} />
          <Route path="/About" element={<AboutPage />} />
          <Route path="/Contact-Us" element={<ContactUsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-availability" element={<CalendarComponent />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/Room-List" element={<RoomList />} />
          <Route path="/Confirm-details" element={<Booking />} />
        </Routes>
        <ChatBotComponent />
        {showDealsMessage && <DealsPopup onClose={() => setShowDealsMessage(false)} />}
      </div>
    </Router>
  );
};

export default App;