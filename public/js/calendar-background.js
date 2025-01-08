document.addEventListener("DOMContentLoaded", () => {
    const calendarImage = document.getElementById("calendarImage");
    const calendarAudio = document.getElementById("calendar-audio");

    calendarImage.addEventListener("click", () => {
        if (calendarAudio.paused) {
            calendarAudio.play();
        } else {
            calendarAudio.pause();
        }
    });

});


const images = [
    '../assets/green2.gif',
    '../assets/some-gif.gif',
    '../assets/gree1.gif',
    '../assets/purple2.gif'
];

let currentIndex = 0;

function changeBackground() {
   
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;

    // Move to the next index, looping back to 0 if at the end of the list
    currentIndex = (currentIndex + 1) % images.length;
}

// Call the changeBackground function every 40 seconds 
setInterval(changeBackground, 40000);

// Set the initial background image on page load
window.addEventListener('DOMContentLoaded', changeBackground);