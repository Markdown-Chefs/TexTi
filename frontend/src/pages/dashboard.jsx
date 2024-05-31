import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// import { fetchProtectedInfo, onLogout } from "../api/auth";
import { onLogout } from "../api/auth";
import { fetchListOfNotes, onCreateNote, onDeleteNote } from "../api/notes";
import { unAuthenticateUser } from "../redux/slices/authSlice";
import Layout from "../components/layout";

function Dashboard() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    // const [protectedData, setProtectedData] = useState(null);
    const [listOfNotes, setListOfNotes] = useState([]); // [{note_id: 1, title: 'example'}, ...]
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(-1);


    const logout = async () => {
        try {
            await onLogout();
            dispatch(unAuthenticateUser());
            localStorage.removeItem('isAuth');
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

    const createNote = async () => {
        const title = prompt("Note's Title: ");
        
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

    const listOfUserNotes = async () => {
        try {
            const { data } = await fetchListOfNotes();
            // data = JSON.parse(JSON.stringify(data));

            setListOfNotes(data.listOfNotes); // [{note_id: 1, title: 'example'}, ...]

            setLoading(false);
        } catch (error) {
            logout(); // force log out
        }
    }

    // useEffect(() => {protectedInfo()}, []);
    useEffect(() => {listOfUserNotes()}, []);
    
    return (loading ? (
            <Layout>
                <h1>Loading...</h1>
            </Layout>
        ) : (
            <div>
                <Layout>
                    <h1>Dashboard</h1>
                    {/* <h2>{protectedData}</h2> */}

                    {/* List out all user's note */}
                    <h2>List of notes:</h2>
                    <ul className="list-group">
                        {listOfNotes.length === 0 ? (
                            <p>No notes found</p>
                        ) : (
                            listOfNotes.map((note, index) => (
                            <li 
                                key={note.note_id} 
                                className={
                                    selectedNoteIndex === index
                                        ? "list-group-item list-group-item-success"
                                        : "list-group-item"
                                }
                                onClick={() => {
                                    setSelectedNoteIndex(index);
                                }}
                            >
                                    <h4>
                                        {note.title}
                                    </h4>
                            </li>
                            ))
                        )}
                    </ul>

                    <button onClick={() => createNote()} className="btn btn-primary">Create New Note</button>
                    <button onClick={() => deleteNote()} className="btn btn-primary">Delete Selected Note</button>
                    <br />
                    <button onClick={() => logout()} className="btn btn-primary">Logout</button>
                </Layout>
            </div>
        ));
}

export default Dashboard;