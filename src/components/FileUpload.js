import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const token = localStorage.getItem('token'); // Ambil token dari localStorage

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/tasks', formData, {
                headers: {
                    Authorization: `Bearer ${token}`, // Sertakan token JWT di header
                }
            });
            alert(response.data.message);
        } catch (err) {
            console.error(err);
            alert('Error uploading file. Please log in again.');
        }
    };

    return (
        <form className="upload-form" onSubmit={handleSubmit}>
            <h2>Upload Tugas</h2>
            <input
                type="text"
                placeholder="Judul"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Deskripsi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
            />
            <button type="submit">Upload</button>
        </form>
    );
};

export default FileUpload;
