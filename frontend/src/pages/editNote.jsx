import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchNoteContent } from "../api/notes";

import Editor from "./editor";

function NoteEditor() {
    const { noteID } = useParams();
    const [noteContent, setNoteContent] = useState('');
    const [noteContentError, setNoteContentError] = useState('');
    const [loading, setLoading] = useState(true); // prevent render before response from server, important

    const fetchUserNoteContent = async () => {
        try {
            const response = await fetchNoteContent(noteID);
            if (response.status === 200) {
                setNoteContent(response.data.content);
                setLoading(false);
            }
        } catch (error) {
            setNoteContentError(error.response.data.errors[0].msg);
            console.log(error.response);
            setLoading(false);
        }
    }

    const renderEditorOrError = () => {
        return noteContentError ? 
            (<h1>{noteContentError}</h1>) :
            (<Editor noteID={noteID} content={noteContent} />);
    }

    useEffect(() => {fetchUserNoteContent()});

    return (loading ? (
        <>
            <h1>Loading...</h1>
        </>
    ) : (
        <>
            {renderEditorOrError()}
        </>
    ));
}

export default NoteEditor;