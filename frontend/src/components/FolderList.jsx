import { useState } from 'react';

const FolderList = ({ folders, onCreateFolder, onDeleteFolder }) => {
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = () => {
    if (folderName) {
      onCreateFolder(folderName);
      setFolderName('');
    }
  };

  return (
    <div>
      <input 
        type="text" 
        value={folderName} 
        onChange={(e) => setFolderName(e.target.value)} 
        placeholder="New folder name"
      />
      <button onClick={handleCreateFolder}>Create Folder</button>
      <ul>
        {folders.map(folder => (
          <li key={folder.id}>
            {folder.name}
            <button onClick={() => onDeleteFolder(folder.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FolderList;