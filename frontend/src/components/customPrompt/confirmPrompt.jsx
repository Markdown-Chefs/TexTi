
import './confirmPrompt.css';

const ConfirmPrompt = ({ open, onClose, onConfirm,  child }) => {
  
    if (!open) return null;
    
    return (
      <div className="confirm-prompt-overlay">
        <div className="confirm-prompt">
          <h2>{child}</h2>
          <div className="confirm-prompt-actions">
            <button onClick={onClose}>Cancel</button>
            <button onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmPrompt