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
let callsRef = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    statusRef = db.ref('call-status');
    callsRef = db.ref('calls');
} catch (error) {
    console.log('Firebase not configured yet. Running in local mode.');
}

// State
const state = {
    partner1: { wantsToCallToday: false, readyToCallRn: false, name: 'Arthur', message: '', cantCallReason: '' },
    partner2: { wantsToCallToday: false, readyToCallRn: false, name: 'Bernice', message: '', cantCallReason: '' }
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
const partner1SendBtn = document.getElementById('partner1-send-btn');
const partner2SendBtn = document.getElementById('partner2-send-btn');
const partner1ReceivedMessage = document.getElementById('partner1-received-message');
const partner2ReceivedMessage = document.getElementById('partner2-received-message');
const callRecordBtn = document.getElementById('call-record-btn');
const celebration = document.getElementById('celebration');
const connectionPulse = document.getElementById('connection-pulse');
const partner1CantCallBtn = document.getElementById('partner1-cant-call-btn');
const partner2CantCallBtn = document.getElementById('partner2-cant-call-btn');
const partner1CantCallContainer = document.getElementById('partner1-cant-call-reason-container');
const partner2CantCallContainer = document.getElementById('partner2-cant-call-reason-container');
const partner1CantCallReason = document.getElementById('partner1-cant-call-reason');
const partner2CantCallReason = document.getElementById('partner2-cant-call-reason');
const partner1CantCallSubmit = document.getElementById('partner1-cant-call-submit');
const partner2CantCallSubmit = document.getElementById('partner2-cant-call-submit');
const partner1CantCallCancel = document.getElementById('partner1-cant-call-cancel');
const partner2CantCallCancel = document.getElementById('partner2-cant-call-cancel');
const partner1ReceivedCantCall = document.getElementById('partner1-received-cant-call');
const partner2ReceivedCantCall = document.getElementById('partner2-received-cant-call');
const partner1ReceivedCantCallText = document.getElementById('partner1-received-cant-call-text');
const partner2ReceivedCantCallText = document.getElementById('partner2-received-cant-call-text');

// Set fixed names in localStorage
localStorage.setItem('partner1-name', 'Arthur');
localStorage.setItem('partner2-name', 'Bernice');

// Message handling
function updateCharCount(partner) {
    const messageEl = partner === 'partner1' ? partner1Message : partner2Message;
    const charCountEl = partner === 'partner1' ? partner1CharCount : partner2CharCount;
    const sendBtn = partner === 'partner1' ? partner1SendBtn : partner2SendBtn;
    const length = messageEl.value.length;
    charCountEl.textContent = `${length}/200`;
    
    // Update state (draft message)
    state[partner].message = messageEl.value;
    
    // Enable/disable send button
    sendBtn.disabled = length === 0;
}

// Send message
function sendMessage(partner) {
    const messageEl = partner === 'partner1' ? partner1Message : partner2Message;
    const message = messageEl.value.trim();
    
    if (!message) return;
    
    // Update sent message in state
    state[partner].sentMessage = message;
    
    // Clear the input
    messageEl.value = '';
    updateCharCount(partner);
    
    // Save to Firebase
    if (statusRef) {
        statusRef.child(partner).update({
            sentMessage: state[partner].sentMessage,
            sentMessageTimestamp: Date.now()
        });
    }
    
    // Update message display on partner's side
    const otherPartner = partner === 'partner1' ? 'partner2' : 'partner1';
    updateMessageDisplay(otherPartner);
}

// Update message display in styled message box
function updateMessageDisplay(partner) {
    const otherPartner = partner === 'partner1' ? 'partner2' : 'partner1';
    const message = state[otherPartner].sentMessage;
    const receivedMessageEl = partner === 'partner1' ? partner1ReceivedMessage : partner2ReceivedMessage;
    const receivedTextEl = partner === 'partner1' ? partner1ReceivedText : partner2ReceivedText;
    
    if (message) {
        receivedTextEl.textContent = message;
        receivedMessageEl.style.display = 'block';
    } else {
        receivedMessageEl.style.display = 'none';
    }
}

// Load and display messages from the other partner
function updateMessages() {
    // Update character counts based on current state
    if (state.partner1.message !== undefined) {
        partner1CharCount.textContent = `${state.partner1.message.length}/200`;
    }
    if (state.partner2.message !== undefined) {
        partner2CharCount.textContent = `${state.partner2.message.length}/200`;
    }
    
    // Update message displays
    updateMessageDisplay('partner1');
    updateMessageDisplay('partner2');
}

// Event listeners for messages
partner1Message.addEventListener('input', () => updateCharCount('partner1'));
partner2Message.addEventListener('input', () => updateCharCount('partner2'));
partner1SendBtn.addEventListener('click', () => sendMessage('partner1'));
partner2SendBtn.addEventListener('click', () => sendMessage('partner2'));

// Allow Enter key to send (Shift+Enter for new line)
partner1Message.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage('partner1');
    }
});
partner2Message.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage('partner2');
    }
});


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

