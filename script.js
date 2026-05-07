// 1. 滾動淡入觀察者
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.2 });

document.querySelectorAll('.card-section').forEach(s => observer.observe(s));

function scrollToAbout() {
    const aboutSection = document.getElementById('intro');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }

// 2. 頁面跳轉邏輯
function openPortfolio() {
    hideAllPages();
    document.getElementById('main-content').classList.add('exit-left');
    const target = document.getElementById('portfolio-page');
    target.style.display = 'block'; // 先顯示才能跑動畫
    target.classList.add('flip-enter');
    document.getElementById('homeBtn').style.display = 'block';
    window.scrollTo(0, 0);
}

function flipToWorks() {
    hideAllPages();
    document.getElementById('works-page').classList.add('flip-enter');
    window.scrollTo(0, 0);
}

function flipToWorksFromHome() {
    hideAllPages();
    document.getElementById('main-content').classList.add('exit-left');
    document.getElementById('works-page').classList.add('flip-enter');
    document.getElementById('homeBtn').style.display = 'block';
    window.scrollTo(0, 0);
}

function flipBackToPortfolio() {
    hideAllPages();
    document.getElementById('portfolio-page').classList.add('flip-enter');
    window.scrollTo(0, 0);
}

function backToHome() {
    document.getElementById('main-content').classList.remove('exit-left');
    hideAllPages();
    document.getElementById('homeBtn').style.display = 'none';
    window.scrollTo(0, 0);
}

function hideAllPages() {
    const p1 = document.getElementById('portfolio-page');
    const p2 = document.getElementById('works-page');
    
    p1.classList.remove('flip-enter');
    p2.classList.remove('flip-enter');
    
    // 延遲一點點隱藏，讓動畫跑完或直接切換
    p1.style.display = 'none';
    p2.style.display = 'none';
}

// 3. 回到頂部按鈕
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.onscroll = function() {
    const btn = document.getElementById('back-to-top');
    if (window.scrollY > 500) btn.style.display = 'block';
    else btn.style.display = 'none';
};