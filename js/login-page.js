document.addEventListener('DOMContentLoaded', function () {
    // Handle image switching
    const backgroundImage = document.getElementById('login-lildude-background');
    let images = [
        'assets/icons8-pixel-48.png',
        'assets/icons8-pixel-cat-50.png'
    ];
    let currentIndex = 0;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        backgroundImage.src = images[currentIndex];
    }, 5000); // 5 seconds

    // Handle form submission
    const loginForm = document.querySelector(".login-form");
    
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
        
        // Hide the login page
        const loginPage = document.getElementById("login-page");
        loginPage.classList.add("hidden");
        console.log('works');
    });
});
