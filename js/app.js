// Firebase Configuration
// You'll need to replace this with your own Firebase config
// Go to: https://console.firebase.google.com/
// 1. Create a new project (or use existing)
// 2. Add a web app
// 3. Copy your config here
// 4. Enable Realtime Database (in test mode for simplicity)

const firebaseConfig = {
    // REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
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
let statusRef = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    statusRef = db.ref('call-status');
} catch (error) {
    console.log('Firebase not configured yet. Running in local mode.');
}

// State
const state = {
    partner1: { wantsToCallToday: false, readyToCallRn: false, name: 'Arthur', message: '' },
    partner2: { wantsToCallToday: false, readyToCallRn: false, name: 'Bernice', message: '' }
};

// DOM Elements
const partner1WantsTodayBtn = document.getElementById('partner1-wants-today-btn');
const partner1ReadyRnBtn = document.getElementById('partner1-ready-rn-btn');
const partner2WantsTodayBtn = document.getElementById('partner2-wants-today-btn');
const partner2ReadyRnBtn = document.getElementById('partner2-ready-rn-btn');
const partner1Status = document.getElementById('partner1-status');
const partner2Status = document.getElementById('partner2-status');
const partner1Section = document.getElementById('partner1-section');
const partner2Section = document.getElementById('partner2-section');
const partner1Message = document.getElementById('partner1-message');
const partner2Message = document.getElementById('partner2-message');
const partner1CharCount = document.getElementById('partner1-char-count');
const partner2CharCount = document.getElementById('partner2-char-count');
const partner1ReceivedText = document.getElementById('partner1-received-text');
const partner2ReceivedText = document.getElementById('partner2-received-text');
const celebration = document.getElementById('celebration');
const connectionPulse = document.getElementById('connection-pulse');

// Set fixed names in localStorage
localStorage.setItem('partner1-name', 'Arthur');
localStorage.setItem('partner2-name', 'Bernice');

// Message handling
function updateCharCount(partner) {
    const messageEl = partner === 'partner1' ? partner1Message : partner2Message;
    const charCountEl = partner === 'partner1' ? partner1CharCount : partner2CharCount;
    const length = messageEl.value.length;
    charCountEl.textContent = `${length}/200`;
    
    // Update state
    state[partner].message = messageEl.value;
    
    // Save to Firebase
    if (statusRef) {
        statusRef.child(partner).update({
            message: state[partner].message,
            messageTimestamp: Date.now()
        });
    }
}

// Load and display messages from the other partner
function updateMessages() {
    // Partner 1 sees Partner 2's message in the received message area
    if (state.partner2.message) {
        partner1ReceivedText.textContent = state.partner2.message;
    } else {
        partner1ReceivedText.textContent = '';
    }
    
    // Partner 2 sees Partner 1's message in the received message area
    if (state.partner1.message) {
        partner2ReceivedText.textContent = state.partner1.message;
    } else {
        partner2ReceivedText.textContent = '';
    }
    
    // Update character counts based on current state
    if (state.partner1.message !== undefined) {
        partner1CharCount.textContent = `${state.partner1.message.length}/200`;
    }
    if (state.partner2.message !== undefined) {
        partner2CharCount.textContent = `${state.partner2.message.length}/200`;
    }
}

// Event listeners for messages
partner1Message.addEventListener('input', () => updateCharCount('partner1'));
partner2Message.addEventListener('input', () => updateCharCount('partner2'));

// Update UI based on state
function updateUI() {
    // Partner 1
    updatePartnerUI('partner1', partner1WantsTodayBtn, partner1ReadyRnBtn, partner1Status);
    
    // Partner 2
    updatePartnerUI('partner2', partner2WantsTodayBtn, partner2ReadyRnBtn, partner2Status);
    
    // Connection pulse when both ready to call rn
    if (state.partner1.readyToCallRn && state.partner2.readyToCallRn) {
        connectionPulse.classList.add('active');
        celebration.classList.add('active');
    } else if (state.partner1.readyToCallRn || state.partner2.readyToCallRn) {
        connectionPulse.classList.add('active');
        celebration.classList.remove('active');
    } else {
        connectionPulse.classList.remove('active');
        celebration.classList.remove('active');
    }
}

// Helper function to update individual partner UI
function updatePartnerUI(partner, wantsTodayBtn, readyRnBtn, statusEl) {
    const partnerState = state[partner];
    const sectionEl = partner === 'partner1' ? partner1Section : partner2Section;
    
    // Update "wants to call today" button
    if (partnerState.wantsToCallToday) {
        wantsTodayBtn.classList.add('active');
    } else {
        wantsTodayBtn.classList.remove('active');
    }
    
    // Update "ready to call rn" button
    if (partnerState.readyToCallRn) {
        readyRnBtn.classList.add('active');
        statusEl.textContent = 'ready to call rn! 💕';
        statusEl.classList.add('ready');
    } else {
        readyRnBtn.classList.remove('active');
        if (partnerState.wantsToCallToday) {
            statusEl.textContent = 'wants to call today';
            statusEl.classList.remove('ready');
        } else {
            statusEl.textContent = 'not ready yet';
            statusEl.classList.remove('ready');
        }
    }
    
    // Update background based on state
    sectionEl.classList.remove('wants-today', 'ready-rn');
    if (partnerState.readyToCallRn) {
        sectionEl.classList.add('ready-rn');
    } else if (partnerState.wantsToCallToday) {
        sectionEl.classList.add('wants-today');
    }
    
    // Enable/disable "ready to call rn" button based on "wants to call today"
    if (partnerState.wantsToCallToday) {
        readyRnBtn.disabled = false;
    } else {
        readyRnBtn.disabled = true;
        // If wantsToCallToday is false, also reset readyToCallRn
        if (partnerState.readyToCallRn) {
            partnerState.readyToCallRn = false;
        }
    }
}

