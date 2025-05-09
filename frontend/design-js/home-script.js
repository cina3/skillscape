document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-section .hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    const prevArrow = document.querySelector('.hero-section .prev-arrow');
    const nextArrow = document.querySelector('.hero-section .next-arrow');

    if (slides.length === 0) {
        // console.warn('Hero slider elements not found.');
        if(prevArrow) prevArrow.classList.add('hidden');
        if(nextArrow) nextArrow.classList.add('hidden');
        return;
    }
    
    // Ensure arrows exist before trying to use them
    if (!prevArrow || !nextArrow) {
        // console.warn('Hero navigation arrows not found.');
        // Depending on design, you might want to proceed without arrows or stop.
    }

    let currentSlideIndex = 0;

    function updateArrowsVisibility() {
        if (!prevArrow || !nextArrow) return; // Guard clause if arrows don't exist

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
            index = 0; // Loop to first slide
        } else if (index < 0) {
            index = slides.length - 1; // Loop to last slide
        }
        // If no looping is desired, add boundary checks like before:
        // if (index >= slides.length || index < 0) {
        //     console.warn(`Slide index ${index} is out of bounds.`);
        //     return;
        // }

        slides.forEach((slide) => {
            slide.classList.remove('active-slide');
        });
        // Only manipulate dots if they exist and match slide count
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

    if (dots.length === slides.length) { // Only setup dot listeners if they match
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
    } else { // No slides, hide arrows if they exist
        if(prevArrow) prevArrow.classList.add('hidden');
        if(nextArrow) nextArrow.classList.add('hidden');
    }
});
