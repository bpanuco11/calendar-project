document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".login-form");
    
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
        
        // Hide the login page
        const loginPage = document.getElementById("login-page");
        loginPage.classList.add("hidden")
        console.log('works')
    })
})
