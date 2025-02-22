import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DealsPopup.css';

const DealsPopup = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 100, y: window.innerHeight / 2 - 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseDown = (e) => {
    if (e.target.tagName.toLowerCase() === 'button') return;
    setIsDragging(true);
    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep popup within window bounds
    const maxX = window.innerWidth - popupRef.current.offsetWidth;
    const maxY = window.innerHeight - popupRef.current.offsetHeight;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDealsClick = () => {
    if (!isDragging) {
      navigate('/Calendar');
      onClose();
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="popup-overlay"
      style={{ 
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none'
      }}
    >
      <div 
        ref={popupRef}
        className="popup-content deals-popup"
        style={{ 
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          borderLeft: '4px solid var(--primary)',
          borderRight: '4px solid var(--primary)'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="popup-header">
          <div className="title-container">
            <h2>Special Deals</h2>
          </div>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Close popup"
          >
            ✘
          </button>
        </div>
        <div 
          className="deals-content" 
          onClick={handleDealsClick}
          style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
        >
          <p>🌟 Book now and get 20% off on Family and Penthouse suites!<br/><br/>
             🎉 Free spa access with 3+ nights stay</p>
              
          <p className="view-deals">Click to view all deals →</p>
        </div>
      </div>
    </div>
  );
};

export default DealsPopup;
