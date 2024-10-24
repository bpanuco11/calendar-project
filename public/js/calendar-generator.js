const calendarDays = document.getElementById('calendarDays');
const monthYear = document.getElementById('monthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const prevMonthButtonHeader = document.getElementById('prevMonth-header');
const nextMonthButtonHeader = document.getElementById('nextMonth-header');
const dayViewContainer = document.getElementById('dayViewContainer');
const dayViewDate = document.getElementById('dayViewDate');
const closeDayViewButton = document.getElementById('closeDayView');
const openButtons = document.querySelectorAll('.entry-open');
const journalWindow = document.getElementById('journalWindow');
const goBackJournalButton = document.getElementById('goBackJournalWindow');
const goBackPlus = document.getElementById('goBackPlus');
const calendarDaysLarge = document.getElementById('calendarDaysLarge');
let currentDate = new Date();

function renderLargeCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Clear the larger calendar
    calendarDaysLarge.innerHTML = '';

    // Get the first day of the current month
    const firstDay = new Date(year, month, 1);

    // Calculate the starting date (the Sunday before the first day of the month)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    const daysToShow = 42;

    let dayCount = 0;
    for (let date = new Date(startDate); dayCount < daysToShow; date.setDate(date.getDate() + 1)) {
        const dayCell = document.createElement('div');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Get day name
        const dayNumber = date.getDate(); // Get day number

        let displayMonth = date.getMonth();
        let displayYear = date.getFullYear();

        // Handle day numbers in the first 2 rows that belong to the previous month
        if (dayCount < 14 && dayNumber >= 20) {
            displayMonth = (month === 0) ? 11 : month - 1; // Move to previous month (December if January)
            displayYear = (month === 0) ? year - 1 : year;  // Move to previous year if necessary
        }
        // Handle day numbers in the last 2 rows that belong to the next month
        else if (dayCount >= 28 && dayNumber <= 14) {
            displayMonth = (month === 11) ? 0 : month + 1; // Move to next month (January if December)
            displayYear = (month === 11) ? year + 1 : year; // Move to next year if necessary
        }

        if (dayCount < 7) {
            // Add both day name and number for the first row
            dayCell.textContent = `${dayName} ${dayNumber}`;
            // dayCell.className = (date.getMonth() === month) ? 'calendar-day' : 'calendar-day other-month';
            
        } else {
            // Only add day number for subsequent rows
            dayCell.textContent = `${dayNumber}`;
            // dayCell.className = (date.getMonth() === month) ? 'calendar-day' : 'calendar-day other-month';
        }

        //dayCell.className = (date.getMonth() === month) ? 'calendar-day' : 'calendar-day other-month';
        dayCell.className = (displayMonth === month) ? 'calendar-day' : 'calendar-day other-month';

        dayCell.addEventListener('click', () => {
            window.displayMonth = displayMonth;
            window.displayYear = displayYear;
            console.log(dayNumber, displayMonth, displayYear);
            showDayView(new Date(displayYear, displayMonth, dayNumber));
        });

        calendarDaysLarge.appendChild(dayCell);
        dayCount++;
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const headerMonthYear = document.getElementById('headerMonthYear');

    // Update the month and year display
    monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
    headerMonthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    // Clear the calendar
    calendarDays.innerHTML = '';

    // Get the first day of the current month
    const firstDay = new Date(year, month, 1);

    // Calculate the starting date (the Sunday before the first day of the month)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // Calculate the total number of days to show (6 weeks, or 42 days)
    const daysToShow = 42;

    // Add the day names (Sun, Mon, Tue, etc.)
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const dayCell = document.createElement('div');
        dayCell.textContent = day;
        dayCell.className = 'calendar-day header';
        calendarDays.appendChild(dayCell);
    });

    // Add the days for the 6 weeks
    let dayCount = 0;
    for (let date = new Date(startDate); dayCount < daysToShow; date.setDate(date.getDate() + 1)) {
        const dayCell = document.createElement('div');
        dayCell.textContent = date.getDate();

        // Check if the day is from the current month
        if (date.getMonth() === month) {
            dayCell.className = 'calendar-day';
        } else {
            dayCell.className = 'calendar-day other-month';
        }

        calendarDays.appendChild(dayCell);
        dayCount++;
    }

    // Enable/Disable buttons based on the current date
    prevMonthButton.disabled = (currentDate.getFullYear() <= 1900 && currentDate.getMonth() <= 0);
    nextMonthButton.disabled = (currentDate.getFullYear() >= 2100 && currentDate.getMonth() >= 11);
    prevMonthButtonHeader.disabled = (currentDate.getFullYear() <= 1900 && currentDate.getMonth() <= 0);
    nextMonthButtonHeader.disabled = (currentDate.getFullYear() >= 2100 && currentDate.getMonth() >= 11);
}

function goToPreviousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    renderLargeCalendar();
}

function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    renderLargeCalendar();
}

