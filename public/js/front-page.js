// Function to handle image switching
function handleImageSwitching(elementId, images, interval = 5000) {
    const backgroundImage = document.getElementById(elementId);
    if (backgroundImage) {
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            backgroundImage.src = images[currentIndex];
        }, interval);
    }
}

// Function to handle closing error message
function handleCloseButton(buttonId, messageId) {
    const closeBtn = document.getElementById(buttonId);
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const errorMessage = document.getElementById(messageId);
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
        });
    }
}

// Function to handle audio control
function handleAudioControl(audioId, iconId, initialMuted = false) {
    const backgroundAudio = document.getElementById(audioId);
    const audioIcon = document.getElementById(iconId);
    let isMuted = initialMuted;

    // Initialize audio state
    backgroundAudio.muted = isMuted;
    audioIcon.src = isMuted ? 'assets/speaker-off.png' : 'assets/speaker-on.png';

    // Toggle audio mute/unmute on icon click
    audioIcon.addEventListener('click', () => {
        isMuted = !isMuted;
        backgroundAudio.muted = isMuted;
        audioIcon.src = isMuted ? 'assets/speaker-off.png' : 'assets/speaker-on.png';
    });
}

// Function to start audio on user interaction
function handleStartAudio(audioId) {
    const backgroundAudio = document.getElementById(audioId);
    function startAudio() {
        backgroundAudio.play();
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keypress', startAudio);
    }
    document.addEventListener('click', startAudio);
    document.addEventListener('keypress', startAudio);
}

// Function to update the year in the copyright notice
function handleYearUpdate(yearElementId) {
    const yearSpan = document.getElementById(yearElementId);
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}
