// 移动端导航菜单
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    burger.addEventListener('click', () => {
        // 切换导航显示
        nav.classList.toggle('active');
        
        // 链接动画
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // 汉堡菜单动画
        burger.classList.toggle('toggle');
    });
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
        });
        
        // 如果是移动端，点击后关闭菜单
        if (document.querySelector('.nav-links').classList.contains('active')) {
            navSlide();
        }
    });
});

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    navSlide();
    
    // 设置当前年份
    const yearElement = document.querySelector('.footer-bottom p');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2025', currentYear);
    }
});

// 动态加载内容
document.addEventListener('DOMContentLoaded', function() {
    // 可以从API加载最新内容
    // fetchLatestStories();
    // fetchLatestLiterature();
    
    // 或者使用静态数据
});

// 示例函数：获取最新故事
function fetchLatestStories() {
    // 这里可以添加AJAX请求来获取最新故事
    // 然后动态更新DOM
}

// 其他交互功能