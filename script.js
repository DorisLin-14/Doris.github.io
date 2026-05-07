// 1. 滾動淡入觀察者
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.2 });

document.querySelectorAll('.card-section').forEach(s => observer.observe(s));

// 修正：補上結尾的 }
function scrollToAbout() {
    const aboutSection = document.getElementById('intro');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
} 

function toggleResume(show) {
    const card = document.getElementById('card-inner');
    const container = document.getElementById('intro-container');
    
    if (show) {
        card.classList.add('flipped');
        container.classList.add('resume-active');
    } else {
        card.classList.remove('flipped');
        container.classList.remove('resume-active');
        // 點擊收起時，順便平滑滾動回關於我頂部
        document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
    }
}

// 2. 頁面跳轉邏輯
function openPortfolio() {
    hideAllPages();
    document.getElementById('main-content').classList.add('exit-left');
    const target = document.getElementById('portfolio-page');
    target.style.display = 'block'; 
    target.classList.add('flip-enter');
    document.getElementById('homeBtn').style.display = 'block';
    window.scrollTo(0, 0);
}

function flipToWorks() {
    hideAllPages();
    const target = document.getElementById('works-page');
    target.style.display = 'block';
    target.classList.add('flip-enter');
    window.scrollTo(0, 0);
}

function flipToWorksFromHome() {
    hideAllPages();
    document.getElementById('main-content').classList.add('exit-left');
    const target = document.getElementById('works-page');
    target.style.display = 'block';
    target.classList.add('flip-enter');
    document.getElementById('homeBtn').style.display = 'block';
    window.scrollTo(0, 0);
}

function flipBackToPortfolio() {
    hideAllPages();
    const target = document.getElementById('portfolio-page');
    target.style.display = 'block';
    target.classList.add('flip-enter');
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