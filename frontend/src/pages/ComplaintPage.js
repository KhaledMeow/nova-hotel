import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ComplaintPage.css";

const ComplaintPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    booking: "",
    category: "other",
    description: ""
  });

  const [userBookings, setUserBookings] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    isError: false
  });
  const [errors, setErrors] = useState({
    booking: "",
    category: "",
    description: ""
  });

  // Fetch user's bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login to submit complaints");
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5000/api/v1/bookings", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch bookings");
        
        const data = await response.json();
        setUserBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        alert(error.message);
      }
    };

    fetchBookings();
  }, [navigate]);

  const validateForm = (name, value) => {
    switch (name) {
      case "booking":
        return value ? "" : "Please select a booking";
      case "category":
        return value ? "" : "Please select a category";
      case "description":
        return value.trim().length >= 20 
          ? "" 
          : "Description must be at least 20 characters";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const errorMessage = validateForm(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      booking: validateForm("booking", formData.booking),
      category: validateForm("category", formData.category),
      description: validateForm("description", formData.description)
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== "")) {
      alert("Please correct the errors before submitting");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          booking: formData.booking,
          category: formData.category,
          description: formData.description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(prev => ({
            ...prev,
            ...data.errors
          }));
          alert(Object.values(data.errors).join(", "));
          return;
        }
        throw new Error(data.message || "Failed to submit complaint");
      }

      // Success handling
      setSubmitStatus({
        message: "Complaint submitted successfully! We'll respond within 24 hours.",
        isError: false
      });

      // Reset form
      setFormData({
        booking: "",
        category: "other",
        description: ""
      });

    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({
        message: error.message || "Failed to submit complaint. Please try again.",
        isError: true
      });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Submit a Complaint</h1>
        <p>Please provide details about your concern</p>
      </div>

      <div className="contact-content">
        <div className="complaint-form">
          <form onSubmit={handleSubmit}>
            {/* Booking Selection */}
            <div className="form-group">
              <label>Related Booking *</label>
              <select
                name="booking"
                value={formData.booking}
                onChange={handleChange}
                className={errors.booking ? "error" : ""}
              >
                <option value="">Select your booking</option>
                {userBookings.map(booking => (
                  <option key={booking._id} value={booking._id}>
                    {new Date(booking.check_in_date).toLocaleDateString()} - {booking.room_type}
                  </option>
                ))}
              </select>
              {errors.booking && <div className="error-message">{errors.booking}</div>}
            </div>

            {/* Category Selection */}
            <div className="form-group">
              <label>Issue Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? "error" : ""}
              >
                <option value="service">Service Issue</option>
                <option value="cleanliness">Cleanliness Concern</option>
                <option value="facilities">Facility Problem</option>
                <option value="billing">Billing Dispute</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label>Detailed Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe your complaint in detail (minimum 20 characters)"
                rows="6"
                className={errors.description ? "error" : ""}
              ></textarea>
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
            </div>

            <button type="submit" className="submit-button">
              Submit Complaint
            </button>

            {submitStatus.message && (
              <div className={`status-message ${submitStatus.isError ? 'error' : 'success'}`}>
                {submitStatus.message}
              </div>
            )}
          </form>
        </div>

        <div className="contact-info">
          <h2>Support Information</h2>
          <div className="contact-details">
            <p><strong>Email:</strong> support@novahotel.com</p>
            <p><strong>Phone:</strong> +60 3-2142 8888</p>
            <p><strong>Response Time:</strong> 24-48 hours</p>
          </div>
          
          <div className="map-container">
            <iframe
              title="hotel-location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3180.000000000000000!2d101.70752555002214!3d3.1453263510836957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMy4xNDUzMjYzLCAxMDEuNzA3NTI1NQ!5e0!3m2!1sen!2s!4v1234567890123"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;