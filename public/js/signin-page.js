/*
// Function to handle image switching
function handleImageSwitching() {
    const backgroundImage = document.getElementById('signup-lildude-background');
    if (backgroundImage) {
        const images = [
            'assets/icons8-pug-48.png',
            'assets/zz.png'
        ];
        let currentIndex = 0;

        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            backgroundImage.src = images[currentIndex];
        }, 5000); // 5 seconds
    }
}

// Function to handle closing error message
function handleCloseButton() {
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
    }
}

// Function to handle audio control
function handleAudioControl() {
    const backgroundAudio = document.getElementById('background-audio');
    const audioIcon = document.getElementById('audio-icon');
    let isMuted = false; // Set to true if audio should be muted initially

    // Initialize audio state
    backgroundAudio.muted = isMuted;
    audioIcon.src = isMuted ? 'assets/speaker-off.png' : 'assets/speaker-on.png';

    // Toggle audio mute/unmute on icon click
    audioIcon.addEventListener('click', () => {
        isMuted = !isMuted; // Toggle the mute state
        backgroundAudio.muted = isMuted;
        audioIcon.src = isMuted ? 'assets/speaker-off.png' : 'assets/speaker-on.png';
    });
}

// Function to start audio on user interaction
function handleStartAudio() {
    const backgroundAudio = document.getElementById('background-audio');
    function startAudio() {
        backgroundAudio.play();
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keypress', startAudio);
    }
    document.addEventListener('click', startAudio);
    document.addEventListener('keypress', startAudio);
}

// Function to update the year in the copyright notice
function handleYearUpdate() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Initialize functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    handleImageSwitching();
    handleCloseButton();
    handleAudioControl();
    handleStartAudio();
    handleYearUpdate();
});
*/

document.addEventListener('DOMContentLoaded', function () {
    handleImageSwitching('signup-lildude-background', [
        'assets/gray-pug.png',
        'assets/brown-pug.png'
    ]);
    handleCloseButton('close-btn', 'error-message');
    handleAudioControl('background-audio', 'audio-icon');
    handleStartAudio('background-audio');
    handleYearUpdate('year');
});
