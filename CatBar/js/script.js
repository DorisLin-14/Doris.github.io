// script.js

// 獲取自定義游標元素
const cursor = document.querySelector('.custom-cursor');

// 監聽滑鼠移動事件
document.addEventListener('mousemove', (e) => {
    // 更新游標位置
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// 當滑鼠按下時，讓爪子收縮一下
document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
});