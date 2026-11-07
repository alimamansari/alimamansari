/* ==========================================================================
   SECURE IN-BROWSER PDF & IMAGE PROCESSING ENGINE (100% CLIENT-SIDE)
   Author: Alimam Ansari Studio
   Zero Server Uploads - Pure JavaScript, Canvas, and Web APIs
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Theme Sync with Main Portfolio --- */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    /* --- Tab Switching System --- */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabCards = document.querySelectorAll('.tool-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = 'tab-' + btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabCards.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                targetCard.classList.add('active');
            }
        });
    });

    // Helper: Format Bytes to KB / MB
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }


    /* ==========================================================================
       TOOL 1: EXACT TARGET-KB IMAGE COMPRESSOR
       Binary-search quality & dimension reduction loop in pure Canvas
       ========================================================================== */
    const imgDropZone = document.getElementById('img-drop-zone');
    const imgInput = document.getElementById('img-input');
    const imgWorkbench = document.getElementById('img-workbench');
    const imgName = document.getElementById('img-name');
    const imgOrigSize = document.getElementById('img-orig-size');
    const imgRemoveBtn = document.getElementById('img-remove-btn');
    const targetKbInput = document.getElementById('target-kb-input');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const imgFormatSelect = document.getElementById('img-format-select');
    const btnCompressImg = document.getElementById('btn-compress-img');
    const imgProgressWrap = document.getElementById('img-progress-wrap');
    const imgProgressFill = document.getElementById('img-progress-fill');
    const imgProgressText = document.getElementById('img-progress-text');
    const imgResultCard = document.getElementById('img-result-card');
    const imgResultSize = document.getElementById('img-result-size');
    const imgResultSaving = document.getElementById('img-result-saving');
    const imgPreview = document.getElementById('img-preview');
    const imgDownloadBtn = document.getElementById('img-download-btn');

    let currentImageFile = null;
    let loadedImageBitmap = null;

    // Preset KB Buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            targetKbInput.value = btn.getAttribute('data-kb');
        });
    });

    targetKbInput.addEventListener('input', () => {
        presetBtns.forEach(btn => {
            if (btn.getAttribute('data-kb') === targetKbInput.value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });

    // File Input Handling
    imgDropZone.addEventListener('click', () => imgInput.click());

    setupDropZone(imgDropZone, (files) => {
        if (files && files[0] && files[0].type.startsWith('image/')) {
            loadImageFile(files[0]);
        }
    });

    imgInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            loadImageFile(e.target.files[0]);
        }
    });

    imgRemoveBtn.addEventListener('click', () => {
        currentImageFile = null;
        loadedImageBitmap = null;
        imgInput.value = '';
        imgWorkbench.style.display = 'none';
        imgDropZone.style.display = 'block';
        imgResultCard.style.display = 'none';
    });

    function loadImageFile(file) {
        currentImageFile = file;
        imgName.textContent = file.name;
        imgOrigSize.textContent = 'Original: ' + formatBytes(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                loadedImageBitmap = img;
                imgDropZone.style.display = 'none';
                imgWorkbench.style.display = 'block';
                imgResultCard.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Compression Core Logic with Target KB Binary Search
    btnCompressImg.addEventListener('click', async () => {
        if (!loadedImageBitmap) return;

        const targetKB = parseFloat(targetKbInput.value) || 100;
        const targetBytes = targetKB * 1024;
        const outputFormat = imgFormatSelect.value;

        btnCompressImg.disabled = true;
        imgProgressWrap.style.display = 'flex';
        imgProgressFill.style.width = '10%';
        imgProgressText.textContent = `Targeting ${targetKB} KB...`;
        imgResultCard.style.display = 'none';

        try {
            const compressedBlob = await compressImageToTargetBytes(
                loadedImageBitmap,
                targetBytes,
                outputFormat,
                (percent, msg) => {
                    imgProgressFill.style.width = percent + '%';
                    imgProgressText.textContent = msg;
                }
            );

            // Display Results
            const resultUrl = URL.createObjectURL(compressedBlob);
            imgPreview.src = resultUrl;
            imgResultSize.textContent = formatBytes(compressedBlob.size);

            const savings = ((1 - (compressedBlob.size / currentImageFile.size)) * 100).toFixed(1);
            imgResultSaving.textContent = (savings > 0 ? '-' : '+') + Math.abs(savings) + '%';

            let ext = 'jpg';
            if (outputFormat === 'image/png') ext = 'png';
            if (outputFormat === 'image/webp') ext = 'webp';

            const baseName = currentImageFile.name.substring(0, currentImageFile.name.lastIndexOf('.')) || 'image';
            imgDownloadBtn.href = resultUrl;
            imgDownloadBtn.download = `${baseName}_${Math.round(compressedBlob.size / 1024)}KB.${ext}`;

            imgProgressFill.style.width = '100%';
            imgProgressText.textContent = 'Compression complete!';
            imgResultCard.style.display = 'block';

        } catch (err) {
            console.error(err);
            alert('Compression error: ' + err.message);
        } finally {
            btnCompressImg.disabled = false;
        }
    });

    async function compressImageToTargetBytes(img, targetBytes, mimeType, progressCb) {
        let currentWidth = img.naturalWidth || img.width;
        let currentHeight = img.naturalHeight || img.height;

        let bestBlob = null;
        let bestQuality = 0.92;

        // If PNG and target is small, canvas PNG is lossless, so convert to JPEG/WEBP if needed
        const effectiveMime = (mimeType === 'image/png' && targetBytes < img.size) ? 'image/jpeg' : mimeType;

        // Step 1: Binary Search Quality (at 100% dimensions)
        let lowQuality = 0.05;
        let highQuality = 0.98;

        for (let i = 0; i < 7; i++) {
            const midQ = (lowQuality + highQuality) / 2;
            progressCb(20 + i * 8, `Optimizing quality (${Math.round(midQ * 100)}%)...`);

            const blob = await canvasToBlob(img, currentWidth, currentHeight, effectiveMime, midQ);

            if (blob.size <= targetBytes) {
                bestBlob = blob;
                lowQuality = midQ; // try higher quality while staying below target
            } else {
                highQuality = midQ; // file is too big, reduce quality
            }
        }

        // Step 2: If even at minimum quality it exceeds targetBytes, smoothly scale down dimensions
        if (!bestBlob || bestBlob.size > targetBytes) {
            let scale = 0.9;
            while (scale > 0.1) {
                const scaledWidth = Math.round(currentWidth * scale);
                const scaledHeight = Math.round(currentHeight * scale);
                progressCb(80, `Rescaling dimensions to ${scaledWidth}x${scaledHeight}...`);

                const blob = await canvasToBlob(img, scaledWidth, scaledHeight, effectiveMime, 0.75);
                if (blob.size <= targetBytes) {
                    bestBlob = blob;
                    break;
                }
                scale -= 0.12;
            }
        }

        // Fallback: If still slightly over, return lowest generated
        if (!bestBlob) {
            bestBlob = await canvasToBlob(img, Math.round(currentWidth * 0.5), Math.round(currentHeight * 0.5), effectiveMime, 0.5);
        }

        return bestBlob;
    }

    function canvasToBlob(img, w, h, mime, quality) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');

            // Draw white background in case of transparent PNG converted to JPEG
            if (mime === 'image/jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
            }

            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => resolve(blob), mime, quality);
        });
    }


    /* ==========================================================================
       TOOL 2: PDF TO HIGH-QUALITY JPG (PDF.JS)
       Extracts pages client-side into canvas images
       ========================================================================== */
    const pdf2jpgDropZone = document.getElementById('pdf2jpg-drop-zone');
    const pdf2jpgInput = document.getElementById('pdf2jpg-input');
    const pdf2jpgWorkbench = document.getElementById('pdf2jpg-workbench');
    const pdf2jpgName = document.getElementById('pdf2jpg-name');
    const pdf2jpgOrigSize = document.getElementById('pdf2jpg-orig-size');
    const pdf2jpgRemoveBtn = document.getElementById('pdf2jpg-remove-btn');
    const pdf2jpgDpi = document.getElementById('pdf2jpg-dpi');
    const btnConvertPdf2Jpg = document.getElementById('btn-convert-pdf2jpg');
    const pdf2jpgProgressWrap = document.getElementById('pdf2jpg-progress-wrap');
    const pdf2jpgProgressFill = document.getElementById('pdf2jpg-progress-fill');
    const pdf2jpgProgressText = document.getElementById('pdf2jpg-progress-text');
    const pdf2jpgResults = document.getElementById('pdf2jpg-results');
    const pdf2jpgCount = document.getElementById('pdf2jpg-count');
    const pdf2jpgGallery = document.getElementById('pdf2jpg-gallery');
    const btnDownloadAllZip = document.getElementById('btn-download-all-zip');

    let currentPdfDoc = null;
    let convertedPagesData = []; // [{ pageNum, dataUrl, blob }]

    // Set worker for Mozilla PDF.js
    if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    pdf2jpgDropZone.addEventListener('click', () => pdf2jpgInput.click());

    setupDropZone(pdf2jpgDropZone, (files) => {
        if (files && files[0] && files[0].type === 'application/pdf') {
            loadPdfFile(files[0]);
        }
    });

    pdf2jpgInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            loadPdfFile(e.target.files[0]);
        }
    });

    pdf2jpgRemoveBtn.addEventListener('click', () => {
        currentPdfDoc = null;
        convertedPagesData = [];
        pdf2jpgInput.value = '';
        pdf2jpgWorkbench.style.display = 'none';
        pdf2jpgDropZone.style.display = 'block';
        pdf2jpgResults.style.display = 'none';
    });

    async function loadPdfFile(file) {
        pdf2jpgName.textContent = file.name;
        pdf2jpgOrigSize.textContent = 'Size: ' + formatBytes(file.size);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            currentPdfDoc = await loadingTask.promise;

            pdf2jpgOrigSize.textContent = `${currentPdfDoc.numPages} Page(s) \u2022 ${formatBytes(file.size)}`;
            pdf2jpgDropZone.style.display = 'none';
            pdf2jpgWorkbench.style.display = 'block';
            pdf2jpgResults.style.display = 'none';
        } catch (err) {
            alert('Failed to read PDF. Make sure it is not password protected.');
            console.error(err);
        }
    }

    btnConvertPdf2Jpg.addEventListener('click', async () => {
        if (!currentPdfDoc) return;

        btnConvertPdf2Jpg.disabled = true;
        pdf2jpgProgressWrap.style.display = 'flex';
        pdf2jpgResults.style.display = 'none';
        pdf2jpgGallery.innerHTML = '';
        convertedPagesData = [];

        const scale = parseFloat(pdf2jpgDpi.value) || 2.0;
        const totalPages = currentPdfDoc.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            pdf2jpgProgressFill.style.width = Math.round((pageNum / totalPages) * 100) + '%';
            pdf2jpgProgressText.textContent = `Rendering page ${pageNum} of ${totalPages}...`;

            const page = await currentPdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');

            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({ canvasContext: ctx, viewport }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));

            convertedPagesData.push({ pageNum, dataUrl, blob });

            // Create Page Card
            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `
                <img src="${dataUrl}" alt="Page ${pageNum}">
                <div class="page-card-footer">
                    <span class="page-num">Page ${pageNum}</span>
                    <a href="${dataUrl}" download="${pdf2jpgName.textContent.replace(/\.pdf$/i, '')}_page_${pageNum}.jpg" class="page-download-btn">
                        <i class="fa-solid fa-download"></i> Save JPG
                    </a>
                </div>
            `;
            pdf2jpgGallery.appendChild(card);
        }

        pdf2jpgCount.textContent = totalPages;
        pdf2jpgProgressText.textContent = 'All pages converted!';
        pdf2jpgResults.style.display = 'block';
        btnConvertPdf2Jpg.disabled = false;
    });

    // Download All as ZIP (via JSZip)
    btnDownloadAllZip.addEventListener('click', async () => {
        if (!convertedPagesData.length || !window.JSZip) return;

        btnDownloadAllZip.disabled = true;
        btnDownloadAllZip.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Bundling ZIP...';

        const zip = new JSZip();
        const baseName = pdf2jpgName.textContent.replace(/\.pdf$/i, '');

        convertedPagesData.forEach(item => {
            zip.file(`${baseName}_page_${item.pageNum}.jpg`, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(zipBlob);

        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `${baseName}_images.zip`;
        a.click();

        btnDownloadAllZip.disabled = false;
        btnDownloadAllZip.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Download All as ZIP';
    });


    /* ==========================================================================
       TOOL 3: IMAGES TO CLEAN PDF MERGER (JSPDF)
       Combines multiple images into a professional PDF
       ========================================================================== */
    const jpg2pdfDropZone = document.getElementById('jpg2pdf-drop-zone');
    const jpg2pdfInput = document.getElementById('jpg2pdf-input');
    const jpg2pdfWorkbench = document.getElementById('jpg2pdf-workbench');
    const jpg2pdfCountBadge = document.getElementById('jpg2pdf-count-badge');
    const jpg2pdfThumbs = document.getElementById('jpg2pdf-thumbs');
    const jpg2pdfClearBtn = document.getElementById('jpg2pdf-clear-btn');
    const jpg2pdfAddMoreBtn = document.getElementById('jpg2pdf-add-more-btn');
    const jpg2pdfOrientation = document.getElementById('jpg2pdf-orientation');
    const jpg2pdfMargin = document.getElementById('jpg2pdf-margin');
    const btnGeneratePdf = document.getElementById('btn-generate-pdf');

    let selectedImages = []; // [{ file, dataUrl, imgElement }]

    jpg2pdfDropZone.addEventListener('click', () => jpg2pdfInput.click());
    jpg2pdfAddMoreBtn.addEventListener('click', () => jpg2pdfInput.click());

    setupDropZone(jpg2pdfDropZone, (files) => {
        addImagesToPdfList(Array.from(files).filter(f => f.type.startsWith('image/')));
    });

    jpg2pdfInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length) {
            addImagesToPdfList(Array.from(e.target.files));
        }
    });

    jpg2pdfClearBtn.addEventListener('click', () => {
        selectedImages = [];
        jpg2pdfInput.value = '';
        jpg2pdfThumbs.innerHTML = '';
        jpg2pdfWorkbench.style.display = 'none';
        jpg2pdfDropZone.style.display = 'block';
    });

    function addImagesToPdfList(files) {
        if (!files.length) return;

        let loadedCount = 0;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    selectedImages.push({
                        file,
                        dataUrl: e.target.result,
                        imgElement: img,
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    });
                    loadedCount++;
                    if (loadedCount === files.length) {
                        renderImageThumbs();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImageThumbs() {
        if (!selectedImages.length) {
            jpg2pdfWorkbench.style.display = 'none';
            jpg2pdfDropZone.style.display = 'block';
            return;
        }

        jpg2pdfDropZone.style.display = 'none';
        jpg2pdfWorkbench.style.display = 'block';
        jpg2pdfCountBadge.textContent = `${selectedImages.length} Image(s) Selected`;
        jpg2pdfThumbs.innerHTML = '';

        selectedImages.forEach((item, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumb-item';
            thumb.innerHTML = `
                <img src="${item.dataUrl}" alt="Photo ${index + 1}">
                <button type="button" class="thumb-delete-btn" data-index="${index}" title="Remove image">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <span class="thumb-order-badge">#${index + 1}</span>
            `;
            jpg2pdfThumbs.appendChild(thumb);
        });

        // Attach delete events
        document.querySelectorAll('.thumb-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                selectedImages.splice(idx, 1);
                renderImageThumbs();
            });
        });
    }

    btnGeneratePdf.addEventListener('click', () => {
        if (!selectedImages.length || !window.jspdf) return;

        btnGeneratePdf.disabled = true;
        btnGeneratePdf.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';

        try {
            const { jsPDF } = window.jspdf;
            const orientationMode = jpg2pdfOrientation.value;
            const marginMm = parseFloat(jpg2pdfMargin.value) || 0;

            let doc = null;

            selectedImages.forEach((item, index) => {
                let pageOrientation = 'p';
                if (orientationMode === 'landscape') pageOrientation = 'l';
                if (orientationMode === 'auto') pageOrientation = item.width > item.height ? 'l' : 'p';

                if (index === 0) {
                    doc = new jsPDF({
                        orientation: pageOrientation,
                        unit: 'mm',
                        format: 'a4'
                    });
                } else {
                    doc.addPage('a4', pageOrientation);
                }

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                const printableW = pageWidth - (marginMm * 2);
                const printableH = pageHeight - (marginMm * 2);

                const imgRatio = item.width / item.height;
                const pageRatio = printableW / printableH;

                let drawW, drawH;
                if (imgRatio > pageRatio) {
                    drawW = printableW;
                    drawH = printableW / imgRatio;
                } else {
                    drawH = printableH;
                    drawW = printableH * imgRatio;
                }

                const x = marginMm + (printableW - drawW) / 2;
                const y = marginMm + (printableH - drawH) / 2;

                doc.addImage(item.dataUrl, 'JPEG', x, y, drawW, drawH);
            });

            doc.save('Merged_Documents.pdf');
        } catch (err) {
            console.error(err);
            alert('PDF generation error: ' + err.message);
        } finally {
            btnGeneratePdf.disabled = false;
            btnGeneratePdf.innerHTML = '<i class="fa-solid fa-file-export"></i> Assemble &amp; Download PDF';
        }
    });


    /* ==========================================================================
       TOOL 4: PDF COMPRESSOR (IN-BROWSER STREAM COMPRESSION)
       Re-renders pages to optimized JPEG canvas streams and repacks to PDF
       ========================================================================== */
    const cpdfDropZone = document.getElementById('cpdf-drop-zone');
    const cpdfInput = document.getElementById('cpdf-input');
    const cpdfWorkbench = document.getElementById('cpdf-workbench');
    const cpdfName = document.getElementById('cpdf-name');
    const cpdfOrigSize = document.getElementById('cpdf-orig-size');
    const cpdfRemoveBtn = document.getElementById('cpdf-remove-btn');
    const cpdfLevel = document.getElementById('cpdf-level');
    const btnCompressPdfAction = document.getElementById('btn-compress-pdf-action');
    const cpdfProgressWrap = document.getElementById('cpdf-progress-wrap');
    const cpdfProgressFill = document.getElementById('cpdf-progress-fill');
    const cpdfProgressText = document.getElementById('cpdf-progress-text');
    const cpdfResultCard = document.getElementById('cpdf-result-card');
    const cpdfResultSize = document.getElementById('cpdf-result-size');
    const cpdfResultSaving = document.getElementById('cpdf-result-saving');
    const cpdfDownloadBtn = document.getElementById('cpdf-download-btn');

    let cpdfLoadedDoc = null;
    let cpdfOriginalBytes = 0;

    cpdfDropZone.addEventListener('click', () => cpdfInput.click());

    setupDropZone(cpdfDropZone, (files) => {
        if (files && files[0] && files[0].type === 'application/pdf') {
            loadCompressPdfFile(files[0]);
        }
    });

    cpdfInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            loadCompressPdfFile(e.target.files[0]);
        }
    });

    cpdfRemoveBtn.addEventListener('click', () => {
        cpdfLoadedDoc = null;
        cpdfInput.value = '';
        cpdfWorkbench.style.display = 'none';
        cpdfDropZone.style.display = 'block';
        cpdfResultCard.style.display = 'none';
    });

    async function loadCompressPdfFile(file) {
        cpdfOriginalBytes = file.size;
        cpdfName.textContent = file.name;
        cpdfOrigSize.textContent = 'Size: ' + formatBytes(file.size);

        try {
            const arrayBuffer = await file.arrayBuffer();
            cpdfLoadedDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            cpdfOrigSize.textContent = `${cpdfLoadedDoc.numPages} Page(s) \u2022 ${formatBytes(file.size)}`;

            cpdfDropZone.style.display = 'none';
            cpdfWorkbench.style.display = 'block';
            cpdfResultCard.style.display = 'none';
        } catch (err) {
            alert('Cannot read PDF. File may be encrypted or corrupted.');
            console.error(err);
        }
    }

    btnCompressPdfAction.addEventListener('click', async () => {
        if (!cpdfLoadedDoc || !window.jspdf) return;

        btnCompressPdfAction.disabled = true;
        cpdfProgressWrap.style.display = 'flex';
        cpdfResultCard.style.display = 'none';

        const intensity = cpdfLevel.value;
        let scale = 1.6;
        let quality = 0.75;

        if (intensity === 'low') {
            scale = 2.0;
            quality = 0.85;
        } else if (intensity === 'high') {
            scale = 1.2;
            quality = 0.55;
        }

        try {
            const { jsPDF } = window.jspdf;
            let outDoc = null;
            const totalPages = cpdfLoadedDoc.numPages;

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                cpdfProgressFill.style.width = Math.round((pageNum / totalPages) * 100) + '%';
                cpdfProgressText.textContent = `Compressing page ${pageNum} of ${totalPages}...`;

                const page = await cpdfLoadedDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: ctx, viewport }).promise;

                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                const isLandscape = viewport.width > viewport.height;
                const pageOrientation = isLandscape ? 'l' : 'p';

                if (pageNum === 1) {
                    outDoc = new jsPDF({
                        orientation: pageOrientation,
                        unit: 'pt',
                        format: [viewport.width, viewport.height]
                    });
                } else {
                    outDoc.addPage([viewport.width, viewport.height], pageOrientation);
                }

                outDoc.addImage(dataUrl, 'JPEG', 0, 0, viewport.width, viewport.height);
            }

            const compressedBlob = outDoc.output('blob');
            const compressedUrl = URL.createObjectURL(compressedBlob);

            cpdfResultSize.textContent = formatBytes(compressedBlob.size);
            const savings = ((1 - (compressedBlob.size / cpdfOriginalBytes)) * 100).toFixed(1);
            cpdfResultSaving.textContent = (savings > 0 ? '-' : '+') + Math.abs(savings) + '%';

            const baseName = cpdfName.textContent.replace(/\.pdf$/i, '');
            cpdfDownloadBtn.href = compressedUrl;
            cpdfDownloadBtn.download = `${baseName}_compressed.pdf`;

            cpdfProgressText.textContent = 'PDF compressed successfully!';
            cpdfResultCard.style.display = 'block';

        } catch (err) {
            console.error(err);
            alert('PDF compression error: ' + err.message);
        } finally {
            btnCompressPdfAction.disabled = false;
        }
    });


    /* ==========================================================================
       DRAG & DROP HELPERS
       ========================================================================== */
    function setupDropZone(dropZone, onFiles) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('dragover');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length) {
                onFiles(files);
            }
        });
    }

});
