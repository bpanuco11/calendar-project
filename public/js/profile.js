const profileImage = document.getElementById('profileImage');
const dropdown = document.querySelector('.dropdown-container');
const closeButton = document.getElementById('closeButton');
const pictureOption = document.getElementById('pictureOption');
const imageUpload = document.getElementById('imageUpload');

function fillUserData() {
    // Truncate username if it exceeds 12 characters
    const username = prfleImgeSql[0]['username'];
    const truncatedUsername = username.length > 15 ? `${username.slice(0, 12)}...` : username;
    document.getElementById("username-header").textContent = truncatedUsername;

    // Update journal total
    document.getElementById("journalTotal").textContent = `Total Journals: ${journalCount[0]['journal_count']}`;

    // Update profile image if it exists
    if (prfleImgeSql[0]['profile_image']) {
        pictureOption.src = prfleImgeSql[0]['profile_image'];
        profileImage.src = prfleImgeSql[0]['profile_image'];
    }
    return;
}

profileImage.addEventListener('click', () => {
    dropdown.classList.toggle("active");
});

closeButton.addEventListener('click', () => {
    dropdown.classList.remove("active");
});

document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target) && event.target !== profileImage) {
        dropdown.classList.remove("active");
    }
});

pictureOption.addEventListener('click', () => {
    imageUpload.click(); // Programmatically trigger the file input click
});

imageUpload.addEventListener('change', async (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
        const reader = new FileReader(); // Create a FileReader to read the file

        // Set up the onload callback for dynamically updating the image
        reader.onload = (e) => {
            const newImageSrc = e.target.result; // Read the new image as a data URL

            // Update the images dynamically
            pictureOption.src = newImageSrc;
            profileImage.src = newImageSrc;
        };

        reader.readAsDataURL(file); // Read the file as a data URL

        // Now send the file to the server using a POST request
        try {
            const formData = new FormData();
            formData.append('profileImage', file); // Append the selected file

            console.log('Client /upload');
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Image successfully uploaded:', result.path);
            } else {
                console.error('Error uploading image:', result.message);
            }
        } catch (error) {
            console.error('An error occurred during the upload:', error);
        }
    }
});

document.getElementById('logoutButton').addEventListener('click', () => {
    window.location.href = '/logout';
});

fillUserData();