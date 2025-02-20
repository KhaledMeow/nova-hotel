import React, { useState } from "react";
import "../styles/HAC.css";
import "../styles/SweetAlertCustom.css";
import SpecialOfferPopup from '../components/SpecialOfferPopup';

// Home Section
const Home = () => {
  return (
    <div className="main-content">
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

// Features Data
const featuresData = [
  {
    title: "Exquisite Accommodations",
    description:
      "Immerse yourself in a seamless blend of comfort and elegance in our beautifully designed rooms, where every detail has been thoughtfully crafted to offer a refined and relaxing experience.",
    backgroundColor: "#ffffff",
  },
  {
    title: "Gourmet Dining",
    description:
      "Savor an extraordinary dining experience with exquisite culinary creations, expertly crafted by our renowned chefs, using the finest ingredients.",
    backgroundColor: "#ffffff",
  },
  {
    title: "Outstanding Service",
    description:
      "Our dedicated team is passionately committed to providing exceptional hospitality, ensuring personalized service and attention to every detail throughout your stay.",
    backgroundColor: "#ffffff",
  },
];

const galleryImages = [
  require("../assets/images/photo1.jpg"),
  require("../assets/images/photo2.jpg"),
  require("../assets/images/photo3.jpg"),
];

// About Section
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
      <p>
        <h2>
          <strong>Cultural Heritage Festival</strong>
        </h2>
        Celebrate our local culture with traditional dance performances, art
        exhibits, and craft workshops.
      </p>
      <p>
        <h2>
          <strong>Outdoor Movie Night</strong>
        </h2>
        Enjoy a classic film under the stars in our garden. Bring your blankets
        and enjoy popcorn and snacks with family and friends.
      </p>
      <h1>Exceptional Discounts</h1>
      <h2>
        <strong>
          <span className="vip-link" onClick={handleVIPOffersClick}>
            VIP Offers
          </span>
        </strong>
      </h2>
      <h2>
        <strong>
          <span className="vip-link" onClick={handleWeekendGetawayClick}>
            Weekend Getaway Package
          </span>
        </strong>
      </h2>
      <h2>
        <strong>
          <span className="vip-link" onClick={handleRomanticEscapeClick}>
            Romantic Escape
          </span>
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
      <p>After 3:00 PM , Before 12:00 PM.</p>
      <h2>
        <strong>Pets</strong>
      </h2>
      <p>Only assistance animals allowed.</p>
      <h2>
        <strong>Fitness Center</strong>
      </h2>
      <p>Exclusive for VIP guests.</p>
      <h2>
        <strong>Wi-Fi</strong>
      </h2>
      <p>Complimentary for all guests.</p>
    </div>
  );
};

// Contact Us Section
const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const validateForm = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Name is required" : "";
      case "email":
        if (value.trim() === "") return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Invalid email address" : "";
      case "message":
        return value.trim() === "" ? "Message is required" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate and update errors
    const errorMessage = validateForm(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMessage = validateForm(key, formData[key]);
      if (errorMessage) {
        newErrors[key] = errorMessage;
      }
    });

    // Update errors
    setErrors(newErrors);

    // Check if form is valid
    if (Object.values(newErrors).some((error) => error !== "")) {
      alert("Please correct the errors before submitting");
      return;
    }

    try {
      const response = await fetch("http://localhost:5432/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.errors) {
          setErrors(data.errors);
          alert(Object.values(data.errors).join(", "));
          return;
        }
        throw new Error(data.message || "Failed to send message");
      }

      // Success
      alert("Complaint Submitted: Thank you for your message. We will get back to you soon!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      setErrors({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "Failed to send message. Please try again.");
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

          <button type="submit" className="submit-button">
            Submit 
          </button>
        </form>
      </div>

      <div className="key-persons">
        <h3>Examples</h3>
        <ul>
          <li className="key-person">
            Name: <strong>Khaled Xo</strong> - CEO
          </li>
          <li className="key-person">Email: kal.xo@example.com</li>
          <li className="key-person">
            Name: <strong>Maya Xin</strong> - Manager
          </li>
          <li className="key-person">Email: maya.xin@example.com</li>
        </ul>
      </div>
    </section>
  );
};

// Main HAC Component
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
