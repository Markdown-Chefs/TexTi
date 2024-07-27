import axios from 'axios';
axios.defaults.withCredentials = true;

const backend_url = process.env.NODE_ENV === 'production'
    ? 'https://texti.onrender.com/api/'
    : 'http://localhost:8000/api/';

export async function fetchListOfFolders(parent_id=null) {
    const api = 'user-folders';
    return await axios.get(
        backend_url + api, 
        { params: {
            parentID: parent_id
        }
    });
}

export async function onCreateFolder(folder_name, parent_id=null) {
    const api = 'create-folder';
    return await axios.post(
        backend_url + api,
        {
            folderName: folder_name,
            parentID: parent_id,
        }
    );
}

export async function onDeleteFolder(folder_id) {
    const api = 'delete-folder';
    return await axios.delete(
        backend_url + api,
        {
            data: {
                folderID: folder_id,
            }
        }
    );
}
    