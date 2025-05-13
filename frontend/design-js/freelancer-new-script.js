document.addEventListener('DOMContentLoaded', function() {
    console.log('[FreelancerNewScript] DOM fully loaded and parsed.');
    
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
    
    const newGigForm = document.getElementById('newGigForm'); 
    const successModal = document.getElementById('successModal');
    const viewGigBtn = document.getElementById('viewGigBtn'); 
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveAsDraftBtn = document.getElementById('saveAsDraftBtn');

    const deliveryTimeSelect = document.getElementById('deliveryTimeDays');
    const customDeliveryTimeGroup = document.getElementById('customDeliveryTimeGroup');
    const customDeliveryTimeInput = document.getElementById('customDeliveryTime');

    const coverImageInput = document.getElementById('coverImage');
    const coverImagePreviewContainer = document.getElementById('coverImagePreview');
    let coverImagePreviewImg = null;
    let noImageText = null;

    const billingUnitSelect = document.getElementById('billingUnit');
    const priceLabel = document.getElementById('priceLabel');
    const priceHint = document.getElementById('priceHint');
    const priceInput = document.getElementById('price');

    if (billingUnitSelect && priceLabel && priceHint && priceInput) {
        billingUnitSelect.addEventListener('change', function() {
            if (this.value === 'hourly') {
                priceLabel.innerHTML = 'Hourly Rate ($) <span class="required">*</span>';
                priceHint.textContent = 'Enter your hourly rate.';
                priceInput.min = "1"; 
            } else if (this.value === 'project_item') {
                priceLabel.innerHTML = 'Project / Item Price ($) <span class="required">*</span>';
                priceHint.textContent = 'Enter the total price for the project or per item.';
                priceInput.min = "5"; 
                priceLabel.innerHTML = 'Price ($) <span class="required">*</span>';
                priceHint.textContent = 'Enter the amount based on selected billing unit.';
                priceInput.min = "1"; 
            }
        });
        if(billingUnitSelect.value) {
            billingUnitSelect.dispatchEvent(new Event('change'));
        }
    }

    if (coverImagePreviewContainer) {
        coverImagePreviewImg = coverImagePreviewContainer.querySelector('img');
        noImageText = coverImagePreviewContainer.querySelector('.no-image-text');
    }

    if (coverImageInput && coverImagePreviewImg && noImageText) {
        coverImageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    coverImagePreviewImg.src = e.target.result;
                    coverImagePreviewImg.style.display = 'block';
                    noImageText.style.display = 'none';
                }
                
                reader.readAsDataURL(file);
            } else {
                coverImagePreviewImg.src = '#';
                coverImagePreviewImg.style.display = 'none';
                noImageText.style.display = 'block';
            }
        });
    }

    if (deliveryTimeSelect && customDeliveryTimeGroup && customDeliveryTimeInput) {
        deliveryTimeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDeliveryTimeGroup.style.display = 'block';
                customDeliveryTimeInput.required = true;
            } else {
                customDeliveryTimeGroup.style.display = 'none';
                customDeliveryTimeInput.required = false;
                customDeliveryTimeInput.value = '';  
            }
        });
    }
    
    if (newGigForm) {
        newGigForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const whatYouGetInput = document.getElementById('whatYouGet');
            if (whatYouGetInput) {
                const lines = whatYouGetInput.value.split('\n').filter(line => line.trim() !== '');
                if (lines.length > 5) {
                    alert('Please limit "What You Get / Key Offerings" to a maximum of 5 items.');
                    whatYouGetInput.focus();
                    return;
                }
            }

            if (coverImageInput && coverImageInput.files.length === 0) {
                alert('Please upload a cover image for your gig.');
                coverImageInput.focus();
                return;
            }
            
            if (deliveryTimeSelect && deliveryTimeSelect.value === 'custom' && customDeliveryTimeInput && !customDeliveryTimeInput.value) {
                alert('Please enter the number of custom delivery days.');
                customDeliveryTimeInput.focus();
                return;
            }

            if (successModal) {
                successModal.style.display = 'flex';
            }
        });
    }
    
    if (saveAsDraftBtn) {
        saveAsDraftBtn.addEventListener('click', function() {
            alert('Gig saved as draft'); 
        });
    }
    
    if (successModal) {
        const closeModalIcon = successModal.querySelector('.close-modal');
        
        if (closeModalIcon) {
            closeModalIcon.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        }
        
        if (viewGigBtn) {
            viewGigBtn.addEventListener('click', function() {
                alert('Redirecting to view gig...');  
                successModal.style.display = 'none';
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