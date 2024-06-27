import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
// import { fetchProtectedInfo, onLogout } from "../api/auth";
import { onLogout } from "../../api/auth";
import { fetchListOfNotes, onCreateNote, onDeleteNote, updateNotePermission, onPinNote, updateNoteContent } from "../../api/notes";
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


function Dashboard() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    // const [protectedData, setProtectedData] = useState(null);
    const [listOfNotes, setListOfNotes] = useState([]); // [{note_id: 1, title: 'example'}, ...]
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(-1);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [isConfirmPromptOpen, setIsConfirmPromptOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [newNoteMenu, setNewNoteMenu] = useState(false);

    const handleOpenPrompt = () => {
        setIsPromptOpen(true);
    };
  
    const handleClosePrompt = () => {
        setIsPromptOpen(false);
    };

    const handleCreateNoteConfirmPrompt = (noteTitle) => {
        createNote(noteTitle);
        setIsPromptOpen(false);
    };

    const handleDeleteNoteConfirmPrompt = () => {
        deleteNote();
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

    const getSelectedNoteTitle = () => {
        if (selectedNoteIndex !== -1 && listOfNotes[selectedNoteIndex]) {
            return listOfNotes[selectedNoteIndex].title;
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

    // for testing
    // const protectedInfo = async () => {
    //     try {
    //         const { data } = await fetchProtectedInfo();
    //         // console.log('protected');
    //         setProtectedData(data.info); // because the protected data we set only backend is 'info'

    //         setLoading(false);
    //     } catch (error) {
    //         logout(); // force log out
    //     }
    // }

    const createNote = async (title) => {
        // const title = prompt("Note's Title: ");
        
        try {
            const response = await onCreateNote({noteTitle: title});
            // console.log(response);
            if (response.status === 201) {
                setListOfNotes([...listOfNotes, response.data.noteCreated]);
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

    const listOfUserNotes = async () => {
        try {
            const { data } = await fetchListOfNotes();
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

    const handleOpenNote = () => {
        const noteWindow = window.open('http://localhost:3000/note/' + listOfNotes[selectedNoteIndex].note_id, '_blank', 'noopener,noreferrer');
        if (noteWindow) {noteWindow.opener = null;}
    }

    // useEffect(() => {protectedInfo()}, []);
    useEffect(() => {listOfUserNotes()}, []);
    // useEffect(() => {
    //     console.log(JSON.parse(localStorage.getItem('userInfo')).username);
    // })
    
    return (loading ? (
            <>
            <Navbar page="my-notes"/>
            <h1>Loading...</h1>
            </>
        ) : (
            <>
               <Navbar />
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
                                <button onClick={handleOpenPrompt} className="new-note-menu-item">
                                    <img src={plusIcon} alt="Plus Icon" className="icon"></img>
                                    <span className="text">Create Note</span>
                                </button>
                                <CustomPrompt
                                    open={isPromptOpen}
                                    onClose={handleClosePrompt}
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
                        <button onClick={handleOpenConfirmPrompt} className="function-button" disabled={selectedNoteIndex === -1}>
                            <img src={trashIcon} alt="Trash Icon"></img> </button>
                        <button onClick={handlePinNote}  className="function-button" disabled={selectedNoteIndex === -1 || listOfNotes[selectedNoteIndex].pin_by_owner}>
                            <img src={pinIcon2} alt="Pin Icon"></img>
                        </button>
                        <button onClick={handlePinNote}  className="function-button" disabled={selectedNoteIndex === -1 || !listOfNotes[selectedNoteIndex].pin_by_owner}>
                            <img src={unpinIcon} alt="Pin-off Icon"></img>
                        </button>

                       
                        <ConfirmPrompt
            open={isConfirmPromptOpen}
            onClose={handleCloseConfirmPrompt}
            onConfirm={handleDeleteNoteConfirmPrompt}
            child={"Delete " + getSelectedNoteTitle()}
        />
                    </div>
                    <div className="header-container">
                        <div className="line"></div>
                        <div className="header-text">MY NOTES</div>
                        <div className="line"></div>
                    </div>

                    <div className="notes-section" onClick={() => setSelectedNoteIndex(-1)}>
                    {/* List out all user's note */}
                    <div className="notes-container"  onClick={() => setSelectedNoteIndex(-1)}>
                        {listOfNotes.length === 0 ? (
                            <p>No notes found</p>
                        ) : (
                            listOfNotes.map((note, index) => (
                            <div
                                key={note.note_id} 
                                className={
                                    selectedNoteIndex === index
                                        ? "note-card note-card-selected"
                                        : "note-card"
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (index === selectedNoteIndex) { handleOpenNote(); }
                                    setSelectedNoteIndex(index);
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