// Show can't call reason input
function showCantCallReason(partner) {
    const container = partner === 'partner1' ? partner1CantCallContainer : partner2CantCallContainer;
    const reasonInput = partner === 'partner1' ? partner1CantCallReason : partner2CantCallReason;
    const btn = partner === 'partner1' ? partner1CantCallBtn : partner2CantCallBtn;
    
    container.style.display = 'block';
    reasonInput.focus();
    btn.classList.add('active');
}

// Hide can't call reason input
function hideCantCallReason(partner) {
    const container = partner === 'partner1' ? partner1CantCallContainer : partner2CantCallContainer;
    const reasonInput = partner === 'partner1' ? partner1CantCallReason : partner2CantCallReason;
    const btn = partner === 'partner1' ? partner1CantCallBtn : partner2CantCallBtn;
    
    container.style.display = 'none';
    reasonInput.value = '';
    btn.classList.remove('active');
}

// Submit can't call reason
function submitCantCallReason(partner) {
    const reasonInput = partner === 'partner1' ? partner1CantCallReason : partner2CantCallReason;
    const reason = reasonInput.value.trim();
    
    if (!reason) {
        alert('Please explain why you can\'t call today.');
        return;
    }
    
    // Update state
    state[partner].cantCallReason = reason;
    
    // Save to Firebase
    if (statusRef) {
        statusRef.child(partner).update({
            cantCallReason: reason,
            timestamp: Date.now()
        });
    }
    
    // Hide the input container
    hideCantCallReason(partner);
    
    // Update UI to show the reason on the other partner's side
    updateCantCallReasons();
}

// Update displayed can't call reasons
function updateCantCallReasons() {
    // Show partner2's reason on partner1's side
    if (state.partner2.cantCallReason) {
        partner1ReceivedCantCall.style.display = 'block';
        partner1ReceivedCantCallText.textContent = state.partner2.cantCallReason;
    } else {
        partner1ReceivedCantCall.style.display = 'none';
    }
    
    // Show partner1's reason on partner2's side
    if (state.partner1.cantCallReason) {
        partner2ReceivedCantCall.style.display = 'block';
        partner2ReceivedCantCallText.textContent = state.partner1.cantCallReason;
    } else {
        partner2ReceivedCantCall.style.display = 'none';
    }
}

// Listen for Firebase updates
let firebaseDataLoaded = false;

function setupFirebaseListeners() {
    if (!statusRef) {
        // If Firebase not available, still update UI with current state
        updateUI();
        updateMessages();
        return;
    }
    
    statusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.partner1) {
                state.partner1.wantsToCallToday = data.partner1.wantsToCallToday || false;
                state.partner1.readyToCallRn = data.partner1.readyToCallRn || false;
                if (data.partner1.message !== undefined) {
                    state.partner1.message = data.partner1.message || '';
                }
                if (data.partner1.sentMessage) {
                    state.partner1.sentMessage = data.partner1.sentMessage;
                }
                if (data.partner1.cantCallReason) {
                    state.partner1.cantCallReason = data.partner1.cantCallReason;
                } else {
                    state.partner1.cantCallReason = '';
                }
            }
            if (data.partner2) {
                state.partner2.wantsToCallToday = data.partner2.wantsToCallToday || false;
                state.partner2.readyToCallRn = data.partner2.readyToCallRn || false;
                if (data.partner2.message !== undefined) {
                    state.partner2.message = data.partner2.message || '';
                }
                if (data.partner2.sentMessage) {
                    state.partner2.sentMessage = data.partner2.sentMessage;
                }
                if (data.partner2.cantCallReason) {
                    state.partner2.cantCallReason = data.partner2.cantCallReason;
                } else {
                    state.partner2.cantCallReason = '';
                }
            }
            
            // Mark that Firebase data has been loaded
            if (!firebaseDataLoaded) {
                firebaseDataLoaded = true;
                // Check for daily reset only after Firebase data is loaded
                checkDailyReset();
            }
            
            updateUI();
            updateMessages();
            updateCantCallReasons();
        } else {
            // No data in Firebase yet - initialize with defaults
            if (!firebaseDataLoaded) {
                firebaseDataLoaded = true;
                checkDailyReset();
            }
            updateUI();
            updateMessages();
            updateCantCallReasons();
        }
    });
}

