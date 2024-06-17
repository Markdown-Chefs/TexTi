import TexTiLogo from '../assets/TexTi-logo.jpg'
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import BothIcon from '../assets/Both Icon.png';
import Preview from '../assets/eye.png';
import Edit from "../assets/edit-3.png";
import './editorNavbar.css'
import { updateNotePermission } from '../../api/notes';
import { useParams } from "react-router-dom";


const EditorNavbar = ( {setMode, trial, fetchUserNotePermission}) => {

    const [activeMode, setActiveMode] = useState('both');
    const { noteID } = useParams();
    const [targetUsername, setTargetUsername] = useState('');
    const [permission, setPermission] = useState({ can_view: false, can_edit: false });
   
    const handleModeClick = (mode) => {
        setActiveMode(mode);
        setMode(mode);
        console.log(`Switched to ${mode} mode`);
    };

    const handlePermissionChange = (event) => {
        const { name, checked } = event.target;
        setPermission(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const handleUsernameChange = (event) => {
        setTargetUsername(event.target.value);
    };

    
    const handleUpdatePermission = async (event) => {
        event.preventDefault();
        try {
            const response = await updateNotePermission(noteID, targetUsername, permission.can_view, permission.can_edit);
            if (response.status === 200) {
                fetchUserNotePermission(); // Refresh permissions list
                alert('Permissions updated successfully.');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert('Failed to update permissions.');
        }
    };
    

    return (
    <div className="editor-navbar">
        <div className="editor-navbar-brand">
            <img src={TexTiLogo} alt="Logo" />
            <span className='productName'>TexTi</span>
        </div>
        {trial == 'false' && 
        <>
            <form onSubmit={handleUpdatePermission}>
            <input
                type="text"
                placeholder="Username to share with"
                value={targetUsername}
                onChange={handleUsernameChange}
                required
            />
            <label>
                <input
                    type="checkbox"
                    name="can_view"
                    checked={permission.can_view}
                    onChange={handlePermissionChange}
                />
                Can View
            </label>
            <label>
                <input
                    type="checkbox"
                    name="can_edit"
                    checked={permission.can_edit}
                    onChange={handlePermissionChange}
                />
                Can Edit
            </label>
            <button type="submit">Update Permissions</button>
        </form> </>}
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