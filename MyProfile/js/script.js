const btn = document.getElementById('scrollTopBtn');

btn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

btn.addEventListener('mouseenter', () =>{
        btn.src = 'images/cat_up.png';
})

btn.addEventListener('mouseleave', () => {
    btn.src = 'images/cat.png'
})