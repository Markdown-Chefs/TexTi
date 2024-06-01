import React, { useState } from 'react';
import './customPrompt.css';

const CustomPrompt = ({ open, onClose, onConfirm,  child, placeHolder }) => {
    const [noteTitle, setNoteTitle] = useState('');
  
    if (!open) return null;
  
    const handleConfirm = () => {
      onConfirm(noteTitle);
      setNoteTitle('');
    };
  
    return (
      <div className="custom-prompt-overlay">
        <div className="custom-prompt">
          <h2>{child}</h2>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder={placeHolder}
          />
          <div className="custom-prompt-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleConfirm}>OK</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default CustomPrompt;