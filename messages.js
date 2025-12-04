// Firebase Configuration (same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyDVJCeWLDQ7EmcHwbnQ2o7_wuFdAedBGaQ",
    authDomain: "callreadyapp.firebaseapp.com",
    databaseURL: "https://callreadyapp-default-rtdb.firebaseio.com",
    projectId: "callreadyapp",
    storageBucket: "callreadyapp.firebasestorage.app",
    messagingSenderId: "999847583592",
    appId: "1:999847583592:web:6b1fea99fff58275df40dd"
};

// Initialize Firebase
let db = null;
let notesRef = null;
let historyRef = null;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    notesRef = db.ref('love-notes/today');
    historyRef = db.ref('love-notes/history');
} catch (error) {
    console.log('Firebase not configured. Running in local mode.');
}

// Romantic prompts - curated for couples
const prompts = [
    "What's one small thing they did recently that made you smile?",
    "Describe your favorite memory together in just a few sentences.",
    "What are you most looking forward to doing together next?",
    "What song reminds you of them and why?",
    "If you could teleport to them right now, what would you do first?",
    "What's something you've never told them but have always wanted to?",
    "Describe how you felt the first time you realized you loved them.",
    "What quality of theirs do you admire most?",
    "What's a simple pleasure you'd love to share with them today?",
    "If you could give them one gift right now, what would it be?",
    "What do you miss most about them in this moment?",
    "Write about a dream you had about them recently.",
    "What's something they do that always makes you laugh?",
    "Describe your perfect lazy day together.",
    "What's a challenge you've overcome together that made you stronger?",
    "If your love story was a movie, what would this chapter be called?",
    "What's something you want to try together someday?",
    "Write a haiku about how you're feeling right now.",
    "What advice would you give to your past self about this relationship?",
    "What's the most romantic thing they've ever done for you?",
    "If you could freeze one moment with them forever, which would it be?",
    "What's something about them that surprised you in a good way?",
    "Describe how it feels when they hold your hand.",
    "What's a future you're building together?",
    "Write three words that describe how they make you feel.",
    "What's your favorite inside joke?",
    "If you had one more hour together today, how would you spend it?",
    "What's a little thing they do that shows they care?",
    "Write about a time they made you feel truly understood.",
    "What would you whisper in their ear right now?",
    "Describe the moment you knew they were special.",
    "What's something you've learned from loving them?",
    "If your hearts could speak to each other, what would they say?",
    "What scent reminds you of them?",
    "Write about a promise you want to make to them.",
    "What's the best good morning text you could send them?",
    "Describe their laugh. How does it make you feel?",
    "What adventure do you want to go on together?",
    "What's something you appreciate about the distance between you?",
    "If you could cook one meal together tonight, what would it be?",
    "Write about something they inspire in you.",
    "What's the sweetest dream you have for your future together?",
    "Describe what home feels like with them.",
    "What's a tiny detail about them that you absolutely love?",
    "If you could send them one feeling telepathically, what would it be?"
];

// DOM Elements
const dailyPromptEl = document.getElementById('daily-prompt');
const refreshPromptBtn = document.getElementById('refresh-prompt');
const toggleHistoryBtn = document.getElementById('toggle-history');
const historyList = document.getElementById('history-list');

const partner1Note = document.getElementById('partner1-note');
const partner2Note = document.getElementById('partner2-note');
const partner1Save = document.getElementById('partner1-save');
const partner2Save = document.getElementById('partner2-save');
const partner1CharCount = document.getElementById('partner1-char-count');
const partner2CharCount = document.getElementById('partner2-char-count');
const partner1NoteName = document.getElementById('partner1-note-name');
const partner2NoteName = document.getElementById('partner2-note-name');
const partner1Timestamp = document.getElementById('partner1-timestamp');
const partner2Timestamp = document.getElementById('partner2-timestamp');
const partner1SavedNote = document.getElementById('partner1-saved-note');
const partner2SavedNote = document.getElementById('partner2-saved-note');
const partner1SavedText = document.getElementById('partner1-saved-text');
const partner2SavedText = document.getElementById('partner2-saved-text');

