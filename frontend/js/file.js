console.log('[file.js] Script loaded and parsing started.'); 

const API_BASE_URL = 'http://localhost:8080/api/files'; 

async function uploadSingleFile(file) {
    console.log('[file.js] uploadSingleFile called with file:', file);
    if (!file) {
        console.error('[file.js] No file provided to uploadSingleFile.');
        throw new Error('No file provided for upload.');
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log('[file.js] FormData created:', formData);

    const token = localStorage.getItem('authToken'); 
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[file.js] Authorization header set.');
    } else {
        console.log('[file.js] No auth token found, proceeding without Authorization header.');
    }

    try {
        const uploadUrl = `${API_BASE_URL}/upload`;
        console.log(`[file.js] Attempting to POST to ${uploadUrl} with headers:`, headers);
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: headers,
        });
        console.log('[file.js] Fetch response received:', response);

        const responseData = await response.json();
        console.log('[file.js] Response data parsed:', responseData);

        if (!response.ok) {
            console.error('[file.js] Server error during single file upload:', response.status, responseData);
            throw new Error(responseData.message || `Failed to upload ${file.name}. Status: ${response.status}`);
        }
        console.log('[file.js] File upload successful:', responseData);
        return responseData;
    } catch (error) {
        console.error(`[file.js] Error uploading file ${file.name}:`, error);
        throw error; 
    }
}

async function uploadMultipleFiles(files) {
    console.log('[file.js] uploadMultipleFiles called with files:', files);
    if (!files || files.length === 0) {
        console.log('[file.js] No files provided to uploadMultipleFiles.');
        return []; 
    }

    const uploadedFileResponses = [];
    const token = localStorage.getItem('authToken'); 
    const commonHeaders = {};
    if (token) {
        commonHeaders['Authorization'] = `Bearer ${token}`;
    }

    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file); 
        console.log('[file.js] uploadMultipleFiles - FormData for', file.name, ':', formData);

        try {
            const uploadUrl = `${API_BASE_URL}/upload`;
            console.log(`[file.js] uploadMultipleFiles - Attempting to POST ${file.name} to ${uploadUrl} with headers:`, commonHeaders);
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: commonHeaders,
            });
            console.log('[file.js] uploadMultipleFiles - Fetch response for', file.name, ':', response);
            const responseData = await response.json();
            console.log('[file.js] uploadMultipleFiles - Response data for', file.name, 'parsed:', responseData);

            if (!response.ok) {
                console.error('[file.js] uploadMultipleFiles - Server error (for file ' + file.name + '):', response.status, responseData);
                throw new Error(responseData.message || `Failed to upload ${file.name}. Status: ${response.status}`);
            }
            uploadedFileResponses.push(responseData);
            console.log('[file.js] uploadMultipleFiles - Successfully uploaded', file.name);
        } catch (error) {
            console.error(`[file.js] uploadMultipleFiles - Error uploading file ${file.name}:`, error);
            throw error;
        }
    }
    console.log('[file.js] uploadMultipleFiles - All files processed. Responses:', uploadedFileResponses);
    return uploadedFileResponses;
}

async function downloadFile(fileName) {
    console.log('[file.js] downloadFile called for fileName:', fileName);
    if (!fileName) {
        console.error('[file.js] Filename cannot be empty for download.');
        alert('Filename cannot be empty.');
        return;
    }
    const downloadUrl = `${API_BASE_URL}/download/${encodeURIComponent(fileName)}`;
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('[file.js] downloadFile - Authorization header set.');
    } else {
        console.log('[file.js] downloadFile - No auth token found.');
    }

    try {
        console.log(`[file.js] downloadFile - Attempting to GET from ${downloadUrl} with headers:`, headers);
        const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: headers,
        });
        console.log('[file.js] downloadFile - Fetch response received:', response);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
            }
            console.error('[file.js] downloadFile - Server error during file download:', response.status, errorData);
            throw new Error(errorData?.message || `Failed to download ${fileName}. Status: ${response.status}`);
        }

        const blob = await response.blob();
        console.log('[file.js] downloadFile - Blob created, size:', blob.size);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); 
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log(`[file.js] downloadFile - Download initiated for: ${fileName} from ${downloadUrl}`);
    } catch (error) {
        console.error(`[file.js] downloadFile - Error downloading file ${fileName}:`, error);
        alert(`Could not download ${fileName}: ${error.message || 'Unknown error'}`);
        throw error; 
    }
}

