import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// import { fetchProtectedInfo, onLogout } from "../api/auth";
import { onLogout } from "../../api/auth";
import { fetchListOfNotes, onCreateNote, onDeleteNote, updateNotePermission, onPinNote, updateNoteContent } from "../../api/notes";
import { fetchListOfFolders, onCreateFolder, onDeleteFolder } from "../../api/folders";
import { unAuthenticateUser } from "../../redux/slices/authSlice";
import "./dashboard.css"
import Navbar from "../../components/navbar/navbar";
import CustomPrompt from "../../components/customPrompt/customPrompt";
import ConfirmPrompt from "../../components/customPrompt/confirmPrompt";
import newIcon from "../../components/assets/file-plus-2.png";
import chevronDown from "../../components/assets/chevron-down.png"
import fileIcon from "./../../components/assets/File_dock_fill.png"
import pinIcon from "./../../components/assets/Pin_fill.png"
import publishIcon from "./../../components/assets/published.png"
import plusIcon from "./../../components/assets/plus-circle.png"
import importIcom from "./../../components/assets/import.png"
import trashIcon from "./../../components/assets/trash-2.png"
import pinIcon2 from "./../../components/assets/pin.png"
import unpinIcon from "./../../components/assets/pin-off.png"
import Loading from "../loading/loading"
import ShortLoading from "../loading/shortloading";
import newFolder from "./../../components/assets/folder-plus.png"
import BackIcon from "./../../components/assets/arrow-left-circle.png"


