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
import PermissionIcon from "../assets/file-lock-2.png"
import CopyIcon from "../assets/copy.png"
import PermissionsTab from '../permissionTab/permissionTab';
import PublishIcon from "../assets/published.png"



const EditorNavbar = ( {noteTitle="", setMode, trial, canEdit, isOwner, fetchUserNotePermission, handleExporting, isAPublicNote, handlePublishNote, handleUnpublishNote}) => {

    const [activeMode, setActiveMode] = useState('both');
    const { noteID } = useParams();
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
            <div className="note-Title"> {noteTitle} </div>
        </>
        }
        <div className = "buttons">
            <button 
                    className={`mode-button ${activeMode === 'edit' ? 'active' : ''}`} 
                    onClick={() => handleModeClick('edit')}
                >
                    <img src={Edit} alt="Editor Mode" />
                    <div className="tooltipp">Editor Only</div>
            </button>
            <button 
                className={`mode-button ${activeMode === 'both' ? 'active' : ''}`} 
                onClick={() => handleModeClick('both')}
            >
                <img src={BothIcon} width="20px"alt="Both Mode" />
                <div className="tooltipp">Editor + Previewer</div>
            </button>
            <button 
                className={`mode-button ${activeMode === 'preview' ? 'active' : ''}`} 
                onClick={() => handleModeClick('preview')}
            >
                <img src={Preview} alt="Preview Mode" />
                <div className="tooltipp">Previewer Only</div>
            </button>
            <div className="dropdown-button">
                <button className="export-button" type="button" onClick={toggleMenu}>
                    <img src={ExportIcon} alt="Export" />
                    <div className="tooltipp"> Export Note</div>
                </button>
                {showMenu && (
                    <ul className="dropdown-menu show">
                        <div className="dropdown-menu-header">Export to</div>
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("pdf")}>PDF</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("markdown")}>Markdown</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("styledhtml")}>HTML</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => handleExportAndHideMenu("rawhtml")}>Raw HTML</a></li>
                    </ul>
                )}
            </div>
            <button className="permission-button" onClick={handlePermissionButtonClick}> 
            <img src={PermissionIcon} alt="Note Permission" /> 
            <div className="tooltipp"> Share Note </div>
            </button>
            <PermissionsTab
            isOwner={isOwner}
            showModal={showModal}
            closeModal={closeModal}
            noteID={noteID}
            fetchUserNotePermission={fetchUserNotePermission}
            updateNotePermission={updateNotePermission}
            />
            {isOwner && !isAPublicNote && <button className="publish-button" onClick={handlePublishNote}>
                <img src={PublishIcon} alt = "Publish Icon"></img>
                <div className="tooltipp"> Publish Note</div>
                </button>}
            {isOwner && isAPublicNote && <button className="publish-button unpublish-button" onClick={handleUnpublishNote}> 
                <img src={PublishIcon} alt = "Publish Icon"></img>
                <div className="tooltipp"> Unpublish Note</div>
            </button>}
        </div>
    </div>
    
    );
};

export default EditorNavbar;