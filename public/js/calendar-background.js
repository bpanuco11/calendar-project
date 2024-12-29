// Array of background image paths
const images = [
    '../assets/green2.gif',
    '../assets/some-gif.gif',
    '../assets/gree1.gif',
    '../assets/purple2.gif'
];

let currentIndex = 0;

function changeBackground() {
    // Set the background image to the current image in the list
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;

    // Move to the next index, looping back to 0 if at the end of the list
    currentIndex = (currentIndex + 1) % images.length;
}

// Call the changeBackground function every 40 seconds (10000ms)
setInterval(changeBackground, 40000);

// Set the initial background image on page load
window.addEventListener('DOMContentLoaded', changeBackground);