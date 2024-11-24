import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FileList.css';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const token = localStorage.getItem('token'); // Ambil token dari localStorage

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tasks', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Sertakan token JWT
                    },
                });
                setFiles(response.data);
            } catch (err) {
                console.error(err);
                alert('Failed to fetch files. Please log in again.');
            }
        };
        fetchFiles();
    }, [token]);

    const handleDownload = async (id, filename) => {
        try {
            const response = await axios.get(`http://localhost:5000/tasks/download/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Sertakan token JWT
                },
                responseType: 'blob', // Tentukan tipe respons sebagai file blob
            });

            // Buat URL unduhan dari blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Nama file
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('Failed to download file. Please log in again.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/tasks/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFiles(files.filter((file) => file.id !== id));
            alert('File deleted successfully');
        } catch (err) {
            console.error(err);
            alert('Error deleting file. Please log in again.');
        }
    };

    return (
        <div className="file-list">
            <h3>Tugas Terkirim</h3>
            <ul>
                {files.map((file) => (
                    <li key={file.id}>
                        <strong>{file.title}</strong> - {file.filename}
                        <div className="actions">
                            <button onClick={() => handleDownload(file.id, file.filename)}>Download</button>
                            <button onClick={() => handleDelete(file.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileList;
