const searchBar = document.querySelector('.search-bar');
const searchBarInner = document.querySelector('.search-bar-inner');
const searchButton = document.querySelector('.search-button');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchQueryHeader = document.getElementById('searchQuery');
const queryEntriesContainer = document.querySelector('.query-entries');
const closeSearchView = document.getElementById('closeSearchView');
const suggestionsContainer = document.createElement('div');
const searchJournalWindow = document.getElementById('searchJournalWindow');

suggestionsContainer.classList.add('suggestions-container');
suggestionsContainer.style.display = 'none'; 
searchBarInner.appendChild(suggestionsContainer); 


function updateSuggestionsPosition() {
  const rect = searchBar.getBoundingClientRect();
  suggestionsContainer.style.top = `${rect.bottom + window.scrollY}px`; // Adjust top based on search bar's bottom position
  suggestionsContainer.style.left = `${rect.left + window.scrollX}px`; // Adjust left based on search bar's left position
  suggestionsContainer.style.width = `${rect.width}px`; // Set width to match the search bar
}

function openSearchEntry(entry) {
    
  searchJournalWindow.innerHTML = '';

  const journalHeader = document.createElement('div');
  journalHeader.classList.add('search-journal-header');

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.classList.add('search-journal-title-input');
  titleInput.id = 'searchJournalTitle';
  titleInput.placeholder = 'Title';
  titleInput.value = entry.entry_title; 

  journalHeader.appendChild(titleInput);

  const saveButton = document.createElement('button');
  saveButton.classList.add('save-entry');
  saveButton.id = 'saveSearchJournalEntry';
  const saveIcon = document.createElement('i');
  saveIcon.classList.add('fas', 'fa-save'); 
  saveButton.appendChild(saveIcon);
  journalHeader.appendChild(saveButton);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-entry');
  deleteButton.id = 'deleteSearchJournalEntry';
  const deleteIcon = document.createElement('i');
  deleteIcon.classList.add('fas', 'fa-trash'); 
  deleteButton.appendChild(deleteIcon);
  journalHeader.appendChild(deleteButton);

  searchJournalWindow.appendChild(journalHeader); 

  const journalContent = document.createElement('div');
  journalContent.classList.add('search-journal-content');

  const textarea = document.createElement('textarea');
  textarea.classList.add('search-journal-textarea');
  textarea.id = `searchJournalContent-${entry.entry_id}`; 
  textarea.rows = 10;
  textarea.placeholder = 'Write your entry...';
  textarea.value = entry.entry_input; 
  journalContent.appendChild(textarea);

  searchJournalWindow.appendChild(journalContent); 

  const select = document.createElement('select');
  select.id = 'search-journal-label';

  const labels = ['task', 'important', 'meeting', 'birthday', 'personal', 'holiday', 'appointment', 'deadline'];

  labels.forEach(label => {
      const option = document.createElement('option');
      option.value = label;
      option.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      if (label === entry.entry_label) {
          option.selected = true; 
      }
      select.appendChild(option);
  });

  searchJournalWindow.appendChild(select);

  const journalFooter = document.createElement('div');
  journalFooter.classList.add('search-journal-footer');


  const goBackButton = document.createElement('button');
  goBackButton.classList.add('go-back');
  goBackButton.id = 'searchgoBack';

  const arrowIcon = document.createElement('i');
  arrowIcon.classList.add('fas', 'fa-arrow-left');

  goBackButton.appendChild(arrowIcon);
  journalFooter.appendChild(goBackButton);
  searchJournalWindow.appendChild(journalFooter); 

  document.getElementById('saveSearchJournalEntry').addEventListener('click', async () => 
    {
    await updateJournalEntry(
        entry.entry_id, 
        '.search-journal-title-input', 
        '.search-journal-textarea', 
        '#search-journal-label', 
        '/update-entry', 
        false
    );
    searchJournalWindow.classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
    renderLargeCalendar(); 
  });

  deleteButton.addEventListener('click', async () => {
    await deleteJournalEntry(entry.entry_id, '/delete-entry', false)
    searchJournalWindow.classList.remove('active');
    document.getElementById('overlay').style.display = 'none';
    renderLargeCalendar();
  });

  goBackButton.addEventListener('click', () => {
      searchJournalWindow.classList.remove('active');
      document.getElementById('overlay').style.display = 'none'; 
  });

  searchResultsContainer.classList.remove('active');
  searchJournalWindow.classList.add('active'); 
}

