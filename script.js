// 1. 滾動觀察者：處理區塊進入畫面時的動畫
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card-section').forEach(s => observer.observe(s));

// 2. 初始與基本滾動控制
document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
});

function scrollToAbout() {
    document.body.classList.remove('locked');
    document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
}

function toggleScrollSnap(enabled) {
    document.documentElement.style.scrollSnapType = enabled ? "y mandatory" : "none";
}

// 3. 履歷翻轉切換
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

// 4. 頁面導航邏輯
function openPortfolio() {
    hideAllPages();
    toggleScrollSnap(false);
    document.getElementById('main-content').classList.add('exit-left');
    const page = document.getElementById('portfolio-page');
    page.style.display = 'block';
    page.classList.add('flip-enter');
    
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
    document.getElementById('homeBtn').onclick = () => backToHome('works-trigger');
    window.scrollTo(0, 0);
}

function flipToWorksFromHome() {
    hideAllPages();
    toggleScrollSnap(false);
    document.getElementById('main-content').classList.add('exit-left');
    document.getElementById('works-page').style.display = 'block';
    document.getElementById('works-page').classList.add('flip-enter');
    document.getElementById('homeBtn').style.display = 'block';
    document.getElementById('homeBtn').onclick = () => backToHome('works-trigger');
    window.scrollTo(0, 0);
}

function flipBackToPortfolio() {
    hideAllPages();
    const target = document.getElementById('portfolio-page');
    target.style.display = 'block';
    target.classList.add('flip-enter');
    document.getElementById('homeBtn').onclick = () => backToHome('products-trigger');
    window.scrollTo(0, 0);
}

function backToHome(targetId) {
    document.getElementById('main-content').classList.remove('exit-left');
    hideAllPages();
    toggleScrollSnap(true);
    document.getElementById('homeBtn').style.display = 'none';
    if (targetId) {
        setTimeout(() => {
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// 5. 互動功能：標籤展開與燈箱
function toggleLabel(element) {
    element.classList.toggle('active');
}

function showProductDetail(title, desc, url) {
    if (event) event.stopPropagation();
    document.getElementById('detail-title').innerText = title;
    document.getElementById('detail-desc').innerText = desc;
    const linkBtn = document.getElementById('detail-link');
    linkBtn.href = url;
    linkBtn.style.display = 'inline-block';
    document.getElementById('product-detail-area').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openLightbox(imgSrc) {
    if (event) event.stopPropagation();
    const lightbox = document.getElementById('lightbox-overlay');
    const img = document.getElementById('lightbox-img');
    img.src = imgSrc;
    lightbox.classList.add('show');
}

function closeLightbox() {
    document.getElementById('lightbox-overlay').classList.remove('show');
}

// 6. 輔助功能與全域點擊監聽
function hideAllPages() {
    const pages = ['portfolio-page', 'works-page'];
    pages.forEach(id => {
        const p = document.getElementById(id);
        p.style.display = 'none';
        p.classList.remove('flip-enter');
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (e) => {
    // 處理獲獎圖片點擊放大
    if (e.target.classList.contains('award-img')) {
        e.target.classList.toggle('enlarged');
    } else {
        const enlarged = document.querySelector('.award-img.enlarged');
        if (enlarged) enlarged.classList.remove('enlarged');
    }
});

window.onscroll = function() {
    const btn = document.getElementById('back-to-top');
    btn.style.display = window.scrollY > 500 ? 'block' : 'none';
};