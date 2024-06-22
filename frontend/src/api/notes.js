import axios from 'axios';
axios.defaults.withCredentials = true;

export async function fetchListOfNotes() {
    return await axios.get('http://localhost:8000/api/user-notes');
}

export async function onCreateNote(noteTitle) {
    return await axios.post(
        'http://localhost:8000/api/create-notes', 
        noteTitle
    );
}

export async function onDeleteNote(note_id, note_title) {
    return await axios.delete(
        'http://localhost:8000/api/delete-notes',
        {
            data: {
                note_id: note_id,
                title: note_title,
            }
        }
    );
}

export async function fetchNoteContent(note_id) {
    const url = 'http://localhost:8000/api/note/' + note_id
    return await axios.get(url);
}

export async function updateNoteContent(note_id, content) {
    const url = 'http://localhost:8000/api/note/' + note_id
    return await axios.put(
        url,
        {
            updatedContent: content
        }
    );
}

export async function fetchNotePermission(note_id) {
    return await axios.get(
        'http://localhost:8000/api/note-permission',
        { params: {
            noteID: note_id
        }
    });
}

/* Response of fetchNotePermission

{
    success: true,
    listOfUsers: {
        can_view: [list of user with view permission],
        can_edit: [list of user with view and edit permission]
    }
}

*/

export async function updateNotePermission(note_id, target_username, can_view, can_edit) {
    return await axios.post(
        'http://localhost:8000/api/note-permission',
        {
            noteID: note_id, // integer
            usernameToShare: target_username, // string
            can_view: can_view, // boolean
            can_edit: can_edit // boolean
        }
    );
}