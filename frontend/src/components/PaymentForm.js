import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PaymentForm.css';

const PaymentForm = ({ 
  room, 
  checkInDate, 
  checkOutDate, 
  onSuccess, 
  onError 
}) => {
  const navigate = useNavigate();

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1; // Default to 1 night
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    // Calculate difference in days and subtract 1 to get actual nights
    const timeDiff = end.getTime() - start.getTime();
    const nights = Math.max(1, Math.floor(timeDiff / (1000 * 3600 * 24)));
    
    return nights;
  };

    const nights = calculateNights();
  const totalPrice =(room.price * nights).toFixed(2);

  useEffect(() => {
    console.log('Room:', room._id);
    console.log('Room Price:', room.price);
    console.log('Room Price Type:', typeof room.price);
    console.log('Nights:', nights);
    console.log('Total Price:', Number(room.price) * nights);
  }, [room, nights]);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Test payment validation
  const validateCardNumber = (number) => {
    const testCardNumbers = [
      '4111111111111111',  // Visa
      '5500000000000004',  // Mastercard
      '3400000000000009',  // AMEX
      '6011000000000004'   // Discover
    ];
    return testCardNumbers.includes(number.replace(/\s/g, ''));
  };

  const validateExpiryDate = (date) => {
    return true;
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const isCardNumberValid = validateCardNumber(cardNumber);
    const isExpiryValid = validateExpiryDate(expiryDate);
    const isCVVValid = validateCVV(cvv);

    if (!isCardNumberValid) {
      alert('Please use a test card number');
      setProcessing(false);
      return;
    }

    if (!isExpiryValid) {
      alert('Please use a valid test expiry date');
      setProcessing(false);
      return;
    }

    if (!isCVVValid) {
      alert('Please use a 3 or 4 digit test CVV');
      setProcessing(false);
      return;
    }

    try {
      // Keep your existing simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentResult = paymentGatewaySimulation();
  
      if (paymentResult.success) {
        // Only call backend if simulation succeeds
        const response = await fetch('/api/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            bookingId: bookingData._id,
            method: 'mock'
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Payment recording failed');
        }
  
        const paymentData = await response.json();
        setPaymentSuccess(true);
        onSuccess(paymentData);
      } else {
        alert(paymentResult.message);
        onError(paymentResult.message);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };
  const paymentGatewaySimulation = () => {
    const scenarios = [
      { success: true, message: 'Payment Successful' },
      { success: true, message: 'Payment Processed' },
      { success: true, message: 'Payment Successful' },
      { success: true, message: 'Payment Processed' },
      { success: false, message: 'Payment Failed - Please try again' }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="confirmation-header">
          <h2>Booking Confirmation</h2>
          <p className="confirmation-number">Confirmation #: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
        
        <div className="confirmation-content">
          <div className="confirmation-section">
            <h3>Stay Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Check-in Date</span>
                <span className="detail-value">{checkInDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check-out Date</span>
                <span className="detail-value">{checkOutDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Length of Stay</span>
                <span className="detail-value">{calculateNights()} Night(s)</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Number of Guests</span>
                <span className="detail-value">{room.num_of_people || '1'}</span>
              </div>
            </div>
          </div>

          {room.special_requests && (
            <div className="confirmation-section">
              <h3>Special Requests</h3>
              <div className="special-requests">
                <p>{room.special_requests}</p>
              </div>
            </div>
          )}

          <div className="confirmation-section price-summary">
            <h3>Price Summary</h3>
            <div className="price-details">
              <div className="price-row">
                <span>Room Rate ({calculateNights()} Night(s))</span>
                <span>${room.price} × {calculateNights()}</span>
              </div>
              <div className="price-row total">
                <span>Total Amount</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-footer">
          <p className="thank-you">Thank you for choosing Nova Hotel</p>
          <button 
            onClick={() => {
              onSuccess && onSuccess();
              navigate('/', { replace: true });
            }} 
            className="home-btn"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} >
      <h2>Payment for {room.type} Room</h2>
      <p>{calculateNights()} Night(s) at {room.price}/night</p>
      
      <div className="form-row">
        <label>
          Cardholder Name
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            required
            minLength="3"
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Card Number
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1111 1111 1111 1111"
            required
            pattern="[0-9\s]+"
            maxLength="19"
          />
        </label>
      </div>
      
      <div className="form-row">
        <label>
          Expiry Date
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="MM/YY"
            required
            pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
            maxLength="5"
          />
        </label>
        
        <label>
          CVV
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="123"
            required
            pattern="[0-9]{3,4}"
            maxLength="4"
          />
        </label>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        type="submit" 
        disabled={processing}
        className="payment-button"
      >
        {processing ? 'Processing...' : 'Pay $' + Math.floor(room.price.replace(/\$/g, '')*nights) }
      </button>
    </form>
  );
};

export default PaymentForm;
