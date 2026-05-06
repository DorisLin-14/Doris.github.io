// 1. 滾動淡入觀察者
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.2 });

document.querySelectorAll('.card-section').forEach(s => observer.observe(s));

function scrollToAbout() {
    document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
}

// 2. 頁面跳轉邏輯
function openPortfolio() {
    hideAllPages();
    document.getElementById('main-content').classList.add('exit-left');
    document.getElementById('portfolio-page').classList.add('flip-enter');
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
    document.getElementById('portfolio-page').classList.remove('flip-enter');
    document.getElementById('works-page').classList.remove('flip-enter');
    document.getElementById('portfolio-page').style.display = 'none';
    document.getElementById('works-page').style.display = 'none';
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