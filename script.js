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

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});