function showDayView(date) {
    const dayText = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    dayViewDate.textContent = dayText; // Update the date in the day-view

    const dayViewEntriesContainer = document.querySelector('.day-view-entries');
    dayViewEntriesContainer.innerHTML = ''; // Clear any previous entries

    // Compare the clicked date with entry dates
    entries.forEach(entry => {
        const entryDate = new Date(entry.entry_date);

        // Check if the year, month, and day match
        if (entryDate.getFullYear() === date.getFullYear() &&
            entryDate.getMonth() === date.getMonth() &&
            entryDate.getDate() === date.getDate()) {
            
            // Create the entry div with the necessary elements
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('day-view-entry');
            entryDiv.id = `entry-${entry.entry_id}`; // Set id using entry_id
            
            // Create the title span
            const titleSpan = document.createElement('span');
            titleSpan.classList.add('entry-title');
            titleSpan.textContent = entry.entry_title;
            entryDiv.appendChild(titleSpan);

            const openButton = document.createElement('button');
            openButton.classList.add('entry-open');
            const openIcon = document.createElement('i');
            openIcon.classList.add('fas', 'fa-folder-open'); 
            openButton.appendChild(openIcon);
            entryDiv.appendChild(openButton);

            openButton.addEventListener('click', () => openEntry(entry));

            // Create the "Delete" button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('entry-delete');
            const deleteIcon = document.createElement('i');
            deleteIcon.classList.add('fas', 'fa-trash'); // Font Awesome trash icon classes
            deleteButton.appendChild(deleteIcon);
            entryDiv.appendChild(deleteButton);

            // Append the entry to the day-view-entries container
            dayViewEntriesContainer.appendChild(entryDiv);

            //deleteButton.addEventListener('click', () => deleteJournalEntry(entry.entry_id, '/delete-entry'));
            deleteButton.addEventListener('click', () => deleteJournalEntry(entry.entry_id, '/delete-entry'));
        }
    });

    dayViewContainer.classList.add('active'); // Show the day-view container
    document.getElementById('overlay').style.display = 'block'; // Show overlay
}

closeDayViewButton.addEventListener('click', () => { 
    dayViewContainer.classList.remove('active'); // Hide the day-view container
    document.getElementById('overlay').style.display = 'none'; // Hide overlay
});

document.getElementById("add-new-entry").addEventListener("click", function() {
    document.getElementById("dayViewContainer").classList.remove("active");
    document.getElementById("newEntryWindow").classList.add("active");
});

document.getElementById("goBackNewEntryWindow").addEventListener("click", function() {
    // Hide the new-entry-window
    document.getElementById("newEntryWindow").classList.remove("active");

    // Show the day-view-container
    document.getElementById("dayViewContainer").classList.add("active");
});

function openEntry(entry) {
    // Clear any existing content inside journalWindow
    journalWindow.innerHTML = '';

    // Create the new structure for the journal entry
    const journalHeader = document.createElement('div');
    journalHeader.classList.add('journal-header');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.classList.add('journal-title-input');
    titleInput.id = 'journalTitle';
    titleInput.placeholder = 'Title';
    titleInput.value = entry.entry_title; // Fill the title with entry data
    journalHeader.appendChild(titleInput);

    const saveButton = document.createElement('button');
    saveButton.classList.add('save-entry');
    saveButton.id = 'saveJournalEntry';

    const saveIcon = document.createElement('i');
    saveIcon.classList.add('fas', 'fa-save'); 
    saveButton.appendChild(saveIcon);
    journalHeader.appendChild(saveButton);
    journalWindow.appendChild(journalHeader); 

    const journalContent = document.createElement('div');
    journalContent.classList.add('journal-content');

    const textarea = document.createElement('textarea');
    textarea.classList.add('journal-textarea');
    textarea.id = `journalContent-${entry.entry_id}`; 
    textarea.rows = 10;
    textarea.placeholder = 'Write your entry...';
    textarea.value = entry.entry_input; 
    journalContent.appendChild(textarea);

    journalWindow.appendChild(journalContent); 

    const select = document.createElement('select');
    select.id = 'journal-label';

    // List of label options
    const labels = ['task', 'important', 'meeting', 'birthday', 'personal', 'holiday', 'appointment', 'deadline'];

    // Create each option and set the correct label as selected
    labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label.charAt(0).toUpperCase() + label.slice(1); // Capitalize the first letter
        if (label === entry.entry_label) {
            option.selected = true; // Pre-select the correct label
        }
        select.appendChild(option);
    });

    journalWindow.appendChild(select); // Append the select element to journalWindow

    const journalFooter = document.createElement('div');
    journalFooter.classList.add('journal-footer');

    const goBackButton = document.createElement('button');
    goBackButton.classList.add('go-back');
    goBackButton.id = 'goBackJournalWindow';
    goBackButton.textContent = 'Go Back';
    journalFooter.appendChild(goBackButton);

    journalWindow.appendChild(journalFooter); // Append the footer to journalWindow

    document.getElementById('saveJournalEntry').addEventListener('click', () => {
        updateJournalEntry(entry.entry_id, '.journal-title-input', '.journal-textarea', '#journal-label', '/update-entry');
    });
    
    goBackButton.addEventListener('click', () => {
        // Add logic to close the journal window or navigate back
        journalWindow.classList.remove('active'); // Hide the journal window
        dayViewContainer.classList.add('active'); // Show the day-view container
    });

    // Make sure the journalWindow is visible after populating it
    dayViewContainer.classList.remove('active'); // Hide the day-view container
    journalWindow.classList.add('active'); // Show the journal window
    document.getElementById('overlay').style.display = 'block'; // Show overlay
}

goBackJournalButton.addEventListener('click', () => {
    journalWindow.classList.remove('active'); // Hide the journal window
    dayViewContainer.classList.add('active'); // Show the day-view container
});

const entryForm = document.querySelector('.add-new-entry-plus');
document.querySelector('.add-button').addEventListener('click', function() {
    entryForm.classList.add('active'); 
    document.getElementById('overlay').style.display = 'block'; // Show overlay
});

goBackPlus.addEventListener('click', () => { 
    entryForm.classList.remove('active'); // Hide the day-view container
    document.getElementById('overlay').style.display = 'none'; // Hide overlay
});


prevMonthButton.addEventListener('click', goToPreviousMonth);
nextMonthButton.addEventListener('click', goToNextMonth);
prevMonthButtonHeader.addEventListener('click', goToPreviousMonth);
nextMonthButtonHeader.addEventListener('click', goToNextMonth);

renderCalendar();
renderLargeCalendar();
