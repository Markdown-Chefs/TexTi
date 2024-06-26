import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPublicNotes, importPublicNote } from "../api/notes";

function PublicNotes() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [publicNotesFromServer, setPublicNotesFromServer] = useState([]);

    const fetchPublicNotes = async () => {
        try {
            const response = await fetchAllPublicNotes();
            if (response.status === 200) {
                setPublicNotesFromServer(response.data.listOfPublicNotes);
                setLoading(false);
            }
        } catch (error) {
            alert('Something went wrong.');
            console.log(error.response);
            console.log("Failed to fetch public notes.");
        }
    }

    const DisplayPublicNotes = () => {
        return (
            <div className="row row-cols-1 row-cols-md-3 g-2">
                {publicNotesFromServer.map((item, index) => (
                    <div className="col" key={item.note_id} style={{ width: "18rem" }}>
                        <div className="card" >
                            <div className="card-body">
                                <h5 className="card-title">{item.title}</h5>
                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    {item.note_public_tags.map((tag, tagIndex) => (
                                        <h6 key={`${item.note_id}-tag-${tagIndex}`} className="card-subtitle mb-2 text-muted">{tag}</h6>
                                    ))}
                                </div>
                                <h6 className="card-subtitle mb-2 text-muted">Author: {item.username}</h6>
                                <p className="card-text">{item.note_public_description}</p>
                                <a href="#" onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await handleImportPublicNote(item.note_id, item.note_title)
                                    } catch (error) {
                                        console.log(error.response);
                                        console.log("Failed to import public notes.");
                                    }
                                }} className="card-link">Import Note</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );  
    }

    const handleImportPublicNote = async (note_id, note_title) => {
        if (window.confirm(`Are you sure you want to import ${note_title}.`)) {
            try {
                const response = await importPublicNote(note_id);
                if (response.status === 201) {
                    navigate(`/note/${response.data.noteCreated.note_id}`);
                }
            } catch (error) {
                console.log(error.response);
                console.log("Failed to import public notes.");
            }
        }
    }

    useEffect(() => {DisplayPublicNotes()}, [publicNotesFromServer]);

    useEffect(() => {fetchPublicNotes()}, []);

    return (loading ? (
        <>
            <h1>Loading...</h1>
        </>
    ) : (
        <>
            <h1>Public Notes</h1>
            <DisplayPublicNotes />
        </>
    )
    );
}

export default PublicNotes;