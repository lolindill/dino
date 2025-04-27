// TipPopup.jsx
import React from 'react';
import tipImage from './image/tip.jpg'; 

function TipPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="tip-popup-overlay">
      <div className="tip-popup-container">
        <button className="tip-popup-close" onClick={onClose} aria-label="Close Tip">×</button>
        <img src={tipImage} alt="Tip" className="tip-popup-image" />
      </div>
    </div>
  );
}

export default TipPopup;
