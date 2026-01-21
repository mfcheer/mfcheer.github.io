// 平滑滚动锚点
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// 页面加载动画
window.addEventListener('load', () => {
    document.querySelectorAll('.skill-card, .stat-item').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
    });
});

// 添加动画关键帧
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 导航栏背景在滚动时变暗
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 0) {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.8)';
    }
});

console.log('%c💫 Welcome to Portfolio', 'font-size: 20px; color: #00d4ff; font-weight: bold;');
console.log('%cPowered by Modern Web Design', 'font-size: 14px; color: #94a3b8;');
