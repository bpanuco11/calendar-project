const calendarDays = document.getElementById('calendarDays');
const monthYear = document.getElementById('monthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const prevMonthButtonHeader = document.getElementById('prevMonth-header');
const nextMonthButtonHeader = document.getElementById('nextMonth-header');

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

    // Calculate the total number of days to show (6 weeks, or 42 days)
    const daysToShow = 42;

    // Add the day names and dates for the first row
    let dayCount = 0;
    for (let date = new Date(startDate); dayCount < daysToShow; date.setDate(date.getDate() + 1)) {
        const dayCell = document.createElement('div');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // Get day name
        const dayNumber = date.getDate(); // Get day number

        if (dayCount < 7) {
            // Add both day name and number for the first row
            dayCell.textContent = `${dayName} ${dayNumber}`;
            dayCell.className = (date.getMonth() === month) ? 'calendar-day' : 'calendar-day other-month';
            
        } else {
            // Only add day number for subsequent rows
            dayCell.textContent = `${dayNumber}`;
            dayCell.className = (date.getMonth() === month) ? 'calendar-day' : 'calendar-day other-month';
        }

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

prevMonthButton.addEventListener('click', goToPreviousMonth);
nextMonthButton.addEventListener('click', goToNextMonth);
prevMonthButtonHeader.addEventListener('click', goToPreviousMonth);
nextMonthButtonHeader.addEventListener('click', goToNextMonth);

// Initial render
renderCalendar();
renderLargeCalendar();
