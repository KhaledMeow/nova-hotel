import React, { useState } from "react";
import "../styles/ComplaintPage.css";

const ComplaintPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitStatus, setSubmitStatus] = useState({
    message: "",
    isError: false
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: ""
  });

  const validateForm = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" 
          ? "Name is required" 
          : "";
      case "email":
        if (value.trim() === "") return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) 
          ? "Invalid email address" 
          : "";
      case "message":
        return value.trim() === "" 
          ? "Message is required" 
          : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate and update errors
    const errorMessage = validateForm(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    try {
      const response = await fetch("http://localhost:5432/api/v1/complaints", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.errors) {
          setErrors(data.errors);
          alert(Object.values(data.errors).join(", ")); 
          return;
        }
        throw new Error(data.message || 'Failed to send message');
      }

      // Success
      alert('Complaint Submitted: Thank you for your message. We will get back to you soon!');
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        message: ""
      });
      setErrors({
        name: "",
        email: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Contact Us</h1>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Address</h2>
          <p>No.16-22 Jalan Alor, 50200 Kuala Lumpur, Malaysia.</p>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3180.000000000000000!2d101.70752555002214!3d3.1453263510836957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMy4xNDUzMjYzLCAxMDEuNzA3NTI1NQ!5e0!3m2!1sen!2s!4v1234567890123"
              title="map"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          
          <div className="contact-details">
            <h3>Contact Details</h3>
            <p><strong>Phone:</strong> +60 3-2142 8888</p>
            <p><strong>Email:</strong> info@novahotel.com</p>
            <p><strong>Operating Hours:</strong> 24/7</p>
          </div>
        </div>

        <div className="complaint-form">
          <h2>Send Us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Your Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className={errors.email ? "error" : ""}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Enter your message"
                rows="5"
                className={errors.message ? "error" : ""}
              ></textarea>
              {errors.message && <div className="error-message">{errors.message}</div>}
            </div>

            <button type="submit" className="submit-button">
              Send Message
            </button>

            {submitStatus.message && (
              <div className={`status-message ${submitStatus.isError ? 'error' : 'success'}`}> 
                {submitStatus.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;
