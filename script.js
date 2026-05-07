/* ==========================================
   1. 全域變數與初始設定 (Constants & Init)
   ========================================== */
const PAGE_IDS = ['main-content', 'portfolio-page', 'works-page'];
const SCROLL_SNAP_SETTING = "y mandatory";

document.addEventListener("DOMContentLoaded", () => {
    // 1. 初始化捲動位置
    window.scrollTo(0, 0);

    // 2. 啟動區塊淡入觀察者
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card-section').forEach(section => observer.observe(section));

    // 3. 初始鎖定滾動 (等待點擊開始瀏覽)
    document.body.classList.add('locked');
});


/* ==========================================
   2. 效能優化：滑鼠與背景互動 (Mouse Interaction)
   ========================================== */
let ticking = false;

document.addEventListener('mousemove', (e) => {
    if (!ticking) {
        // 使用 requestAnimationFrame 確保動畫與螢幕重新整理率同步，避免卡頓
        window.requestAnimationFrame(() => {
            handleParallax(e);
            handleCursorReset(e);
            ticking = false;
        });
        ticking = true;
    }
});

// 背景視差：游離圖片輕微晃動
function handleParallax(e) {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
    
    document.querySelectorAll('.float-item').forEach(item => {
        item.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
}

// 游標邏輯：按下切換
document.addEventListener('mousedown', () => {
    document.documentElement.classList.add('cursor-pressing');
});

document.addEventListener('mouseup', () => {
    document.documentElement.classList.remove('cursor-pressing');
});

// 移動時重置 inline cursor (確保 CSS 優先權)
function handleCursorReset(e) {
    if (e.buttons === 0) {
        document.documentElement.style.cursor = "";
    }
}


/* ==========================================
   3. 導覽系統與分頁切換 (Navigation & Pages)
   ========================================== */

/**
 * 核心切換功能：管理頁面顯示、捲動與滾動吸附狀態
 * @param {string} targetPageId - 目的地 ID
 * @param {boolean} isHome - 是否返回首頁
 */
function switchPage(targetPageId, isHome = false) {
    const mainContent = document.getElementById('main-content');
    const homeBtn = document.getElementById('homeBtn');

    // 1. 隱藏所有分頁
    PAGE_IDS.filter(id => id !== 'main-content').forEach(id => {
        const p = document.getElementById(id);
        if (p) {
            p.style.display = 'none';
            p.classList.remove('flip-enter');
        }
    });

    // 2. 切換主頁面狀態
    if (isHome) {
        mainContent.classList.remove('exit-left');
        homeBtn.style.display = 'none';
        toggleScrollSnap(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        mainContent.classList.add('exit-left');
        const target = document.getElementById(targetPageId);
        if (target) {
            target.style.display = 'block';
            target.classList.add('flip-enter');
        }
        homeBtn.style.display = 'block';
        toggleScrollSnap(false);
        window.scrollTo(0, 0);
    }
}

// 供 HTML 調用的包裝函式
function openPortfolio() { switchPage('portfolio-page'); }
function flipToWorks() { switchPage('works-page'); }
function flipToWorksFromHome() { switchPage('works-page'); }
function flipBackToPortfolio() { switchPage('portfolio-page'); }
function backToHome() { switchPage('main-content', true); }

function scrollToAbout() {
    document.body.classList.remove('locked');
    const aboutSection = document.getElementById('intro');
    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
}

function toggleScrollSnap(enable) {
    document.documentElement.style.scrollSnapType = enable ? SCROLL_SNAP_SETTING : "none";
}


/* ==========================================
   4. 履歷與組件互動 (Components Interaction)
   ========================================== */

// 切換履歷詳細資訊
function toggleResume(show) {
    const card = document.getElementById('card-inner');
    const container = document.getElementById('intro-container');
    
    if (show) {
        card.classList.add('flipped');
        container.classList.add('resume-active');
    } else {
        card.classList.remove('flipped');
        container.classList.remove('resume-active');
        document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
    }
}

// 獲獎照片點擊擴展
document.addEventListener('click', (e) => {
    const target = e.target;
    const currentEnlarged = document.querySelector('.award-img.enlarged');

    if (target.classList.contains('award-img')) {
        e.stopPropagation();
        target.classList.toggle('enlarged');
    } else if (currentEnlarged) {
        currentEnlarged.classList.remove('enlarged');
    }
});


/* ==========================================
   5. 媒體與燈箱系統 (Media & Lightbox)
   ========================================== */

function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = imgSrc;
    lightbox.style.display = 'flex';
    
    setTimeout(() => lightbox.classList.add('show'), 20);
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox-overlay');
    if (lightbox) {
        lightbox.classList.remove('show');
        setTimeout(() => lightbox.style.display = 'none', 300);
    }
    document.body.style.overflow = '';
}

// 商品細節展示
function showProductDetail(title, desc, url, imgSrc) {
    const elements = {
        title: document.getElementById('detail-title'),
        desc: document.getElementById('detail-desc'),
        link: document.getElementById('detail-link'),
        img: document.getElementById('detail-img')
    };

    if (elements.title) elements.title.innerText = title;
    if (elements.desc) elements.desc.innerText = desc;
    if (elements.link) {
        elements.link.href = url;
        elements.link.style.display = 'inline-block';
    }

    if (imgSrc && elements.img) {
        elements.img.src = imgSrc;
        elements.img.style.display = 'block';
        
        // 重置動畫觸發
        elements.img.classList.remove('anim-page-flip');
        void elements.img.offsetWidth; 
        
        if (title.includes("白貓")) elements.img.classList.add('anim-page-flip');
    }
}


/* ==========================================
   6. 捲動工具 (Scroll Utilities)
   ========================================== */

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    const btn = document.getElementById('back-to-top');
    if (btn) {
        btn.style.display = window.scrollY > 500 ? 'block' : 'none';
    }
});