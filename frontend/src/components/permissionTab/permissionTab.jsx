import React, { useState } from 'react';
import CopyIcon from '../assets/copy.png'; 
import './permissionTab.css';
import Alert from '../alert/alert';

const PermissionTab = ({ isOwner, showModal, closeModal, noteID, fetchUserNotePermission, updateNotePermission }) => {
    const [targetUsername, setTargetUsername] = useState('');
    const [activeTab, setActiveTab] = useState('can_edit');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');

    const handleUsernameChange = (event) => {
        setTargetUsername(event.target.value);
    };

    const handleUpdatePermission = async (event) => {
        event.preventDefault();
        const permission = {
            can_view: true, 
            can_edit: activeTab === 'can_edit'
        };
        try {
            const response = await updateNotePermission(noteID, targetUsername, permission.can_view, permission.can_edit);
            if (response.status === 200) {
                fetchUserNotePermission(); // Refresh permissions list
                setAlertMessage('Permissions updated successfully.');
                setAlertType('success');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            setAlertMessage(error.response.data.errors[0].msg);
            setAlertType('error');
        }
    };

    const toggleTab = (tab) => {
        setActiveTab(tab);
    };

    const handleCopyUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setAlertMessage('URL copied to clipboard!');
            setAlertType('success');
        }).catch((err) => {
            console.error('Error copying URL: ', err);
            setAlertMessage('Failed to copy URL.');
            setAlertType('error');
        });
    };

    return (
        showModal && (
            <div className="modal" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Note Permission</h3>
                    <span className="close" onClick={closeModal}>&times;</span>
                    <div className="tabs">
                        <div className={`tab-link ${activeTab === "can_edit" ? "active" : ""}`} onClick={() => toggleTab("can_edit")}>Can Edit</div>
                        <div className={`tab-link ${activeTab === "can_view" ? "active" : ""}`} onClick={() => toggleTab("can_view")}>Can View</div>
                    </div>
                    <form onSubmit={handleUpdatePermission}>
                        {activeTab === "can_edit" && <label> Assign edit permission to the following user
                            <input
                                type="text"
                                placeholder="username"
                                value={targetUsername}
                                onChange={handleUsernameChange}
                                required
                            />
                        </label>}
                        {activeTab === "can_view" && <label> Assign view permission to the following user
                            <input
                                type="text"
                                placeholder="username"
                                value={targetUsername}
                                onChange={handleUsernameChange}
                                required
                            />
                        </label>}
                        <div className="btn-grp">
                            <button type="submit" className="update-btn">Update Permissions</button>
                            <button type="button" className="copy-url-button" onClick={handleCopyUrl}>
                                <img src={CopyIcon} alt="Copy URL" /> Copy Note URL
                            </button>
                        </div>
                    </form>
                </div>
                {alertMessage && (
                    <Alert 
                        message={alertMessage} 
                        type={alertType} 
                        onClose={() => setAlertMessage('')} 
                    />
                )}
            </div>
        )
    );
};

export default PermissionTab;