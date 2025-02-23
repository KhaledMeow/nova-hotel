import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RoomList.css";
import "../styles/SweetAlertCustom.css";

const rooms = [
  {
    id: 1,
    name: "One Bedded Room",
    description: "Elegant rooms with one queen or king bed.",
    type: "Superior Queen",
    amenities: [
      "Luxurious Bathroom with Standing Shower",
      "Touch Panel Variable Lighting and Blind Controls",
      "Complimentary Bottled Water and Welcome Snack",
      "Nespresso Machine",
    ],
    image: require("../assets/images/Suite-4.jpg"),
    price: "249",
  },
  {
    id: 2,
    name: "Deluxe Suite",
    description: "Spacious suite with separate living and bedroom areas.",
    type: "Deluxe King Suite",
    amenities: [
      "Separate Living Area",
    
      "Complimentary Mini-bar",
      "Private Balcony with City View",
      "50-inch LED TV with Premium Channels",
    ],
    image: require("../assets/images/OneBeddedRoom.jpg"),
    price: "349",
  },
  {
    id: 3,
    name: "Family Room",
    description: "A large room perfect for family stays, with two queen beds.",
    type: "Family Suite",
    amenities: [
      "One Queen Bed and 2 Single beds",
      "Complimentary Crib Upon Request",
      "Child-friendly Room Setup",
      "In-room Entertainment System",
      "Spacious Bathroom with Tub",
    ],
    image: require("../assets/images/FamilySuite.jpg"),
    price: "999",
  },
  {
    id: 4,
    name: "Penthouse Suite",
    description:
      "Luxury penthouse with panoramic views and exclusive amenities.",
    type: "Penthouse King",
    amenities: [
      "Private Rooftop Terrace",
      "Outdoor Jacuzzi",
      "Butler Service",
      "Full Kitchen",
      "Panoramic City Views",
      "Exclusive Access to Executive Lounge",
    ],
    image: require("../assets/images/penthouse-suite.jpg"),
    price: "1499",
  },
  {
    id: 5,
    name: "VIP Offers",
    description: "Experience luxury at its finest with our exclusive VIP package.",
    type: "VIP Room",
    amenities: [
      "Priority Check-in and Check-out",
      "Complimentary Airport Transfer",
      "Access to Executive Lounge",
      "Daily Breakfast Buffet",
      "Evening Cocktails and Canapés",
      "Late Check-out Subject to Availability"
    ],
    image: require('../assets/images/VIPRoom.jpg'),
    price: "499",
  },
  {
    id: 6,
    name: "Weekend Getaway Package",
    description: "Make the most of your weekend with our special getaway package.",
    type: "Weekend Package",
    amenities: [
      "2 Nights Stay in Deluxe Room",
      "Breakfast for Two",
      "Welcome Drink on Arrival",
      "Access to Pool and Fitness Center",
      "Sunday Brunch Included",
      "20% Off on Spa Treatments"
    ],
    image: require('../assets/images/WeekendGetaway.jpg'),
    price: "399",
  },
  {
    id: 7,
    name: "Romantic Escape",
    description: "Create unforgettable moments with our romantic package.",
    type: "Romantic Room",
    amenities: [
      "Luxury Room with Ocean View",
      "Champagne and Chocolate-covered Strawberries",
      "Candlelit Dinner for Two",
      "Couples Spa Treatment",
      "Rose Petal Turndown Service",
      "Late Check-out until 2 PM"
    ],
    image: require('../assets/images/RomanticEscape.jpg'),
    price: "449",
  },
];

const RoomList = () => {
  const navigate = useNavigate();
  

  const handleBookNowClick = (room) => {
    navigate("/Confirm-details", { state: {
      selectedRoom: room
    } });
  };

  return (
    <div className="room-list-page">
      <div className="room-list-container">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <div className="room-image">
              <img src={room.image} alt={room.name} />
            </div>
            <div className="room-info">
              <h2>{room.name}</h2>
              <p>
                <strong>{room.type}</strong>
              </p>
              <ul>
                {room.amenities.map((amenity, idx) => (
                  <li key={idx}>{amenity}</li>
                ))}
              </ul>
              <div className="room-price">
                {(room.type.toLowerCase().includes('penthouse') || 
                  room.type.toLowerCase().includes('family')) ? (
                  <>
                    <span className="original-price">${room.price}</span>
                    <span className="discounted-price">${Math.round(room.price * 0.8)} per night</span>
                    <span className="discount-badge">20% OFF</span>
                  </>
                ) : (
                  <span className="regular-price">${room.price} per night</span>
                )}
              </div>
              <button
                className="book-button"
                onClick={() => handleBookNowClick(room)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
