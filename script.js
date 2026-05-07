// 滾動淡入觀察者
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

// 確保當滑鼠按下時，強制更換游標樣式（針對全域）
document.addEventListener('mousedown', () => {
    document.documentElement.style.cursor = "url('./assets/pressed.png'), auto";
});

// 當滑鼠放開時，回到常態或根據所在位置判定
document.addEventListener('mouseup', (e) => {
    // 檢查放開的位置是否在按鈕上
    const isLink = e.target.closest('a, button, .cat-btn, .work-link');
    if (isLink) {
        document.documentElement.style.cursor = "url('./assets/link.png'), pointer";
    } else {
        document.documentElement.style.cursor = "url('./assets/normal.png'), auto";
    }
});

// 為了讓游標邏輯更精準，當滑鼠移動時清除手動設定的 style，回歸 CSS 判定
document.addEventListener('mousemove', () => {
    // 只有在沒有按住滑鼠的情況下才清除，讓 CSS 的 :active 與 hover 正常運作
    if (event.buttons === 0) {
        document.documentElement.style.cursor = "";
    }
});

// 初始狀態下，禁止滾動直到按下「開始瀏覽」
document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
});;

document.querySelectorAll('.card-section').forEach(s => observer.observe(s));

// 開始瀏覽：解鎖並捲動
function scrollToAbout() {
    document.body.classList.remove('locked'); // 移除鎖定類名
    const aboutSection = document.getElementById('intro'); // 取得第一個卡片區塊
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' }); // 因為有 scroll-snap，直接捲動過去會自動對齊
    }
}

function toggleScrollSnap(isLocked) {
    if (isLocked) {
        document.documentElement.style.scrollSnapType = "y mandatory";
    } else {
        document.documentElement.style.scrollSnapType = "none";
    }
}

// 切換履歷：自動撐開高度
function toggleResume(show) {
    const card = document.getElementById('card-inner');
    const container = document.getElementById('intro-container');
    const introSection = document.getElementById('intro');
    
    if (show) {
        card.classList.add('flipped');
        container.classList.add('resume-active');
        // 展開後，區塊會因為 CSS 的 height: auto 自動變長
    } else {
        card.classList.remove('flipped');
        container.classList.remove('resume-active');
        introSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 圖片點擊放大與任意處縮小功能
const awardImg = document.getElementById('resume-award-img');

if (awardImg) {
    awardImg.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止觸發全域點擊
        awardImg.classList.toggle('enlarged');
    });
}

// 全域監聽點擊，只要點擊非圖片處就縮小
document.addEventListener('click', () => {
    if (awardImg && awardImg.classList.contains('enlarged')) {
        awardImg.classList.remove('enlarged');
    }
});

// 頁面跳轉：點擊進入時，重新定義「回到主頁」的行為
function openPortfolio() {
    hideAllPages();
    toggleScrollSnap(false); // 進入分頁，解除滾動鎖定
    document.getElementById('main-content').classList.add('exit-left');
    document.getElementById('portfolio-page').style.display = 'block';
    document.getElementById('portfolio-page').classList.add('flip-enter');
    
    const btn = document.getElementById('homeBtn');
    btn.style.display = 'block';
    btn.onclick = () => backToHome('products-trigger'); 
    window.scrollTo(0, 0);
}

function flipToWorks() {
    hideAllPages();
    const target = document.getElementById('works-page');
    target.style.display = 'block';
    target.classList.add('flip-enter');
    
    // 依然保持回到「作品展示」入口
    document.getElementById('homeBtn').onclick = () => backToHome('works-trigger');
    
    window.scrollTo(0, 0);
}

function flipToWorksFromHome() {
    hideAllPages();
    toggleScrollSnap(false); // 進入分頁，解除滾動鎖定
    document.getElementById('main-content').classList.add('exit-left');
    document.getElementById('works-page').style.display = 'block';
    document.getElementById('works-page').classList.add('flip-enter');
    
    const btn = document.getElementById('homeBtn');
    btn.style.display = 'block';
    btn.onclick = () => backToHome('works-trigger'); 
    window.scrollTo(0, 0);
}

function flipBackToPortfolio() {
    hideAllPages();
    const target = document.getElementById('portfolio-page');
    target.style.display = 'block';
    target.classList.add('flip-enter');
    
    // 切換回商品頁時，按鈕也要改回連動到商品入口
    document.getElementById('homeBtn').onclick = () => backToHome('products-trigger');
    
    window.scrollTo(0, 0);
}

function backToHome(targetId) {
    // 1. 顯示主內容
    document.getElementById('main-content').classList.remove('exit-left');
    
    // 2. 隱藏所有分頁
    hideAllPages();
    
    toggleScrollSnap(true); // 回到首頁，重新啟用鎖定

    // 3. 隱藏主頁按鈕
    document.getElementById('homeBtn').style.display = 'none';

    // 4. 如果有指定目標區塊，則滾動到該處
    if (targetId) {
        // 稍微延遲執行，確保主畫面已經顯示出來，否則會抓不到正確位置
        setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100); 
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 輔助函式
function hideAllPages() {
    const p1 = document.getElementById('portfolio-page');
    const p2 = document.getElementById('works-page');
    p1.classList.remove('flip-enter');
    p2.classList.remove('flip-enter');
    p1.style.display = 'none';
    p2.style.display = 'none';
}

// 回到頂部按鈕
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = function() {
    const btn = document.getElementById('back-to-top');
    if (window.scrollY > 500) btn.style.display = 'block';
    else btn.style.display = 'none';
};