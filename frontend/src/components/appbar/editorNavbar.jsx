import TexTiLogo from '../assets/TexTi-logo.jpg'
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import BothIcon from '../assets/Both Icon.png';
import Preview from '../assets/eye.png';
import Edit from "../assets/edit-3.png";
import './editorNavbar.css'
import { updateNotePermission } from '../../api/notes';
import { useParams } from "react-router-dom";
import LockIcon from "../assets/lock.png";
import EditIcon from "../assets/edit.png";
import ExportIcon from "../assets/share.png";
import PermissionIcon from "../assets/permission.png"
import CopyIcon from "../assets/copy.png"
import PermissionsTab from '../permissionTab/permissionTab';



const EditorNavbar = ( {noteTitle="", setMode, trial, canEdit, isOwner, fetchUserNotePermission, handleExporting}) => {

    const [activeMode, setActiveMode] = useState('both');
    const { noteID } = useParams();
    const [targetUsername, setTargetUsername] = useState('');
    const [permission, setPermission] = useState({ can_view: false, can_edit: false });
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
   
    const handleModeClick = (mode) => {
        setActiveMode(mode);
        setMode(mode);
        console.log(`Switched to ${mode} mode`);
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleExportAndHideMenu = (format) => {
        handleExporting(format);
        setShowMenu(false); 
    };


    const handlePermissionButtonClick = () => {
        if (isOwner) {
            setShowModal(true);
        } else {
            alert("You don't have permission to do this.");
        }
        
    };


    const closeModal = () => {
        setShowModal(false);
    };

    return (
    <div className="editor-navbar">
        <div className="editor-navbar-brand">
            <img src={TexTiLogo} alt="Logo" />
            <span className='productName'>TexTi</span>
        </div>
        {trial == 'false' && 
        <>
            {canEdit && !isOwner &&
            <div className='permission'> 
                 <img src={EditIcon} alt="Edit"></img> 
                 Edit </div>
            }
             {!canEdit && 
            <div className='permission'> 
                <img src={LockIcon} alt="View Only"></img> 
                View Only </div>
            }
            <div className="note-title"> {noteTitle} </div>
        </>
        }
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
            <div className="dropdown-button">
                <button className="export-button" type="button" onClick={toggleMenu}>
                    <img src={ExportIcon} alt="Export" />
                </button>
                {showMenu && (
                    <ul className="dropdown-menu show">
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("markdown")}>Markdown</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("styledhtml")}>HTML</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("rawhtml")}>Raw HTML</a></li>
                    </ul>
                )}
            </div>
        <button className="permission-button" onClick={handlePermissionButtonClick}> 
            <img src={PermissionIcon} alt="Note Permission" /> 
        </button>
       
        <PermissionsTab
        isOwner={isOwner}
        showModal={showModal}
        closeModal={closeModal}
        noteID={noteID}
        fetchUserNotePermission={fetchUserNotePermission}
        updateNotePermission={updateNotePermission}
        />

        </div>
    </div>
    );
};

export default EditorNavbar;