searchBar.addEventListener('input', function() {
  const query = searchBar.value.toLowerCase();
  
  // Clear previous suggestions
  suggestionsContainer.innerHTML = '';
  
  if (query.trim() === '') {
    suggestionsContainer.style.display = 'none'; // Hide if no input
    return; // Exit if the search bar is empty
  }
  
  suggestionsContainer.style.display = 'block'; // Show container when input is present
  
  // Update the position and width of the suggestions container
  updateSuggestionsPosition();
  
  // Filter entries for approximate matches in entry_title
  const filteredEntries = entries.filter(entry => 
    entry.entry_title.toLowerCase().includes(query)
  );
  
  // Display suggestions (limited to 10 for performance)
  filteredEntries.slice(0, 10).forEach(entry => {
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion');
    
    // Limit the suggestion title to 15 characters, add "..." if longer
    const truncatedTitle = entry.entry_title.length > 15 ? entry.entry_title.slice(0, 12) + '...' : entry.entry_title;

    // Format the date to "yyyy-mm-dd" (assuming entry.entry_date is an ISO string)
    const formattedDate = new Date(entry.entry_date).toISOString().split('T')[0]; // Get only the date part (yyyy-mm-dd)
    
    suggestion.textContent = `${truncatedTitle} - ${formattedDate}`;
    
    // Optional: Click event to populate the search bar with the selected suggestion
    suggestion.addEventListener('click', () => {
      searchBar.value = entry.entry_title;
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.style.display = 'none'; // Hide after selection
    });
    
    suggestionsContainer.appendChild(suggestion);
  });
});


searchButton.addEventListener('click', function() {
  const query = searchBar.value.trim();
  
  if (query === '') 
    return; // Do nothing if the search bar is empty
  
  document.getElementById('overlay').style.display = 'block';

 
  const truncatedQuery = query.length > 55 ? query.slice(0, 52) + '...' : query;
  searchQueryHeader.textContent = `Results for: "${truncatedQuery}"`;

  queryEntriesContainer.innerHTML = '';
  
  const filteredEntries = entries.filter(entry => 
    entry.entry_title.toLowerCase().includes(query.toLowerCase())
  );
  
  filteredEntries.forEach(entry => {
    const queryEntry = document.createElement('div');
    queryEntry.classList.add('query-entry');
    
    const entryTitle = document.createElement('span');
    entryTitle.classList.add('entry-title');
    entryTitle.textContent = entry.entry_title;
    
    const openButton = document.createElement('button');
    openButton.classList.add('entry-open');
    openButton.textContent = 'Open';
    openButton.addEventListener('click', () => {
      openSearchEntry(entry); 
    });
    queryEntry.appendChild(entryTitle);
    queryEntry.appendChild(openButton);
    queryEntriesContainer.appendChild(queryEntry);
  });
  searchResultsContainer.classList.add('active');

});

closeSearchView.addEventListener('click', () => { 
  searchResultsContainer.classList.remove('active'); 
  document.getElementById('overlay').style.display = 'none'; 
});


window.addEventListener('resize', updateSuggestionsPosition);
window.addEventListener('scroll', updateSuggestionsPosition);


document.addEventListener('click', function(event) {
  const isClickInsideSearchBar = searchBar.contains(event.target);
  const isClickInsideSuggestions = suggestionsContainer.contains(event.target);
  
  if (!isClickInsideSearchBar && !isClickInsideSuggestions) {
    suggestionsContainer.style.display = 'none'; // Hide suggestions if click is outside
  }
});


const style = document.createElement('style');
style.textContent = `
  .suggestions-container {
    position: absolute;
    background-color: rgba(192, 230, 220, 0.95);
    border: 2px solid black;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
  }
  .suggestion {
    padding: 6px 10px;
    font-family: 'Tiny5', serif;
    color: black;
    border-bottom: 1px solid black;
    cursor: pointer;
    line-height: 1.2;
  }
  .suggestion:last-child {
    border-bottom: none;
  }
  .suggestion:hover {
    background-color: rgba(75, 96, 167, 0.8);
    color: white;
  }
`;
document.head.appendChild(style);
