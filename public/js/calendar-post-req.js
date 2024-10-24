function saveJournalEntry(titleInputSelector, textareaSelector, labelSelector, saveUrl) {
    const journalTitleInput = document.querySelector(titleInputSelector);
    const journalTextarea = document.querySelector(textareaSelector);
    const journalLabel = document.querySelector(labelSelector);
    const dayViewElement = document.getElementById('dayViewDate');
    const dayViewDate = dayViewElement ? dayViewElement.textContent.trim() : '';
    const year = window.displayYear;
    const month = window.displayMonth + 1; // starts at 0
    const dayNumber = parseInt(dayViewDate.split(' ')[1], 10);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = dayNumber.toString().padStart(2, '0');
    const selectedDate = `${year}-${formattedMonth}-${formattedDay}`;

    const title = journalTitleInput.value;
    const content = journalTextarea.value;
    const label = journalLabel.value;

    if (!title || !content) {
        alert('Please fill out both the title and the content!');
        return;
    }

    // Send the data to the server
    fetch(saveUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            content: content,
            label: label,
            date: selectedDate
        })
    }).then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Journal entry saved successfully!');
            // Optionally, close the journal window or clear the form
            journalTitleInput.value = '';
            journalTitleInput.placeholder = 'Title...'; // Reset the placeholder for title
            journalTextarea.value = '';
            journalTextarea.placeholder = 'Content...'; // Reset the placeholder for content
            journalLabel.value = 'task'; // Optionally reset label to a default value

            //window.location.href = '/calendar';
            updateDayView(selectedDate, document.getElementById("newEntryWindow"));
            updateEntryData();
        } else {
            alert('Failed to save the journal entry.');
        }
    });
}
function updateJournalEntry(entryId, titleSelector, inputSelector, labelSelector, url) {
    // Gather the values from the input fields
    const entryTitle = document.querySelector(titleSelector).value;
    const entryInput = document.querySelector(inputSelector).value;
    const entryLabel = document.querySelector(labelSelector).value;

    const dayViewElement = document.getElementById('dayViewDate');
    const dayViewDate = dayViewElement ? dayViewElement.textContent.trim() : '';
    const year = window.displayYear;
    const month = window.displayMonth + 1; // starts at 0
    const dayNumber = parseInt(dayViewDate.split(' ')[1], 10);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = dayNumber.toString().padStart(2, '0');
    const selectedDate = `${year}-${formattedMonth}-${formattedDay}`;

    // Send a POST request using the Fetch API
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            entry_id: entryId,
            entry_title: entryTitle,
            entry_input: entryInput,
            entry_label: entryLabel
        }) // Convert the data object to JSON
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Journal entry saved successfully!');
    
            //window.location.href = '/calendar';
            updateDayView(selectedDate, journalWindow);
            updateEntryData();
        } else {
            alert('Failed to save the journal entry.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving the journal entry.');
    });
    
}
function deleteJournalEntry(entryId, deleteUrl) {
    const dayViewElement = document.getElementById('dayViewDate');
    const dayViewDate = dayViewElement ? dayViewElement.textContent.trim() : '';
    const year = window.displayYear;
    const month = window.displayMonth + 1; // starts at 0
    const dayNumber = parseInt(dayViewDate.split(' ')[1], 10);
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = dayNumber.toString().padStart(2, '0');
    const selectedDate = `${year}-${formattedMonth}-${formattedDay}`;

    if (!entryId) {
        alert('Entry ID is required to delete an entry.');
        return;
    }

    // Confirm before deletion
    if (!confirm('Are you sure you want to delete this journal entry?')) {
        return;
    }

    // Send DELETE request to the server
    fetch(`${deleteUrl}/${entryId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Journal entry deleted successfully!');
            
            //window.location.href = '/calendar';
            updateDayView(selectedDate, null);
            updateEntryData();
        } else {
            alert('Failed to delete the journal entry: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting journal entry:', error);
        alert('An error occurred while deleting the journal entry.');
    });
}
function updateDayView(selectedDate, otherWindow) {
    //console.log('updateDayView:', selectedDate);
    fetch(`/update-day?date=${selectedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const dayViewDateElement = document.getElementById('dayViewDate');
            const dayViewEntriesContainer = document.querySelector('.day-view-entries');
            const [year, month, day] = selectedDate.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const dayText = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            console.log(dayText); 
            dayViewDateElement.textContent = dayText; 
            dayViewEntriesContainer.innerHTML = '';
            data.entries.forEach(entry => {
                const entryDate = new Date(entry.entry_date);
                if (entryDate.getFullYear() === date.getFullYear() &&
                    entryDate.getMonth() === date.getMonth() &&
                    entryDate.getDate() === date.getDate()) {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('day-view-entry');
                    entryDiv.id = `entry-${entry.entry_id}`; 
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
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('entry-delete');
                    const deleteIcon = document.createElement('i');
                    deleteIcon.classList.add('fas', 'fa-trash'); 
                    deleteButton.appendChild(deleteIcon);
                    entryDiv.appendChild(deleteButton);
                    deleteButton.addEventListener('click', () => deleteJournalEntry(entry.entry_id, '/delete-entry'));
                    dayViewEntriesContainer.appendChild(entryDiv);
                }
            });
            //document.getElementById("newEntryWindow").classList.remove("active");
            if (otherWindow != null)
                otherWindow.classList.remove('active');

            document.getElementById("dayViewContainer").classList.add("active");
        })
        .catch(error => {
            console.error('Error fetching updated entries:', error);
        });
}
function updateEntryData() {
    fetch('/entries')  // Fetch entries from the server
        .then(response => response.json())
        .then(data => {
            entries = JSON.parse(JSON.stringify(data.entries));
        })
        .catch(error => {
            console.error('Error fetching updated entries:', error);
        });
}
document.getElementById('saveNewJournalEntry').addEventListener('click', () => {
    saveJournalEntry('.newJournal-title-input', '.newJournal-textarea', '#newJournal-label', '/save-entry');
});

