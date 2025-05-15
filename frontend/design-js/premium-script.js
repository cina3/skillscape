document.addEventListener('DOMContentLoaded', function() {
    const getPremiumButton = document.querySelector('.get-premium-btn');
    const premiumPlan = document.querySelector('.premium-plan');
    const freePlan = document.querySelector('.free-plan');
    
    if (getPremiumButton) {
        getPremiumButton.addEventListener('click', function() {
            getPremiumButton.innerHTML = '<i class="fas fa-check"></i> You are now premium!';
            getPremiumButton.classList.add('premium-activated');
            premiumPlan.classList.add('active-plan');
            freePlan.classList.add('inactive-plan');
            
            createConfetti();
            
            const currentPlanBtn = document.querySelector('.current-plan-btn');
            currentPlanBtn.textContent = 'Previous Plan';
            currentPlanBtn.classList.add('previous-plan-btn');
        });
    }
    
    function createConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        const colors = ['#9b59b6', '#f1c40f', '#e74c3c', '#2ecc71', '#3498db'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiContainer.appendChild(confetti);
        }
        
        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }
});
