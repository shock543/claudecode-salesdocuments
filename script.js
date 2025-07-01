// モックデータ
const mockData = {
    pdfs: [
        {
            id: 1,
            title: "Engateギフティング事業概要資料",
            url: "./pdfs/engate-gifting.pdf",
            downloadUrl: "./pdfs/engate-gifting.pdf",
            filename: "engate-gifting.pdf"
        },
        {
            id: 2,
            title: "「スポオク」オークション事業概要資料",
            url: "./pdfs/spooku-auction.pdf",
            downloadUrl: "./pdfs/spooku-auction.pdf",
            filename: "spooku-auction.pdf"
        },
        {
            id: 3,
            title: "Engateスポンサーシップモデル事業概要資料",
            url: "./pdfs/engate-sponsorship.pdf",
            downloadUrl: "./pdfs/engate-sponsorship.pdf",
            filename: "engate-sponsorship.pdf"
        }
    ],
    videos: [
        {
            id: 1,
            title: "エンゲートサービス利用方法",
            embedUrl: "https://www.youtube.com/embed/aLeALBPNi6w"
        },
        {
            id: 2,
            title: "Engate Gifting Time動画",
            embedUrl: "https://www.youtube.com/embed/TYAiNu37oOA"
        },
        {
            id: 3,
            title: "EngateUS事業プロモーション動画",
            embedUrl: "https://www.youtube.com/embed/-IVU5mLXONA"
        }
    ]
};

// DOM要素の取得
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const documentsGrid = document.querySelector('.documents-grid');
const videosGrid = document.querySelector('.videos-grid');

// タブ切り替え機能
function switchTab(tabName) {
    // すべてのタブボタンとコンテンツからactiveクラスを削除
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 選択されたタブボタンとコンテンツにactiveクラスを追加
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
}

// タブボタンにイベントリスナーを追加
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// PDF資料カードを生成
function createPdfCard(pdf) {
    return `
        <div class="document-card">
            <h3 class="card-title">${pdf.title}</h3>
            <iframe class="pdf-viewer" src="${pdf.url}#toolbar=0&navpanes=0&scrollbar=0" frameborder="0"></iframe>
            <button class="download-btn" onclick="downloadPdf('${pdf.downloadUrl}', '${pdf.filename}')">ダウンロード</button>
        </div>
    `;
}

// 動画カードを生成
function createVideoCard(video) {
    return `
        <div class="video-card">
            <h3 class="card-title">${video.title}</h3>
            <iframe class="video-player" src="${video.embedUrl}" frameborder="0" allowfullscreen></iframe>
        </div>
    `;
}

// データを読み込んでカードを表示
function loadContent() {
    // PDF資料の表示
    documentsGrid.innerHTML = mockData.pdfs.map(pdf => createPdfCard(pdf)).join('');
    
    // 動画の表示
    videosGrid.innerHTML = mockData.videos.map(video => createVideoCard(video)).join('');
}

// PDFダウンロード機能
function downloadPdf(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 管理者モード状態
let isAdminMode = false;
const ADMIN_PASSWORD = "Engate0226";

// 管理者認証機能
function showPasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.style.display = 'flex';
    document.getElementById('password-input').focus();
}

function hidePasswordModal() {
    const modal = document.getElementById('password-modal');
    modal.style.display = 'none';
    document.getElementById('password-input').value = '';
    document.getElementById('error-message').textContent = '';
}

function checkPassword() {
    const input = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    
    if (input.value === ADMIN_PASSWORD) {
        isAdminMode = true;
        hidePasswordModal();
        updateUIForAdminMode();
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'パスワードが正しくありません';
        input.value = '';
        input.focus();
    }
}

function updateUIForAdminMode() {
    // 管理者ログインボタンを非表示
    document.getElementById('admin-login-btn').style.display = 'none';
    
    // アップロードボタンを各カードに追加
    loadContent();
}

// PDF資料カードを生成（管理者モード対応）
function createPdfCard(pdf) {
    const uploadButton = isAdminMode ? 
        `<button class="upload-btn" onclick="uploadPdf(${pdf.id})">アップロード</button>` : '';
    
    // アップロードされたファイルがあるかチェック
    const uploadedUrl = getUploadedFileUrl('pdf', pdf.id);
    const pdfUrl = uploadedUrl || pdf.url;
    const downloadUrl = uploadedUrl || pdf.downloadUrl;
    
    return `
        <div class="document-card">
            <h3 class="card-title">${pdf.title}</h3>
            <iframe class="pdf-viewer" src="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0" frameborder="0"></iframe>
            <div class="card-actions">
                <button class="download-btn" onclick="downloadPdf('${downloadUrl}', '${pdf.filename}')">ダウンロード</button>
                ${uploadButton}
            </div>
        </div>
    `;
}

