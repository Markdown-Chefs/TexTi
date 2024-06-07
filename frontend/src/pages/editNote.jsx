import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchNoteContent } from "../api/notes";

import Editor from "./editor";

function NoteEditor() {
    const { noteID } = useParams();
    const [noteContent, setNoteContent] = useState('');
    const [noteContentError, setNoteContentError] = useState('');

    const fetchUserNoteContent = async () => {
        try {
            const response = await fetchNoteContent(noteID);
            if (response.status === 200) {
                setNoteContent(response.data.content);
            }
        } catch (error) {
            setNoteContentError(error.response.data.errors[0].msg);
            console.log(error.response);
        }
    }

    // check if note exists
    // verify user have access to notes
    //      user log in (yes):
    //          if yes: send back content
    //          if no : send "no access"
    //      user log in (no) :
    //          check allow public access

    useEffect(() => {fetchUserNoteContent()});

    return (noteContentError ? (
        <>
            <h1>{noteContentError}</h1>
        </>
    ) : (
        <>
            <Editor content={noteContent} />
        </>
    ));
}

export default NoteEditor;