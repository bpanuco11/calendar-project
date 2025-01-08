document.addEventListener('DOMContentLoaded', function () {
    handleImageSwitching('login-lildude-background', [
        'assets/icons8-pixel-48.png',
        'assets/icons8-pixel-cat-50.png'
    ]);
    handleCloseButton('close-btn', 'error-message');
    handleAudioControl('background-audio', 'audio-icon');
    handleStartAudio('background-audio');
    handleYearUpdate('year');
});
