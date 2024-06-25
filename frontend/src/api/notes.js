import axios from 'axios';
axios.defaults.withCredentials = true;

const backend_url = process.env.NODE_ENV === 'production'
    ? 'https://texti.onrender.com/api/'
    : 'http://localhost:8000/api/';

export async function fetchListOfNotes() {
    const api = 'user-notes';
    return await axios.get(backend_url + api);
}

export async function onCreateNote(noteTitle) {
    const api = 'create-notes';
    return await axios.post(
        backend_url + api, 
        noteTitle
    );
}

export async function onDeleteNote(note_id, note_title) {
    const api = 'delete-notes';
    return await axios.delete(
        backend_url + api,
        {
            data: {
                noteID: note_id,
                title: note_title,
            }
        }
    );
}

export async function onPinNote(note_id, pinNote) {
    const api = 'pin-notes';
    return await axios.post(
        backend_url + api,
        {
            noteID: note_id,
            pinNote: pinNote // true to pin note, false to unpin note
        }
    );
}

export async function fetchNoteContent(note_id) {
    const api = 'note';
    const url = 'http://localhost:8000/api/note/' + note_id
    return await axios.get(url);
}

export async function updateNoteContent(note_id, content) {
    const api = 'note';
    const url = 'http://localhost:8000/api/note/' + note_id
    return await axios.put(
        url,
        {
            updatedContent: content
        }
    );
}

export async function fetchNotePermission(note_id) {
    const api = 'note-permission';
    return await axios.get(
        backend_url + api,
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
    const api = 'note-permission';
    return await axios.post(
        backend_url + api,
        {
            noteID: note_id, // integer
            usernameToShare: target_username, // string
            can_view: can_view, // boolean
            can_edit: can_edit // boolean
        }
    );
}