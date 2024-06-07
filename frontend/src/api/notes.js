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