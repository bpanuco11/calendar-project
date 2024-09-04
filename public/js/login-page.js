document.addEventListener('DOMContentLoaded', function () {
    // Handle image switching only if the background image element exists
    const backgroundImage = document.getElementById('login-lildude-background');
    const closeBtn = document.getElementById('close-btn');
    
    if (backgroundImage) {
        let images = [
            'assets/icons8-pixel-48.png',
            'assets/icons8-pixel-cat-50.png'
        ];
        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            backgroundImage.src = images[currentIndex];
        }, 5000); // 5 seconds
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
    }
});
