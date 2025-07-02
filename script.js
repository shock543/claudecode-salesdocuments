// Supabaseの初期化
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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



// データを読み込んでカードを表示
async function loadContent() {
    // PDF資料の表示
    const pdfCards = await Promise.all(mockData.pdfs.map(pdf => createPdfCard(pdf)));
    documentsGrid.innerHTML = pdfCards.join('');
    
    // 動画の表示（動画は非同期処理不要のためそのまま）
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

// グローバルスコープで利用可能にする
window.downloadPdf = downloadPdf;

// 管理者モード状態
let isAdminMode = false;
const ADMIN_EMAIL = "admin@engate.com";
const ADMIN_PASSWORD = "Engate2025";

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

async function checkPassword() {
    const input = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');
    
    console.log('ログイン試行開始:', input.value);
    
    if (input.value === ADMIN_PASSWORD) {
        try {
            // 簡易認証：パスワードが正しければ管理者モードに
            console.log('パスワード認証成功');
            isAdminMode = true;
            hidePasswordModal();
            updateUIForAdminMode();
            
            // ローカルストレージに認証状態を保存
            localStorage.setItem('adminLoggedIn', 'true');
            console.log('管理者モード有効化完了');
            
        } catch (error) {
            console.error('予期しないエラー:', error);
            errorMessage.textContent = `予期しないエラー: ${error.message}`;
        }
    } else {
        errorMessage.textContent = 'パスワードが正しくありません';
        input.value = '';
        input.focus();
    }
}

function updateUIForAdminMode() {
    // 管理者ログインボタンを非表示
    const loginBtn = document.getElementById('admin-login-btn');
    loginBtn.style.display = 'none';
    
    // ログアウトボタンを表示
    if (!document.getElementById('admin-logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'admin-logout-btn';
        logoutBtn.className = 'admin-login-btn';
        logoutBtn.textContent = 'ログアウト';
        logoutBtn.addEventListener('click', logout);
        loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
    }
    
    // アップロードボタンを各カードに追加
    loadContent();
}

async function logout() {
    try {
        isAdminMode = false;
        
        // ローカルストレージから認証状態を削除
        localStorage.removeItem('adminLoggedIn');
        
        // UIを元に戻す
        document.getElementById('admin-login-btn').style.display = 'block';
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
        
        // コンテンツを再読み込み
        await loadContent();
        
        console.log('ログアウト完了');
        
    } catch (error) {
        console.error('予期しないエラー:', error);
        alert('ログアウトでエラーが発生しました');
    }
}

// PDF資料カードを生成（管理者モード対応）
async function createPdfCard(pdf) {
    const uploadButton = isAdminMode ? 
        `<button class="upload-btn" onclick="uploadPdf(${pdf.id})">アップロード</button>` : '';
    
    // アップロードされたファイルがあるかチェック
    const uploadedUrl = await getUploadedFileUrl('pdf', pdf.id);
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
    showUploadModal('動画', 'YouTube');
}

// グローバルスコープで利用可能にする
window.uploadPdf = uploadPdf;
window.uploadVideo = uploadVideo;

function showUploadModal(type, fileType) {
    const modal = document.getElementById('upload-modal');
    const title = document.getElementById('upload-modal-title');
    const description = document.getElementById('upload-modal-description');
    const pdfArea = document.getElementById('pdf-upload-area');
    const videoArea = document.getElementById('video-upload-area');
    
    title.textContent = `${type}をアップロード`;
    
    if (currentUploadType === 'pdf') {
        description.textContent = `新しい${fileType}ファイルを選択してください`;
        pdfArea.style.display = 'block';
        videoArea.style.display = 'none';
    } else {
        description.textContent = `新しい${fileType}リンクを入力してください`;
        pdfArea.style.display = 'none';
        videoArea.style.display = 'block';
    }
    
    modal.style.display = 'flex';
    resetUploadModal();
}

function hideUploadModal() {
    const modal = document.getElementById('upload-modal');
    modal.style.display = 'none';
    resetUploadModal();
}

function resetUploadModal() {
    // PDF関連のリセット
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('drop-zone').style.display = 'block';
    
    // YouTube関連のリセット
    document.getElementById('youtube-url').value = '';
    document.getElementById('youtube-preview').style.display = 'none';
    
    // 共通のリセット
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

function simulateUpload(fileOrUrl) {
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
            setTimeout(async () => {
                let success = false;
                if (currentUploadType === 'video') {
                    // YouTubeリンクの場合
                    success = saveYouTubeLink(fileOrUrl);
                } else {
                    // PDFファイルの場合
                    success = await saveUploadedFile(fileOrUrl);
                }
                
                hideUploadModal();
                
                if (success) {
                    await loadContent(); // UI更新
                    alert('アップロードが完了しました！');
                } else {
                    alert('アップロードに失敗しました。コンソールでエラーを確認してください。');
                }
            }, 500);
        }
    }, 200);
}

