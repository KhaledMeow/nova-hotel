import React, { useState, useEffect } from "react";
import "../styles/HAC.css";
import "../styles/SweetAlertCustom.css";
import SpecialOfferPopup from '../components/SpecialOfferPopup';


const Home = () => {
  const location = useLocation();
  const [showMessage, setShowMessage] = React.useState(!!location.state?.paymentMessage);
  const paymentMessage = location.state?.paymentMessage;

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => setShowMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  return (
    <div className="main-content">
      {showMessage && paymentMessage && (
        <div style={{
          background: '#d1e7dd',
          color: '#0f5132',
          padding: '16px',
          marginBottom: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}>
          {paymentMessage}
        </div>
      )}
      <header className="App-header">
        <h1>Welcome to NOVA Hotel!</h1>
        <p>Book your stay today for an unforgettable experience.</p>
      </header>

      <section className="features">
        <h1></h1>
        <h1>Features</h1>
        <div className="feature-list">
          {featuresData.map((feature, index) => (
            <div
              className="feature"
              key={index}
              style={{ backgroundColor: feature.backgroundColor }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="photo-gallery">
        <h1>Over View</h1>

        <div className="photo-row">
          {galleryImages.slice(0, 3).map((image, index) => (
            <div key={index} className="photo">
              <img src={image} alt="Hotel Highlights" />
            </div>
          ))}
        </div>
        <div className="photo-row">
          {galleryImages.slice(3, 6).map((image, index) => (
            <div key={index + 3} className="photo">
              <img src={image} alt="Hotel Highlights" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


const featuresData = [
  {
    title: "Exquisite Accommodations",
    description:
      "Immerse yourself in a seamless blend of comfort and elegance in our beautifully designed rooms, where every detail has been thoughtfully crafted to offer a refined and relaxing experience.",
    backgroundColor: "var(--text)",
  },
  {
    title: "Gourmet Dining",
    description:
      "Savor an extraordinary dining experience with exquisite culinary creations, expertly crafted by our renowned chefs, using the finest ingredients.",
    backgroundColor: "var(--text)",
  },
  {
    title: "Outstanding Service",
    description:
      "Our dedicated team is passionately committed to providing exceptional hospitality, ensuring personalized service and attention to every detail throughout your stay.",
    backgroundColor: "var(--text)",
  },
];

const galleryImages = [
  require("../assets/images/photo1.jpg"),
  require("../assets/images/photo2.jpg"),
  require("../assets/images/photo3.jpg"),
];

const About = () => {
  const [currentOffer, setCurrentOffer] = useState(null);

  const handleVIPOffersClick = () => {
    setCurrentOffer({
      title: "VIP Offers",
      description: "Unlock VIP rates and exclusive discounts when you book directly. Enjoy premium benefits!"
    });
  };

  const handleWeekendGetawayClick = () => {
    setCurrentOffer({
      title: "Weekend Getaway Package",
      description: "Enjoy a 10% discount on stays over the weekend, including breakfast for two. Plan your perfect weekend escape!"
    });
  };

  const handleRomanticEscapeClick = () => {
    setCurrentOffer({
      title: "Romantic Escape",
      description: "Celebrate love with a complimentary bottle of wine and chocolates in your room upon arrival when you book a two-night stay."
    });
  };

  return (
    <div className="text-background">
      <h1>News & Events</h1>
      <div className="event-item">
        <h2>
          <strong>Cultural Heritage Festival</strong>
        </h2>
        Celebrate our local culture with traditional dance performances, art
        exhibits, and craft workshops.
      </div>
      <div className="event-item">
        <h2>
          <strong>Outdoor Movie Night</strong>
        </h2>
        Enjoy a classic film under the stars in our garden. Bring your blankets
        and enjoy popcorn and snacks with family and friends.
      </div>
      <h1>Exceptional Discounts</h1>
      <h2>
        <strong>
          <button className="vip-link" onClick={handleVIPOffersClick}>
            VIP Offers
          </button>
        </strong>
      </h2>
      <h2>
        <strong>
          <button className="vip-link" onClick={handleWeekendGetawayClick}>
            Weekend Getaway Package
          </button>
        </strong>
      </h2>
      <h2>
        <strong>
          <button className="vip-link" onClick={handleRomanticEscapeClick}>
            Romantic Escape
          </button>
        </strong>
      </h2>
      {currentOffer && (
        <SpecialOfferPopup
          offer={currentOffer.title}
          description={currentOffer.description}
          onClose={() => setCurrentOffer(null)}
        />
      )}
      <h1>FAQs</h1>
      <h2>
        <strong>Check-in/Check-out</strong>
      </h2>
      <div className="event-item">After 3:00 PM , Before 12:00 PM.</div>
      <h2>
        <strong>Pets</strong>
      </h2>
      <div className="event-item">Only assistance animals allowed.</div>
      <h2>
        <strong>Fitness Center</strong>
      </h2>
      <div className="event-item">Exclusive for VIP guests.</div>
      <h2>
        <strong>Wi-Fi</strong>
      </h2>
      <div className="event-item">Complimentary for all guests.</div>
    </div>
  );
};


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    category: '',
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const validateForm = (name, value) => {
    switch (name) {
      case "name":
        if (value.trim() === "") return "Name is required";
        if (value.length > 50) return "Max 50 characters";
        return "";
      case "email":
        if (value.trim() === "") return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
        return "";
      case "message":
        if (value.trim() === "") return "Message is required";
        if (value.length < 20) return "Minimum 20 characters";
        if (value.length > 500) return "Maximum 500 characters";
        return "";
      case "category":
        if (!value || !['service', 'facility', 'billing', 'other'].includes(value)) return "Category is required.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;


    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


    const errorMessage = validateForm(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError("");

    const newErrors = Object.keys(formData).reduce((acc, key) => {
      acc[key] = validateForm(key, formData[key]);
      return acc;
    }, {});

    if (Object.values(newErrors).some(error => error)) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          category: formData.category,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (data.errors) {
          const backendErrors = Object.entries(data.errors).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value
          }), {});
          setErrors(backendErrors);
          return;
        }
        throw new Error(data.error || "Submission failed");
      }
  
      alert("Complaint submitted successfully!");
      setFormData({ name: "", email: "", message: "", category: '' });
      setErrors({});
  
    } catch (error) {
      console.error("Submission Error:", error);
      if (!error.message.includes("Validation")) {
        alert(error.message || "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="header">
        <h1>Contact Us</h1>
      </div>
      <div className="contact-info">
        <h2>Address</h2>
        <p>No.16-22 Jalan Alor, 50200 Kuala Lumpur, Malaysia.</p>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3180.000000000000000!2d101.70752555002214!3d3.1453263510836957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMy4xNDUzMjYzLCAxMDEuNzA3NTI1NQ!5e0!3m2!1sen!2s!4v1234567890123"
          title="map"
          width="100%"
          height="300rem"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      <div className="message-form">
        <h1>Send Us a Message</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Your Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? "error" : ""}
            >
              <option value="">Select a category</option>
              <option value="service">Service</option>
              <option value="facility">Facility</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="message">Your Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your message"
              className={errors.message ? "error" : ""}
            ></textarea>
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? <div className="loading-indicator"><span className="spinner"></span> Submitting</div> : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
};

import { useLocation } from "react-router-dom";
const HAC = () => {
  return (
    <div>
      <Home />
      <About />
      <ContactUs />
    </div>
  );
};

export default HAC;
