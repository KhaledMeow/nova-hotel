import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import "E:/React/nova-hotel/frontend/src/styles/Booking.css";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
const Booking = () => {
  const location = useLocation();
  const room = location.state?.room || {};
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    special_requests: "",
    room_type: room.type,
    check_in_date: location.state?.checkInDate,
    check_out_date: location.state?.checkOutDate,
    num_of_people: "",
  });

  useEffect(() => {
    if (!room.type) {
      alert("Please select a room first.");
      navigate("/room-list");
    }
  }, [room.type, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate check-in and check-out dates
    if (!formData.check_in_date || !formData.check_out_date) {
      alert("Check-in and check-out dates are required.");
      return;
    }

    // Additional date validation
    const checkInDate = new Date(formData.check_in_date);
    const checkOutDate = new Date(formData.check_out_date);

    // Validate date range
    if (checkInDate >= checkOutDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    // Validate against past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert("Check-in date cannot be in the past.");
      return;
    }

    // Validate other required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.num_of_people) {
      alert("Please fill in all required fields.");
      return;
    }

    const numOfPeople = parseInt(formData.num_of_people, 10);
    if (isNaN(numOfPeople) || numOfPeople < 1) {
      alert("Number of people must be a positive number.");
      return;
    }

    const submissionData = {
      ...formData,
      num_of_people: numOfPeople
    };

    try {
      // Store the booking data and show payment form
      setBookingData(submissionData);
      setShowPayment(true);
    } catch (error) {
      console.error("Booking submission error:", error);
      alert("Network error. Please try again.");
    }
  };

  const handlePaymentSuccess = () => {
    // Clear any stored booking data
    setBookingData(null);
    setShowPayment(false);
    // Reset form data
    setFormData({
      name: "",
      phone: "",
      email: "",
      special_requests: "",
      room_type: "",
      check_in_date: "",
      check_out_date: "",
      num_of_people: "",
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setShowPayment(false);
  };

  // Calculate total amount based on room price and number of nights
  const calculateAmount = () => {
    const checkIn = new Date(location.state?.checkInDate);
    const checkOut = new Date(location.state?.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return room.price * nights;
  };

  return (
    <div className="booking-container main-content">
      {!showPayment ? (
        <>
          <h2>Confirm Details</h2>
          <div className="booking-dates required">
            <div className="booking-date-item">
              <h3>Check-in Date <span className="required-asterisk">*</span></h3>
              <input 
                type="date" 
                value={formData.check_in_date || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  check_in_date: e.target.value
                }))}
                required 
                min={new Date().toISOString().split('T')[0]} 
                className="date-input"
              />
            </div>
            <div className="booking-date-item">
              <h3>Check-out Date <span className="required-asterisk">*</span></h3>
              <input 
                type="date" 
                value={formData.check_out_date || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  check_out_date: e.target.value
                }))}
                required 
                min={formData.check_in_date || new Date().toISOString().split('T')[0]} 
                className="date-input"
              />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="name">↓ Name ↓</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your Full Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">↓ Email ↓</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your Email Address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">↓ Phone Number ↓</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{11}"
                title="Please enter an 11-digit phone number"
                placeholder="Your Phone Number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="num_of_people">↓ Number of People ↓</label>
              <input
                type="number"
                id="num_of_people"
                name="num_of_people"
                value={formData.num_of_people}
                onChange={handleChange}
                required
                min="1"
                max="4"
                placeholder="Number of Guests"
              />
            </div>

            <div className="form-group">
              <label htmlFor="special_requests">↓ Special Requests (Optional) ↓</label>
              <textarea
                id="special_requests"
                name="special_requests"
                value={formData.special_requests}
                onChange={handleChange}
                placeholder="Any special requirements?"
                rows="4"
              />
            </div>

            <button type="submit" className="submit-button">
              Proceed to Payment
            </button>
          </form>
        </>
      ) : (
        <div className="payment-section">
          <h2>Payment Details</h2>
          <div className="payment-summary">
            <div className="booking-dates">
              <div className="booking-date-item">
                <p>{formatDate(formData.check_in_date)}</p>
              </div>
              <div className="booking-date-item">

                <p>{formatDate(formData.check_out_date)}</p>
              </div>
            </div>

          </div>
          <PaymentForm 
            room={room}
            checkInDate={formData.check_in_date}
            checkOutDate={formData.check_out_date}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}
    </div>
  );
};

export default Booking;
