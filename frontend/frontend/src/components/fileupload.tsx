import React, { useState } from 'react';
import axios from 'axios';

const UploadForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const [fileDetails, setFileDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            setMessage('Please select a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:3000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage(`File uploaded successfully`);
            setFileDetails(response.data);  // Save file details and URL from the server response
        } catch (error) {
            setMessage('Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Upload PDF</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            {message && <p>{message}</p>}
            {fileDetails && (
                <div>
                    <h2>File Details:</h2>
                    <pre>{JSON.stringify(fileDetails, null, 2)}</pre>
                    {/* Display a link to the uploaded PDF */}
                    <a href={`http://localhost:3000${fileDetails.fileUrl}`} target="_self" rel="noopener noreferrer">
                        View Uploaded PbDF
                    </a>
                </div>
            )}
        </div>
    );
};

export default UploadForm;