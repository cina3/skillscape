document.addEventListener('DOMContentLoaded', function() {
    console.log('[CustomerNewScript] DOM fully loaded and parsed.');

    let coverImageFile = null;
    let galleryFiles = []; 

    const MAX_GALLERY_FILES = 5;
    const MAX_GALLERY_SIZE_MB = 25;
    const MAX_GALLERY_SIZE_BYTES = MAX_GALLERY_SIZE_MB * 1024 * 1024;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; 

    const coverImageInput = document.getElementById('coverImage');
    const coverImagePreviewDiv = document.getElementById('coverImagePreview');
    const coverImagePreviewImg = coverImagePreviewDiv ? coverImagePreviewDiv.querySelector('img') : null;
    const coverImagePlaceholder = coverImagePreviewDiv ? coverImagePreviewDiv.querySelector('.placeholder') : null;
    const removeCoverImageBtn = document.getElementById('removeCoverImage');

    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadedFilesDiv = document.getElementById('uploadedFiles');
    const galleryCountSpan = document.getElementById('galleryCount');
    const totalGallerySizeSpan = document.getElementById('totalGallerySize');
    const galleryProgressBar = document.getElementById('galleryProgressBar');
    const clearGalleryBtn = document.getElementById('clearGallery');
    
    let totalGallerySize = 0;

    if (coverImageInput && coverImagePreviewDiv && coverImagePreviewImg && coverImagePlaceholder && removeCoverImageBtn) {
        coverImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { 
                    alert('Cover image must be under 2MB.');
                    this.value = '';
                    coverImageFile = null;
                    coverImagePreviewImg.style.display = 'none';
                    coverImagePlaceholder.style.display = 'flex';
                    coverImagePlaceholder.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
                    removeCoverImageBtn.style.display = 'none';
                    return;
                }
                coverImageFile = file; 
                console.log('[CustomerNewScript] Cover image selected:', coverImageFile);

                const reader = new FileReader();
                reader.onload = function(e) {
                    coverImagePreviewImg.src = e.target.result;
                    coverImagePreviewImg.style.display = 'block';
                }
                reader.readAsDataURL(file);
                coverImagePlaceholder.style.display = 'none';
                removeCoverImageBtn.style.display = 'inline-block';
            } else {
                coverImageFile = null;
                console.log('[CustomerNewScript] Cover image selection cleared.');
            }
        });

        removeCoverImageBtn.addEventListener('click', function() {
            coverImageInput.value = '';
            coverImagePreviewImg.src = '#';
            coverImagePreviewImg.style.display = 'none';
            coverImagePlaceholder.style.display = 'flex';
            coverImagePlaceholder.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
            this.style.display = 'none';
            coverImageFile = null; 
            console.log('[CustomerNewScript] Cover image removed.');
        });
    }

    if (fileUploadArea && fileInput && uploadedFilesDiv) {
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
            console.log('[CustomerNewScript] handleFiles called with', files.length, 'files.');
            const currentFiles = uploadedFilesDiv.querySelectorAll('.gallery-thumb').length;
            const filesArray = Array.from(files);
            const filesToProcess = filesArray.slice(0, MAX_GALLERY_FILES - currentFiles);
            
            if (filesToProcess.length < filesArray.length) {
                showFileError(`Only ${MAX_GALLERY_FILES} files allowed. Added ${filesToProcess.length} out of ${filesArray.length}.`);
            }
            
            if (filesToProcess.length === 0) {
                showFileError(`Maximum of ${MAX_GALLERY_FILES} files already added.`);
                return;
            }
            
            filesToProcess.forEach(file => {
                if (file.size > MAX_FILE_SIZE) {
                    showFileError(`${file.name} exceeds 5MB limit.`);
                    return;
                }
                
                if (totalGallerySize + file.size > MAX_GALLERY_SIZE_BYTES) {
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
                uploadedFilesDiv.appendChild(fileItem);
                
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
                        
                        const originalFileObj = galleryFiles.find(f => f.name === file.name && f.size === file.size);
                        if (originalFileObj) {
                            galleryFiles = galleryFiles.filter(f => f !== originalFileObj);
                            console.log('[CustomerNewScript] Removed from galleryFiles:', originalFileObj.name, '. Remaining count:', galleryFiles.length);
                        } else {
                            console.warn('[CustomerNewScript] Could not find file in galleryFiles to remove:', file.name);
                        }
                        
                        totalGallerySize -= parseInt(fileItem.dataset.filesize, 10) || 0;
                        
                        URL.revokeObjectURL(e.target.result); 
                        fileItem.remove();
                        updateGalleryCount();
                    });
                    
                    updateGalleryCount();
                };
                
                reader.onerror = function() {
                    fileItem.remove();
                    galleryFiles = galleryFiles.filter(f => f.name !== file.name || f.size !== file.size);
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
                    container.insertBefore(error, uploadedFilesDiv);
                } else {
                    uploadedFilesDiv.parentNode.insertBefore(error, uploadedFilesDiv);
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
            const current = uploadedFilesDiv.querySelectorAll('.gallery-thumb').length;
            
            if (galleryCountSpan) {
                galleryCountSpan.textContent = `${current}/${MAX_GALLERY_FILES} files`;
            }
            
            if (galleryProgressBar) {
                const percentage = (current / MAX_GALLERY_FILES) * 100;
                galleryProgressBar.style.width = `${percentage}%`;
                
                if (totalGallerySizeSpan) {
                    const percentOfMax = Math.round((totalGallerySize / MAX_GALLERY_SIZE_BYTES) * 100);
                    totalGallerySizeSpan.textContent = `${formatFileSize(totalGallerySize)} / 25MB`;
                }
            }
            
            if (fileUploadArea) {
                if (current >= MAX_GALLERY_FILES) {
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
        
        if (clearGalleryBtn) {
            clearGalleryBtn.addEventListener('click', function() {
                if (confirm('Clear all uploaded files?')) {
                    const items = uploadedFilesDiv.querySelectorAll('.gallery-thumb');
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
        
        updateGalleryCount();
    }

    window.getCoverImageFileToUpload = () => {
        console.log('[CustomerNewScript] getCoverImageFileToUpload called, returning:', coverImageFile);
        return coverImageFile;
    };
    window.getGalleryFilesToUpload = () => {
        const filesToUpload = galleryFiles.filter(f => f);
        console.log('[CustomerNewScript] getGalleryFilesToUpload called, returning', filesToUpload.length, 'files:', filesToUpload.map(f=>f.name));
        return filesToUpload;
    };
});