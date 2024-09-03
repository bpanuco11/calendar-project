document.addEventListener('DOMContentLoaded', function () {
    // Handle image switching only if the background image element exists
    const backgroundImage = document.getElementById('login-lildude-background');
    
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
});