async function saveUploadedFile(file) {
    try {
        console.log('アップロード開始:', { 
            fileName: file.name, 
            fileSize: file.size, 
            fileType: file.type,
            currentUploadType,
            currentUploadId
        });
        
        // 管理者モードチェック
        if (!isAdminMode) {
            alert('管理者ログインが必要です。');
            return false;
        }
        
        console.log('管理者モード確認済み');
        
        // ファイル名をクリーンにする
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'pdf';
        const sanitizedFileName = `file_${currentUploadId}_${timestamp}.${fileExtension}`;
        const fileName = `${currentUploadType}/${sanitizedFileName}`;
        console.log('アップロード先:', fileName);
        
        const { data, error } = await supabase.storage
            .from('sales-documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) {
            console.error('ファイルアップロードエラー:', error);
            alert(`ファイルのアップロードに失敗しました: ${error.message}`);
            return;
        }
        
        console.log('ファイルアップロード成功:', data);
        
        // アップロード成功時、公開URLを取得
        const { data: urlData } = supabase.storage
            .from('sales-documents')
            .getPublicUrl(fileName);
            
        console.log('公開URL取得:', urlData.publicUrl);
        
        
        // データベースにファイル情報を保存
        const insertData = {
            file_name: file.name, // 元のファイル名を保持
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
            content_type: currentUploadType,
            content_id: currentUploadId,
            public_url: urlData.publicUrl,
            upload_date: new Date().toISOString()
        };
        
        console.log('データベース保存データ:', insertData);
        
        const { error: dbError } = await supabase
            .from('uploaded_files')
            .insert([insertData]);
            
        if (dbError) {
            console.error('データベース保存エラー:', dbError);
            alert(`ファイル情報の保存に失敗しました: ${dbError.message}`);
            return;
        }
        
        console.log('データベース保存成功');
        return true; // 成功を示すフラグを返す
        
    } catch (error) {
        console.error('予期しないエラー:', error);
        alert(`予期しないエラーが発生しました: ${error.message}`);
        return false;
    }
}

function saveYouTubeLink(url) {
    const embedUrl = convertYouTubeUrl(url);
    if (!embedUrl) return;
    
    // ローカルストレージに保存
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '{}');
    
    const linkData = {
        originalUrl: url,
        embedUrl: embedUrl,
        uploadDate: new Date().toISOString(),
        contentType: currentUploadType,
        id: currentUploadId
    };
    
    if (!uploadedFiles[currentUploadType]) {
        uploadedFiles[currentUploadType] = {};
    }
    
    uploadedFiles[currentUploadType][currentUploadId] = linkData;
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    
    // embed URLをコンテンツとして保存
    const fileContent = JSON.parse(localStorage.getItem('uploadedFileContents') || '{}');
    fileContent[`${currentUploadType}_${currentUploadId}`] = embedUrl;
    localStorage.setItem('uploadedFileContents', JSON.stringify(fileContent));
}

async function getUploadedFileUrl(type, id) {
    try {
        const { data, error } = await supabase
            .from('uploaded_files')
            .select('public_url')
            .eq('content_type', type)
            .eq('content_id', id)
            .single();
            
        if (error) {
            console.log('アップロード済みファイルが見つかりません:', error);
            return null;
        }
        
        return data?.public_url || null;
    } catch (error) {
        console.error('ファイルURL取得エラー:', error);
        return null;
    }
}

// YouTube URL変換機能
function convertYouTubeUrl(url) {
    if (!url) return null;
    
    // YouTube URLの各パターンに対応
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }
    
    return null;
}

function handleYouTubeInput(url) {
    const embedUrl = convertYouTubeUrl(url);
    const preview = document.getElementById('youtube-preview');
    const previewIframe = document.getElementById('youtube-preview-iframe');
    const submitBtn = document.getElementById('upload-submit');
    
    if (embedUrl) {
        previewIframe.src = embedUrl;
        preview.style.display = 'block';
        submitBtn.disabled = false;
    } else {
        preview.style.display = 'none';
        submitBtn.disabled = true;
    }
}

// 認証状態をチェック
async function checkAuthState() {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (adminLoggedIn === 'true') {
        isAdminMode = true;
        updateUIForAdminMode();
        console.log('管理者として認証済み（ローカルストレージ）');
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthState();
    await loadContent();
    
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
        if (currentUploadType === 'pdf') {
            const fileInput = document.getElementById('file-input');
            if (fileInput.files[0]) {
                simulateUpload(fileInput.files[0]);
            }
        } else {
            const youtubeUrl = document.getElementById('youtube-url').value;
            if (youtubeUrl) {
                simulateUpload(youtubeUrl);
            }
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
    
    // YouTube URL入力のイベントリスナー
    const youtubeInput = document.getElementById('youtube-url');
    youtubeInput.addEventListener('input', (e) => {
        handleYouTubeInput(e.target.value);
    });
    
    youtubeInput.addEventListener('paste', (e) => {
        setTimeout(() => {
            handleYouTubeInput(e.target.value);
        }, 100);
    });
    
    // アップロードモーダル外クリックで閉じる
    document.getElementById('upload-modal').addEventListener('click', (e) => {
        if (e.target.id === 'upload-modal') {
            hideUploadModal();
        }
    });
});