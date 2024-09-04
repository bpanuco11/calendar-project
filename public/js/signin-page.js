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

document.addEventListener('DOMContentLoaded', function () {
    // Handle image switching only if the background image element exists
    const backgroundImage = document.getElementById('signup-lildude-background');
    const closeBtn = document.getElementById('close-btn');

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

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
    }

    handleAudioControl();
    handleStartAudio();
    handleYearUpdate();
});
