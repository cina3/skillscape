document.addEventListener('DOMContentLoaded', function() {
    console.log('[CustomerNewScript] DOM fully loaded and parsed.');
    
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    
    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
        
        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        fileUploadArea.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
        
        function handleFiles(files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileSize = formatFileSize(file.size);
                const fileExtension = file.name.split('.').pop().toLowerCase();
                
                const fileItem = document.createElement('div');
                fileItem.className = 'uploaded-file-item';
                
                let iconClass = 'fa-file';
                if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
                    iconClass = 'fa-file-image';
                } else if (['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(fileExtension)) {
                    iconClass = 'fa-file-alt';
                } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
                    iconClass = 'fa-file-excel';
                } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
                    iconClass = 'fa-file-archive';
                }
                
                fileItem.innerHTML = `
                    <i class="fas ${iconClass} file-icon"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize}</span>
                    <button type="button" class="remove-file" aria-label="Remove file">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                fileItem.querySelector('.remove-file').addEventListener('click', function() {
                    fileItem.remove();
                });
                
                if (uploadedFiles) {
                    uploadedFiles.appendChild(fileItem);
                }
            }
            
            fileInput.value = '';
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }
    
    const newListingForm = document.getElementById('newListingForm');
    const successModal = document.getElementById('successModal');
    const viewListingBtn = document.getElementById('viewListingBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');
    
    if (newListingForm) {
        newListingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (successModal) {
                successModal.style.display = 'flex';
            }
        });
    }
    
    if (saveAsDraftBtn) {
        saveAsDraftBtn.addEventListener('click', function() {
            alert('Listing saved as draft');
        });
    }
    
    if (successModal) {
        const closeModal = document.querySelector('.close-modal');
        
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        }
        
        if (viewListingBtn) {
            viewListingBtn.addEventListener('click', function() {
                window.location.href = '#';
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.style.display = 'none';
            }
        });
    }
});