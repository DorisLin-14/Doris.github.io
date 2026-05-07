/* ==========================================
   1. 觀察者與初始設定 (Observers & Init)
   ========================================== */

// 滾動淡入觀察者：當元素進入畫面時加入 active 類名
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

// 初始化執行：禁止滾動並捲動至頂部
document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    // 開始監控所有卡片區塊
    document.querySelectorAll('.card-section').forEach(s => observer.observe(s));
});

//背景視差效果：讓游離圖片隨滑鼠輕微晃動
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    document.querySelectorAll('.float-item').forEach(item => {
        // 在原本的動畫基礎上，疊加滑鼠位移
        item.style.marginLeft = `${moveX}px`;
        item.style.marginTop = `${moveY}px`;
    });
});

/* ==========================================
   2. 貓咪游標互動系統 (Cursor Logic)
   ========================================== */

// 當滑鼠按下時：更換為「按下」樣式
document.addEventListener('mousedown', () => {
    document.documentElement.style.cursor = "url('./assets/cat-pressed-64.png') 16 16, auto";
});

// 當滑鼠放開時：根據所在位置判定回歸樣式
document.addEventListener('mouseup', (e) => {
    const isLink = e.target.closest('a, button, .cat-btn, .work-link, .tag-item, .close-resume');
    if (isLink) {
        document.documentElement.style.cursor = "url('./assets/cat-link-64.png') 16 16, pointer";
    } else {
        document.documentElement.style.cursor = "url('./assets/cat-paw-64.png') 16 16, auto";
    }
});

// 當滑鼠移動時：清除手動設定，回歸 CSS 判定 ( hover 效果)
document.addEventListener('mousemove', (e) => {
    // 只有在「沒有」按住滑鼠的情況下才清除，確保 CSS 的 :active 與 :hover 能正常運作
    if (e.buttons === 0) {
        document.documentElement.style.cursor = "";
    }
});


/* ==========================================
   3. 首頁導覽與 UI 狀態切換 (Main UI Toggles)
   ========================================== */