// 動画カードを生成（管理者モード対応）
function createVideoCard(video) {
    const uploadButton = isAdminMode ? 
        `<button class="upload-btn" onclick="uploadVideo(${video.id})">アップロード</button>` : '';
    
    // アップロードされたファイルがあるかチェック
    const uploadedUrl = getUploadedFileUrl('video', video.id);
    const videoUrl = uploadedUrl || video.embedUrl;
    
    const videoElement = uploadedUrl ? 
        `<video class="video-player" controls><source src="${videoUrl}" type="video/mp4">お使いのブラウザは動画の再生に対応していません。</video>` :
        `<iframe class="video-player" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`;
    
    return `
        <div class="video-card">
            <h3 class="card-title">${video.title}</h3>
            ${videoElement}
            ${uploadButton ? `<div class="card-actions">${uploadButton}</div>` : ''}
        </div>
    `;
}

// アップロード機能
let currentUploadType = null;
let currentUploadId = null;

function uploadPdf(id) {
    currentUploadType = 'pdf';
    currentUploadId = id;
    showUploadModal('PDF資料', 'PDF');
}

function uploadVideo(id) {
    currentUploadType = 'video';
    currentUploadId = id;
    showUploadModal('動画', '動画');
}

function showUploadModal(type, fileType) {
    const modal = document.getElementById('upload-modal');
    const title = document.getElementById('upload-modal-title');
    const description = document.getElementById('upload-modal-description');
    
    title.textContent = `${type}をアップロード`;
    description.textContent = `新しい${fileType}ファイルを選択してください`;
    
    modal.style.display = 'flex';
    resetUploadModal();
}

function hideUploadModal() {
    const modal = document.getElementById('upload-modal');
    modal.style.display = 'none';
    resetUploadModal();
}

function resetUploadModal() {
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('drop-zone').style.display = 'block';
    document.getElementById('upload-submit').disabled = true;
    document.getElementById('upload-progress').style.display = 'none';
}

function handleFileSelect(file) {
    if (!file) return;
    
    const fileName = document.getElementById('file-name');
    const filePreview = document.getElementById('file-preview');
    const dropZone = document.getElementById('drop-zone');
    const submitBtn = document.getElementById('upload-submit');
    
    fileName.textContent = file.name;
    filePreview.style.display = 'flex';
    dropZone.style.display = 'none';
    submitBtn.disabled = false;
}

function simulateUpload(file) {
    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const submitBtn = document.getElementById('upload-submit');
    
    progressDiv.style.display = 'block';
    submitBtn.disabled = true;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                // ファイルを実際に保存（ローカルストレージまたは実際のアップロード）
                saveUploadedFile(file);
                hideUploadModal();
                loadContent(); // UI更新
                alert('アップロードが完了しました！');
            }, 500);
        }
    }, 200);
}

function saveUploadedFile(file) {
    // ローカルストレージに保存（本番では実際のサーバーにアップロード）
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '{}');
    
    const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        contentType: currentUploadType,
        id: currentUploadId
    };
    
    if (!uploadedFiles[currentUploadType]) {
        uploadedFiles[currentUploadType] = {};
    }
    
    uploadedFiles[currentUploadType][currentUploadId] = fileData;
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    
    // ファイルの実際のコンテンツをBase64で保存（小さなファイルの場合）
    if (file.size < 5 * 1024 * 1024) { // 5MB未満
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = JSON.parse(localStorage.getItem('uploadedFileContents') || '{}');
            fileContent[`${currentUploadType}_${currentUploadId}`] = e.target.result;
            localStorage.setItem('uploadedFileContents', JSON.stringify(fileContent));
        };
        reader.readAsDataURL(file);
    }
}

function getUploadedFileUrl(type, id) {
    const fileContents = JSON.parse(localStorage.getItem('uploadedFileContents') || '{}');
    return fileContents[`${type}_${id}`] || null;
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    
    // イベントリスナーの設定
    document.getElementById('admin-login-btn').addEventListener('click', showPasswordModal);
    document.getElementById('login-submit').addEventListener('click', checkPassword);
    document.getElementById('login-cancel').addEventListener('click', hidePasswordModal);
    
    // Enterキーでログイン
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // モーダル外クリックで閉じる
    document.getElementById('password-modal').addEventListener('click', (e) => {
        if (e.target.id === 'password-modal') {
            hidePasswordModal();
        }
    });
    
    // アップロードモーダルのイベントリスナー
    document.getElementById('upload-cancel').addEventListener('click', hideUploadModal);
    document.getElementById('upload-submit').addEventListener('click', () => {
        const fileInput = document.getElementById('file-input');
        if (fileInput.files[0]) {
            simulateUpload(fileInput.files[0]);
        }
    });
    
    // ファイル選択
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // ドラッグ&ドロップ
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files[0]) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });
    
    // ファイル削除
    document.getElementById('remove-file').addEventListener('click', () => {
        resetUploadModal();
    });
    
    // アップロードモーダル外クリックで閉じる
    document.getElementById('upload-modal').addEventListener('click', (e) => {
        if (e.target.id === 'upload-modal') {
            hideUploadModal();
        }
    });
});