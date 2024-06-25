import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// import { fetchProtectedInfo, onLogout } from "../api/auth";
import { onLogout } from "../../api/auth";
import { fetchListOfNotes, onCreateNote, onDeleteNote, updateNotePermission, onPinNote } from "../../api/notes";
import { unAuthenticateUser } from "../../redux/slices/authSlice";
import "./dashboard.css"
import Navbar from "../../components/navbar/navbar";
import CustomPrompt from "../../components/customPrompt/customPrompt";
import ConfirmPrompt from "../../components/customPrompt/confirmPrompt";
import fileIcon from "./../../components/assets/note-icon2.png"


function Dashboard() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    // const [protectedData, setProtectedData] = useState(null);
    const [listOfNotes, setListOfNotes] = useState([]); // [{note_id: 1, title: 'example'}, ...]
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(-1);
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [isConfirmPromptOpen, setIsConfirmPromptOpen] = useState(false);

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
            }
        } catch (error) {
            alert(error.response.data.errors[0].msg);
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

            // for testing only
            notesList = notesList.map(note => {
                if (note.pin_by_owner) {
                    return {
                        ...note,
                        title: `[PIN] ${note.title}`
                    };
                }
                return note;
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
            <Navbar/>
            <h1>Loading...</h1>
            </>
        ) : (
            <>
               <Navbar />
               <div className="dashboard-page">
                    <div className="top">
                    <button onClick={handleOpenPrompt} className="create-note">Create New Note</button>
                    <CustomPrompt
        open={isPromptOpen}
        onClose={handleClosePrompt}
        onConfirm={handleCreateNoteConfirmPrompt}
        child="Create New Note"
        placeHolder="Enter note title"
      />
                        <button onClick={handlePinNote}>Pin/Unpin Note</button>

                        <button onClick={handleOpenConfirmPrompt} className="delete-note" disabled={selectedNoteIndex === -1}>Delete Selected Note </button>
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
                    <ul className="list-group2"  onClick={() => setSelectedNoteIndex(-1)}>
                        {listOfNotes.length === 0 ? (
                            <p>No notes found</p>
                        ) : (
                            listOfNotes.map((note, index) => (
                            <li 
                                key={note.note_id} 
                                className={
                                    selectedNoteIndex === index
                                        ? "list-group2-item list-group2-item-success"
                                        : "list-group2-item"
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (index === selectedNoteIndex) {handleOpenNote();}
                                    setSelectedNoteIndex(index);
                                }}
                                
                            >
                                <img src={fileIcon} alt="fileIcon" className="file-img"/>
                                <div className="note-title"> 
                                    {note.title}
                                </div>
                            </li>
                            ))
                        )}
                    </ul>
                    </div>
                    <br />
                </div>
            </>
        ));
}

export default Dashboard;