import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import Login from './components/Login';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    if (!token) {
        return <Login setToken={setToken} />;
    }

    return (
        <div>
            <button style={{ float: 'right', margin: '10px' }} onClick={handleLogout}>
                Logout
            </button>
            <h1 style={{ textAlign: 'center', color: '#4CAF50' }}>Tugas - Nurico Aditya Nugroho - 21110165</h1>
            <FileUpload />
            <FileList />
        </div>
    );
}

export default App;
