
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');

if (menuButton && navigation) {

    menuButton.addEventListener('click', () => {

        navigation.classList.toggle('open');

        const isOpen = navigation.classList.contains('open');

        menuButton.setAttribute('aria-expanded', isOpen);

        menuButton.textContent = isOpen ? '✕' : '☰';

    });

}