// Event Listeners
partner1WantsTodayBtn.addEventListener('click', () => toggleState('partner1', 'wantsToday'));
partner1ReadyRnBtn.addEventListener('click', () => toggleState('partner1', 'readyRn'));
partner2WantsTodayBtn.addEventListener('click', () => toggleState('partner2', 'wantsToday'));
partner2ReadyRnBtn.addEventListener('click', () => toggleState('partner2', 'readyRn'));

// Can't call today button handlers
partner1CantCallBtn.addEventListener('click', () => showCantCallReason('partner1'));
partner2CantCallBtn.addEventListener('click', () => showCantCallReason('partner2'));

// Submit and cancel handlers
partner1CantCallSubmit.addEventListener('click', () => submitCantCallReason('partner1'));
partner2CantCallSubmit.addEventListener('click', () => submitCantCallReason('partner2'));
partner1CantCallCancel.addEventListener('click', () => hideCantCallReason('partner1'));
partner2CantCallCancel.addEventListener('click', () => hideCantCallReason('partner2'));

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

// Reset at 4 PM UTC daily (only resets call status, not messages)
function checkDailyReset() {
    const currentPeriod = getResetPeriodId();
    const lastReset = localStorage.getItem('lastResetPeriod');
    
    if (lastReset !== currentPeriod) {
        // New period, reset only call status (keep messages and cantCallReason)
        if (statusRef) {
            statusRef.child('partner1').update({
                wantsToCallToday: false,
                readyToCallRn: false,
                timestamp: Date.now()
            });
            statusRef.child('partner2').update({
                wantsToCallToday: false,
                readyToCallRn: false,
                timestamp: Date.now()
            });
        }
        state.partner1.wantsToCallToday = false;
        state.partner1.readyToCallRn = false;
        state.partner2.wantsToCallToday = false;
        state.partner2.readyToCallRn = false;
        localStorage.setItem('lastResetPeriod', currentPeriod);
        updateUI();
        updateCantCallReasons();
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

// Record call for today
function recordCall() {
    if (!callRecordBtn) return;
    
    const today = getTodayString();
    
    // Always show sparkles immediately for visual feedback
    createSparkles();
    
    // Change button to red immediately for visual feedback
    callRecordBtn.classList.add('recorded');
    
    // Check if already recorded today
    if (callsRef) {
        callsRef.child(today).once('value', (snapshot) => {
            if (snapshot.exists()) {
                // Already recorded today - button already red
                console.log('Call already recorded for today');
                return;
            }
            
            // Record the call (save as true to match calendar expectations)
            callsRef.child(today).set(true).then(() => {
                console.log('Call recorded for', today);
                // Button already red from above
                // The calendar page will automatically update via its Firebase listener
            }).catch((error) => {
                console.error('Error recording call:', error);
                // Remove red state if error
                callRecordBtn.classList.remove('recorded');
            });
        });
    } else {
        console.log('Firebase not available - running in local mode');
    }
}

// Create sparkling particles animation
function createSparkles() {
    const rect = callRecordBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create multiple sparkle particles
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.textContent = '✨';
        
        // Random angle and distance
        const angle = (i / 15) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        sparkle.style.left = `${centerX}px`;
        sparkle.style.top = `${centerY}px`;
        sparkle.style.setProperty('--sparkle-x', `${x}px`);
        sparkle.style.setProperty('--sparkle-y', `${y}px`);
        sparkle.style.animationDelay = `${i * 0.03}s`;
        
        document.body.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 2000);
    }
}

// Get today's date string
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Event listener for call record button
if (callRecordBtn) {
    callRecordBtn.addEventListener('click', recordCall);
} else {
    console.error('Call record button not found!');
}

// Check if call was already recorded today and update button state
function checkCallRecordedToday() {
    const today = getTodayString();
    
    if (callsRef) {
        callsRef.child(today).once('value', (snapshot) => {
            if (snapshot.exists()) {
                callRecordBtn.classList.add('recorded');
            } else {
                callRecordBtn.classList.remove('recorded');
            }
        });
    }
}

// Initialize
setTodayDate();
setupFirebaseListeners(); // This will call checkDailyReset after Firebase data loads
updateUI(); // Initial UI update (will be updated again when Firebase loads)
updateMessages(); // Initial messages update
updateCantCallReasons(); // Initial cant call reasons update
checkCallRecordedToday();

// Fallback: if Firebase doesn't load within 2 seconds, still check reset
setTimeout(() => {
    if (!firebaseDataLoaded) {
        firebaseDataLoaded = true;
        checkDailyReset();
        updateUI();
        updateMessages();
        updateCantCallReasons();
    }
}, 2000);

// Initialize send buttons
updateCharCount('partner1');
updateCharCount('partner2');

// Update messages on window resize
window.addEventListener('resize', () => {
    setTimeout(updateMessages, 100);
});

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