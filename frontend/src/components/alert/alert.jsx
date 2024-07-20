import './alert.css';
import { useEffect } from 'react';
import success from './../assets/Checkboxes.png'
import error from './../assets/error.png'

const Alert = ({ message, type, onClose}) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, 3000, onClose]);

    if (!message) return null;

    return (
        <div className={`alert ${type}`}>
             <img src={ type === 'error' ? error : success } alt={type} className={`alert-icon ${type}`}/>
            {message}
            <span className="close-btn" onClick={onClose}>×</span>
        </div>
    );
};

export default Alert;
