document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-section .hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    const prevArrow = document.querySelector('.hero-section .prev-arrow');
    const nextArrow = document.querySelector('.hero-section .next-arrow');

    if (slides.length === 0) {
        if(prevArrow) prevArrow.classList.add('hidden');
        if(nextArrow) nextArrow.classList.add('hidden');
        return;
    }
    
    if (!prevArrow || !nextArrow) {
    }

    let currentSlideIndex = 0;

    function updateArrowsVisibility() {
        if (!prevArrow || !nextArrow) return;

        if (currentSlideIndex === 0) {
            prevArrow.classList.add('hidden');
        } else {
            prevArrow.classList.remove('hidden');
        }

        if (currentSlideIndex === slides.length - 1) {
            nextArrow.classList.add('hidden');
        } else {
            nextArrow.classList.remove('hidden');
        }
    }

    function showSlide(index) {
        if (index >= slides.length) {
            index = 0;
        } else if (index < 0) {
            index = slides.length - 1;
        }

        slides.forEach((slide) => {
            slide.classList.remove('active-slide');
        });
        if (dots.length === slides.length) {
            dots.forEach((dot) => {
                dot.classList.remove('active');
            });
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }

        slides[index].classList.add('active-slide');
        currentSlideIndex = index;
        updateArrowsVisibility();
    }

    if (dots.length === slides.length) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
    }

    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            showSlide(currentSlideIndex - 1);
        });
    }

    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            showSlide(currentSlideIndex + 1);
        });
    }

    const initialActiveSlideIndex = Array.from(slides).findIndex(slide => slide.classList.contains('active-slide'));
    if (initialActiveSlideIndex !== -1) {
        showSlide(initialActiveSlideIndex);
    } else if (slides.length > 0) {
        showSlide(0); 
    } else {
        if(prevArrow) prevArrow.classList.add('hidden');
        if(nextArrow) nextArrow.classList.add('hidden');
    }
});
