import React, { useState, useRef } from 'react';
import '../styles/DealsPopup.css';

const ComplaintPopup = ({ onClose }) => {
  // Center horizontally and vertically
  const popupWidth = 400; // width in px
  const popupHeight = 200; // height in px
  const initialX = (window.innerWidth - popupWidth) / 2;
  const initialY = (window.innerHeight - popupHeight) / 2;
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true); // for fade
  const popupRef = useRef(null);

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

  // Auto-close after 3 seconds with fade out
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(), 400); // match CSS transition
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

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
      className={`popup-overlay${visible ? '' : ' popup-fade-out'}`}
      style={{ cursor: isDragging ? 'grabbing' : 'default', userSelect: 'none' }}
    >
      <div 
        ref={popupRef}
        className={`popup-content complaint-popup${visible ? '' : ' popup-fade-out'}`}
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
          <button 
            onClick={() => {
              setVisible(false);
              setTimeout(() => onClose(), 400);
            }} 
            className="close-button"
            aria-label="Close popup"
          >
            ✘
          </button>
        </div>
        <div className="title-container">
          <h2>Complaint Submitted</h2>
        </div>
        <div className="complaint-content">
          <p>✅ Your complaint has been submitted successfully!<br/>Thank you for your feedback.</p>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPopup;
