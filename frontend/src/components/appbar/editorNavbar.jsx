import TexTiLogo from '../assets/TexTi-logo.jpg'
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import BothIcon from '../assets/Both Icon.png';
import Preview from '../assets/eye.png';
import Edit from "../assets/edit-3.png";
import './editorNavbar.css'

const EditorNavbar = ( {setMode }) => {

    const [activeMode, setActiveMode] = useState('both');

    const handleModeClick = (mode) => {
        setActiveMode(mode);
        setMode(mode);
        console.log(`Switched to ${mode} mode`);
    };

    return (
    <div className="editor-navbar">
        <div className="editor-navbar-brand">
            <img src={TexTiLogo} alt="Logo" />
            <span className='productName'>TexTi</span>
        </div>
        <div className = "buttons">
            <button 
                    className={`mode-button ${activeMode === 'edit' ? 'active' : ''}`} 
                    onClick={() => handleModeClick('edit')}
                >
                    <img src={Edit} alt="Editor Mode" />
            </button>
            <button 
                className={`mode-button ${activeMode === 'both' ? 'active' : ''}`} 
                onClick={() => handleModeClick('both')}
            >
                <img src={BothIcon} width="20px"alt="Both Mode" />
            </button>
            <button 
                className={`mode-button ${activeMode === 'preview' ? 'active' : ''}`} 
                onClick={() => handleModeClick('preview')}
            >
                <img src={Preview} alt="Preview Mode" />
            </button>
        </div>
    </div>
    );
};

export default EditorNavbar;