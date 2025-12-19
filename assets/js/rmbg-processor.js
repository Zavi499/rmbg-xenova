/**
 * Background Remover - Xenova Modnet
 * Client-side image processing with AI
 */

import { AutoModel, AutoProcessor, RawImage, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Configure Transformers.js environment
env.allowLocalModels = false;
env.useBrowserCache = true;

class RMBGProcessor {
    constructor() {
        this.model = null;
        this.processor = null;
        this.isModelLoaded = false;
        this.isModelLoading = false;
        this.currentImage = null;

        // DOM elements
        this.elements = {};

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the processor
     */
    async init() {
        this.cacheElements();
        this.attachEventListeners();
        this.checkModelCache();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            uploadArea: document.getElementById('rmbgUploadArea'),
            fileInput: document.getElementById('rmbgFileInput'),
            uploadSection: document.getElementById('rmbgUploadSection'),
            modelLoading: document.getElementById('rmbgModelLoading'),
            modelStatus: document.getElementById('rmbgModelStatus'),
            modelProgress: document.getElementById('rmbgModelProgress'),
            modelProgressText: document.getElementById('rmbgModelProgressText'),
            processingSection: document.getElementById('rmbgProcessingSection'),
            processProgress: document.getElementById('rmbgProcessProgress'),
            processProgressText: document.getElementById('rmbgProcessProgressText'),
            resultSection: document.getElementById('rmbgResultSection'),
            originalImage: document.getElementById('rmbgOriginalImage'),
            resultCanvas: document.getElementById('rmbgResultCanvas'),
            downloadBtn: document.getElementById('rmbgDownloadBtn'),
            newImageBtn: document.getElementById('rmbgNewImageBtn'),
            errorSection: document.getElementById('rmbgErrorSection'),
            errorMessage: document.getElementById('rmbgErrorMessage'),
            retryBtn: document.getElementById('rmbgRetryBtn'),
            infoNotice: document.getElementById('rmbgInfoNotice')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Upload area click
        if (this.elements.uploadArea) {
            this.elements.uploadArea.addEventListener('click', () => {
                this.elements.fileInput.click();
            });

            // Drag and drop
            this.elements.uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.elements.uploadArea.classList.add('rmbg-drag-over');
            });

            this.elements.uploadArea.addEventListener('dragleave', () => {
                this.elements.uploadArea.classList.remove('rmbg-drag-over');
            });

            this.elements.uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                this.elements.uploadArea.classList.remove('rmbg-drag-over');

                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    this.handleImageUpload(files[0]);
                }
            });
        }

        // File input change
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0]);
                }
            });
        }

        // Download button
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => {
                this.downloadImage();
            });
        }

        // New image button
        if (this.elements.newImageBtn) {
            this.elements.newImageBtn.addEventListener('click', () => {
                this.reset();
            });
        }

        // Retry button
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => {
                this.reset();
            });
        }
    }

    /**
     * Check if model is cached
     */
    async checkModelCache() {
        const cacheKey = 'rmbg_model_cached';
        const isCached = localStorage.getItem(cacheKey);

        if (isCached) {
            // Hide the first-time notice if model is cached
            if (this.elements.infoNotice) {
                this.elements.infoNotice.style.display = 'none';
            }
        }
    }

    /**
     * Load the AI model
     */
    async loadModel() {
        if (this.isModelLoaded) {
            return;
        }

        if (this.isModelLoading) {
            // Wait for the current loading to finish
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.isModelLoaded) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        this.isModelLoading = true;

        try {
            // Show loading UI
            this.showSection('modelLoading');
            this.updateModelStatus('Downloading AI model...', 0);

            // Load model with progress tracking
            this.updateModelStatus('Loading model...', 10);

            this.model = await AutoModel.from_pretrained('Xenova/modnet', {
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        const percentage = Math.min(Math.round((progress.loaded / progress.total) * 100), 90);
                        this.updateModelStatus(`Downloading: ${progress.file}`, percentage);
                    } else if (progress.status === 'done') {
                        this.updateModelStatus('Processing model files...', 95);
                    }
                }
            });

            this.updateModelStatus('Loading processor...', 80);
            this.processor = await AutoProcessor.from_pretrained('Xenova/modnet');

            this.updateModelStatus('Model loaded successfully!', 100);

            // Mark model as cached
            localStorage.setItem('rmbg_model_cached', 'true');

            this.isModelLoaded = true;
            this.isModelLoading = false;

            // Hide loading UI after a short delay
            setTimeout(() => {
                this.hideSection('modelLoading');
            }, 500);

        } catch (error) {
            console.error('Error loading model:', error);
            this.isModelLoading = false;
            throw error;
        }
    }

    /**
     * Handle image upload
     */
    async handleImageUpload(file) {
        try {
            // Reset any previous state
            this.hideSection('errorSection');

            // Load model if not already loaded
            if (!this.isModelLoaded) {
                await this.loadModel();
            }

            // Read the image file
            const imageUrl = URL.createObjectURL(file);
            this.currentImage = imageUrl;

            // Load image
            const img = new Image();
            img.onload = async () => {
                try {
                    await this.processImage(img);
                } catch (error) {
                    this.showError('Failed to process image: ' + error.message);
                }
            };
            img.onerror = () => {
                this.showError('Failed to load image. Please try another file.');
            };
            img.src = imageUrl;

        } catch (error) {
            console.error('Error handling image upload:', error);
            this.showError('Failed to upload image: ' + error.message);
        }
    }

    /**
     * Process image to remove background
     */
    async processImage(img) {
        try {
            // Show processing UI
            this.hideSection('uploadSection');
            this.showSection('processingSection');
            this.updateProcessProgress(0);

            this.updateProcessProgress(20, 'Preparing image...');

            // Create canvas to get image data
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Convert to RawImage format
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const rawImage = new RawImage(
                new Uint8Array(imageData.data),
                canvas.width,
                canvas.height,
                4
            );

            this.updateProcessProgress(40, 'Processing with AI...');

            // Process image with model
            const inputs = await this.processor(rawImage);

            this.updateProcessProgress(70, 'Removing background...');

            const { output } = await this.model(inputs);

            this.updateProcessProgress(90, 'Finalizing...');

            // Process the output to create alpha mask
            const maskData = output.data;
            const [batchSize, channels, height, width] = output.dims;

            // Create result canvas
            const resultCanvas = this.elements.resultCanvas;
            resultCanvas.width = width;
            resultCanvas.height = height;
            const resultCtx = resultCanvas.getContext('2d');

            // Resize original image to match mask dimensions
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, width, height);
            const resultImageData = tempCtx.getImageData(0, 0, width, height);

            // Apply mask to create transparency
            for (let i = 0; i < height * width; i++) {
                const alpha = maskData[i] * 255; // Convert to 0-255 range
                resultImageData.data[i * 4 + 3] = alpha; // Set alpha channel
            }

            resultCtx.putImageData(resultImageData, 0, 0);

            this.updateProcessProgress(100, 'Complete!');

            // Show result
            this.elements.originalImage.src = img.src;

            setTimeout(() => {
                this.hideSection('processingSection');
                this.showSection('resultSection');
            }, 500);

        } catch (error) {
            console.error('Error processing image:', error);
            this.hideSection('processingSection');
            this.showError('Failed to remove background: ' + error.message);
        }
    }

    /**
     * Download the processed image
     */
    downloadImage() {
        try {
            const canvas = this.elements.resultCanvas;
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'background-removed-' + Date.now() + '.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        } catch (error) {
            console.error('Error downloading image:', error);
            this.showError('Failed to download image: ' + error.message);
        }
    }

    /**
     * Update model loading status
     */
    updateModelStatus(message, percentage) {
        if (this.elements.modelStatus) {
            this.elements.modelStatus.textContent = message;
        }
        if (this.elements.modelProgress) {
            this.elements.modelProgress.style.width = percentage + '%';
        }
        if (this.elements.modelProgressText) {
            this.elements.modelProgressText.textContent = Math.round(percentage) + '%';
        }
    }

    /**
     * Update processing progress
     */
    updateProcessProgress(percentage, message = '') {
        if (this.elements.processProgress) {
            this.elements.processProgress.style.width = percentage + '%';
        }
        if (this.elements.processProgressText) {
            this.elements.processProgressText.textContent = Math.round(percentage) + '%';
        }
    }

    /**
     * Show a section
     */
    showSection(sectionName) {
        const element = this.elements[sectionName];
        if (element) {
            element.style.display = 'block';
        }
    }

    /**
     * Hide a section
     */
    hideSection(sectionName) {
        const element = this.elements[sectionName];
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        this.hideSection('uploadSection');
        this.hideSection('processingSection');
        this.hideSection('resultSection');
        this.hideSection('modelLoading');

        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
        }
        this.showSection('errorSection');
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.hideSection('resultSection');
        this.hideSection('errorSection');
        this.hideSection('processingSection');
        this.showSection('uploadSection');

        // Clear file input
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }

        // Revoke object URL if exists
        if (this.currentImage) {
            URL.revokeObjectURL(this.currentImage);
            this.currentImage = null;
        }
    }
}

// Initialize the processor
new RMBGProcessor();