// State
let currentPromptIndex = 0;
let todaysNotes = {
    partner1: { text: '', timestamp: null },
    partner2: { text: '', timestamp: null }
};

// Get today's date string for daily prompt
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// Get a deterministic prompt for today
function getDailyPrompt() {
    const today = getTodayString();
    const savedPromptData = localStorage.getItem('daily-prompt-data');
    
    if (savedPromptData) {
        const data = JSON.parse(savedPromptData);
        if (data.date === today) {
            currentPromptIndex = data.index;
            return prompts[data.index];
        }
    }
    
    // New day - pick a new prompt based on date
    const dateNum = today.split('-').join('');
    currentPromptIndex = parseInt(dateNum) % prompts.length;
    
    localStorage.setItem('daily-prompt-data', JSON.stringify({
        date: today,
        index: currentPromptIndex
    }));
    
    return prompts[currentPromptIndex];
}

// Shuffle to a new random prompt
function getNewPrompt() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * prompts.length);
    } while (newIndex === currentPromptIndex);
    
    currentPromptIndex = newIndex;
    
    localStorage.setItem('daily-prompt-data', JSON.stringify({
        date: getTodayString(),
        index: currentPromptIndex
    }));
    
    return prompts[newIndex];
}

// Load saved names
function loadNames() {
    const name1 = localStorage.getItem('partner1-name') || 'Partner 1';
    const name2 = localStorage.getItem('partner2-name') || 'Partner 2';
    
    partner1NoteName.textContent = name1;
    partner2NoteName.textContent = name2;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return 'today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Update character count
function updateCharCount(textarea, countEl) {
    const count = textarea.value.length;
    countEl.textContent = `${count}/500`;
}

// Save note
function saveNote(partner) {
    const textarea = partner === 'partner1' ? partner1Note : partner2Note;
    const saveBtn = partner === 'partner1' ? partner1Save : partner2Save;
    const text = textarea.value.trim();
    
    if (!text) return;
    
    const timestamp = Date.now();
    
    // Update local state
    todaysNotes[partner] = { text, timestamp };
    
    // Visual feedback
    saveBtn.classList.add('saved');
    createFloatingEnvelope(saveBtn);
    
    setTimeout(() => {
        saveBtn.classList.remove('saved');
    }, 2000);
    
    // Save to Firebase
    if (notesRef) {
        const today = getTodayString();
        notesRef.child(partner).set({
            text,
            timestamp,
            date: today
        });
    }
    
    // Update saved note display
    updateSavedNoteDisplay(partner);
}

// Update saved note display
function updateSavedNoteDisplay(partner) {
    const savedNote = partner === 'partner1' ? partner1SavedNote : partner2SavedNote;
    const savedText = partner === 'partner1' ? partner1SavedText : partner2SavedText;
    const timestampEl = partner === 'partner1' ? partner1Timestamp : partner2Timestamp;
    
    const note = todaysNotes[partner];
    
    if (note.text) {
        savedText.textContent = note.text;
        savedNote.classList.add('visible');
        timestampEl.textContent = formatTimestamp(note.timestamp);
    } else {
        savedNote.classList.remove('visible');
        timestampEl.textContent = '';
    }
}

// Create floating envelope animation
function createFloatingEnvelope(element) {
    const rect = element.getBoundingClientRect();
    const envelope = document.createElement('div');
    envelope.className = 'floating-envelope';
    envelope.textContent = '💌';
    envelope.style.left = rect.left + rect.width / 2 + 'px';
    envelope.style.top = rect.top + 'px';
    document.body.appendChild(envelope);
    
    setTimeout(() => envelope.remove(), 1500);
}

// Archive old notes and load today's
function checkDayReset() {
    if (!notesRef) return;
    
    const today = getTodayString();
    
    notesRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        // Check if notes are from a previous day
        const partner1Date = data.partner1?.date;
        const partner2Date = data.partner2?.date;
        
        if ((partner1Date && partner1Date !== today) || (partner2Date && partner2Date !== today)) {
            // Archive yesterday's notes
            const archiveDate = partner1Date || partner2Date;
            if (archiveDate && (data.partner1?.text || data.partner2?.text)) {
                historyRef.child(archiveDate).set({
                    partner1: data.partner1 || null,
                    partner2: data.partner2 || null
                });
            }
            
            // Clear today's notes
            notesRef.set({
                partner1: { text: '', timestamp: null, date: today },
                partner2: { text: '', timestamp: null, date: today }
            });
        }
    });
}

