import { useState } from 'react';
import axios from 'axios';
import Alert from './alert/alert';
axios.defaults.withCredentials = true;

function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState(null);

  const backend_url = process.env.NODE_ENV === 'production'
    ? 'https://texti.onrender.com/upload'
    : 'http://localhost:8000/upload';

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      setError(null);
      const imageUrl = await uploadToImgur(file);
      handleUploadResult(imageUrl);
      setUploading(false);
    }
  };

  const handleUploadResult = (imageUrl) => {
    if (imageUrl) {
      onUpload(imageUrl);
      setUploaded(true);
    } else {
      setError('Failed to upload image to Imgur');
    }
  };

  async function uploadToImgur(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(backend_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.link) {
        return response.data.link;
      } else {
        console.error('Upload failed:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  }

  const renderFileInput = () => (
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      style={{ display: 'none' }}
      id="imageUploadInput"
    />
  );

  return (
    <div>
      {renderFileInput()}
      {uploading && <Alert message="Uploading..." type="load" onClose={() => setUploading(false)} />}
      {uploaded && <Alert message="Image uploaded" type="success" onClose={() => setUploaded(false)} />}
      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
    </div>
  );
}

export default ImageUpload;