// 開始瀏覽：解鎖頁面並平滑捲動至「關於我」
function scrollToAbout() {
    document.body.classList.remove('locked'); 
    const aboutSection = document.getElementById('intro');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 切換滾動吸附：在主頁開啟，在分頁關閉
function toggleScrollSnap(isLocked) {
    document.documentElement.style.scrollSnapType = isLocked ? "y mandatory" : "none";
}

// 切換履歷細節：翻轉卡片並撐開高度
function toggleResume(show) {
    const card = document.getElementById('card-inner');
    const container = document.getElementById('intro-container');
    const introSection = document.getElementById('intro');
    
    if (show) {
        card.classList.add('flipped');
        container.classList.add('resume-active');
    } else {
        card.classList.remove('flipped');
        container.classList.remove('resume-active');
        // 縮起後回到該區塊頂部，避免版面跳動
        introSection.scrollIntoView({ behavior: 'smooth' });
    }
}


/* ==========================================
   4. 圖片互動與燈箱功能 (Image Interaction)
   ========================================== */

// 處理獲獎照片點擊放大 (全域監聽)
document.addEventListener('click', (e) => {
    const enlargedImg = document.querySelector('.award-img.enlarged');
    
    // 如果點擊的是獲獎圖片，且目前未放大
    if (e.target.classList.contains('award-img') && !e.target.classList.contains('enlarged')) {
        e.stopPropagation(); 
        e.target.classList.add('enlarged');
    } 
    // 如果點擊任何地方且目前有放大圖片，則收起
    else if (enlargedImg) {
        enlargedImg.classList.remove('enlarged');
    }
});

// 開啟作品燈箱 (Lightbox)
function openLightbox(imgSrc) {
    event.stopPropagation();
    const lightbox = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    
    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex'; // 先轉為 flex 以便計算位置
    
    // 延遲一點點加上 show 類名，確保 transition 動畫能被觸發
    setTimeout(() => {
        lightbox.classList.add('show');
    }, 10);
    
    document.body.style.overflow = 'hidden'; //禁止背景捲動
}

// 關閉作品燈箱
function closeLightbox() {
    const lightbox = document.getElementById('lightbox-overlay');
    lightbox.classList.remove('show');
    document.body.style.overflow = 'auto'; // 恢復背景捲動
}


/* ==========================================
   5. 多頁面系統導覽 (Navigation System)
   ========================================== */

// 進入「商品分頁」
function openPortfolio() {
    hideAllPages();
    toggleScrollSnap(false); 
    document.getElementById('main-content').classList.add('exit-left');
    
    const page = document.getElementById('portfolio-page');
    page.style.display = 'block';
    page.classList.add('flip-enter');
    
    updateHomeButton('products-trigger');
    window.scrollTo(0, 0);
}

// 進入「作品展示分頁」
function flipToWorks() {
    hideAllPages();
    const page = document.getElementById('works-page');
    page.style.display = 'block';
    page.classList.add('flip-enter');
    
    updateHomeButton('works-trigger');
    window.scrollTo(0, 0);
}

// 從首頁直接進入作品展示
function flipToWorksFromHome() {
    hideAllPages();
    document.getElementById('main-content').classList.add('exit-left');
    
    const worksPage = document.getElementById('works-page');
    if (worksPage) {
        worksPage.style.display = 'block'; // 確保設為 block
        worksPage.classList.add('flip-enter');
    }
    
    document.getElementById('homeBtn').style.display = 'block';
    window.scrollTo(0, 0);
}

// 從作品頁返回商品頁
function flipBackToPortfolio() {
    hideAllPages();
    const page = document.getElementById('portfolio-page');
    page.style.display = 'block';
    page.classList.add('flip-enter');
    
    updateHomeButton('products-trigger');
    window.scrollTo(0, 0);
}

// 回到首頁邏輯
function backToHome() {
    document.getElementById('main-content').classList.remove('exit-left');
    hideAllPages();
    document.getElementById('homeBtn').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 輔助：更新「回到主頁」按鈕的行為
function updateHomeButton(triggerId) {
    const btn = document.getElementById('homeBtn');
    btn.style.display = 'block';
    btn.onclick = () => backToHome(triggerId);
}

// 輔助：隱藏所有額外分頁容器
function hideAllPages() {
    const pages = ['portfolio-page', 'works-page'];
    pages.forEach(id => {
        const p = document.getElementById(id);
        if (p) {
            p.style.display = 'none';
            p.classList.remove('flip-enter');
        }
    });
}


/* ==========================================
   6. 商品互動細節 (Product Details)
   ========================================== */

// 切換資訊框框展開/縮回
function showProductDetail(title, desc, url, imgSrc) {
    // 更新文字內容
    document.getElementById('detail-title').innerText = title;
    document.getElementById('detail-desc').innerText = desc;
    
    // 更新購買連結
    const linkBtn = document.getElementById('detail-link');
    linkBtn.href = url;
    linkBtn.style.display = 'inline-block';
    
    // 更新圖片並套用動畫
    const imgElement = document.getElementById('detail-img');
    if (imgSrc) {
        imgElement.src = imgSrc;
        imgElement.style.display = 'block';
        
        // 重置動畫
        imgElement.classList.remove('anim-page-flip');
        void imgElement.offsetWidth; // 強制重繪觸發動畫
        
        if (title.includes("聰明白貓")) {
            imgElement.classList.add('anim-page-flip');
        } else {
            imgElement.style.opacity = '1'; // 其他預設直接顯示
            imgElement.style.transform = 'none';
        }
    }
}

function toggleLabel(element) {
    // 移除其他標籤的 active 狀態 (單選效果)
    document.querySelectorAll('.tag-item').forEach(tag => tag.classList.remove('active'));
    // 幫當前點擊的加上 active
    element.classList.add('active');
}

/* ==========================================
   7. 捲動工具 (Scroll Utilities)
   ========================================== */

// 回到頂部功能
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 監聽捲動：顯示/隱藏回到頂部按鈕
window.onscroll = function() {
    const btn = document.getElementById('back-to-top');
    if (window.scrollY > 500) btn.style.display = 'block';
    else btn.style.display = 'none';
};