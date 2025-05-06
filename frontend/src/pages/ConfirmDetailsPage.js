import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Booking.css";

const formatDate = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
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

const Booking = ({ isModal }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkInDate = location.state?.checkInDate;
  const checkOutDate = location.state?.checkOutDate;
  const room = location.state?.room || {};

  React.useEffect(() => {
    if (!checkInDate || !checkOutDate || !room._id) {
      alert('Missing booking details. Please start your booking again.');
      navigate('/');
    }
  }, [checkInDate, checkOutDate, room, navigate]);

  if (!checkInDate || !checkOutDate || !room._id) return null;


  const [errors, setErrors] = useState({
  name: "",
  email: "",
  phone: "",
  num_of_people: ""
});

const [formData, setFormData] = useState({
  room_type: room.type,
  check_in_date: checkInDate ? checkInDate.slice(0, 10) : '',
  check_out_date: checkOutDate ? checkOutDate.slice(0, 10) : '',
  num_of_people: ""
});
  useEffect(() => {  
    if (!isModal && !location.state?.room?._id) {  
      alert("Invalid room selection");  
      navigate("/room-list");  
    }  
  }, [isModal, location.state, navigate]);
  useEffect(() => {  
    if (!location.state?.room?._id) {  
      alert("Invalid room selection");  
      navigate("/room-list");  
    }  else {
      setFormData(prev => ({
        ...prev,
        room_type: location.state.room.type
      }));
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

  const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = {};
  Object.keys(formData).forEach(key => {
    const errorMessage = validateForm(key, formData[key]);
    if (errorMessage) {
      newErrors[key] = errorMessage;
    }
  });
  setErrors(newErrors);
  if (Object.values(newErrors).some(error => error !== "")) {
    alert("Please correct the errors before submitting");
    return;
  }
  navigate('/payment', {
    state: {
      room,
      checkInDate: formData.check_in_date,
      checkOutDate: formData.check_out_date,
      formData
    }
  });
};

    const submissionData = {
      room: room._id,
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date,
      num_of_people: parseInt(formData.num_of_people),
      special_requests: formData.special_requests

    };
    console.log('Booking data:', submissionData);

  
  
  return (
    <div className={`booking-container ${isModal ? 'modal-version' : ''}`}>
        <>
          <h2>Confirm Details</h2>
          <div className="booking-dates required">
            <div className="booking-date-item">
              <h3>Check-in Date <span className="required-asterisk">*</span></h3>
              <input 
                type="date" 
                value={formData.check_in_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, check_in_date: e.target.value})}
                readOnly
                className="date-input"
              />
            </div>
            <div className="booking-date-item">
              <h3>Check-out Date <span className="required-asterisk">*</span></h3>
              <input 
                type="date" 
                value={formData.check_out_date}
                readOnly
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
                max="6"
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
    </div>
  );
};

export default Booking;

