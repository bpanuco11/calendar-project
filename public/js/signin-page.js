document.addEventListener('DOMContentLoaded', function () {
    // Handle image switching only if the background image element exists
    const backgroundImage = document.getElementById('signup-lildude-background');
    
    if (backgroundImage) {
        let images = [
            'assets/icons8-pug-48.png',
            'assets/zz.png'
        ];
        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            backgroundImage.src = images[currentIndex];
        }, 5000); // 5 seconds
    }
});
