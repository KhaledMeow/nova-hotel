import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import RoomList from "./components/RoomList";
import ConfirmDetailsPage from "./pages/ConfirmDetailsPage";
import PaymentPage from "./pages/PaymentPage";
import AboutPage from "./pages/AboutPage";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from './components/Register';
import HAC from "./pages/HAC";
import "./assets/styles/main.css";
import ChatBotComponent from "./components/ChatBotComponent";
import DealsPopup from "./components/DealsPopup";
import Dashboard from "./components/Dashboard";
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
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HAC />} />
          <Route path="/About" element={<AboutPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-availability" element={<CalendarComponent />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/Room-List" element={<RoomList />} />
          <Route path="/confirm-details" element={<ConfirmDetailsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <ChatBotComponent />
        {showDealsMessage && <DealsPopup onClose={() => setShowDealsMessage(false)} />}
      </div>
    </Router>
  );
};

export default App;