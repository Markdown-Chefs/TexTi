import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchNoteContent, fetchNotePermission, updateNotePermission } from "../api/notes";
import useUser from "../hooks/useUser";

import Editor from "./editor/editor";

function NoteEditor() {
    const { noteID } = useParams();
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteContentError, setNoteContentError] = useState('');
    const [loading, setLoading] = useState(true); // prevent render before response from server, important
    const [canEdit, setCanEdit] = useState(false);
    const [editList, setEditList] = useState([]);
    const [viewList, setViewList] = useState([]);
    const { username, userId } = useUser();
    const [targetUsername, setTargetUsername] = useState('');
    const [permission, setPermission] = useState({ can_view: false, can_edit: false });
   
   

    const fetchUserNoteContent = async () => {
        try {
            const response = await fetchNoteContent(noteID);
            if (response.status === 200) {
                setNoteTitle(response.data.title);
                setNoteContent(response.data.content);
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
                // setCanEdit(response.data.listOfUsers.can_edit.includes(userId));
                setViewList(response.data.listOfUsers.can_view || []);
                setEditList(response.data.listOfUsers.can_edit || []);
            }
        } catch (error) {
            console.error('Error fetching permission:', error);
        }
    }

    const handlePermissionChange = (event) => {
        const { name, checked } = event.target;
        setPermission(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const handleUsernameChange = (event) => {
        setTargetUsername(event.target.value);
    };

    const handleUpdatePermission = async (event) => {
        event.preventDefault();
        try {
            const response = await updateNotePermission(noteID, targetUsername, permission.can_view, permission.can_edit);
            if (response.status === 200) {
                fetchUserNotePermission(); // Refresh permissions list
                alert('Permissions updated successfully.');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert('Failed to update permissions.');
        }
    };

    const renderEditorOrError = () => {
        return noteContentError ? 
            (<h1>{noteContentError}</h1>) :

            (<Editor noteID={noteID} noteTitle={noteTitle} content={noteContent} canedit={canEdit} trial='false' fetchUserNotePermission= {fetchUserNotePermission}/>);

    }


    

    useEffect(() => {
        fetchUserNoteContent();
        fetchUserNotePermission();
    }, [noteID]);

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