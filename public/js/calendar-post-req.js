async function saveJournalEntry(titleInputSelector, textareaSelector, labelSelector, saveUrl) {
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

    try {
        // Send the data to the server
        const response = await fetch(saveUrl, {
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
        });

        const data = await response.json();

        if (data.success) {
            alert('Journal entry saved successfully!');

            journalTitleInput.value = '';
            journalTitleInput.placeholder = 'Title...';
            journalTextarea.value = '';
            journalTextarea.placeholder = 'Content...';
            journalLabel.value = 'task';

            await updateDayView(selectedDate, document.getElementById("newEntryWindow"));
            await updateEntryData();
        } else {
            alert('Failed to save the journal entry.');
        }
    } catch (error) {
        console.error('Error saving journal entry:', error);
        alert('An error occurred while saving the journal entry.');
    }
}
async function updateDayView(selectedDate, otherWindow) {
    try {
        // Fetch updated day entries
        const response = await fetch(`/update-day?date=${selectedDate}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Update the day view date and entries container
        const dayViewDateElement = document.getElementById('dayViewDate');
        const dayViewEntriesContainer = document.querySelector('.day-view-entries');
        const [year, month, day] = selectedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayText = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        dayViewDateElement.textContent = dayText;
        dayViewEntriesContainer.innerHTML = '';

        // Populate entries for the selected date
        data.entries.forEach(entry => {
            const entryDate = new Date(entry.entry_date);
            if (
                entryDate.getFullYear() === date.getFullYear() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getDate() === date.getDate()
            ) {
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
                deleteButton.addEventListener('click', async () => 
                    await deleteJournalEntry(entry.entry_id, '/delete-entry', true));

                dayViewEntriesContainer.appendChild(entryDiv);
            }
        });

        // Handle window visibility
        if (otherWindow != null) {
            otherWindow.classList.remove('active');
        }

        document.getElementById("dayViewContainer").classList.add("active");
    } catch (error) {
        console.error('Error fetching updated entries:', error);
    }
}
async function updateJournalEntry(entryId, titleSelector, inputSelector, labelSelector, url, isUpdateDayView) {
    try {
        
        const entryTitle = document.querySelector(titleSelector).value;
        const entryInput = document.querySelector(inputSelector).value;
        const entryLabel = document.querySelector(labelSelector).value;
        let selectedDate = ``;

        if (isUpdateDayView) {
            const dayViewElement = document.getElementById('dayViewDate');
            const dayViewDate = dayViewElement ? dayViewElement.textContent.trim() : '';
            const year = window.displayYear;
            const month = window.displayMonth + 1; // starts at 0
            const dayNumber = parseInt(dayViewDate.split(' ')[1], 10);
            const formattedMonth = month.toString().padStart(2, '0');
            const formattedDay = dayNumber.toString().padStart(2, '0');
            selectedDate = `${year}-${formattedMonth}-${formattedDay}`;
        }

        // Send a POST request using the Fetch API
        const response = await fetch(url, {
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
        });

        const data = await response.json();

        if (data.success) {
            alert('Journal entry saved successfully!');

            if (isUpdateDayView) {
                await updateDayView(selectedDate, journalWindow); 
            }
            await updateEntryData(); 
        } else {
            alert('Failed to save the journal entry.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the journal entry.');
    }
}
async function deleteJournalEntry(entryId, deleteUrl, isUpdateDayView) {
    if (!entryId) {
        alert('Entry ID is required to delete an entry.');
        return;
    }

    // Confirm before deletion
    if (!confirm('Are you sure you want to delete this journal entry?')) {
        return;
    }

    try {
        // Send DELETE request to the server
        const response = await fetch(`${deleteUrl}/${entryId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            alert('Journal entry deleted successfully!');

            if (isUpdateDayView) {
                const dayViewElement = document.getElementById('dayViewDate');
                const dayViewDate = dayViewElement ? dayViewElement.textContent.trim() : '';
                const year = window.displayYear;
                const month = window.displayMonth + 1; // starts at 0
                const dayNumber = parseInt(dayViewDate.split(' ')[1], 10);
                const formattedMonth = month.toString().padStart(2, '0');
                const formattedDay = dayNumber.toString().padStart(2, '0');
                const selectedDate = `${year}-${formattedMonth}-${formattedDay}`;
                await updateDayView(selectedDate, null);
            }

            await updateEntryData();
        } else {
            alert('Failed to delete the journal entry: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        alert('An error occurred while deleting the journal entry.');
    }
}
async function updateEntryData() {
    try {
        const response = await fetch('/entries');
        const data = await response.json();
        entries = JSON.parse(JSON.stringify(data.entries));
        journalCount = JSON.parse(JSON.stringify(data.journal_count));
    } catch (error) {
        console.error('Error fetching updated entries:', error);
    }
}
async function saveJournalEntryPlus(titleInputSelector, textareaSelector, labelSelector, dateInputSelector, saveUrl) {
    const journalTitleInput = document.querySelector(titleInputSelector);
    const journalTextarea = document.querySelector(textareaSelector);
    const journalLabel = document.querySelector(labelSelector);
    const journalDateInput = document.querySelector(dateInputSelector); 

    const title = journalTitleInput.value.trim();
    const content = journalTextarea.value.trim();
    const label = journalLabel.value;
    const date = journalDateInput.value; 

    // Validate the inputs
    if (!title || !content) {
        alert('Please fill out both the title and the content!');
        return;
    }

    if (!date) {
        alert('Please select a date for the journal entry!');
        return;
    }

    try {
        const response = await fetch(saveUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content,
                label: label,
                date: date
            })
        });

        const data = await response.json();

        if (data.success) {
            await updateEntryData(); 
            console.log('Server 2:', entries);
            alert('Journal entry saved successfully!');
            
            
            journalTitleInput.value = '';
            journalTextarea.value = '';
            journalLabel.value = 'task';
            journalDateInput.value = ''; 

        } else {
            alert('Failed to save the journal entry.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the journal entry.');
    }
}
