document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    const navBar = document.getElementById('nav-bar');

    if (mobileMenu && navBar) {
        mobileMenu.addEventListener('click', () => {
            navBar.classList.toggle('active');
        });
    }
});