// Toggle state based on action
function toggleState(partner, action) {
    if (action === 'wantsToday') {
        state[partner].wantsToCallToday = !state[partner].wantsToCallToday;
        // If unchecking "wants to call today", also uncheck "ready to call rn"
        if (!state[partner].wantsToCallToday) {
            state[partner].readyToCallRn = false;
        }
    } else if (action === 'readyRn') {
        state[partner].readyToCallRn = !state[partner].readyToCallRn;
    }
    
    updateUI();
    
    // Sync to Firebase if configured
    if (statusRef) {
        statusRef.child(partner).update({
            wantsToCallToday: state[partner].wantsToCallToday,
            readyToCallRn: state[partner].readyToCallRn,
            timestamp: Date.now()
        });
    }
}

// Listen for Firebase updates
function setupFirebaseListeners() {
    if (!statusRef) return;
    
    statusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.partner1) {
                state.partner1.wantsToCallToday = data.partner1.wantsToCallToday || false;
                state.partner1.readyToCallRn = data.partner1.readyToCallRn || false;
                if (data.partner1.message) {
                    state.partner1.message = data.partner1.message;
                }
            }
            if (data.partner2) {
                state.partner2.wantsToCallToday = data.partner2.wantsToCallToday || false;
                state.partner2.readyToCallRn = data.partner2.readyToCallRn || false;
                if (data.partner2.message) {
                    state.partner2.message = data.partner2.message;
                }
            }
            updateUI();
            updateMessages();
        }
    });
}

// Event Listeners
partner1WantsTodayBtn.addEventListener('click', () => toggleState('partner1', 'wantsToday'));
partner1ReadyRnBtn.addEventListener('click', () => toggleState('partner1', 'readyRn'));
partner2WantsTodayBtn.addEventListener('click', () => toggleState('partner2', 'wantsToday'));
partner2ReadyRnBtn.addEventListener('click', () => toggleState('partner2', 'readyRn'));

// Close celebration when clicked
celebration.addEventListener('click', () => {
    celebration.classList.remove('active');
});

// Get the current reset period ID (changes at 4 PM UTC daily)
function getResetPeriodId() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcDate = now.getUTCDate();
    const utcMonth = now.getUTCMonth();
    const utcYear = now.getUTCFullYear();
    
    // If before 4 PM UTC, we're in the previous day's period
    if (utcHours < 16) {
        // Use yesterday's date for the period ID
        const yesterday = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1));
        return `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;
    }
    // After 4 PM UTC, use today's date
    return `${utcYear}-${utcMonth}-${utcDate}`;
}

// Reset at 4 PM UTC daily
function checkDailyReset() {
    const currentPeriod = getResetPeriodId();
    const lastReset = localStorage.getItem('lastResetPeriod');
    
    if (lastReset !== currentPeriod) {
        // New period, reset states (but keep messages)
        if (statusRef) {
            statusRef.update({
                partner1: { wantsToCallToday: false, readyToCallRn: false, timestamp: Date.now() },
                partner2: { wantsToCallToday: false, readyToCallRn: false, timestamp: Date.now() }
            });
        }
        state.partner1.wantsToCallToday = false;
        state.partner1.readyToCallRn = false;
        state.partner2.wantsToCallToday = false;
        state.partner2.readyToCallRn = false;
        localStorage.setItem('lastResetPeriod', currentPeriod);
        updateUI();
    }
}

// Set today's date display
function setTodayDate() {
    const todayDateEl = document.getElementById('today-date');
    if (todayDateEl) {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = today.toLocaleDateString('en-US', options);
        todayDateEl.textContent = formattedDate;
    }
}

// Initialize
setTodayDate();
setupFirebaseListeners();
checkDailyReset();
updateUI();
updateMessages();

// Add some magic - floating hearts animation
function createFloatingHeart() {
    if (!celebration.classList.contains('active')) return;
    
    const heart = document.createElement('div');
    heart.innerHTML = '💕';
    heart.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 20 + 15}px;
        left: ${Math.random() * 100}vw;
        bottom: -50px;
        pointer-events: none;
        z-index: 99;
        animation: float-up ${Math.random() * 3 + 4}s ease-out forwards;
    `;
    
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 7000);
}

// Add float-up animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        to {
            transform: translateY(-100vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create floating hearts when celebrating
setInterval(createFloatingHeart, 500);

console.log(`
💕 Love Call Ready 💕
=====================
To enable real-time sync between devices:
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Add a web app and copy the config
4. Replace the firebaseConfig in app.js
5. Enable Realtime Database in test mode

Without Firebase, the app works locally only.
`);