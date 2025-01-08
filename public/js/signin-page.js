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
