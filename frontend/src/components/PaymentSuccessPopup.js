import React from 'react';
import '../styles/PaymentSuccessPopup.css';

const PaymentSuccessPopup = ({ onClose }) => {
  return (
    <div className="payment-success-overlay" onClick={onClose}>
      <div className="payment-success-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Payment Successful!</h2>
        <p className="success-description">Thank you for your payment. Your booking is confirmed and a receipt has been sent to your email.</p>
        <button className="home-btn" onClick={onClose}>Return to Homepage</button>
      </div>
    </div>
  );
};

export default PaymentSuccessPopup;
