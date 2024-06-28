import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchNoteContent, fetchNotePermission, updateNotePermission } from "../api/notes";
import useUser from "../hooks/useUser";
import Loading from "./loading/loading";
import Editor from "./editor/editor";

function NoteEditor() {
    const { noteID } = useParams();
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteContentError, setNoteContentError] = useState('');
    const [loading, setLoading] = useState(true); // prevent render before response from server, important
    const [editList, setEditList] = useState([]);
    const [viewList, setViewList] = useState([]);
    const [permission, setPermission] = useState({ isOwner: false, canView: false, canEdit: false, isPublished: false });
   
   

    const fetchUserNoteContent = async () => {
        try {
            const response = await fetchNoteContent(noteID);
            if (response.status === 200) {
                setNoteTitle(response.data.title);
                setNoteContent(response.data.content);
                setPermission(response.data.permission);
                setLoading(false);
            }
        } catch (error) {
            setNoteContentError(error.response.data.errors[0].msg);
            console.log(error.response);
            setLoading(false);
        }
    }

    const fetchUserNotePermission = async () => {
        try {
            const response = await fetchNotePermission(noteID);
            if (response.status === 200 && response.data.success) {
                setViewList(response.data.listOfUsers.can_view || []);
                setEditList(response.data.listOfUsers.can_edit || []);
                
            }
        } catch (error) {
            console.error('Error fetching permission:', error);
        }
    }

    const renderEditorOrError = () => {
        return noteContentError ? 
            (<h1>{noteContentError}</h1>) :

            (<Editor noteID={noteID} noteTitle={noteTitle} content={noteContent} canEdit={permission.canEdit} isOwner={permission.isOwner} isPublished={permission.isPublished} trial='false' fetchUserNotePermission= {fetchUserNotePermission}/>);

    }

    useEffect(() => {
        fetchUserNoteContent();
        if (permission.isOwner) {
        fetchUserNotePermission()
        };
    }, []);

    return (loading ? (
        <>
            <Loading/>
        </>
    ) : (
        <>
            {renderEditorOrError()}
           
        </>
    ));
}

export default NoteEditor;