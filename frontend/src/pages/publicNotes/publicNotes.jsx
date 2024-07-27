import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPublicNotes, importPublicNote } from "../../api/notes";
import Navbar from "../../components/navbar/navbar";
import "./publicNotes.css"
import userIcon from "./../../components/assets/user.png"
import importIcon from "./../../components/assets/Import1.png"
import searchIcon from "./../../components/assets/search.png"
import Loading from "../loading/loading";
import ShortLoading from "../loading/shortloading";


function PublicNotes() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [publicNotesFromServer, setPublicNotesFromServer] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredNotes, setFilteredNotes] = useState([]);

    const fetchPublicNotes = async () => {
        try {
            const response = await fetchAllPublicNotes();
            if (response.status === 200) {
                setPublicNotesFromServer(response.data.listOfPublicNotes);
                setFilteredNotes(response.data.listOfPublicNotes);
                setLoading(false);
            }
        } catch (error) {
            alert('Something went wrong.');
            console.log(error.response);
            console.log("Failed to fetch public notes.");
        }
    }

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filtered = publicNotesFromServer.filter(note => 
                note.title.toLowerCase().includes(query.toLowerCase()) || 
                note.note_public_tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                note.username.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredNotes(filtered);
        } else {
            setFilteredNotes(publicNotesFromServer);
        }
    }

    const DisplayPublicNotes = () => {
        return (
        <>
            <div className="note-container">
                {filteredNotes.map((item, index) => (
                    <div className="notepool-card" key={item.note_id}>
                        <h5 className="notepool-title">{item.title}</h5>
                        <p className="notepool-description"> {item.note_public_description} </p>
                        <div className="notepool-details">
                            <div className="notepool-author">
                                <img src={userIcon} alt="User Icon"></img>
                                {item.username}
                            </div>
                            <div className="notepool-tags">
                                {item.note_public_tags.map((tag, index) => (
                                    <span className="notepool-tag" key={`${item.note_id}-tag-${index}`}> #{tag}</span>
                                ))}
                            </div>
                        </div>
                            <div className="import">
                                <img src={importIcon} alt="Import Icon" className="import-note-icon" onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    await handleImportPublicNote(item.note_id, item.title)
                                } catch (error) {
                                    console.log(error.response);
                                    console.log("Failed to import public notes.");
                                }
                                }}></img>
                                <div className="tooltipp"> Import</div>
                            </div>
                    </div>
                ))}
            </div>
        </>
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
           <ShortLoading/>
        </>
    ) : (
        <>
            <Navbar page="note-pool"></Navbar>
            <div className="public-notes-page">
                <div className="top">
                    <div className="search-container">
                        <input 
                            type="text" 
                            placeholder="Search notes" 
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)} 
                            className="search-input"
                        />
                        <img src={searchIcon} alt="Search Icon"></img>
                    </div>
                </div>
                <div className="header-container">
                        <div className="line"></div>
                        <div className="header-text">PUBLIC NOTES</div>
                        <div className="line"></div>
                </div>
                <DisplayPublicNotes />
            </div>
        </>
    )
    );
}

export default PublicNotes;