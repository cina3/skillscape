document.addEventListener('DOMContentLoaded', function() {
    console.log('[FreelancerNewScript] DOM fully loaded and parsed.');
    
    let coverImageFile = null;
    let galleryFiles = [];
    
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const galleryCount = document.getElementById('galleryCount');
    const galleryProgress = document.getElementById('galleryProgress');
    const galleryProgressBar = document.getElementById('galleryProgressBar');
    const clearGalleryBtn = document.getElementById('clearGallery');
    const MAX_FILES = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; 
    const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
    
    let totalGallerySize = 0;
    
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
            const currentFiles = uploadedFiles.querySelectorAll('.gallery-thumb').length;
            const filesArray = Array.from(files);
            const filesToProcess = filesArray.slice(0, MAX_FILES - currentFiles);
            
            if (filesToProcess.length < filesArray.length) {
                showFileError(`Only ${MAX_FILES} files allowed. Added ${filesToProcess.length} out of ${filesArray.length}.`);
            }
            
            if (filesToProcess.length === 0) {
                showFileError(`Maximum of ${MAX_FILES} files already added.`);
                return;
            }
            
            filesToProcess.forEach(file => {
                if (file.size > MAX_FILE_SIZE) {
                    showFileError(`${file.name} exceeds 5MB limit.`);
                    return;
                }
                
                if (totalGallerySize + file.size > MAX_TOTAL_SIZE) {
                    showFileError(`Adding this file would exceed the 25MB total limit.`);
                    return;
                }
                
                const fileExt = file.name.split('.').pop().toLowerCase();
                const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'pdf', 'doc', 'docx'];
                
                if (!allowedTypes.includes(fileExt)) {
                    showFileError(`${file.name}: File type not allowed.`);
                    return;
                }
                
                galleryFiles.push(file);
                
                const reader = new FileReader();
                const fileItem = document.createElement('div');
                fileItem.className = 'gallery-thumb';
                fileItem.dataset.filename = file.name;
                fileItem.dataset.filesize = file.size;
                
                fileItem.innerHTML = '<div class="file-loading"></div>';
                uploadedFiles.appendChild(fileItem);
                
                reader.onload = function(e) {
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExt);
                    
                    const sizeStr = formatFileSize(file.size);
                    
                    if (isImage) {
                        fileItem.innerHTML = `
                            <img src="${e.target.result}" alt="${file.name}">
                            <div class="file-size-badge">${sizeStr}</div>
                            <button class="remove-thumb" aria-label="Remove">×</button>
                        `;
                    } else {
                        fileItem.innerHTML = `
                            <div class="file-icon-container">
                                <span class="file-ext">${fileExt}</span>
                            </div>
                            <div class="file-size-badge">${sizeStr}</div>
                            <button class="remove-thumb" aria-label="Remove">×</button>
                        `;
                    }
                    
                    totalGallerySize += file.size;
                    
                    fileItem.querySelector('.remove-thumb').addEventListener('click', function(e) {
                        e.stopPropagation();
                        totalGallerySize -= parseInt(fileItem.dataset.filesize, 10) || 0;
                        
                        galleryFiles = galleryFiles.filter(f => 
                            f.name !== file.name || f.size !== file.size || f.lastModified !== file.lastModified);
                            
                        URL.revokeObjectURL(e.target.result); 
                        fileItem.remove();
                        updateGalleryCount();
                    });
                    
                    updateGalleryCount();
                };
                
                reader.onerror = function() {
                    fileItem.remove();
                    galleryFiles = galleryFiles.filter(f => 
                        f.name !== file.name || f.size !== file.size || f.lastModified !== file.lastModified);
                    showFileError(`Error reading ${file.name}`);
                };
                
                reader.readAsDataURL(file);
            });
            
            fileInput.value = ''; 
        }
        
        function showFileError(message) {
            const errorEl = document.getElementById('fileError');
            if (!errorEl) {
                const error = document.createElement('div');
                error.id = 'fileError';
                error.className = 'file-error';
                error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                const container = document.querySelector('.gallery-container');
                if (container) {
                    container.insertBefore(error, uploadedFiles);
                } else {
                    uploadedFiles.parentNode.insertBefore(error, uploadedFiles);
                }
                
                setTimeout(() => {
                    if (error.parentNode) error.remove();
                }, 5000);
            } else {
                errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                
                clearTimeout(errorEl.dataset.timeout);
                errorEl.dataset.timeout = setTimeout(() => {
                    if (errorEl.parentNode) errorEl.remove();
                }, 5000);
            }
        }
        
        function updateGalleryCount() {
            const current = uploadedFiles.querySelectorAll('.gallery-thumb').length;
            
            if (galleryCount) {
                galleryCount.textContent = `${current}/${MAX_FILES} files`;
            }
            
            if (galleryProgress && galleryProgressBar) {
                const percentage = (current / MAX_FILES) * 100;
                galleryProgressBar.style.width = `${percentage}%`;
                
                const totalSizeEl = document.getElementById('totalGallerySize');
                if (totalSizeEl) {
                    const percentOfMax = Math.round((totalGallerySize / MAX_TOTAL_SIZE) * 100);
                    totalSizeEl.textContent = `${formatFileSize(totalGallerySize)} / 25MB`;
                }
            }
            
            if (fileUploadArea) {
                if (current >= MAX_FILES) {
                    fileUploadArea.classList.add('disabled');
                } else {
                    fileUploadArea.classList.remove('disabled');
                }
            }
            
            if (clearGalleryBtn) {
                clearGalleryBtn.style.display = current > 0 ? 'inline-block' : 'none';
            }
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
        
        updateGalleryCount();
        
        if (clearGalleryBtn) {
            clearGalleryBtn.addEventListener('click', function() {
                if (confirm('Clear all uploaded files?')) {
                    const items = uploadedFiles.querySelectorAll('.gallery-thumb');
                    items.forEach(item => {
                        if (item.querySelector('img')) {
                            URL.revokeObjectURL(item.querySelector('img').src);
                        }
                        item.remove();
                    });
                    galleryFiles = []; 
                    totalGallerySize = 0; 
                    updateGalleryCount();
                }
            });
        }
    }
    
    const coverImageInput = document.getElementById('coverImage');
    const coverImagePreviewContainer = document.getElementById('coverImagePreview');
    const coverImageRemoveBtn = document.getElementById('removeCoverImage');
    const coverSizeLimit = document.getElementById('coverSizeLimit');
    const MAX_COVER_SIZE = 5 * 1024 * 1024; 
    
    if (coverImageInput && coverImagePreviewContainer) {
        coverImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                if (file.size > MAX_COVER_SIZE) {
                    showCoverError(`Cover image exceeds 2MB limit.`);
                    this.value = '';
                    coverImageFile = null; 
                    return;
                }
                
                const fileExt = file.name.split('.').pop().toLowerCase();
                if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
                    showCoverError(`Cover must be an image (JPG, PNG, GIF).`);
                    this.value = '';
                    coverImageFile = null; 
                    return;
                }
                
                coverImageFile = file;
                
                const reader = new FileReader();
                const img = coverImagePreviewContainer.querySelector('img');
                const placeholder = coverImagePreviewContainer.querySelector('.placeholder');
                
                if (placeholder) {
                    placeholder.innerHTML = '<div class="file-loading"></div>';
                }
                
                reader.onload = function(e) {
                    if (img) {
                        img.src = e.target.result;
                        img.style.display = 'block';
                    }
                    
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    
                    const sizeBadgeId = 'coverSizeBadge';
                    let sizeBadge = document.getElementById(sizeBadgeId);
                    if (!sizeBadge) {
                        sizeBadge = document.createElement('div');
                        sizeBadge.id = sizeBadgeId;
                        sizeBadge.className = 'cover-size-badge';
                        coverImagePreviewContainer.appendChild(sizeBadge);
                    }
                    
                    sizeBadge.textContent = formatFileSize(file.size);
                    sizeBadge.style.display = 'block';
                    
                    if (coverImageRemoveBtn) {
                        coverImageRemoveBtn.style.display = 'inline-block';
                    }
                };
                
                reader.onerror = function() {
                    showCoverError(`Error reading ${file.name}`);
                    resetCoverImage();
                    coverImageFile = null; 
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        if (coverImageRemoveBtn) {
            coverImageRemoveBtn.addEventListener('click', function() {
                resetCoverImage();
                coverImageInput.value = '';
                coverImageFile = null; 
            });
        }
        
        function resetCoverImage() {
            const img = coverImagePreviewContainer.querySelector('img');
            const placeholder = coverImagePreviewContainer.querySelector('.placeholder');
            const sizeBadge = document.getElementById('coverSizeBadge');
            
            if (img) {
                img.src = '';
                img.style.display = 'none';
            }
            
            if (placeholder) {
                placeholder.innerHTML = `<i class="fas fa-image"></i>
                    <span>No image selected</span>`;
                placeholder.style.display = 'flex';
            }
            
            if (sizeBadge) {
                sizeBadge.style.display = 'none';
            }
            
            if (coverImageRemoveBtn) {
                coverImageRemoveBtn.style.display = 'none';
            }
        }
        
        function showCoverError(message) {
            const errorId = 'coverImageError';
            let errorEl = document.getElementById(errorId);
            
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.id = errorId;
                errorEl.className = 'file-error';
                errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                coverImagePreviewContainer.parentNode.appendChild(errorEl);
            } else {
                errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            }
            
            clearTimeout(errorEl.dataset.timeout);
            errorEl.dataset.timeout = setTimeout(() => {
                if (errorEl.parentNode) errorEl.remove();
            }, 5000);
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 B';
            
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }
        
        if (coverSizeLimit) {
            coverSizeLimit.textContent = 'Max 2MB';
        }
    }
    
    const successModal = document.getElementById('successModal');
    if (successModal) {
        const closeButtons = successModal.querySelectorAll('.close-modal, #closeModalBtn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        });
        
        const viewGigBtn = document.getElementById('viewGigBtn');
        if (viewGigBtn) {
            viewGigBtn.textContent = 'View Gigs'; 
            viewGigBtn.addEventListener('click', function() {
                window.location.href = 'my.html';
            });
        }
        
        window.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.style.display = 'none';
            }
        });
    }
    
    window.getCoverImageFileToUpload = () => {
        console.log('[FreelancerNewScript] getCoverImageFileToUpload called, returning:', coverImageFile);
        return coverImageFile;
    };
    window.getGalleryFilesToUpload = () => {
        const filesToUpload = galleryFiles.filter(f => f);
        console.log('[FreelancerNewScript] getGalleryFilesToUpload called, returning', filesToUpload.length, 'files:', filesToUpload.map(f=>f.name));
        return filesToUpload;
    };
});