import React from 'react';
import '../styles/SpecialOfferPopup.css';

const SpecialOfferPopup = ({ offer, onClose }) => {
  const offerDetails = {
    'VIP Offers': {
      title: 'VIP Offers',
      description: 'Experience luxury at its finest with our exclusive VIP package.',
      benefits: [
        'Priority Check-in and Check-out',
        'Complimentary Airport Transfer',
        'Access to Executive Lounge',
        'Daily Breakfast Buffet',
        'Evening Cocktails and Canapés',
        'Late Check-out Subject to Availability'
      ],
      price: 'Starting from $499 per night'
    },
    'Weekend Getaway Package': {
      title: 'Weekend Getaway Package',
      description: 'Make the most of your weekend with our special getaway package.',
      benefits: [
        '2 Nights Stay in Deluxe Room',
        'Breakfast for Two',
        'Welcome Drink on Arrival',
        'Access to Pool and Fitness Center',
        'Sunday Brunch Included',
        '20% Off on Spa Treatments'
      ],
      price: 'Starting from $399 per weekend'
    },
    'Romantic Escape': {
      title: 'Romantic Escape',
      description: 'Create unforgettable moments with our romantic package.',
      benefits: [
        'Luxury Room with Ocean View',
        'Champagne and Chocolate-covered Strawberries',
        'Candlelit Dinner for Two',
        'Couples Spa Treatment',
        'Rose Petal Turndown Service',
        'Late Check-out until 2 PM'
      ],
      price: 'Starting from $449 per night'
    }
  };

  const currentOffer = offerDetails[offer];

  if (!currentOffer) return null;

  return (
    <div className="special-offer-overlay" onClick={onClose}>
      <div className="special-offer-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>{currentOffer.title}</h2>
        <p className="offer-description">{currentOffer.description}</p>
        
        <div className="benefits-section">
          <h3>Package Includes:</h3>
          <ul>
            {currentOffer.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
        
        <div className="price-section">
          <p className="price">{currentOffer.price}</p>
          <button className="book-now-button" onClick={() => window.location.href = '/Calendar'}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferPopup;
