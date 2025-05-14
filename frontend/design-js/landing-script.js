document.addEventListener('DOMContentLoaded', function() {
    const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');
    const testimonials = document.querySelectorAll('.testimonial');
    
    testimonialDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = dot.getAttribute('data-slide');
            
            testimonials.forEach(testimonial => {
                testimonial.classList.remove('active-testimonial');
            });
            
            testimonialDots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            testimonials[slideIndex].classList.add('active-testimonial');
            dot.classList.add('active');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.site-header').offsetHeight; 
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    
    const header = document.querySelector('.site-header'); 
    
    window.addEventListener('scroll', () => {
        if (header) { 
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }
        
        animateOnScroll();
    });
    
    const featureCards = document.querySelectorAll('.feature-card');
    const steps = document.querySelectorAll('.step');
    const sectionTitles = document.querySelectorAll('.section-title');
    
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(40px)';
        step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        step.style.transitionDelay = `${index * 0.1}s`;
    });
    
    sectionTitles.forEach((title) => {
        title.style.opacity = '0';
        title.style.transform = 'translateY(30px)';
        title.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    });
    
    function animateOnScroll() {
        const triggerBottom = window.innerHeight * 0.85;
        
        featureCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            if (cardTop < triggerBottom) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
        
        steps.forEach(step => {
            const stepTop = step.getBoundingClientRect().top;
            if (stepTop < triggerBottom) {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }
        });
        
        sectionTitles.forEach(title => {
            const titleTop = title.getBoundingClientRect().top;
            if (titleTop < triggerBottom) {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }
        });
    }
    
    setTimeout(() => {
        animateOnScroll();
    }, 300);
});
