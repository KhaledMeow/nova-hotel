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

const validateForm = (key, value) => {
  switch (key) {
    case "name":
      if (!value) return "Name is required";
      break;
    case "email":
      if (!value) return "Email is required";
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return "Invalid email address";
      break;
    case "phone":
      if (!value) return "Phone number is required";
      if (!/^[0-9]{11}$/.test(value)) return "Invalid phone number";
      break;
    case "num_of_people":
      if (!value) return "Number of people is required";
      if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 1) return "Number of people must be a positive number";
      break;
    default:
      break;
  }
  return "";
};

const Booking = () => {
  const location = useLocation();
  const room = location.state?.room || {};
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    num_of_people: ""
  });

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

  useEffect(() => {  if (!location.state?.room?._id) {
    alert("Invalid room selection");
    navigate("/room-list");
  }
}, [location.state, navigate]);

  useEffect(() => {
    if (!room.type) {
      alert("Please select a room first.");
      navigate("/room-list");
    }
  }, [room.type, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const errorMessage = validateForm(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return navigate('/login');
    }

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
        const errorMessage = validateForm(key, formData[key]);
        if (errorMessage) {
            newErrors[key] = errorMessage;
        }
    });

    // Update errors
    setErrors(newErrors);

    // Check if form is valid
    if (Object.values(newErrors).some(error => error !== "")) {
        alert("Please correct the errors before submitting");
        return;
    }

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

    const numOfPeople = parseInt(formData.num_of_people, 10);
    if (isNaN(numOfPeople) || numOfPeople < 1) {
        alert("Number of people must be a positive number.");
        return;
    }
    
    const submissionData = {
      ...formData,
      num_guests: numOfPeople
    };

    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          roomId: room._id,
          check_in_date: new Date(formData.check_in_date).toISOString(), // Proper date formatting
          check_out_date: new Date(formData.check_out_date).toISOString(),
          num_guests: parseInt(formData.num_of_people), // Ensure numeric type
          special_requests: formData.special_requests // Add missing field
        })
      });
      if (!response.ok){
        if (response.status === 401) {
          localStorage.removeItem('token');
          alert('Session expired - Please login again');
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error) || 'Booking failed';
      }
      const booking = await response.json();
      setBookingData(booking);
      setShowPayment(true);

    } catch (error) {
      if (error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      alert(error.message);
      console.error('Booking Error:', error);
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
              {errors.name && <p style={{color: 'red'}}>{errors.name}</p>}
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
              {errors.email && <p style={{color: 'red'}}>{errors.email}</p>}
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
              {errors.phone && <p style={{color: 'red'}}>{errors.phone}</p>}
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
              {errors.num_of_people && <p style={{color: 'red'}}>{errors.num_of_people}</p>}
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