// Setup Firebase listeners
function setupFirebaseListeners() {
    if (!notesRef) return;
    
    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.partner1) {
                todaysNotes.partner1 = {
                    text: data.partner1.text || '',
                    timestamp: data.partner1.timestamp || null
                };
                partner1Note.value = todaysNotes.partner1.text;
                updateCharCount(partner1Note, partner1CharCount);
                updateSavedNoteDisplay('partner1');
            }
            if (data.partner2) {
                todaysNotes.partner2 = {
                    text: data.partner2.text || '',
                    timestamp: data.partner2.timestamp || null
                };
                partner2Note.value = todaysNotes.partner2.text;
                updateCharCount(partner2Note, partner2CharCount);
                updateSavedNoteDisplay('partner2');
            }
        }
    });
}

// Load history
function loadHistory() {
    if (!historyRef) {
        historyList.innerHTML = '<div class="history-empty">No previous notes yet. Start writing! 💕</div>';
        return;
    }
    
    historyRef.orderByKey().limitToLast(10).once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            historyList.innerHTML = '<div class="history-empty">No previous notes yet. Start writing! 💕</div>';
            return;
        }
        
        const name1 = localStorage.getItem('partner1-name') || 'Partner 1';
        const name2 = localStorage.getItem('partner2-name') || 'Partner 2';
        
        // Sort by date descending
        const dates = Object.keys(data).sort().reverse();
        
        historyList.innerHTML = dates.map(date => {
            const entry = data[date];
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString([], {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            
            let notesHtml = '';
            
            if (entry.partner1?.text) {
                notesHtml += `
                    <div class="history-note">
                        <div class="history-note-author">${name1}</div>
                        <div class="history-note-text">${escapeHtml(entry.partner1.text)}</div>
                    </div>
                `;
            }
            
            if (entry.partner2?.text) {
                notesHtml += `
                    <div class="history-note">
                        <div class="history-note-author">${name2}</div>
                        <div class="history-note-text">${escapeHtml(entry.partner2.text)}</div>
                    </div>
                `;
            }
            
            if (!notesHtml) return '';
            
            return `
                <div class="history-item">
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-notes">${notesHtml}</div>
                </div>
            `;
        }).join('');
        
        if (!historyList.innerHTML.trim()) {
            historyList.innerHTML = '<div class="history-empty">No previous notes yet. Start writing! 💕</div>';
        }
    });
}

// Escape HTML for safe display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
refreshPromptBtn.addEventListener('click', () => {
    dailyPromptEl.style.opacity = '0';
    setTimeout(() => {
        dailyPromptEl.textContent = getNewPrompt();
        dailyPromptEl.style.opacity = '1';
    }, 300);
});

toggleHistoryBtn.addEventListener('click', () => {
    toggleHistoryBtn.classList.toggle('expanded');
    historyList.classList.toggle('visible');
    
    if (historyList.classList.contains('visible')) {
        loadHistory();
    }
});

partner1Note.addEventListener('input', () => updateCharCount(partner1Note, partner1CharCount));
partner2Note.addEventListener('input', () => updateCharCount(partner2Note, partner2CharCount));

partner1Save.addEventListener('click', () => saveNote('partner1'));
partner2Save.addEventListener('click', () => saveNote('partner2'));

// Allow Ctrl+Enter to save
partner1Note.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') saveNote('partner1');
});
partner2Note.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') saveNote('partner2');
});

// Initialize
dailyPromptEl.textContent = getDailyPrompt();
dailyPromptEl.style.transition = 'opacity 0.3s ease';
loadNames();
checkDayReset();
setupFirebaseListeners();

console.log(`
💌 Love Notes 💌
================
Leave sweet messages for each other!
Notes sync between devices via Firebase.
Previous notes are saved in history.
`);