function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // const [protectedData, setProtectedData] = useState(null);
    const [listOfNotes, setListOfNotes] = useState([]); // [{note_id: 1, title: 'example'}, ...]
    const [listOfFolders, setListOfFolders] = useState([]); // [{folder_id: 1, folder_name: 'example', created_at: DATE}, ...]
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(-1);
    const [selectedFolderIndex, setSelectedFolderIndex] = useState(-1);
    const [isNotePromptOpen, setIsNotePromptOpen] = useState(false);
    const [isFolderPromptOpen, setIsFolderPromptOpen] = useState(false);
    const [isConfirmPromptOpen, setIsConfirmPromptOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [newNoteMenu, setNewNoteMenu] = useState(false);

    const handleOpenNotePrompt = () => {
        setIsNotePromptOpen(true);
    };
  
    const handleCloseNotePrompt = () => {
        setIsNotePromptOpen(false);
    };

    const handleCreateNoteConfirmPrompt = (noteTitle) => {
        createNote(noteTitle);
        setIsNotePromptOpen(false);
        setNewNoteMenu(false);
    };

    const handleDeleteNoteConfirmPrompt = () => {
        if (selectedNoteIndex !== -1 && listOfNotes[selectedNoteIndex]) {
            deleteNote();
        } else {
            deleteFolder();
        }
        setIsConfirmPromptOpen(false);
    }

    const handleOpenConfirmPrompt = () => {
        setIsConfirmPromptOpen(true);
    };
  
      const handleCloseConfirmPrompt = () => {
        setIsConfirmPromptOpen(false);
    };

    const toggleMenu = () => {
        setNewNoteMenu(!newNoteMenu);
    }

    const getSelectedNoteTitleOrFolderTitle = () => {
        if (selectedNoteIndex !== -1 && listOfNotes[selectedNoteIndex]) {
            return "note: " + listOfNotes[selectedNoteIndex].title;
        } else if (selectedFolderIndex !== -1 && listOfFolders[selectedFolderIndex]) {
            return "folder: " + listOfFolders[selectedFolderIndex].folder_name;
        }
        return "";
    }
  
    const logout = async () => {
        try {
            await onLogout();
            dispatch(unAuthenticateUser());
            localStorage.removeItem('isAuth');
            localStorage.removeItem('userInfo');
        } catch (error) {
            console.log(error.response);
        }
    }

    const createFolder = async (folder_name) => {
        try {
            if (folder_name) {
                const response = await onCreateFolder(folder_name, null);
                if (response.status === 201) {
                    setListOfFolders([...listOfFolders, response.data.folderCreated]);
                    setSelectedNoteIndex(-1);
                    setSelectedFolderIndex(-1);
                    return response;
                }
            } else {
                alert("Folder's name cannot be empty!");
            }
        } catch (error) {
            console.log(error.response);
        }
    }

    const handleOpenFolderPrompt = () => {
        setIsFolderPromptOpen(true);
    }

    const handleCloseFolderPrompt = () => {
        setIsFolderPromptOpen(false);
    }

    const handleCreateFolderConfirmPrompt = (folderTitle) => {
        createFolder(folderTitle);
        setIsFolderPromptOpen(false);
    }

    const deleteFolder = async () => {
        try {
            if (selectedFolderIndex !== -1) {
                const response = await onDeleteFolder(listOfFolders[selectedFolderIndex].folder_id);
                setSelectedNoteIndex(-1);
                setSelectedFolderIndex(-1);
                if (response.status === 200) {
                    listOfUserFolders();
                }
            }
        } catch (error) {
            console.log(error.response);
            alert(error.response.data.error);
        }
    }

    const createNote = async (title) => {
        try {
            const response = await onCreateNote(title, null);
            // console.log(response);
            if (response.status === 201) {
                setListOfNotes([...listOfNotes, response.data.noteCreated]);
                setSelectedNoteIndex(-1);
                setSelectedFolderIndex(-1);
                return response;
            }
        } catch (error) {
            alert(error.response.data.errors[0].msg);
            return error.response.data.errors[0].msg;
        }
    }

    const deleteNote = async () => {
        try {
            if (selectedNoteIndex !== -1) {
                const response = await onDeleteNote(listOfNotes[selectedNoteIndex].note_id, listOfNotes[selectedNoteIndex].title);
                setSelectedNoteIndex(-1);
                setSelectedFolderIndex(-1);
                
                if (response.status === 200) {
                    listOfUserNotes();
                }
            }
        } catch (error) {
            console.log(error);
            alert(error.response.data.errors[0].msg);
        }
    }

    const handlePinNote = async () => {
        if (selectedNoteIndex !== -1) {
            try {
                const response = listOfNotes[selectedNoteIndex].pin_by_owner
                    ? await onPinNote(listOfNotes[selectedNoteIndex].note_id, false)
                    : await onPinNote(listOfNotes[selectedNoteIndex].note_id, true);
                if (response.status === 200) {
                    listOfUserNotes();
                }
            } catch (error) {
                alert(error.response.data.errors[0].msg);
            }
        }
    }

    const handleImportNoteClick = () => {
        fileInputRef.current.click();
    }

    const handleImportNoteChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ee) => {
                try {
                    const content = ee.target.result;
                    if (!/^[\x00-\x7F]*$/.test(content.slice(0, 1000))) { // check first 1000 characters
                        alert('The file contains non-text character!');
                        return;
                    }
                    const createFileResponse = await createNote(file.name);
                    if (createFileResponse.status === 201) {
                        const note_id = createFileResponse.data.noteCreated.note_id;
                        // console.log(createFileResponse.data.noteCreated.note_id);
                        // console.log(ee.target.result);
                        const saveImportFileResponse = await updateNoteContent(note_id, content);
                        if (saveImportFileResponse.status !== 200) {
                            alert('Failed to save file content!')
                        }
                    } else {
                        // console.log('Failed to create import note.');
                    }
                } catch (error) {
                    alert('Something went wrong!');
                }
            };
            reader.readAsText(file);
        }
    }

    const listOfUserFolders = async () => {
        try {
            const { data } = await fetchListOfFolders(null);

            let foldersList = data.listOfFolders;
            foldersList.sort((a, b) => {
                return new Date(a.created_at) - new Date(b.created_at);
            });
            setListOfFolders(foldersList);
        } catch (error) {
            console.log(error);
        }
    }

    const listOfUserNotes = async () => {
        try {
            const { data } = await fetchListOfNotes(null);
            // data = JSON.parse(JSON.stringify(data));

            // sort data by pin_by_owner then last_modified
            let notesList = data.listOfNotes;
            notesList.sort((a, b) => {
                if (a.pin_by_owner !== b.pin_by_owner) {
                    return a.pin_by_owner ? -1 : 1;
                }
                return new Date(b.last_modified) - new Date(a.last_modified);
            });
            
            /* 
                [ { note_id: 1, 
                    title: 'example', 
                    last_modified: data, 
                    pin_by_owner: true
                }, ...]
            */
            setListOfNotes(notesList);

            setLoading(false);
        } catch (error) {
            logout(); // force log out
        }
    }

    const frontend_url = process.env.NODE_ENV === 'production' ? 'https://texti-client.onrender.com/' : 'http://localhost:3000/';

    const handleOpenFolder = () => {
        // console.log('Open folder: ' + selectedFolderIndex);
        navigate('/folder/' + listOfFolders[selectedFolderIndex].folder_id);
    }

    const handleOpenNote = () => {
        const noteWindow = window.open(frontend_url + 'note/' + listOfNotes[selectedNoteIndex].note_id, '_blank', 'noopener,noreferrer');
        if (noteWindow) {noteWindow.opener = null;}
    }

    useEffect(() => {
        listOfUserFolders();
        listOfUserNotes();
    }, []);
    
    return (loading ? (
            <>
            <ShortLoading/>
            </>
        ) : (
            <>
               <Navbar page="my-notes"/>
               <div className="dashboard-page">
                    <div className="top">
                        <div className="new-note">
                            <button onClick={toggleMenu} className="new-note-button"> 
                                <img src = {newIcon} alt="NewIcon" className="new-icon"></img>
                                New 
                                <img src = {chevronDown} alt="chevronDown" className="chevron-down"></img>
                            </button>
                            {newNoteMenu && <div className="new-note-menu">
                                <div className="menu-header"> New Note </div>
                                <button onClick={handleOpenNotePrompt} className="new-note-menu-item">
                                    <img src={plusIcon} alt="Plus Icon" className="icon"></img>
                                    <span className="text">Create Note</span>
                                </button>
                                <CustomPrompt
                                    open={isNotePromptOpen}
                                    onClose={handleCloseNotePrompt}
                                    onConfirm={handleCreateNoteConfirmPrompt}
                                    child="Create New Note"
                                    placeHolder="Enter note title"
                                />
                                <div>
                                    <button onClick={handleImportNoteClick} className="new-note-menu-item">
                                        <img src = {importIcom} alt = "Import Icon" className="icon"></img>
                                        <span className="text">Import Note</span>
                                    </button>
                                    <input 
                                        type="file"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleImportNoteChange}
                                        accept=".txt,.text,.md,.html"
                                    />
                                </div>
                             </div>}
                        </div>
                        <div className = "divider"> | </div>
                        <button onClick={handleOpenConfirmPrompt} className="function-button" disabled={selectedNoteIndex === -1 && selectedFolderIndex === -1}>
                            <img src={trashIcon} alt="Trash Icon"></img> 
                            <div className="tooltipp"> Delete </div>
                        </button>
                        <button onClick={handlePinNote}  className="function-button" disabled={selectedNoteIndex === -1 || listOfNotes[selectedNoteIndex].pin_by_owner}>
                            <img src={pinIcon2} alt="Pin Icon"></img>
                            <div className="tooltipp"> Pin </div>
                        </button>
                        <button onClick={handlePinNote}  className="function-button" disabled={selectedNoteIndex === -1 || !listOfNotes[selectedNoteIndex].pin_by_owner}>
                            <img src={unpinIcon} alt="Pin-off Icon"></img>
                            <div className="tooltipp"> Unpin </div>
                        </button>
                        <button onClick={handleOpenFolderPrompt} className="function-button">
                            <img src={newFolder} alt="New Folder"></img>
                            <div className="tooltipp"> New Folder </div>
                        </button>
                        <CustomPrompt
                                    open={isFolderPromptOpen}
                                    onClose={handleCloseFolderPrompt}
                                    onConfirm={handleCreateFolderConfirmPrompt}
                                    child="Create New Folder"
                                    placeHolder="Enter folder name"
                                />
                        
                        <ConfirmPrompt
            open={isConfirmPromptOpen}
            onClose={handleCloseConfirmPrompt}
            onConfirm={handleDeleteNoteConfirmPrompt}
            child={"Delete " + getSelectedNoteTitleOrFolderTitle()}
        />
        <button onClick={() => navigate(-1)} className="function-button" disabled={true}> 
            <img src={BackIcon} alt="Navigate Back"/>
            <div className="tooltipp"> Navigate Back </div>
        </button> 
                    </div>
                    <div className="header-container">
                        <div className="line"></div>
                        <div className="header-text">MY NOTES</div>
                        <div className="line"></div>
                    </div>

                    <div className="notes-section" onClick={() => {setSelectedNoteIndex(-1); setSelectedFolderIndex(-1)}}>
    <div className="notes-container">
        {/* List out all user's folders */}
        {listOfFolders.length > 0 && listOfFolders.map((folder, index) => (
            <div
                key={folder.folder_id}
                className={selectedFolderIndex === index ? "note-card note-card-selected" : "note-card"}
                onClick={(e) => {
                    e.stopPropagation();
                    if (index === selectedFolderIndex) { handleOpenFolder(); }
                    setSelectedFolderIndex(index);
                    setSelectedNoteIndex(-1);   
                }}
            >
                <img src={"https://cdn-icons-png.flaticon.com/512/32/32527.png"} alt="folderIcon" className="file-img" />
                <div className="note-title-container">
                    <div className="note-title" data-full-title={folder.folder_name}>
                        {folder.folder_name}
                    </div>
                </div>
                <div className="tooltip" data-full-title={folder.folder_name}>{folder.folder_name}</div>
            </div>
        ))}

        {/* List out all user's notes */}
        {listOfNotes.length === 0 ? (
            null
        ) : (
            listOfNotes.map((note, index) => (
                <div
                    key={note.note_id}
                    className={selectedNoteIndex === index ? "note-card note-card-selected" : "note-card"}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (index === selectedNoteIndex) { handleOpenNote(); }
                        setSelectedNoteIndex(index);
                        setSelectedFolderIndex(-1);
                    }}
                >
                    <img src={fileIcon} alt="fileIcon" className="file-img" />
                    <div className="note-title-container">
                        <div className="note-title" data-full-title={note.title}>
                            {note.title}
                        </div>
                    </div>
                    {note.pin_by_owner && <img src={pinIcon} alt="pinIcon" className="pin-icon" />}
                    {note.published && <img src={publishIcon} alt="publishIcon" className="publish-icon" />}
                    <div className="tooltip" data-full-title={note.title}>{note.title}</div>
                </div>
            ))
        )}
    </div>
</div>
                    <br />
                </div>
            </>
        ));
}

export default Dashboard;